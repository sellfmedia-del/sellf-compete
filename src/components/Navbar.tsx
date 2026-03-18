import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Sol: Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter text-white">
          SELLFCOMPETE
        </Link>

        {/* Orta: Linkler */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* Sağ: Aksiyonlar */}
        <div className="flex items-center gap-6">
          <Link href="/register" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Sign Up
          </Link>
          <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5">
            Dashboard
          </Link>
        </div>

      </div>
    </nav>
  );
}