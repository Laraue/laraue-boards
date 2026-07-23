import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import AppBackLink from './AppBackLink.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('renders the accessible route back to the previous page', async () => {
  currentWrapper = await mountSuspended(AppBackLink, {
    attachTo: document.body,
    props: { label: 'Back to board', to: '/organizations/acme-ab12/spaces/product-ab12/12' },
  })

  await expect
    .element(page.getByRole('link', { name: 'Back to board' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/spaces/product-ab12/12')
})
