import createFetchClient from 'openapi-fetch'

import type { paths } from '#infrastructure/api/generated'

export type CreateApiClientOptions = {
  baseUrl: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

export const createApiClient = ({
  baseUrl,
  fetch = globalThis.fetch,
  headers,
}: CreateApiClientOptions) => {
  return Object.assign(
    createFetchClient<paths>({
      baseUrl,
      credentials: 'include',
      fetch,
      headers,
    }),
    { baseUrl },
  )
}

export type ApiClient = ReturnType<typeof createApiClient>
