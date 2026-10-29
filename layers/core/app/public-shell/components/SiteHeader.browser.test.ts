import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h, nextTick } from 'vue'

import { useLocale } from '#layers/core/app/i18n/useI18n'

import SiteFooter from './SiteFooter.vue'
import SiteHeader from './SiteHeader.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  useLocale().value = 'en'
})

const PublicShell = defineComponent({
  setup: () => () => [h(SiteHeader), h(SiteFooter)],
})

test('updates public labels and links from the shared locale without locale props', async () => {
  wrapper = await mountSuspended(PublicShell, { attachTo: document.body, route: '/terms' })
  const locale = useLocale()
  locale.value = 'en'
  await nextTick()
  const header = page.getByRole('banner')
  const footer = page.getByRole('contentinfo')
  await expect
    .element(header.getByRole('link', { name: 'Documentation' }))
    .toHaveAttribute('href', '/en/documentation')
  await expect.element(footer.getByRole('link', { name: 'Boards vs Linear' })).toBeInTheDocument()

  locale.value = 'ru'
  await nextTick()
  await expect
    .element(header.getByRole('link', { name: 'Документация' }))
    .toHaveAttribute('href', '/ru/documentation')
  await expect
    .element(header.getByRole('link', { exact: true, name: 'EN' }))
    .toHaveAttribute('href', '/terms')
  await expect
    .element(footer.getByRole('link', { name: 'Публичная оферта' }))
    .toHaveAttribute('href', '/ru/terms')
  await expect
    .element(footer.getByRole('link', { name: 'Boards и Linear' }))
    .toHaveAttribute('href', '/ru/compare/linear')
})

test.each([
  ['/?source=docs#pricing', 'en', 'RU', '/ru?source=docs'],
  ['/ru#features', 'ru', 'EN', '/'],
  ['/en/documentation/concepts/issues#issue-keys', 'en', 'RU', '/ru/documentation/concepts/issues'],
] as const)(
  'keeps the page and query, but not the anchor, in language links: %s',
  async (route, language, label, href) => {
    useLocale().value = language
    wrapper = await mountSuspended(PublicShell, { attachTo: document.body, route })

    await expect
      .element(page.getByRole('banner').getByRole('link', { exact: true, name: label }))
      .toHaveAttribute('href', href)
  },
)
