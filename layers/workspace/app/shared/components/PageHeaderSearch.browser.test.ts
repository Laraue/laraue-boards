import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h, ref } from 'vue'

import PageHeaderSearch from './PageHeaderSearch.vue'

it('keeps the search query when switching between mobile and desktop', async () => {
  await page.viewport(390, 844)
  const query = ref('')
  const wrapper = await mountSuspended(
    defineComponent({
      setup: () => () =>
        h(PageHeaderSearch, {
          label: 'Search issues',
          modelValue: query.value,
          'onUpdate:modelValue': (value: string) => {
            query.value = value
          },
        }),
    }),
    { attachTo: document.body },
  )
  try {
    const input = page.getByRole('searchbox', { name: 'Search issues' })
    await input.fill('bug')
    expect(query.value).toBe('bug')
    await page.viewport(1440, 900)
    await expect.element(page.getByRole('searchbox', { name: 'Search issues' })).toHaveValue('bug')
  } finally {
    wrapper.unmount()
    await page.viewport(1440, 900)
  }
})
