# Jia's point of view

A minimal, editorial-style website that pulls daily art observations from a Notion database.
Built with Next.js 14 (App Router) + Tailwind CSS + Notion API.

---

## Quick start (15 minutes total)

### 1. Install dependencies

```bash
cd jia-point-of-view
npm install
```

### 2. Create your Notion integration

1. Go to https://www.notion.so/my-integrations
2. Click **+ New integration**
3. Name it (e.g. "Jia's site"), pick a workspace, leave permissions default → **Submit**
4. Copy the **Internal Integration Secret** (starts with `secret_` or `ntn_`)

### 3. Create your Notion database

Create a new database in Notion with these properties (exact names matter):

| Property name | Type | Notes |
|---|---|---|
| `Name` | Title | The post title |
| `Slug` | Text | URL-safe identifier, e.g. `day-1-girl-with-pearl-earring` |
| `Date` | Date | Publish date |
| `Painting` | Text | "Girl with a Pearl Earring" |
| `Artist` | Text | "Vermeer" |
| `Year` | Text | "1665" |
| `Excerpt` | Text | Short summary shown on home page |
| `CoverImage` | Files & media | Optional (you can also use the page cover instead) |
| `Status` | Select | Options: `Draft`, `Published` (only `Published` posts show) |

The body of each Notion page is the article content (paragraphs, headings,
numbered lists, images, quotes, dividers — all supported).

### 4. Connect the integration to your database

1. Open your database in Notion
2. Click `…` (top right) → **Connections** → **Connect to** → pick your integration
3. The integration now has read access to this database

### 5. Get the database ID

From the database URL `https://www.notion.so/<workspace>/<DATABASE_ID>?v=…`,
copy the `<DATABASE_ID>` part (32 characters, no dashes needed).

### 6. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 7. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

---

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → **New Project** → import your repo
3. In **Environment Variables**, add `NOTION_TOKEN` and `NOTION_DATABASE_ID`
4. Click **Deploy**

That's it. Live in ~2 minutes.

### Updating content

The site revalidates every hour. After publishing a new Notion post:
- Wait up to 1 hour (default), OR
- Trigger a manual rebuild in the Vercel dashboard, OR
- Set up a Notion webhook → Vercel deploy hook (advanced, do later)

---

## Design

- **Aesthetic**: editorial / museum publication. Warm cream paper, deep ink text, all-Fraunces typography.
- **Palette**: `--paper #FAF7F2`, `--ink #1C1B17`, `--ink-muted #6B6862`, `--line #E8E3D9`
- **Type**: [Fraunces](https://fonts.google.com/specimen/Fraunces) — distinctive serif with optical sizing
- **Layout**: max-width 720px, generous vertical rhythm, no sidebar, no clutter

The design is intentionally restrained. The content is the focus, not the chrome.

---

## Project structure

```
jia-point-of-view/
├── app/
│   ├── layout.tsx          ← Root layout, font loading, metadata
│   ├── page.tsx            ← Home page (list of posts)
│   ├── globals.css         ← Global styles, design tokens
│   ├── not-found.tsx       ← 404 page
│   └── posts/[slug]/
│       └── page.tsx        ← Individual post page
├── components/
│   └── NotionRenderer.tsx  ← Custom renderer for Notion blocks
├── lib/
│   ├── notion.ts           ← Notion API client + queries
│   └── types.ts            ← Post / PostWithContent types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## Customizing

- **Site title**: `app/layout.tsx` (metadata) and `app/page.tsx` (masthead h1)
- **Colors / fonts**: `app/globals.css` (CSS variables) and `app/layout.tsx` (Google Font)
- **Post layout**: `app/posts/[slug]/page.tsx`
- **Block rendering**: `components/NotionRenderer.tsx`

---

## Troubleshooting

- **"NOTION_DATABASE_ID is not set"** — environment variable missing or named wrong
- **Empty home page** — check that posts have `Status = Published` and that the integration is connected to the database
- **Image doesn't load** — Notion image URLs expire after 1 hour. The `revalidate = 3600` setting refreshes them. If you want something more permanent, consider adding an image-caching layer.
- **Property errors** — make sure the Notion property names match exactly (case-sensitive): `Name`, `Slug`, `Date`, `Painting`, `Artist`, `Year`, `Excerpt`, `Status`

---

Made with conviction, not Inter.
