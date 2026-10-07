import { createBillingApiClient } from '#infrastructure/api/client'

export const useBillingApiClient = () => {
  const config = useRuntimeConfig()

  return createBillingApiClient({ baseUrl: config.public.billingApiBaseUrl })
}
