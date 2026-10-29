import { navigateTo, useNuxtApp, useRouter } from '#app'

export const useSignInRedirect = () => {
  const nuxtApp = useNuxtApp()
  const router = useRouter()

  return async (schemaPath: string): Promise<void> => {
    // A 401 here can mean no organization is selected yet; the layout handles that case.
    if (schemaPath === '/api/organizations/current') {
      return
    }
    await nuxtApp.runWithContext(() =>
      navigateTo({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } }),
    )
  }
}
