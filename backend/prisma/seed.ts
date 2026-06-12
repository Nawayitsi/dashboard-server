import { PrismaClient, Role, ServiceType, Status, Severity, IntegrationType, IntegrationStatus, LogLevel } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Admin User ──────────────────────────────────
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homelabos.local' },
    update: {},
    create: {
      email: 'admin@homelabos.local',
      username: 'admin',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ─── Create Viewer User ─────────────────────────────────
  const viewerPassword = await hashPassword('viewer123');
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@homelabos.local' },
    update: {},
    create: {
      email: 'viewer@homelabos.local',
      username: 'viewer',
      password: viewerPassword,
      firstName: 'Dashboard',
      lastName: 'Viewer',
      role: Role.VIEWER,
      isActive: true,
    },
  });
  console.log('✅ Viewer user created:', viewer.email);

  // ─── Create Default Services ────────────────────────────
  const services = [
    { name: 'MikroTik Router', type: ServiceType.ROUTER, description: 'Main gateway router', icon: 'router', color: '#1B9BD7', url: 'https://mikrotik.local', order: 1 },
    { name: 'Synology NAS', type: ServiceType.NAS, description: 'Network attached storage', icon: 'hard-drive', color: '#4B9ED6', url: 'https://nas.local:5001', order: 2 },
    { name: 'Nextcloud', type: ServiceType.CLOUD, description: 'Self-hosted cloud platform', icon: 'cloud', color: '#0082C9', url: 'https://cloud.local', order: 3 },
    { name: 'LibreNMS', type: ServiceType.MONITORING, description: 'Network monitoring system', icon: 'activity', color: '#67B74D', url: 'https://nms.local', order: 4 },
    { name: 'SafeLine WAF', type: ServiceType.WAF, description: 'Web application firewall', icon: 'shield', color: '#FF6B35', url: 'https://waf.local', order: 5 },
    { name: 'SIEM', type: ServiceType.SIEM, description: 'Security information and event management', icon: 'search', color: '#9333EA', url: 'https://siem.local', order: 6 },
    { name: 'Nginx Proxy Manager', type: ServiceType.PROXY, description: 'Reverse proxy manager', icon: 'globe', color: '#009639', url: 'https://proxy.local', order: 7 },
    { name: 'Proxmox VE', type: ServiceType.APPLICATION, description: 'Virtualization platform', icon: 'server', color: '#E57000', url: 'https://pve.local:8006', order: 8 },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { id: svc.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: svc.name.toLowerCase().replace(/\s+/g, '-'),
        ...svc,
      },
    });
  }
  console.log('✅ Default services created');

  // ─── Create Default Integrations ────────────────────────
  const integrations = [
    { name: 'MikroTik RouterOS', type: IntegrationType.MIKROTIK, config: { host: '', port: 8728, username: '', password: '' } },
    { name: 'Nextcloud', type: IntegrationType.NEXTCLOUD, config: { url: '', username: '', password: '' } },
    { name: 'Synology DSM', type: IntegrationType.SYNOLOGY, config: { url: '', username: '', password: '' } },
    { name: 'LibreNMS', type: IntegrationType.LIBRENMS, config: { url: '', apiToken: '' } },
    { name: 'SafeLine WAF', type: IntegrationType.SAFELINE, config: { url: '', apiToken: '' } },
    { name: 'SIEM Platform', type: IntegrationType.SIEM, config: { url: '', apiToken: '' } },
    { name: 'Nginx Proxy Manager', type: IntegrationType.NGINX_PROXY_MANAGER, config: { url: '', email: '', password: '' } },
  ];

  for (const intg of integrations) {
    await prisma.integration.upsert({
      where: { type: intg.type },
      update: {},
      create: intg,
    });
  }
  console.log('✅ Default integrations created');

  // ─── Create Default Settings ────────────────────────────
  const settings = [
    { key: 'system.name', value: 'HomelabOS', group: 'general' },
    { key: 'system.timezone', value: 'Asia/Jakarta', group: 'general' },
    { key: 'metrics.interval', value: 5000, group: 'metrics' },
    { key: 'metrics.retention_days', value: 30, group: 'metrics' },
    { key: 'notifications.email_enabled', value: false, group: 'notifications' },
    { key: 'notifications.webhook_url', value: '', group: 'notifications' },
    { key: 'security.max_login_attempts', value: 5, group: 'security' },
    { key: 'security.lockout_duration', value: 900, group: 'security' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value as any,
        group: setting.group,
      },
    });
  }
  console.log('✅ Default settings created');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
