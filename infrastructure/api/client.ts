import createFetchClient from 'openapi-fetch'

import type { paths } from '#infrastructure/api/generated'
import type { paths as RetroPaths } from '#infrastructure/api/retro.generated'

export type CreateApiClientOptions = {
  baseUrl: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

const createClient = <Paths extends {}>({
  baseUrl,
  fetch = globalThis.fetch,
  headers,
}: CreateApiClientOptions) => {
  return Object.assign(
    createFetchClient<Paths>({
      baseUrl,
      credentials: 'include',
      fetch,
      headers,
    }),
    { baseUrl },
  )
}

export const createApiClient = (options: CreateApiClientOptions) => createClient<paths>(options)
export const createRetroApiClient = (options: CreateApiClientOptions) =>
  createClient<RetroPaths>(options)

export type ApiClient = ReturnType<typeof createApiClient>
export type RetroApiClient = ReturnType<typeof createRetroApiClient>
