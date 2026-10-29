import { useRequestHeaders, useRuntimeConfig } from '#app'
import { createApiClient } from '#infrastructure/api/client'

export const useApiClient = ({
  onUnauthorized,
}: {
  onUnauthorized?: (schemaPath: string) => Promise<unknown> | void
}) => {
  const config = useRuntimeConfig()

  const client = createApiClient({
    baseUrl: config.public.boardsApiBaseUrl,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  client.use({
    onResponse: async ({ response, schemaPath }) => {
      if (response.status === 401) {
        await onUnauthorized?.(schemaPath)
      }
    },
  })

  return client
}
