import { expect, test } from 'vitest'

import { useRouter } from '#app'
import { useLocaleHead, useLocalePath } from '#imports'
import { useLocale } from '#layers/core/app/i18n/useI18n'

test('localizes public routes while keeping workspace routes unprefixed', () => {
  const localePath = useLocalePath()
  expect(localePath('index', 'en')).toBe('/')
  expect(localePath('index', 'ru')).toBe('/ru')
  expect(localePath('terms', 'en')).toBe('/terms')
  expect(localePath('terms', 'ru')).toBe('/ru/terms')
  expect(localePath('compare-linear', 'ru')).toBe('/ru/compare/linear')
  expect(localePath('compare-linear', 'en')).toBe('/compare/linear')
  expect(localePath({ hash: '#features', name: 'index' }, 'en')).toBe('/#features')
  expect(localePath({ name: 'documentation-path', params: { path: [] } }, 'en')).toBe(
    '/documentation',
  )
  expect(localePath({ name: 'documentation-path', params: { path: [] } }, 'ru')).toBe(
    '/ru/documentation',
  )
  expect(
    localePath({ name: 'documentation-path', params: { path: ['concepts', 'issues'] } }, 'en'),
  ).toBe('/documentation/concepts/issues')
  expect(
    localePath({ name: 'documentation-path', params: { path: ['concepts', 'issues'] } }, 'ru'),
  ).toBe('/ru/documentation/concepts/issues')
  const router = useRouter()
  expect(router.resolve({ name: 'organizations' }).path).toBe('/organizations')
  expect(router.resolve({ name: 'account' }).path).toBe('/account')
  expect(router.resolve({ name: 'login' }).meta.i18n).toBe(false)
  expect(
    router.getRoutes().some((route) => String(route.name).startsWith('organizations___')),
  ).toBe(false)
})

test.each([
  ['/compare/linear', 'en', '/ru/compare/linear', 'en_US'],
  ['/documentation/concepts/issues', 'en', '/ru/documentation/concepts/issues', 'en_US'],
  ['/ru/documentation/concepts/issues', 'ru', '/documentation/concepts/issues', 'ru_RU'],
] as const)(
  'generates canonical and alternate URLs for %s',
  async (path, locale, alternate, ogLocale) => {
    const router = useRouter()
    await router.push(path)
    useLocale().value = locale
    const head = useLocaleHead({ seo: true })
    expect(head.value.link).toContainEqual(
      expect.objectContaining({
        href: `https://boards.laraue.com${path}`,
        rel: 'canonical',
      }),
    )
    expect(head.value.meta).toContainEqual(
      expect.objectContaining({ content: ogLocale, property: 'og:locale' }),
    )
    expect(head.value.link).toContainEqual(
      expect.objectContaining({
        href: `https://boards.laraue.com${alternate}`,
        rel: 'alternate',
      }),
    )
  },
)
