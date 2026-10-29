import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { nextTick } from 'vue'
import { RouterLink } from 'vue-router'

import { useRouter } from '#app'
import { NuxtPage } from '#components'
import { useLocale } from '#layers/core/app/i18n/useI18n'
import type { Locale } from '#layers/core/app/i18n/useI18n'

vi.mock('#layers/docs/app/DocsPage.deps.impl', () => {
  const titles = { en: 'English docs', ru: 'Русская документация' }
  const meta = (locale: Locale) => ({
    createdAt: '2026-01-01',
    description: 'Documentation',
    keywords: [],
    kind: 'root',
    order: 0,
    title: titles[locale],
    updatedAt: '2026-01-01',
  })
  return {
    createDocsPageDeps: () => ({
      getPage: async (locale: Locale) => ({
        breadcrumbs: [],
        headings: [],
        html: '<p>Docs content</p>',
        meta: meta(locale),
      }),
      getTree: async (locale: Locale) => ({ children: [], meta: meta(locale), path: [] }),
    }),
  }
})

vi.mock('#layers/site/app/sections/landing/LandingPage.deps.impl', () => ({
  createLandingPageDeps: () => ({ getTariffs: async () => undefined }),
}))

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  wrapper?.unmount()
  wrapper = undefined
  await nextTick()
  useLocale().value = 'en'
})

test('switches docs EN → RU → EN and follows the landing section links', async () => {
  wrapper = await mountSuspended(NuxtPage, {
    attachTo: document.body,
    global: { components: { RouterLink } },
    route: '/en/documentation',
    scoped: true,
  })
  const header = page.getByRole('banner')
  await expect.element(page.getByRole('heading', { name: 'English docs' })).toBeInTheDocument()

  await header.getByRole('link', { exact: true, name: 'RU' }).click()
  await expect
    .element(page.getByRole('heading', { name: 'Русская документация' }))
    .toBeInTheDocument()
  await header.getByRole('link', { exact: true, name: 'EN' }).click()
  await expect.element(page.getByRole('heading', { name: 'English docs' })).toBeInTheDocument()

  for (const [label, hash] of [
    ['Features', '#features'],
    ['Pricing', '#pricing'],
    ['FAQ', '#faq'],
  ]) {
    const link = header.getByRole('link', { exact: true, name: label })
    await expect.element(link).toHaveAttribute('href', `/${hash}`)
    await link.click()
    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Tasks from')
    await expect.poll(() => useRouter().currentRoute.value.fullPath).toBe(`/${hash}`)
  }
})
