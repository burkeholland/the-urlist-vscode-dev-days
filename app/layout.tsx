import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthButtons } from "@/components/auth-buttons";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Urlist - Your links deserve a beautiful home",
  description: "Curate, share, and inspire. Create beautiful, shareable lists that inspire others.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe] relative overflow-hidden`}>
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl bg-white/10">
          <div className="mx-auto max-w-[960px] flex h-14 items-center px-4">
            <div className="mr-6 flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-[#4facfe] rounded-lg flex items-center justify-center font-bold text-sm">U</div>
              <span className="font-semibold tracking-tight text-white">urlist</span>
            </div>
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="/" className="text-white transition-colors hover:text-white/80">Home</a>
              <a href="/features" className="text-white/80 transition-colors hover:text-white">Features</a>
              <a href="/pricing" className="text-white/80 transition-colors hover:text-white">Pricing</a>
              <a href="/about" className="text-white/80 transition-colors hover:text-white">About</a>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <AuthButtons initialUserEmail={user?.email ?? null} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <nav className="grid gap-4 py-4">
                    <a href="/" className="text-sm font-medium hover:text-primary">Home</a>
                    <a href="/features" className="text-sm font-medium hover:text-primary">Features</a>
                    <a href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</a>
                    <a href="/about" className="text-sm font-medium hover:text-primary">About</a>
                    <AuthButtons initialUserEmail={user?.email ?? null} />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
