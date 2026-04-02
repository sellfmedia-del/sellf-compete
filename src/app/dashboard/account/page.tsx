// File Path: src/app/dashboard/account/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, CreditCard, ShieldAlert, Edit3, Check, Zap, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

export default function AccountPage() {
  // UI & Data States
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  // User States
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  
  // Billing States
  const [credits, setCredits] = useState<number>(0);
  const [status, setStatus] = useState<string>('Loading...');
  const [paddle, setPaddle] = useState<Paddle>();

  const supabase = createClient();

  useEffect(() => {
    // 1. Initialize Paddle Backend
    initializePaddle({ 
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production', 
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN! 
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });

    // 2. Fetch Live User & Profile Data
    async function fetchUserData() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || '');
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, paddle_status')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCredits(profile.credits || 0);
          setStatus(profile.paddle_status || 'inactive');
        }
      }
      setIsLoading(false);
    }

    fetchUserData();
  }, []);

  // 3. SECURE PASSWORD UPDATE ENGINE
  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setUpdateMessage({ type: '', text: '' });
      return;
    }

    // If editing and they typed a new password, process the update
    if (newPassword.length > 0) {
      setIsUpdating(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setUpdateMessage({ type: 'error', text: error.message });
      } else {
        setUpdateMessage({ type: 'success', text: 'Security credentials updated successfully.' });
        setNewPassword(''); // Clear the field for security
        setIsEditing(false);
      }
      setIsUpdating(false);
    } else {
      // If they clicked save without typing anything, just close edit mode
      setIsEditing(false);
    }
  };

  // 4. PADDLE CREDIT UPSALL TRIGGER
  const handleBuyCredits = () => {
    if (paddle && userId) {
      paddle.Checkout.open({
        items: [{ priceId: "pri_01kmzbktkcsq4x80fj2rateg2t", quantity: 1 }], // $1.90 Credit Package
        customer: { email: userEmail },
        customData: {
          userId: userId,
          app: "sellfcompete",
          planType: "credit" 
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Account <span className="text-orange-500 text-glow">Settings</span>
        </h1>
        <p className="text-zinc-500 text-[10px] mt-3 font-black uppercase tracking-[0.3em]">Identity & Revenue Ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* 1. IDENTITY & AUTH - Bento 7 Columns */}
        <div className="md:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
             <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-400 underline decoration-zinc-800 decoration-4 underline-offset-8">Access Control</h3>
             <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-all flex items-center gap-2 disabled:opacity-50"
             >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <><Check size={14} /> Save Changes</> : <><Edit3 size={14} /> Update Profile</>}
             </button>
          </div>

          {updateMessage.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold relative z-10 ${updateMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
              {updateMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {updateMessage.text}
            </div>
          )}

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-4">Email (Immutable)</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors text-zinc-700" size={18} />
                <input 
                  type="email" 
                  disabled={true} // Usually email changes require deeper verification, keeping disabled for now
                  value={userEmail || 'Loading...'}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none transition-all opacity-60 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-4">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-orange-500' : 'text-zinc-700'}`} size={18} />
                <input 
                  type={isEditing ? "text" : "password"} 
                  disabled={!isEditing}
                  value={isEditing ? newPassword : "••••••••••••"}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isEditing ? "Enter new password..." : ""}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-14 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all disabled:opacity-40 font-medium"
                />
              </div>
            </div>
          </div>
          <Lock size={220} className="absolute right-[-5%] bottom-[-5%] opacity-[0.02] -rotate-12 pointer-events-none" />
        </div>

        {/* 2. BILLING & PADDLE - Bento 5 Columns */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-between h-full relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-400 mb-8 underline decoration-zinc-800 decoration-4 underline-offset-8">Billing Hub</h3>
              
              <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl mb-4 group-hover:bg-orange-500/20 transition-all duration-500 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Available Credits</p>
                  <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                    {isLoading ? <Loader2 className="animate-spin text-orange-500" size={24} /> : credits}
                  </h4>
                </div>
                {status === 'active' && (
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                    Active
                  </div>
                )}
              </div>

              {/* BUY CREDITS BUTTON */}
              <button 
                onClick={handleBuyCredits}
                disabled={isLoading}
                className="w-full bg-orange-500 text-black py-4 rounded-2xl font-black uppercase italic text-xs hover:bg-orange-400 transition-all tracking-tight flex items-center justify-center gap-2 mb-8 shadow-lg shadow-orange-500/10 group/btn disabled:opacity-50"
              >
                <Zap size={14} fill="currentColor" /> Buy 1 More Credit <span className="opacity-60 text-[9px]">($1.90)</span>
              </button>

              <div className="flex items-center gap-4 p-4 border border-zinc-800 rounded-2xl bg-black/20">
                <CreditCard className="text-zinc-600" size={20} />
                <div>
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Subscription System</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Paddle Sandbox</p>
                </div>
              </div>
            </div>

            <button className="mt-8 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all underline underline-offset-4 decoration-zinc-800 relative z-10 text-left">
              Manage Billing via Paddle
            </button>
            <Zap size={150} className="absolute -right-10 -bottom-10 opacity-[0.02] text-orange-500 pointer-events-none" />
          </div>
        </div>

        {/* 3. DANGER ZONE - Full Width */}
        <div className="md:col-span-12 mt-4 border border-red-900/20 bg-red-950/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all duration-500">
                <ShieldAlert className="text-red-500" size={32} />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic text-red-600 tracking-tight">Danger Zone</h3>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">Permanently terminate your SellfCompete access</p>
             </div>
          </div>
          <button className="bg-transparent border border-red-900/50 text-red-900 px-10 py-4 rounded-full font-black uppercase italic text-xs hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300">
             Delete Account & Data
          </button>
        </div>

      </div>
    </div>
  );
}