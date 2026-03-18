import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Reset <span className="text-orange-500">Access</span>
          </h2>
          <p className="text-zinc-500 text-[10px] mt-3 font-black uppercase tracking-[0.2em]">Enter your email to receive a recovery link</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button className="w-full bg-white text-black py-4 rounded-full font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight">
              Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}