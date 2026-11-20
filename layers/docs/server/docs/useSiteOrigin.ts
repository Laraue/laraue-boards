import { getRequestURL, type H3Event } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'

import { siteOrigin } from './docsMarkdown'

// The site's address: nuxt.config's siteUrl, which i18n builds the canonical and hreflang links
// from (the request's own origin if it isn't set). Read from the runtime config and not from
// nuxt-site-config, which isn't set up yet in a server middleware.
export const useSiteOrigin = (event: H3Event): string => {
  const { baseUrl } = useRuntimeConfig(event).public.i18n

  return siteOrigin(
    typeof baseUrl === 'string' && baseUrl !== '' ? baseUrl : getRequestURL(event).origin,
  )
}
