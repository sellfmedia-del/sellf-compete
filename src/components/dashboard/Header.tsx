'use client'; // Menü açılıp kapanması için gerekli

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Settings, History, LogOut, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-20 border-b border-zinc-900 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
      {/* Sol: Logo */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-black tracking-tighter uppercase italic text-white hover:text-orange-500 transition-colors">
          SELLF<span className="text-orange-500">COMPETE</span>
        </Link>
      </div>
      
      {/* Sağ: Profil İkonu & Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 group p-1.5 rounded-full hover:bg-zinc-800/50 transition-colors"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
            <User size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <ChevronDown size={14} className={`text-zinc-600 group-hover:text-zinc-300 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menü (Açıksa Görünür) */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard/account" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings size={16} /> Account Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                  <History size={16} /> Audit History
                </Link>
              </li>
              <li className="pt-2 mt-2 border-t border-zinc-800">
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-orange-500 hover:bg-orange-500/10 transition-colors">
                  <LogOut size={16} /> Log Out
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}