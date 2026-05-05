import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllPosts, getPostBySlug } from '@/lib/notion'
import NotionRenderer from '@/components/NotionRenderer'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: "Not found — Jia's point of view" }
  return {
    title: `${post.title} — Jia's point of view`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <Link
        href="/"
        className="smallcaps text-xs text-ink-muted hover:text-ink transition-colors"
      >
        ←&nbsp;&nbsp;Index
      </Link>

      <article className="mt-12 md:mt-16">
        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="smallcaps text-xs text-ink-muted">
              {formatDate(post.date)}
            </span>
            <span className="h-px w-8 bg-ink-muted/50"></span>
            <span className="smallcaps text-xs text-ink-muted">Observation</span>
          </div>
          <h1 className="font-serif font-light text-4xl md:text-5xl leading-[1.1] tracking-tight mb-8">
            {post.title}
          </h1>
          {(post.artist || post.painting) && (
            <p className="text-ink-muted italic text-lg md:text-xl">
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
        </header>

        {post.coverImage && (
          <figure className="mb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.painting || post.title}
              className="w-full h-auto"
            />
            {post.painting && (
              <figcaption className="mt-4 text-center text-sm text-ink-muted italic">
                {post.artist}, <em className="not-italic">&ldquo;{post.painting}&rdquo;</em>
                {post.year && `, ${post.year}`}
              </figcaption>
            )}
          </figure>
        )}

        <div className="article-content">
          <NotionRenderer blocks={post.blocks} />
        </div>
      </article>

      <footer className="mt-24 md:mt-32 pt-8 border-t border-line">
        <Link
          href="/"
          className="smallcaps text-xs text-ink-muted hover:text-ink transition-colors"
        >
          ←&nbsp;&nbsp;All observations
        </Link>
      </footer>
    </main>
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
