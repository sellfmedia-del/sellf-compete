import type { Metadata } from "next";
import Header from "@/src/components/dashboard/Header"; // Header'ı çağırıyoruz

export const metadata: Metadata = {
  title: "Dashboard | SellfCompete",
  description: "Market Intelligence Hub",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      {/* Header her sayfada en üstte */}
      <Header />
      
      {/* Sayfa İçeriği buraya basılacak */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}