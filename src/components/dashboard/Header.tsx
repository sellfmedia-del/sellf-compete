'use client'; 

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
// YENİ İKONLAR EKLENDİ: LayoutGrid, Radar, Zap
import { User, Settings, History, LogOut, ChevronDown, LayoutGrid, Radar, Zap } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client'; 

export default function Header() {
  // İki farklı dropdown olacağı için state'leri ayırdık
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogOut = async () => {
    await supabase.auth.signOut(); 
    router.push('/'); 
    router.refresh(); 
  };

  return (
    <header className="h-20 border-b border-zinc-900 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
      
      {/* SOL: Logo & Yeni Navigasyon Dropdown */}
      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="text-xl font-black tracking-tighter uppercase italic text-white hover:text-orange-500 transition-colors">
          SELLF<span className="text-orange-500">COMPETE</span>
        </Link>

        {/* YENİ: Workspace Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNavOpen(!isNavOpen);
              setIsProfileOpen(false); // Diğerini kapat
            }}
            className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-full transition-all group"
          >
            <LayoutGrid size={16} className="text-zinc-400 group-hover:text-orange-500 transition-colors" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">Workspace</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Workspace Menü İçeriği */}
          {isNavOpen && (
            <div className="absolute left-0 top-full mt-3 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-colors">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">Quick Audit</p>
                      <p className="text-[10px] font-medium text-zinc-500">Single market scan</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/my-products" 
                    onClick={() => setIsNavOpen(false)}
                    className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group border border-transparent hover:border-zinc-800"
                  >
                    <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors">
                      <Radar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">My Products</p>
                      <p className="text-[10px] font-medium text-zinc-500">Continuous competitor tracking</p>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* SAĞ: Profil İkonu & Dropdown (Eski Hali Korundu) */}
      <div className="relative">
        <button 
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNavOpen(false); // Diğerini kapat
          }}
          className="flex items-center gap-2 group p-1.5 rounded-full hover:bg-zinc-800/50 transition-colors"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
            <User size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <ChevronDown size={14} className={`text-zinc-600 group-hover:text-zinc-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard/account" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings size={16} /> Account Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                  <History size={16} /> Audit History
                </Link>
              </li>
              <li className="pt-2 mt-2 border-t border-zinc-800">
                <button 
                  onClick={handleLogOut} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-orange-500 hover:bg-orange-500/10 transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}