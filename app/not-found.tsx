import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center text-white">
      <h1 className="text-6xl font-black drop-shadow-lg">404: Lost in the Urlist</h1>
      <p className="text-lg text-white/80">
        Looks like this page packed up its links and left. Maybe it found a better list? Either way, let&apos;s get you home.
      </p>
      <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold">
        <Link href="/">Take me back</Link>
      </Button>
    </div>
  )
}
