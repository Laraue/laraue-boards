import { createError, defineEventHandler, getRequestURL, setResponseHeaders } from 'h3'

import { parseDocsMarkdownPath, renderDocMarkdownCopy } from '../docs/docsMarkdown'
import { useDocsCatalog } from '../docs/useDocsCatalog'
import { useSiteOrigin } from '../docs/useSiteOrigin'

// The markdown copy of a docs page: the page's address plus `.md`, e.g.
// /documentation/integrations/mcp.md. A middleware and not a route: a `/documentation/**` route
// would take the pages' own addresses from the Vue page too.
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    return
  }

  const target = parseDocsMarkdownPath(getRequestURL(event).pathname)
  if (!target) {
    return
  }

  const entry = (await useDocsCatalog()).entry(target.locale, target.path)
  if (!entry) {
    throw createError({ statusCode: 404 })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/markdown; charset=utf-8',
    // The page itself is what search engines should show.
    'X-Robots-Tag': 'noindex',
  })

  return renderDocMarkdownCopy(entry, target.locale, useSiteOrigin(event))
})
