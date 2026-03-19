'use client';
import { useState, useRef } from 'react';
import { FileUp, Layout, ArrowLeft, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// HATA ÇÖZÜMÜ: Next.js ortamında PDF.js worker'ının sorunsuz çalışması için CDN üzerinden worker'ı tanımlıyoruz
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface Props {
  type: 'product' | 'idea';
  onBack: () => void;
  // HATA ÇÖZÜMÜ: onStart fonksiyonuna documentContent parametresi eklendi
  onStart: (formData: { url: string; platform: string; documentContent?: string }) => void; 
  isLoading: boolean;
}

export default function AuditInputForm({ type, onBack, onStart, isLoading }: Props) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Trendyol');
  
  // YENİ STATES: Dosya yönetimi ve metin çıkarma durumları
  const [documentContent, setDocumentContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // YENİ FONKSİYON: PDF ve Word dosyalarından metin okuma motoru
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + ' ';
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword'
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }

      setDocumentContent(extractedText);
    } catch (error) {
      console.error("Document extraction error:", error);
      setFileName("Error reading file");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden">
      <button onClick={onBack} disabled={isLoading} className="absolute left-10 top-10 text-zinc-600 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-20">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="pt-12 space-y-10">
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tighter uppercase italic">
            {type === 'product' ? 'Paste Product URL' : 'Describe Your Vision'}
          </h3>
          <div className="relative group">
            {type === 'product' ? (
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                placeholder="Trendyol, Amazon, Shopify or Marketplace Link..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] py-6 px-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            ) : (
              <textarea 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                placeholder="Tell Gem about the product you want to create..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] p-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 min-h-[160px] resize-none disabled:opacity-50"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* YENİ GİZLİ INPUT: Sadece PDF ve Word */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            className="hidden" 
          />
          
          <button 
            onClick={handleUploadClick}
            disabled={isLoading || isExtracting} 
            className={`flex-1 w-full border py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all disabled:opacity-20 ${fileName && !isExtracting ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            {isExtracting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : fileName ? (
              <CheckCircle2 size={20} />
            ) : (
              <FileUp size={20} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
              {isExtracting ? 'Extracting Text...' : fileName ? fileName : 'Upload Reference (PDF/Word)'}
            </span>
          </button>
          
          <button 
            onClick={() => onStart({ url, platform, documentContent })}
            disabled={isLoading || !url}
            className="flex-[0.5] w-full bg-white text-black py-5 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Start Deep Audit <Zap size={18} fill="currentColor" /></>}
          </button>
        </div>

        <div className="pt-10 border-t border-zinc-800/50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 text-center italic">Required: Select Target Ecosystem</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Trendyol', 'Amazon', 'My Website', 'N11', 'Physical Store'].map((p) => (
              <button 
                key={p} 
                onClick={() => setPlatform(p)}
                disabled={isLoading}
                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border ${platform === p ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-zinc-700'}`}
              >
                <Layout size={16} className={platform === p ? 'opacity-100' : 'opacity-40'} />
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}