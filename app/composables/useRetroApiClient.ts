import { createRetroApiClient } from '#infrastructure/api/client'

export const useRetroApiClient = () => {
  const config = useRuntimeConfig()

  return createRetroApiClient({
    baseUrl: config.public.retroApiBaseUrl,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })
}
