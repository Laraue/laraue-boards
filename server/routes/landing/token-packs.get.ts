import { createBillingApiClient } from '#infrastructure/api/client'
import { isApiError } from '#infrastructure/api/request'

import { loadTokenPacks } from '../../../app/sections/billing/tokenPacks'

// The token packs for sale. Billing is reached from here, on the server, like for the landing page's
// prices, so its address stays a server setting and the browser never calls another origin.
export default defineCachedEventHandler(
  async (event) => {
    const client = createBillingApiClient({
      baseUrl: useRuntimeConfig(event).billingApiBaseUrl,
    })
    try {
      return await loadTokenPacks(client)
    } catch (error) {
      if (isApiError(error)) {
        throw createError({ statusCode: 502, statusMessage: 'Billing is unavailable' })
      }
      throw error
    }
  },
  {
    getKey: () => 'token-packs',
    maxAge: 60,
  },
)
