import React, { useState } from 'react';
import { portfolioService } from '../../services/portfolioService';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { Facebook, Mail, MapPin, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

interface ContactPageProps {
  bundle: PublicPortfolioBundle;
}

export function ContactPage({ bundle }: ContactPageProps) {
  const { portfolio, client, settings } = bundle;

  const [sender, setSender] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!sender.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await portfolioService.submitContact(portfolio.slug, {
        sender,
        email,
        subject,
        message,
        honeypot,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        setSender('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMessage(res.message || 'Failed to send message.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 text-left">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <Badge variant="tomato">Direct Inquiries</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Let's Build Something Exceptional Together
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Have an ambitious product idea or need architectural guidance? Send a message directly to start the conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info Left */}
        <div className="lg:col-span-5 space-y-8">
          <GlassCard variant="minimal" className="p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Contact Details
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Direct portfolio contact for {client.name}. Verified social and business channels.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-[#F52F3A]">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{settings.contact_email || client.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-[#F52F3A]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{settings.location || 'Cairo, Egypt (Global Remote)'}</span>
              </div>
            </div>

            {/* Verified Facebook Link Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-[#F52F3A]" />
                  Verified Facebook
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Official reference profile: facebook.com/omar.mhmdfwzi
              </p>
              <a
                href="https://www.facebook.com/omar.mhmdfwzi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-[#F52F3A] hover:underline pt-1"
              >
                Open Facebook Profile →
              </a>
            </div>
          </GlassCard>
        </div>

        {/* Form Right */}
        <div className="lg:col-span-7">
          <GlassCard variant="minimal" className="p-8 sm:p-10 rounded-3xl">
            {successMessage ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Message Dispatched Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                  {successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field (hidden from human visitors) */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Subject / Project Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Design System & Web Application"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell me about your project goals, timelines, and technical requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A] transition-all resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-[#F52F3A]/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Start a Project</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
