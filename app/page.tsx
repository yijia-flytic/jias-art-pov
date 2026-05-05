import Link from 'next/link'
import { getAllPosts } from '@/lib/notion'

// Revalidate every hour. Push to Notion → wait up to 1h, or trigger a Vercel rebuild.
export const revalidate = 3600

export default async function Home() {
  const posts = await getAllPosts()
  const total = posts.length

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      {/* Masthead */}
      <header className="mb-20 md:mb-28">
        <h1 className="font-serif font-light text-6xl md:text-8xl leading-[0.92] tracking-[-0.02em]">
          Jia&rsquo;s
          <br />
          <span className="italic">point of view</span>
        </h1>
        <p className="mt-10 text-ink-muted text-lg leading-relaxed max-w-md italic">
          Daily observations on paintings, one work at a time.
          <br />A learning record by an absolute beginner.
        </p>
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px w-12 bg-ink"></div>
          <span className="smallcaps text-sm text-ink-muted">
            {total === 0 ? 'Coming soon' : `${total} ${total === 1 ? 'entry' : 'entries'}`}
          </span>
        </div>
      </header>

      {/* Index */}
      <section className="space-y-16 md:space-y-20">
        {total === 0 ? (
          <EmptyState />
        ) : (
          posts.map((post, idx) => (
            <article key={post.id} className="group">
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="flex items-baseline gap-6 mb-4">
                  <span className="smallcaps text-sm text-ink-muted">
                    {formatDate(post.date)}
                  </span>
                  <span className="smallcaps text-sm text-ink-muted">
                    №&nbsp;{String(total - idx).padStart(3, '0')}
                  </span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-3 transition-colors group-hover:text-ink-muted">
                  {post.title}
                </h2>
                {(post.artist || post.painting) && (
                  <p className="text-ink-muted italic mb-4 text-base md:text-lg">
                    {post.artist}
                    {post.painting && (
                      <>
                        {post.artist ? ', ' : ''}
                        <span className="not-italic">&ldquo;</span>
                        {post.painting}
                        <span className="not-italic">&rdquo;</span>
                      </>
                    )}
                    {post.year && ` (${post.year})`}
                  </p>
                )}
                {post.excerpt && (
                  <p className="text-ink/85 leading-relaxed text-lg max-w-2xl">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-6 inline-block smallcaps text-sm border-b border-ink pb-0.5 transition-opacity group-hover:opacity-50">
                  Read entry
                </div>
              </Link>
            </article>
          ))
        )}
      </section>

      {/* Footer */}
      <footer className="mt-32 pt-8 border-t border-line">
        <p className="smallcaps text-sm text-ink-muted">
          A build-in-public learning project · {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="py-12">
      <p className="font-serif text-2xl italic text-ink-muted leading-relaxed">
        The first entry is being written.
      </p>
      <p className="mt-4 text-ink-muted leading-relaxed">
        Set up your Notion database, add a published post, and it will appear here.
        See README for setup instructions.
      </p>
    </div>
  )
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
