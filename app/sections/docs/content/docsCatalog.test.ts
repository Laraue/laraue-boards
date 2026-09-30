import { assert, test } from 'vitest'

import { createDocsCatalog } from './docsCatalog'

const file = (title: string, type: string, order: number, body = 'Text') =>
  `---\ntitle: ${title}\ndescription: About ${title}\ntype: ${type}\norder: ${order}\ncreatedAt: 2026-01-01\nupdatedAt: 2026-02-01\n---\n${body}`

const files = {
  'en/concepts/epics.md': file('Epics', 'documentation', 2, '## Boards'),
  'en/concepts/index.md': file('Concepts', 'sectionDefinition', 2),
  'en/concepts/issues.md': file('Issues', 'documentation', 1),
  'en/index.md': file('Home', 'rootSectionDefinition', 0),
  'en/start/index.md': file('Start', 'sectionDefinition', 1),
  'ru/concepts/index.md': file('Понятия', 'sectionDefinition', 2),
  'ru/index.md': file('Главная', 'rootSectionDefinition', 0),
  'ru/start/index.md': file('Начало', 'sectionDefinition', 1),
}

const catalog = createDocsCatalog(files)

test('orders sections and pages by their order', () => {
  const tree = catalog.tree('en')

  assert.deepEqual(
    tree.children.map((node) => node.meta.title),
    ['Start', 'Concepts'],
  )
  assert.deepEqual(
    tree.children[1]!.children.map((node) => node.meta.title),
    ['Issues', 'Epics'],
  )
})

test('shows where a page is in the docs', () => {
  const page = catalog.page('en', ['concepts', 'issues'])

  assert.deepEqual(page?.breadcrumbs, [
    { path: [], title: 'Home' },
    { path: ['concepts'], title: 'Concepts' },
    { path: ['concepts', 'issues'], title: 'Issues' },
  ])
})

test('links the previous and the next page in reading order', () => {
  const page = catalog.page('en', ['concepts', 'issues'])

  assert.deepEqual(page?.previous, { path: ['concepts'], title: 'Concepts' })
  assert.deepEqual(page?.next, { path: ['concepts', 'epics'], title: 'Epics' })
  assert.isUndefined(catalog.page('en', [])?.previous)
  assert.isUndefined(catalog.page('en', ['concepts', 'epics'])?.next)
})

test('lists the languages a page exists in', () => {
  assert.deepEqual(catalog.page('en', ['concepts'])?.alternates, ['en', 'ru'])
  assert.deepEqual(catalog.page('en', ['concepts', 'issues'])?.alternates, ['en'])
})

test('renders the page and its headings', () => {
  const page = catalog.page('en', ['concepts', 'epics'])

  assert.deepEqual(page?.headings, [{ id: 'boards', level: 2, text: 'Boards' }])
  assert.include(page?.html, '<h2 id="boards">Boards</h2>')
})

test('has no page for an unknown path or language', () => {
  assert.isUndefined(catalog.page('en', ['missing']))
  assert.isUndefined(catalog.page('ru', ['concepts', 'issues']))
})
