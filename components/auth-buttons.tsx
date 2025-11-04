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
        <span className="text-sm text-muted-foreground truncate max-w-[140px]" title={userEmail}>{userEmail}</span>
        <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Sign in</Button>
      <Button onClick={() => setOpen(true)}>Get Started</Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
