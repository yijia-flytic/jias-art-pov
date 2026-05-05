import { Client } from '@notionhq/client'
import type { Post, PostWithContent } from './types'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID || ''

// Block types whose children we need to fetch recursively (for rendering)
const BLOCKS_WITH_RENDERED_CHILDREN = ['table', 'column_list', 'column']

/**
 * Fetch all published posts, sorted by Date descending.
 */
export async function getAllPosts(): Promise<Post[]> {
  if (!databaseId) {
    console.warn('NOTION_DATABASE_ID is not set')
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: { equals: 'Published' },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    })
    return response.results.map((page: any) => parsePost(page))
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    return []
  }
}

/**
 * Fetch a single post (with its content blocks) by slug.
 */
export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
  if (!databaseId) return null

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'Published' } },
          { property: 'Slug', rich_text: { equals: slug } },
        ],
      },
    })

    if (!response.results.length) return null

    const page: any = response.results[0]
    const post = parsePost(page)
    const blocks = await getAllBlocks(page.id)

    return { ...post, blocks }
  } catch (err) {
    console.error(`Failed to fetch post "${slug}":`, err)
    return null
  }
}

/**
 * Fetch all blocks for a page, paginating until done.
 * Recursively fetches children for blocks that need them for rendering (e.g. tables).
 */
async function getAllBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = []
  let cursor: string | undefined

  while (true) {
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...response.results)
    if (!response.has_more) break
    cursor = response.next_cursor || undefined
  }

  // For blocks that have rendered children (table rows, columns), fetch them
  for (const block of blocks) {
    if (block.has_children && BLOCKS_WITH_RENDERED_CHILDREN.includes(block.type)) {
      block.children = await getAllBlocks(block.id)
    }
  }

  return blocks
}

function parsePost(page: any): Post {
  const props = page.properties || {}
  const cover =
    page.cover?.type === 'external'
      ? page.cover.external.url
      : page.cover?.type === 'file'
      ? page.cover.file.url
      : getFile(props.CoverImage)

  return {
    id: page.id,
    slug: getText(props.Slug),
    title: getText(props.Name) || getText(props.Title),
    date: props.Date?.date?.start || '',
    painting: getText(props.Painting),
    artist: getText(props.Artist),
    year: getText(props.Year),
    coverImage: cover,
    excerpt: getText(props.Excerpt),
  }
}

function getText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') {
    return prop.title.map((t: any) => t.plain_text).join('')
  }
  if (prop.type === 'rich_text') {
    return prop.rich_text.map((t: any) => t.plain_text).join('')
  }
  if (prop.type === 'url') return prop.url || ''
  return ''
}

function getFile(prop: any): string | null {
  if (!prop || prop.type !== 'files') return null
  const file = prop.files?.[0]
  if (!file) return null
  if (file.type === 'external') return file.external.url
  if (file.type === 'file') return file.file.url
  return null
}
