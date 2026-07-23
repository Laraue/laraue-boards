import { clearNuxtData } from 'nuxt/app'
import { afterEach } from 'vitest'

afterEach(() => {
  clearNuxtData()
})
