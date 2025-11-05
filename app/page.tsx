import { UrlInputForm } from '@/components/url-input-form'

export default function Home() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-16 flex flex-col justify-center gap-10" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <div className="text-center w-full">
        <h1 className="text-7xl md:text-8xl font-black mb-6 text-white drop-shadow-lg">
          The Urlist
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 mb-16 font-medium">
          Your links deserve a beautiful home
        </p>
        <UrlInputForm />
      </div>
    </div>
  )
}
