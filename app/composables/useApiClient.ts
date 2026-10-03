import { createApiClient } from '#infrastructure/api/client'

// Pages that work without signing in; anywhere else a 401 means the session is gone.
const PUBLIC_LAYOUTS = new Set(['landing', 'public'])

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const router = useRouter()

  const client = createApiClient({
    baseUrl: config.public.boardsApiBaseUrl,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  client.use({
    onResponse: async ({ response, schemaPath }) => {
      const route = router.currentRoute.value
      if (
        response.status !== 401 ||
        // Here a 401 means no organization is selected yet, not a lost session.
        schemaPath === '/api/organizations/current' ||
        PUBLIC_LAYOUTS.has(String(route.meta.layout))
      ) {
        return
      }
      await nuxtApp.runWithContext(() =>
        navigateTo({ path: '/login', query: { redirect: route.fullPath } }),
      )
    },
  })

  return client
}
