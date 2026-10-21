import DOMPurify, { sanitize } from 'isomorphic-dompurify'
import { marked } from 'marked'

const preserveLeadingSpaces = (markdown: string): string =>
  markdown
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^ +/, (spaces) => '\u00A0'.repeat(spaces.length)))
    .join('\n')

// A link in a comment opens in a new tab, so following it does not leave the issue.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export const renderMarkdown = (markdown: string): string =>
  sanitize(
    marked.parse(preserveLeadingSpaces(markdown), {
      async: false,
      breaks: true,
      gfm: true,
    }),
  )

// Markdown as plain text, for a place that shows one line of it (e.g. inside a link). Still HTML-escaped: render it
// with v-html.
export const renderMarkdownAsText = (markdown: string): string =>
  sanitize(marked.parse(markdown, { async: false, gfm: true }), {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  })
    .replace(/\s+/g, ' ')
    .trim()
