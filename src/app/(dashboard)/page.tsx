'use client'; // Etkileşimler için şart

import React, { useState } from 'react';
import AuditTypeSelector from '@/src/components/dashboard/AuditTypeSelector';
import AuditInputForm from '@/src/components/dashboard/AuditInputForm';
import AuditReport from '@/src/components/dashboard/AuditReport';

export default function DashboardPage() {
  // Durum Yönetimi: 1 (Seçim), 2 (Girdi), 3 (Rapor)
  const [step, setStep] = useState(1); 
  const [auditType, setAuditType] = useState<'product' | 'idea' | null>(null);

  // Ürün mü Fikir mi seçildiğinde tetiklenir
  const handleTypeSelect = (type: 'product' | 'idea') => {
    setAuditType(type);
    setStep(2); // İkinci adıma (Girdi formuna) geç
  };

  // "Analizi Başlat" butonuna basıldığında tetiklenir
  const startAudit = () => {
    setStep(3); // Üçüncü adıma (Rapor ekranına) geç
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
        
        {/* --- ADIM 1: SEÇİM EKRANI --- */}
        {step === 1 && (
          <div className="pt-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-tight">
                  Start New <span className="text-orange-500">Audit</span>
                </h2>
                <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-[0.2em]">Select your entry point to the ecosystem</p>
             </div>
             <AuditTypeSelector onSelect={handleTypeSelect} />
          </div>
        )}

        {/* --- ADIM 2: GİRDİ EKRANI (Link veya Prompt alanı) --- */}
        {step >= 2 && (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 3 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <AuditInputForm 
              type={auditType!} 
              onBack={() => setStep(1)} 
              onStart={startAudit}
            />
          </div>
        )}

        {/* --- ADIM 3: RAPOR EKRANI (Analiz Sonucu) --- */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="h-px bg-zinc-900 w-full my-16" />
            <AuditReport />
          </div>
        )}

      </div>
    </div>
  );
}