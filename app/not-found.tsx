import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="smallcaps text-xs text-ink-muted mb-6">Error 404</p>
      <h1 className="font-serif text-5xl md:text-6xl italic leading-tight mb-6">
        Not found.
      </h1>
      <p className="text-ink-muted text-lg leading-relaxed mb-12">
        The entry you&rsquo;re looking for doesn&rsquo;t exist, or hasn&rsquo;t been written yet.
      </p>
      <Link
        href="/"
        className="smallcaps text-xs border-b border-ink pb-0.5 hover:opacity-60 transition-opacity"
      >
        Return to index
      </Link>
    </main>
  )
}
