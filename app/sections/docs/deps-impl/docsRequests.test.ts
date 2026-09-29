import { assert, test } from 'vitest'

import { createGetDocsPage, createGetDocsTree } from './docsRequests'

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
  const getTree = createGetDocsTree(async (url, options) => {
    requests.push({ options, url })
    return tree
  })

  assert.deepEqual(await getTree('ru'), { data: tree, status: 'success' })
  assert.deepEqual(requests, [{ options: undefined, url: '/docs-content/ru' }])
})

test('requests a page by its path', async () => {
  const requests: { options: unknown; url: string }[] = []
  const getPage = createGetDocsPage(async (url, options) => {
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
  const getPage = createGetDocsPage(async () => {
    throw Object.assign(new Error('Not Found'), { statusCode: 404 })
  })

  assert.deepEqual(await getPage('en', ['missing']), { code: 404, status: 'error' })
})

test('reports a network failure', async () => {
  const getTree = createGetDocsTree(async () => {
    throw new Error('offline')
  })

  assert.deepEqual(await getTree('en'), { code: 0, status: 'error' })
})
