import { sanitize } from 'isomorphic-dompurify'
import { marked } from 'marked'

export const renderMarkdown = (markdown: string): string =>
  sanitize(marked.parse(markdown, { async: false }))
