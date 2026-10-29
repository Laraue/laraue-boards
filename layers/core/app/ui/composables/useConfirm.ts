import { useNuxtApp } from '#app'
import { createConfirmation } from '#layers/core/app/ui/feedback/createConfirmation'

export type { ConfirmOptions } from '#layers/core/app/ui/feedback/createConfirmation'

declare module '#app' {
  interface NuxtApp {
    $confirmationService?: ReturnType<typeof createConfirmation>
  }
}

export const useConfirmationService = () => {
  const app = useNuxtApp()
  if (app.$confirmationService) {
    return app.$confirmationService
  }
  const service = createConfirmation()
  app.provide('confirmationService', service)
  return service
}

export const useConfirm = () => useConfirmationService().ask
