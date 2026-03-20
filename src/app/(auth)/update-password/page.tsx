'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Şifrelerin eşleştiğini kontrol et
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Supabase ile şifreyi güncelle
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      
      // 3. 3 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 3000);

    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-2xl font-black tracking-tighter text-white uppercase italic mb-2">
            SELLF<span className="text-orange-500">COMPETE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase italic">
            Secure <span className="text-orange-500">Account</span>
          </h2>
          <p className="text-zinc-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em]">Set your new master password</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          
          {success ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Security Updated</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Your password has been changed successfully. <br/>Redirecting to your workspace...
              </p>
              <Loader2 className="animate-spin mx-auto text-orange-500 mt-4" size={20} />
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-500 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all text-white placeholder:text-zinc-700 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all text-white placeholder:text-zinc-700 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full bg-white text-black py-4 rounded-full font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight shadow-xl shadow-white/5 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Secure Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer Note */}
        <p className="mt-8 text-center text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">
          ScaleSuite Security Protocol 2.0
        </p>
      </div>
    </div>
  );
}