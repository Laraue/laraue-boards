import { defineEventHandler, setResponseHeader } from 'h3'

import { renderLlmsTxt } from '../docs/docsMarkdown'
import { useDocsCatalog } from '../docs/useDocsCatalog'
import { useSiteOrigin } from '../docs/useSiteOrigin'

// The docs' index for LLMs and AI agents (https://llmstxt.org).
export default defineEventHandler(async (event) => {
  const catalog = await useDocsCatalog()

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return renderLlmsTxt(catalog.tree('en'), useSiteOrigin(event))
})
