import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScoresWidget } from "@/components/scores/ScoresWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScoresWidget />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
