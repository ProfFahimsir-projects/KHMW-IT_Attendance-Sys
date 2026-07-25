'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to process request');
        setLoading(false);
        return;
      }

      setResetToken(data.data.resetToken);
      toast.success('Reset token generated! Copy it and proceed to reset.');
    } catch (err) {
      toast.error('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(resetToken);
    setTokenCopied(true);
    toast.success('Token copied to clipboard!');
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleProceedToReset = () => {
    router.push(`/reset-password?token=${resetToken}`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Forgot Password?
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your registered email to receive a reset token
            </p>
          </div>

          {!resetToken ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@khmw.edu.in"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Token...' : 'Generate Reset Token'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Your Reset Token
                </p>
                <p className="mt-2 break-all font-mono text-xs text-foreground bg-background/50 rounded-lg p-3 border border-border/60">
                  {resetToken}
                </p>
                <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-500">
                  This token expires in 15 minutes. Copy it and proceed to reset your password.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyToken}
                  className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                >
                  {tokenCopied ? 'Copied!' : 'Copy Token'}
                </button>
                <button
                  onClick={handleProceedToReset}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Reset Password
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-border/60 pt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
