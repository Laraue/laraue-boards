import { createBillingApiClient } from '#infrastructure/api/client'

import { createGetTariffs } from '../../../app/sections/landing/deps-impl/getTariffs'

// The landing page's prices. Billing is reached from here, on the server, so its address stays a
// server setting and the browser never calls another origin (no CORS on Billing needed).
export default defineCachedEventHandler(
  async (event) => {
    const { currency } = getQuery(event)
    if (currency !== 'USD' && currency !== 'RUB') {
      throw createError({ statusCode: 400, statusMessage: 'Unknown currency' })
    }

    const client = createBillingApiClient({
      baseUrl: useRuntimeConfig(event).billingApiBaseUrl,
    })
    const result = await createGetTariffs(client)(currency)
    if (result.status === 'error') {
      throw createError({ statusCode: 502, statusMessage: 'Billing is unavailable' })
    }

    return result.data
  },
  {
    getKey: (event) => `landing-tariffs-${String(getQuery(event).currency)}`,
    maxAge: 60,
  },
)
