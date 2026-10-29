import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h, provide, ref } from 'vue'

import { sidebarOpenKey } from '#layers/workspace/app/shared/composables/useSidebarOpen'

import PageHeader from './PageHeader.vue'

const shell = (name: string) =>
  defineComponent({
    setup() {
      const open = ref(false)
      provide(sidebarOpenKey, open)
      return () =>
        h('section', { 'aria-label': name, role: 'region' }, [
          h(PageHeader, { title: name }),
          h('output', open.value ? 'open' : 'closed'),
        ])
    },
  })

it('opens only the sidebar owned by its surrounding shell', async () => {
  const First = shell('First'),
    Second = shell('Second')
  const wrapper = await mountSuspended(
    defineComponent({
      setup: () => () => [h(First), h(Second)],
    }),
    { attachTo: document.body },
  )
  try {
    // The mobile button is hidden at desktop widths; trigger the same handler through the component.
    await wrapper.find('.page-header-menu').trigger('click')
    await expect
      .element(page.getByRole('region', { name: 'First' }).getByText('open'))
      .toBeVisible()
    await expect
      .element(page.getByRole('region', { name: 'Second' }).getByText('closed'))
      .toBeVisible()
  } finally {
    wrapper.unmount()
  }
})

it('shows the refresh button only when the section passes what it reloads', async () => {
  const wrapper = await mountSuspended(PageHeader, {
    attachTo: document.body,
    props: { title: 'Page' },
  })
  try {
    await expect.element(page.getByRole('button', { name: 'Refresh' })).not.toBeInTheDocument()
    await wrapper.setProps({ onRefresh: () => undefined })
    await expect.element(page.getByRole('button', { name: 'Refresh' })).toBeVisible()
  } finally {
    wrapper.unmount()
  }
})
