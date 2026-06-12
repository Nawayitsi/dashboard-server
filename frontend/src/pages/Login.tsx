import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/auth.api';
import { Terminal, Lock, Mail, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] bg-radial-glow flex items-center justify-center p-4">
      {/* Login Card Panel */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#4F8CFF] to-[#7A5CFF] flex items-center justify-center text-white shadow-lg shadow-[#4F8CFF]/20 mb-3">
            <Terminal className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">HomelabOS</h1>
          <p className="text-xs text-gray-400 mt-1.5">Sign in to administer self-hosted infrastructure</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/2 border border-white/5 focus:border-[#4F8CFF]/50 focus:bg-white/5 outline-none rounded-xl text-sm transition-all placeholder:text-gray-600"
                placeholder="admin@homelabos.local"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/2 border border-white/5 focus:border-[#4F8CFF]/50 focus:bg-white/5 outline-none rounded-xl text-sm transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7A5CFF] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#4F8CFF]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-500">
            For demonstration login with: <span className="font-semibold text-gray-400">admin@homelabos.local</span> / <span className="font-semibold text-gray-400">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
