import { Fragment, type ReactNode } from 'react'

// A deliberately tiny Markdown-ish renderer for Journal article bodies —
// no dependency (the brief: "jangan menambah dependency berat tanpa alasan
// kuat"), and it builds real React nodes so there is no
// dangerouslySetInnerHTML / XSS surface.
//
// Supported, line-based:
//   ## Heading            -> <h2>
//   ### Subheading         -> <h3>
//   - item                 -> <ul><li>
//   1. item                -> <ol><li>
//   > quote                -> <blockquote>
//   blank line             -> paragraph break
// Inline, within any text run:
//   **bold**               -> <strong>
//   *italic*               -> <em>
//   [label](/path or https://…)  -> <a> (only /-relative or https absolute)

type Block =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let para: string[] = []
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') })
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      blocks.push(list)
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushPara()
      flushList()
      continue
    }
    const h2 = line.match(/^##\s+(.*)$/)
    const h3 = line.match(/^###\s+(.*)$/)
    const ul = line.match(/^[-*]\s+(.*)$/)
    const ol = line.match(/^\d+\.\s+(.*)$/)
    const q = line.match(/^>\s?(.*)$/)

    if (h3) {
      flushPara(); flushList()
      blocks.push({ type: 'h3', text: h3[1] })
    } else if (h2) {
      flushPara(); flushList()
      blocks.push({ type: 'h2', text: h2[1] })
    } else if (ul) {
      flushPara()
      if (list?.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
      list.items.push(ul[1])
    } else if (ol) {
      flushPara()
      if (list?.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
      list.items.push(ol[1])
    } else if (q) {
      flushPara(); flushList()
      blocks.push({ type: 'quote', text: q[1] })
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()
  return blocks
}

// Inline formatting -> React nodes.
function inline(text: string): ReactNode {
  const nodes: ReactNode[] = []
  // Split on the three inline patterns, keeping delimiters.
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((?:\/[^)\s]*|https:\/\/[^)\s]+)\))/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    const tok = m[0]
    if (tok.startsWith('**')) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('*')) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    } else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!
      const href = lm[2]
      const external = href.startsWith('https://')
      nodes.push(
        <a
          key={key++}
          href={href}
          className="text-luxury-gold underline decoration-luxury-gold/40 underline-offset-2 hover:decoration-luxury-gold"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {lm[1]}
        </a>
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return nodes
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = parseBlocks(body)
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={i} className="pt-4 font-fraunces text-2xl leading-tight text-luxury-ivory">
                {inline(b.text)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="pt-2 font-fraunces text-xl leading-tight text-luxury-ivory">
                {inline(b.text)}
              </h3>
            )
          case 'quote':
            return (
              <blockquote key={i} className="border-l-2 border-luxury-gold/50 pl-4 font-luxury-sans text-base italic text-luxury-taupe">
                {inline(b.text)}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-3 font-luxury-sans text-base leading-relaxed text-luxury-taupe">
                    <span aria-hidden className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-3 font-luxury-sans text-base leading-relaxed text-luxury-taupe">
                    <span aria-hidden className="font-fraunces text-sm text-luxury-gold">{j + 1}.</span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            )
          default:
            return (
              <p key={i} className="font-luxury-sans text-base leading-relaxed text-luxury-taupe">
                {inline(b.text)}
              </p>
            )
        }
      })}
    </div>
  )
}
