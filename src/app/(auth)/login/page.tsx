import React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-6 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase italic">
            SELLF<span className="text-orange-500">COMPETE</span>
          </Link>
          <p className="text-zinc-500 text-sm mt-3 font-medium uppercase tracking-widest">Welcome Back</p>
        </div>

        {/* Auth Card */}
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

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-orange-400 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button className="w-full bg-white text-black py-4 rounded-full font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group text-sm uppercase italic tracking-tight">
              Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-xs">
            <p className="text-zinc-500 font-medium uppercase tracking-widest">
              Don't have an account?{' '}
              <Link href="/register" className="text-white hover:text-orange-500 transition-colors font-bold underline underline-offset-4 decoration-orange-500">Create one</Link>
            </p>
          </div>
        </div>

        {/* Scalesuite Footer Note */}
        <p className="mt-8 text-center text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">
          Powered by ScaleSuite Engine
        </p>
      </div>
    </div>
  );
}