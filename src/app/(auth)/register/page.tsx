// Dosya Yolu: src/app/auth/register/page.tsx (veya ilgili yol)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();
  
  const router = useRouter();
  const supabase = createClient();

  // Paddle'ı sayfa yüklendiğinde arka planda sessizce başlatıyoruz
  useEffect(() => {
    initializePaddle({ 
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production', 
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN! 
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        
        // KAYIT BAŞARILI: Yönlendirme iptal, anında Paddle Abonelik ekranı açılıyor
        if (paddle) {
          paddle.Checkout.open({
            items: [{ priceId: "pri_01kmzbj3bxn3jajcwpay4an5nx", quantity: 1 }], // Abonelik Price ID
            customer: {
              email: email,
            },
            customData: {
              userId: data.user.id,
              app: "sellfcompete",
              planType: "subscription"
            }
          });
        } else {
          // Fallback: Eğer Paddle yüklenemezse güvenli limana (Account) gönder
          setTimeout(() => {
            router.push('/dashboard/account');
          }, 2000);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase italic">
            SELLF<span className="text-orange-500">COMPETE</span>
          </Link>
          <p className="text-zinc-500 text-sm mt-3 font-medium uppercase tracking-widest">Join the ecosystem</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          {success ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Welcome to the Ecosystem</h2>
              <p className="text-sm text-zinc-400 font-medium">Please complete your subscription to unlock your workspace.</p>
              <Loader2 className="animate-spin mx-auto text-orange-500 mt-4" size={24} />
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-500 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Business Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="name@company.com"
                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Min. 8 characters"
                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-orange-500 text-black py-4 rounded-full font-black hover:bg-orange-400 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight shadow-xl shadow-orange-500/10 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-xs">
              <p className="text-zinc-500 font-medium uppercase tracking-widest">
                Already a member?{' '}
                <Link href="/login" className="text-white hover:text-orange-500 transition-colors font-bold underline underline-offset-4 decoration-orange-500">Sign in here</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}