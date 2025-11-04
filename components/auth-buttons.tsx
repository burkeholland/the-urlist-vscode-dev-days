"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/auth-dialog'

export function AuthButtons({ initialUserEmail }: { initialUserEmail: string | null }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/90 truncate max-w-[140px]" title={userEmail}>{userEmail}</span>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleSignOut}>Sign out</Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => setOpen(true)}>Sign in</Button>
      <Button size="sm" className="bg-white text-[#4facfe] hover:bg-white/90" onClick={() => setOpen(true)}>Get Started</Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
