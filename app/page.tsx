import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4facfe] to-[#00f2fe] relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl bg-white/10">
        <div className="mx-auto flex h-14 items-center px-4" style={{ maxWidth: 960 }}>
          <div className="mr-6 flex items-center gap-2">
            <div className="w-7 h-7 bg-white text-[#4facfe] rounded-lg flex items-center justify-center font-bold text-sm">U</div>
            <span className="font-semibold tracking-tight text-white">urlist</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link href="/" className="text-white transition-colors hover:text-white/80">Home</Link>
            <Link href="/features" className="text-white/80 transition-colors hover:text-white">Features</Link>
            <Link href="/pricing" className="text-white/80 transition-colors hover:text-white">Pricing</Link>
            <Link href="/about" className="text-white/80 transition-colors hover:text-white">About</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Sign in</Button>
            <Button size="sm" className="bg-white text-[#4facfe] hover:bg-white/90">Get Started</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="grid gap-4 py-4">
                  <Link href="/" className="text-sm font-medium hover:text-primary">Home</Link>
                  <Link href="/features" className="text-sm font-medium hover:text-primary">Features</Link>
                  <Link href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
                  <Link href="/about" className="text-sm font-medium hover:text-primary">About</Link>
                  <Button variant="outline" size="sm" className="mt-2 justify-start">Sign in</Button>
                  <Button size="sm" className="justify-start">Get Started</Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center relative z-10" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
        <div className="text-center max-w-4xl">
          <h1 className="text-7xl md:text-8xl font-black mb-6 text-white drop-shadow-lg">
            The Urlist
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-16 font-medium">
            Your links deserve a beautiful home
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10">
            <p className="text-xl font-semibold text-white mb-8" id="url-input-description">
              Drop your first link and watch the magic happen ✨
            </p>
            <div className="bg-white rounded-2xl p-2">
              <input 
                type="url" 
                placeholder="https://your-awesome-link.com" 
                aria-label="Enter your URL to create a list"
                aria-describedby="url-input-description"
                className="w-full px-8 py-7 text-2xl rounded-xl outline-none border-2 border-transparent focus:border-blue-300 transition-colors"
              />
            </div>
            <button className="w-full mt-6 px-8 py-7 text-2xl font-bold text-gray-900 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              Create My List 🚀
            </button>
            
            <div className="mt-10 grid grid-cols-3 gap-6 text-white">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Free</div>
                <div className="text-sm text-white/80">No limits</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Fast</div>
                <div className="text-sm text-white/80">Instant setup</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">Fun</div>
                <div className="text-sm text-white/80">Easy to use</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
