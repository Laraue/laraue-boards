import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import LandingVideo from './LandingVideo.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it("shows the poster and loads YouTube's player only once it's pressed", async () => {
  currentWrapper = await mountSuspended(LandingVideo, {
    attachTo: document.body,
    props: { locale: 'en' },
  })
  expect(document.querySelector('iframe')).toBeNull()

  await page.getByRole('button', { name: /Play the video/ }).click()

  const player = document.querySelector('iframe')
  expect(player?.src).toBe('https://www.youtube-nocookie.com/embed/A_yg1Asvkq0?autoplay=1&rel=0')
  expect(document.activeElement).toBe(player)
})
