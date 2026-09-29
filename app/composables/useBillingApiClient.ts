import { createBillingApiClient } from '#infrastructure/api/client'

export const useBillingApiClient = () =>
  createBillingApiClient({ baseUrl: useRuntimeConfig().public.billingApiBaseUrl })
