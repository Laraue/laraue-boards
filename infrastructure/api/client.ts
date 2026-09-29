import createFetchClient from 'openapi-fetch'

import type { paths as BillingPaths } from '#infrastructure/api/billing.generated'
import type { paths } from '#infrastructure/api/generated'
import type { paths as RetroPaths } from '#infrastructure/api/retro.generated'

export type CreateApiClientOptions = {
  baseUrl: string
  credentials?: RequestCredentials
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

const createClient = <Paths extends {}>({
  baseUrl,
  credentials = 'include',
  fetch = globalThis.fetch,
  headers,
}: CreateApiClientOptions) => {
  return Object.assign(
    createFetchClient<Paths>({
      baseUrl,
      credentials,
      fetch,
      headers,
    }),
    { baseUrl },
  )
}

export const createApiClient = (options: CreateApiClientOptions) => createClient<paths>(options)
export const createRetroApiClient = (options: CreateApiClientOptions) =>
  createClient<RetroPaths>(options)

// Public Billing endpoints (tariffs): no cookies, since the browser calls another origin.
export const createBillingApiClient = (options: CreateApiClientOptions) =>
  createClient<BillingPaths>({ credentials: 'omit', ...options })

export type ApiClient = ReturnType<typeof createApiClient>
export type RetroApiClient = ReturnType<typeof createRetroApiClient>
export type BillingApiClient = ReturnType<typeof createBillingApiClient>
