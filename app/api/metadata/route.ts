import { NextResponse } from 'next/server'

import { fetchLinkMetadata, MetadataError } from '@/lib/metadata'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url')

  if (!target) {
    return NextResponse.json({ ok: false, error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ ok: false, error: 'Only http and https URLs are supported' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const metadata = await fetchLinkMetadata(parsed)
    return NextResponse.json({ ok: true, ...metadata })
  } catch (error) {
    if (error instanceof MetadataError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
