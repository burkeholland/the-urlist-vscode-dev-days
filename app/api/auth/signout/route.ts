import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut()
  }
  const url = new URL(req.url)
  url.pathname = '/'
  return NextResponse.redirect(url, { status: 302 })
}
