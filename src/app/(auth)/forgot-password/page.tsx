'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Kullanıcı maildeki linke tıkladığında bu sayfaya yönlendirilecek
        redirectTo: `${location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Reset <span className="text-orange-500">Access</span>
          </h2>
          <p className="text-zinc-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em]">
            Enter your email to receive a recovery link
          </p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          {success ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Check Your Inbox</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                We've sent a secure recovery link to <br/><span className="text-white font-bold">{email}</span>. <br/><br/>Please check your spam folder if you don't see it.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-500 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="name@company.com"
                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50 text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-white text-black py-4 rounded-full font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-xl shadow-white/5"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}