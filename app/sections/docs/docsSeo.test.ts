import { assert, test } from 'vitest'

import type { DocPage } from './content/DocsContent.types'
import { buildDocsSeo } from './docsSeo'

const page = (overrides: Partial<DocPage> = {}): DocPage => ({
  alternates: ['en', 'ru'],
  breadcrumbs: [
    { path: [], title: 'Laraue Boards - Task Management system' },
    { path: ['concepts'], title: 'How Laraue Boards works' },
    { path: ['concepts', 'issues'], title: 'Issues' },
  ],
  headings: [],
  html: '',
  meta: {
    createdAt: '2026-04-22',
    description: 'What an issue is',
    keywords: ['issue', 'task'],
    kind: 'page',
    order: 1,
    title: 'Issues — the base entities',
    updatedAt: '2026-08-20',
  },
  ...overrides,
})

const seo = (locale: 'en' | 'ru', path: string[], docsPage: DocPage) =>
  buildDocsSeo({
    locale,
    logoUrl: 'https://laraue.com/logo.png',
    ogImage: 'https://laraue.com/og.png',
    page: docsPage,
    path,
    siteUrl: 'https://boards.laraue.com',
  })

const graph = (data: Record<string, unknown>) => data['@graph'] as Record<string, unknown>[]

test('makes the canonical address of the page in its language', () => {
  assert.equal(
    seo('ru', ['concepts', 'issues'], page()).canonical,
    'https://boards.laraue.com/ru/documentation/concepts/issues',
  )
  assert.equal(seo('en', [], page()).canonical, 'https://boards.laraue.com/en/documentation')
})

test('lists the languages of the page, with English as the default', () => {
  assert.deepEqual(seo('ru', ['concepts', 'issues'], page()).alternates, [
    { href: 'https://boards.laraue.com/en/documentation/concepts/issues', hreflang: 'en' },
    { href: 'https://boards.laraue.com/ru/documentation/concepts/issues', hreflang: 'ru' },
    { href: 'https://boards.laraue.com/en/documentation/concepts/issues', hreflang: 'x-default' },
  ])
})

test('uses the only available language as the default of a page without a translation', () => {
  assert.deepEqual(seo('ru', ['a'], page({ alternates: ['ru'] })).alternates, [
    { href: 'https://boards.laraue.com/ru/documentation/a', hreflang: 'ru' },
    { href: 'https://boards.laraue.com/ru/documentation/a', hreflang: 'x-default' },
  ])
})

test('describes an ordinary page as a technical article', () => {
  const article = graph(seo('en', ['concepts', 'issues'], page()).structuredData).find(
    (node) => node['@type'] === 'TechArticle',
  )

  assert.include(article, {
    dateModified: '2026-08-20',
    datePublished: '2026-04-22',
    headline: 'Issues — the base entities',
    inLanguage: 'en',
    keywords: 'issue, task',
    mainEntityOfPage: 'https://boards.laraue.com/en/documentation/concepts/issues',
  })
})

test('describes a section page as a collection, not as an article', () => {
  const types = graph(
    seo('en', ['concepts'], page({ meta: { ...page().meta, kind: 'section' } })).structuredData,
  ).map((node) => node['@type'])

  assert.deepInclude(types, 'CollectionPage')
  assert.notInclude(types, 'TechArticle')
})

test('builds the breadcrumbs from the product through the docs to the page', () => {
  const list = graph(seo('ru', ['concepts', 'issues'], page()).structuredData).find(
    (node) => node['@type'] === 'BreadcrumbList',
  )

  assert.deepEqual(list?.['itemListElement'], [
    {
      '@type': 'ListItem',
      item: 'https://boards.laraue.com/ru',
      name: 'Laraue Boards',
      position: 1,
    },
    {
      '@type': 'ListItem',
      item: 'https://boards.laraue.com/ru/documentation',
      name: 'Документация',
      position: 2,
    },
    {
      '@type': 'ListItem',
      item: 'https://boards.laraue.com/ru/documentation/concepts',
      name: 'How Laraue Boards works',
      position: 3,
    },
    {
      '@type': 'ListItem',
      item: 'https://boards.laraue.com/ru/documentation/concepts/issues',
      name: 'Issues',
      position: 4,
    },
  ])
})

test('ends the breadcrumbs of the docs home page at "Documentation"', () => {
  const home = page({
    breadcrumbs: [{ path: [], title: 'Laraue Boards - Task Management system' }],
  })
  const list = graph(seo('en', [], home).structuredData).find(
    (node) => node['@type'] === 'BreadcrumbList',
  )

  const items = (list?.['itemListElement'] ?? []) as { name: string }[]

  assert.deepEqual(
    items.map((item) => item.name),
    ['Laraue Boards', 'Documentation'],
  )
})
