import { assert, expect, test } from 'vitest'

import { createDocsPageDeps } from './DocsPage.deps.impl'

test('requests the docs tree of the language', async () => {
  const requests: { options: unknown; url: string }[] = []
  const tree = {
    children: [],
    meta: {
      createdAt: '2026-01-01',
      description: 'Docs',
      keywords: [],
      kind: 'root' as const,
      order: 0,
      title: 'Docs',
      updatedAt: '2026-01-01',
    },
    path: [],
  }
  const { getTree } = createDocsPageDeps(async (url, options) => {
    requests.push({ options, url })
    return tree
  })

  assert.deepEqual(await getTree('ru'), tree)
  assert.deepEqual(requests, [{ options: undefined, url: '/docs-content/ru' }])
})

test('requests a page by its path', async () => {
  const requests: { options: unknown; url: string }[] = []
  const { getPage } = createDocsPageDeps(async (url, options) => {
    requests.push({ options, url })
    return {}
  })

  await getPage('en', ['concepts', 'issues'])
  await getPage('en', [])

  assert.deepEqual(requests, [
    { options: { query: { path: 'concepts/issues' } }, url: '/docs-content/en/page' },
    { options: { query: { path: '' } }, url: '/docs-content/en/page' },
  ])
})

test('reports the status code of a failed request', async () => {
  const { getPage } = createDocsPageDeps(async () => {
    throw Object.assign(new Error('Not Found'), { statusCode: 404 })
  })

  await expect(getPage('en', ['missing'])).rejects.toMatchObject({ status: 404 })
})

test('reports a network failure', async () => {
  const { getTree } = createDocsPageDeps(async () => {
    throw new Error('offline')
  })

  await expect(getTree('en')).rejects.toMatchObject({ status: 0 })
})
