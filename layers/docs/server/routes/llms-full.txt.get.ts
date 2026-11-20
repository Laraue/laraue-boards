import { defineEventHandler, setResponseHeader } from 'h3'

import { renderLlmsFullTxt } from '../docs/docsMarkdown'
import { useDocsCatalog } from '../docs/useDocsCatalog'
import { useSiteOrigin } from '../docs/useSiteOrigin'

// Every English docs page in one file, for an agent or a person to give to an LLM at once.
export default defineEventHandler(async (event) => {
  const catalog = await useDocsCatalog()

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return renderLlmsFullTxt(catalog.entries('en'), useSiteOrigin(event))
})
