import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { authService } from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setDispatched(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-4">
        <div
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Reset Password
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Enter your registered portfolio email address and we will dispatch password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-[#111111] border border-white/10 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {dispatched ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If an account exists for {email}, a recovery link has been generated. Please check your inbox.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-[#F52F3A]/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
