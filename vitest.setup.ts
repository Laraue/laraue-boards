import { clearNuxtData } from 'nuxt/app'
import { afterEach, vi } from 'vitest'

// Component tests choose the native dialog explicitly; production has no environment-based fallback.
vi.mock('#layers/core/app/ui/composables/useConfirm', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#layers/core/app/ui/composables/useConfirm')>()),
  useConfirm: vi.fn<typeof import('#layers/core/app/ui/composables/useConfirm').useConfirm>(
    () => async (options) =>
      window.confirm([options.title, options.description].filter(Boolean).join(' ')),
  ),
}))

afterEach(() => {
  clearNuxtData()
})
