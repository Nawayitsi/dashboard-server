#!/bin/bash
set -e

# ==============================================================================
# Configuration (Silakan sesuaikan jika diperlukan)
# ==============================================================================
SSH_HOST="82.41.42.239"
SSH_USER="root"         # Ganti dengan username SSH server Anda (misal: root, ubuntu, dll.)
SSH_PORT="2077"           # Ganti jika menggunakan port kustom
DEPLOY_DIR="homelabos"   # Direktori tempat docker-compose di server

echo "====== 🚀 Memulai Deployment HomelabOS ======"

# 1. Cek status git dan lakukan commit/push otomatis jika ada perubahan
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Menemukan perubahan lokal yang belum dicommit. Melakukan commit otomatis..."
  git add .
  git commit -m "build: auto-commit before deploy"
fi

echo "🔄 Pushing kode terbaru ke GitHub..."
git push origin main

# Dapatkan SHA commit terbaru untuk dipantau di GitHub Actions
COMMIT_SHA=$(git rev-parse HEAD)
echo "✅ Commit SHA: ${COMMIT_SHA:0:7}"

# 2. Pantau status build Docker di GitHub Actions
echo "⏳ Menunggu GitHub Actions menyelesaikan build Docker image..."
echo "Proses ini memakan waktu sekitar 2-3 menit karena mengompilasi Frontend & Backend."
echo "Memulai pemantauan status build..."

RUN_STATUS="queued"
CONCL="none"
for i in {1..60}; do
  # Ambil data run terbaru dari GitHub API
  RUN_DATA=$(curl -s "https://api.github.com/repos/Nawayitsi/dashboard-server/actions/runs?per_page=10")
  
  # Cari run yang sesuai dengan commit SHA kita menggunakan Python
  STATUS=$(echo "$RUN_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    found = False
    for run in data.get('workflow_runs', []):
        if run.get('head_sha') == '$COMMIT_SHA':
            print(f\"{run.get('status')},{run.get('conclusion')}\")
            found = True
            break
    if not found:
        print('not_found,none')
except Exception as e:
    print('error,none')
")

  RUN_STATUS=$(echo "$STATUS" | cut -d',' -f1)
  CONCL=$(echo "$STATUS" | cut -d',' -f2)

  if [ "$RUN_STATUS" = "completed" ]; then
    break
  fi

  if [ "$RUN_STATUS" = "error" ] || [ "$RUN_STATUS" = "not_found" ]; then
     # Jika rate limit tercapai atau API gagal sesaat, tetap tunggu
     echo "⏳ Menunggu repositori memproses commit di GitHub..."
  else
     echo "⏳ Status build: $RUN_STATUS... (Mengecek kembali dalam 10 detik)"
  fi
  sleep 10
done

if [ "$CONCL" != "success" ]; then
  echo "❌ Build di GitHub Actions gagal atau tidak ditemukan."
  echo "Silakan periksa detailnya secara manual di: https://github.com/Nawayitsi/dashboard-server/actions"
  exit 1
fi

echo "✅ Build Docker image sukses di GHCR!"

# 3. Setup direktori dan unggah docker-compose.yml via LAN
echo "📁 Menyiapkan direktori di server ($SSH_USER@$SSH_HOST)..."
ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "mkdir -p $DEPLOY_DIR"

echo "📤 Mengunggah docker-compose.yml ke server..."
scp -P $SSH_PORT -o StrictHostKeyChecking=no docker-compose.yml $SSH_USER@$SSH_HOST:$DEPLOY_DIR/

# 4. Restart container dengan image terbaru di server
echo "🚀 Merestart container di server..."
ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST << EOF
  cd $DEPLOY_DIR
  
  # Pull Docker image terbaru dari GHCR
  docker compose pull
  
  # Restart container
  docker compose up -d --remove-orphans
  
  # Bersihkan docker image lama yang menggantung
  docker image prune -f
EOF

echo "=============================================================================="
echo "🎉 DEPLOYMENT SUKSES!"
echo "Aplikasi Anda telah diperbarui dan go-live di: http://dashhome.jepriserv.my.id"
echo "=============================================================================="
