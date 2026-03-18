import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
            <ShieldCheck className="text-orange-500" size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Verify <span className="text-orange-500">Identity</span>
          </h2>
          <p className="text-zinc-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em]">We sent a 6-digit code to your email</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl text-center">
          <form className="space-y-8">
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <input 
                  key={i}
                  type="text" 
                  maxLength={1}
                  className="w-12 h-14 bg-black/50 border border-zinc-800 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-orange-500 transition-all"
                />
              ))}
            </div>

            <button className="w-full bg-orange-500 text-black py-4 rounded-full font-black hover:bg-orange-400 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight">
              Verify Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-xs font-medium uppercase tracking-widest text-zinc-500">
            Didn't receive code?{' '}
            <button className="text-white hover:text-orange-500 transition-colors underline underline-offset-4 decoration-orange-500">Resend</button>
          </div>
        </div>
      </div>
    </div>
  );
}