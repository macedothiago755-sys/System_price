import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 pb-24 pt-6 sm:px-8 lg:pb-10">
        <div className="mx-auto w-full max-w-6xl animate-fade-in">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
