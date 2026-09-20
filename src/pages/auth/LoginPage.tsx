import React, { useState } from 'react';
import { useRouter, getAssetUrl } from '../../lib/router';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { navigate } = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoClient = () => {
    setEmail('omar@ultimatetomato.com');
    setPassword('omar2026');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@ultimatetomato.com');
    setPassword('tomato2026');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Subtle Tomato Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F52F3A]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-all mb-2"
        >
          <img
            src={getAssetUrl('/assets/ultimate-tomato-logo.png')}
            alt="Ultimate Tomato Logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-sm font-extrabold tracking-tight text-white">
            ULTIMATE TOMATO
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Client Dashboard Sign In
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Manage your portfolio content, case studies, skills, services, and incoming inquiries.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#111111] border border-white/10 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@ultimatetomato.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-[#F52F3A] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-[#F52F3A]/25 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign Into Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Development Quick Fill Options */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-center">
              Quick Test Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoClient}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 font-medium transition-all text-center"
              >
                <span className="block font-bold text-white">Client #1</span>
                <span>omar@... (Client)</span>
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 font-medium transition-all text-center"
              >
                <span className="block font-bold text-white">Super Admin</span>
                <span>admin@... (Platform)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
