import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 items-center px-4" style={{ maxWidth: 960 }}>
          <div className="mr-6 flex items-center gap-2">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <span className="font-semibold tracking-tight">urlist</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm">
        <a href="/" className="transition-colors hover:text-primary">Home</a>
        <a href="/features" className="text-muted-foreground transition-colors hover:text-primary">Features</a>
        <a href="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</a>
        <a href="/about" className="text-muted-foreground transition-colors hover:text-primary">About</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm">Sign in</Button>
        <Button size="sm">Get Started</Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="grid gap-4 py-4">
          <a href="/" className="text-sm font-medium hover:text-primary">Home</a>
          <a href="/features" className="text-sm font-medium hover:text-primary">Features</a>
          <a href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</a>
          <a href="/about" className="text-sm font-medium hover:text-primary">About</a>
          <Button variant="outline" size="sm" className="mt-2 justify-start">Sign in</Button>
          <Button size="sm" className="justify-start">Get Started</Button>
            </nav>
          </SheetContent>
        </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
