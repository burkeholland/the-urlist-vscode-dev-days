import { NewListForm } from '@/components/new-list-form'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const value = params?.url
  const initialUrl = Array.isArray(value) ? value[0] : value
  
  return (
    <div className="mx-auto max-w-[960px] px-4 py-16" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <NewListForm initialUrl={typeof initialUrl === 'string' ? initialUrl : undefined} />
    </div>
  )
}
