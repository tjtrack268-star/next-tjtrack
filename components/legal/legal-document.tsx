import Image from "next/image"

type LegalDocumentProps = {
  title: string
  updatedAt: string
  content: string
}

type HeadingItem = {
  id: string
  text: string
  level: 2 | 3
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function isHeading(line: string): boolean {
  return /^(\d+(\.\d+)*\.)\s+/.test(line.trim())
}

function headingLevel(line: string): 2 | 3 {
  const match = line.trim().match(/^(\d+(\.\d+)*)\./)
  if (!match) return 2
  return match[1].includes(".") ? 3 : 2
}

function isListItem(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("o ")
}

function stripListPrefix(line: string): string {
  return line.trim().replace(/^(-|•|o)\s+/, "")
}

function stripHeadingPrefix(line: string): string {
  return line.trim().replace(/^(\d+(\.\d+)*\.)\s+/, "")
}

function extractHeadings(content: string): HeadingItem[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => isHeading(line))
    .map((line) => {
      const text = stripHeadingPrefix(line)
      return {
        id: slugify(text),
        text,
        level: headingLevel(line),
      }
    })
}

export function LegalDocument({ title, updatedAt, content }: LegalDocumentProps) {
  const lines = content.split("\n")
  const headings = extractHeadings(content)

  let i = 0
  const blocks: JSX.Element[] = []

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()

    if (!line) {
      i++
      continue
    }

    if (isHeading(line)) {
      const text = stripHeadingPrefix(line)
      const id = slugify(text)
      const level = headingLevel(line)
      blocks.push(
        level === 2 ? (
          <h2 key={`h2-${id}-${i}`} id={id} className="mt-8 text-xl font-semibold">
            {line}
          </h2>
        ) : (
          <h3 key={`h3-${id}-${i}`} id={id} className="mt-6 text-lg font-semibold">
            {line}
          </h3>
        ),
      )
      i++
      continue
    }

    if (isListItem(line)) {
      const items: string[] = []
      while (i < lines.length && isListItem(lines[i])) {
        items.push(stripListPrefix(lines[i]))
        i++
      }
      blocks.push(
        <ul key={`ul-${i}`} className="ml-5 list-disc space-y-1 text-sm leading-6 text-muted-foreground">
          {items.map((item, idx) => (
            <li key={`li-${i}-${idx}`}>{item}</li>
          ))}
        </ul>,
      )
      continue
    }

    const paragraph: string[] = []
    while (i < lines.length && lines[i].trim() && !isHeading(lines[i].trim()) && !isListItem(lines[i].trim())) {
      paragraph.push(lines[i].trim())
      i++
    }
    blocks.push(
      <p key={`p-${i}`} className="text-sm leading-6 text-muted-foreground">
        {paragraph.join(" ")}
      </p>,
    )
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-center">
        <Image
          src="/logo-tjtrack.jpeg"
          alt="Logo TJ TRACK"
          width={180}
          height={180}
          className="h-auto w-auto rounded-md"
          priority
        />
      </div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">Dernière mise à jour: {updatedAt}</p>

      {headings.length > 0 ? (
        <nav className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Sommaire</p>
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <li key={`toc-${heading.id}`} className={heading.level === 3 ? "ml-4" : ""}>
                <a href={`#${heading.id}`} className="text-primary hover:underline">
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <article className="relative overflow-hidden space-y-4 rounded-lg border border-border bg-card p-5">
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-semibold uppercase tracking-[0.35em] text-muted-foreground/10 select-none">
          tjtracks.com
        </span>
        <div className="relative z-10 space-y-4">{blocks}</div>
      </article>
    </main>
  )
}
