import React from 'react'

interface RichText {
  plain_text: string
  href?: string
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
  }
}

function renderRichText(richText: RichText[]): React.ReactNode {
  if (!richText || !richText.length) return null
  return richText.map((text, idx) => {
    let element: React.ReactNode = text.plain_text
    if (text.annotations?.code) {
      element = (
        <code className="font-mono text-[0.9em] bg-line/40 px-1.5 py-0.5 rounded">
          {element}
        </code>
      )
    }
    if (text.annotations?.bold) element = <strong>{element}</strong>
    if (text.annotations?.italic) element = <em>{element}</em>
    if (text.annotations?.strikethrough) element = <s>{element}</s>
    if (text.annotations?.underline) element = <u>{element}</u>
    if (text.href) {
      element = (
        <a
          href={text.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 decoration-ink-muted hover:decoration-ink"
        >
          {element}
        </a>
      )
    }
    return <React.Fragment key={idx}>{element}</React.Fragment>
  })
}

type GroupedItem = any | { type: 'numbered_list'; items: any[] } | { type: 'bulleted_list'; items: any[] }

export default function NotionRenderer({ blocks }: { blocks: any[] }) {
  const grouped: GroupedItem[] = []
  let current: any = null

  blocks.forEach((block) => {
    if (block.type === 'numbered_list_item') {
      if (current?.type === 'numbered_list') {
        current.items.push(block)
      } else {
        current = { type: 'numbered_list', items: [block] }
        grouped.push(current)
      }
    } else if (block.type === 'bulleted_list_item') {
      if (current?.type === 'bulleted_list') {
        current.items.push(block)
      } else {
        current = { type: 'bulleted_list', items: [block] }
        grouped.push(current)
      }
    } else {
      current = null
      grouped.push(block)
    }
  })

  return (
    <div className="space-y-6">
      {grouped.map((item, idx) => (
        <Block key={idx} block={item} />
      ))}
    </div>
  )
}

function Block({ block }: { block: GroupedItem }) {
  if (block.type === 'numbered_list') {
    return (
      <ol className="numbered-list space-y-4 my-8">
        {block.items.map((item: any) => (
          <li key={item.id}>{renderRichText(item.numbered_list_item.rich_text)}</li>
        ))}
      </ol>
    )
  }

  if (block.type === 'bulleted_list') {
    return (
      <ul className="bulleted-list space-y-3 my-6">
        {block.items.map((item: any) => (
          <li key={item.id}>{renderRichText(item.bulleted_list_item.rich_text)}</li>
        ))}
      </ul>
    )
  }

  switch (block.type) {
    case 'paragraph': {
      const text = block.paragraph.rich_text
      if (!text.length) return <div className="h-2" />
      return <p className="leading-relaxed text-lg">{renderRichText(text)}</p>
    }
    case 'heading_1':
      return (
        <h2 className="font-serif text-3xl md:text-4xl mt-16 mb-5 leading-tight tracking-tight">
          {renderRichText(block.heading_1.rich_text)}
        </h2>
      )
    case 'heading_2':
      return (
        <h3 className="font-serif text-2xl md:text-3xl mt-14 mb-4 leading-tight tracking-tight">
          {renderRichText(block.heading_2.rich_text)}
        </h3>
      )
    case 'heading_3':
      return (
        <h4 className="font-serif italic text-xl md:text-2xl mt-12 mb-3 text-ink leading-tight">
          {renderRichText(block.heading_3.rich_text)}
        </h4>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-ink pl-6 my-10 italic text-xl leading-relaxed text-ink/80">
          {renderRichText(block.quote.rich_text)}
        </blockquote>
      )
    case 'callout':
      return (
        <div className="border border-line bg-paper px-6 py-5 my-8 rounded-sm">
          <div className="leading-relaxed">{renderRichText(block.callout.rich_text)}</div>
        </div>
      )
    case 'divider':
      return (
        <div className="my-16 flex justify-center">
          <span className="smallcaps text-ink-muted text-xs tracking-[0.4em]">§</span>
        </div>
      )
    case 'image': {
      const src =
        block.image.type === 'external' ? block.image.external.url : block.image.file.url
      const caption = block.image.caption?.map((c: any) => c.plain_text).join('') || ''
      return (
        <figure className="my-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption} className="w-full h-auto" loading="lazy" />
          {caption && (
            <figcaption className="mt-3 text-center text-sm text-ink-muted italic">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }
    case 'code':
      return (
        <pre className="bg-ink/5 border border-line rounded p-4 overflow-x-auto my-6">
          <code className="font-mono text-sm">
            {block.code.rich_text.map((t: any) => t.plain_text).join('')}
          </code>
        </pre>
      )
    case 'table': {
      const rows = block.children || []
      if (!rows.length) return null
      const hasColumnHeader = block.table?.has_column_header
      return (
        <div className="my-12 -mx-6 md:mx-0 overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row: any, rowIdx: number) => {
                const cells = row.table_row?.cells || []
                const isHeader = hasColumnHeader && rowIdx === 0
                return (
                  <tr
                    key={row.id}
                    className={
                      isHeader
                        ? 'border-b-2 border-ink'
                        : 'border-b border-line/60 last:border-b-0'
                    }
                  >
                    {cells.map((cell: RichText[], cellIdx: number) =>
                      isHeader ? (
                        <th
                          key={cellIdx}
                          className="px-4 py-3 text-left align-top font-serif italic text-base md:text-lg text-ink font-normal"
                        >
                          {renderRichText(cell)}
                        </th>
                      ) : (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 text-left align-top leading-relaxed text-base"
                        >
                          {renderRichText(cell)}
                        </td>
                      )
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }
    case 'column_list':
      return (
        <div className="my-8 grid gap-6 md:grid-cols-2">
          {(block.children || []).map((col: any) => (
            <div key={col.id}>
              {(col.children || []).map((child: any, idx: number) => (
                <Block key={idx} block={child} />
              ))}
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}
