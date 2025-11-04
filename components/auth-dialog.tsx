"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// AuthDialog now uses a centered Dialog (was Sheet slide-over)
export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/confirm` // must align with email template override
          }
        })
        if (error) throw error
        setMessage('Check your email to confirm your account. Once confirmed you can sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onOpenChange(false)
      }
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'signup' ? 'Create your account' : 'Sign in to urlist'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === 'signup' ? (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('signin')}
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('signup')}
              >
                Need an account? Create one
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
