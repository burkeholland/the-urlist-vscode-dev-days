import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Redirect destination after successful confirmation
  const redirectTo = new URL(request.url)
  redirectTo.pathname = '/auth/confirmed'
  redirectTo.search = ''

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  // On error, just send them home for now (could render an error page later)
  const home = new URL(request.url)
  home.pathname = '/'
  return NextResponse.redirect(home)
}
