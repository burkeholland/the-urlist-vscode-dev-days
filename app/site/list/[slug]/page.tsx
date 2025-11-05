import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicListPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id, slug, description, is_public, created_at')
    .eq('slug', slug)
    .maybeSingle()

  if (listError || !list) {
    notFound()
  }

  if (!list.is_public) {
    notFound()
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, url, title, description, order')
    .eq('list_id', list.id)
    .order('order', { ascending: true })

  const items = links ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-white/90">
      <div className="mb-10 space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.15em] text-white/50">Curated by The Urlist</p>
        <h1 className="text-5xl font-black text-white drop-shadow-xl">/{list.slug}</h1>
        {list.description ? <p className="text-lg text-white/70">{list.description}</p> : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-white/20 bg-white/10 px-6 py-12 text-center text-white/70">
          This list is still warming up. Check back soon.
        </p>
      ) : (
        <ol className="space-y-4">
          {items.map((link, index) => (
            <li key={link.id} className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-white/50">#{index + 1}</p>
                  <a
                    href={link.url}
                    className="text-2xl font-semibold text-blue-200 hover:text-blue-100 break-words"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title || link.url}
                  </a>
                  {link.description ? <p className="text-base text-white/70">{link.description}</p> : null}
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/50">
                  Link
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
