import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidSlug, normalizeSlug, suggestAlternative } from '@/lib/slug'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawSlug = searchParams.get('slug') ?? ''
  const slug = normalizeSlug(rawSlug)

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 })
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ ok: true, available: false, slug, reason: 'invalid' }, { status: 200 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ ok: false, error: 'Failed to check slug availability' }, { status: 500 })
  }

  const available = !data
  return NextResponse.json({
    ok: true,
    available,
    slug,
    suggestion: available ? null : suggestAlternative(slug)
  })
}
