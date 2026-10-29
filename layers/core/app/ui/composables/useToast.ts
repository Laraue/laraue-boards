import { useNuxtApp } from '#app'
import { createToasts } from '#layers/core/app/ui/feedback/createToasts'

declare module '#app' {
  interface NuxtApp {
    $toastService?: ReturnType<typeof createToasts>
  }
}

export const useToast = () => {
  const app = useNuxtApp()
  if (app.$toastService) {
    return app.$toastService
  }
  const service = createToasts()
  app.provide('toastService', service)
  return service
}
