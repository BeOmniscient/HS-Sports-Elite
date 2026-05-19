import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScoresWidget } from "@/components/scores/ScoresWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <ScoresWidget />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
