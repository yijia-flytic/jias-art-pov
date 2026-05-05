export interface Post {
  id: string
  slug: string
  title: string
  date: string
  painting: string
  artist: string
  year: string
  coverImage: string | null
  excerpt: string
}

export interface PostWithContent extends Post {
  blocks: any[]
}
