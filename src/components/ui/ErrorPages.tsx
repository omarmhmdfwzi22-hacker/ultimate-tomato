import { useRouter, getAssetUrl } from '../../lib/router';
import { ArrowLeft, RefreshCw, ShieldAlert, AlertTriangle, WifiOff, FileQuestion } from 'lucide-react';

interface ErrorPageProps {
  type: '404' | '401' | '403' | '500' | 'offline';
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({ type, title, message, onRetry }: ErrorPageProps) {
  const { navigate } = useRouter();

  const configs = {
    '404': {
      code: '404',
      defaultTitle: 'Page Not Found',
      defaultMessage: 'The portfolio page, project, or resource you are looking for has been moved or does not exist.',
      icon: FileQuestion,
    },
    '401': {
      code: '401',
      defaultTitle: 'Authentication Required',
      defaultMessage: 'You must be signed into your Ultimate Tomato dashboard account to access this area.',
      icon: ShieldAlert,
    },
    '403': {
      code: '403',
      defaultTitle: 'Access Forbidden',
      defaultMessage: 'Strict tenant isolation prevents accessing portfolios or assets outside your authorized account.',
      icon: ShieldAlert,
    },
    '500': {
      code: '500',
      defaultTitle: 'System Error',
      defaultMessage: 'An unexpected error occurred. Our engineering system has logged this incident.',
      icon: AlertTriangle,
    },
    offline: {
      code: 'OFFLINE',
      defaultTitle: 'Connection Interrupted',
      defaultMessage: 'Please check your internet connection. Cached assets will restore as soon as connectivity resumes.',
      icon: WifiOff,
    },
  };

  const current = configs[type];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Tomato Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F52F3A]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 text-center">
        {/* Logo & Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <img src={getAssetUrl('/assets/ultimate-tomato-logo.png')} alt="Ultimate Tomato" className="w-5 h-5 object-contain" />
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Ultimate Tomato</span>
          <span className="w-1 h-1 rounded-full bg-[#F52F3A]" />
          <span className="text-xs font-mono font-bold text-[#F52F3A]">{current.code}</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/40">
          <IconComponent className="w-8 h-8 text-[#F52F3A]" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">
          {title || current.defaultTitle}
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          {message || current.defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white font-medium text-sm transition-all shadow-lg shadow-[#F52F3A]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {type === '401' ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all"
            >
              Go to Login
            </button>
          ) : (
            <button
              onClick={onRetry || (() => window.location.reload())}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-medium text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>

      <div className="mt-16 text-xs text-zinc-600 flex items-center gap-2">
        <span>Built with</span>
        <span className="text-[#F52F3A]">♥</span>
        <span>by Ultimate Tomato Platform</span>
      </div>
    </div>
  );
}
