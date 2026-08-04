import { sanitize } from 'isomorphic-dompurify'
import { marked } from 'marked'

const preserveLeadingSpaces = (markdown: string): string =>
  markdown
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^ +/, (spaces) => '\u00A0'.repeat(spaces.length)))
    .join('\n')

export const renderMarkdown = (markdown: string): string =>
  sanitize(
    marked.parse(preserveLeadingSpaces(markdown), {
      async: false,
      breaks: true,
      gfm: true,
    }),
  )
