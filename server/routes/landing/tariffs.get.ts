import { createBillingApiClient } from '#infrastructure/api/client'
import { isApiError } from '#infrastructure/api/request'

import { loadLandingTariffs } from '../../../app/sections/landing/landingTariffs'

// The landing page's prices. Billing is reached from here, on the server, so its address stays a
// server setting and the browser never calls another origin (no CORS on Billing needed).
export default defineCachedEventHandler(
  async (event) => {
    const client = createBillingApiClient({
      baseUrl: useRuntimeConfig(event).billingApiBaseUrl,
    })
    try {
      return await loadLandingTariffs(client)
    } catch (error) {
      if (isApiError(error)) {
        throw createError({ statusCode: 502, statusMessage: 'Billing is unavailable' })
      }
      throw error
    }
  },
  {
    getKey: () => 'landing-tariffs',
    maxAge: 60,
  },
)
