import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceSettingsPageDeps } from './SpaceSettingsPage.deps.impl'

const catalog =
  (spaceKey = 'product') =>
  () => ({
    attributes: [],
    spaces: [{ color: '#fff', key: spaceKey, name: 'Product' }],
  })

const respond = (_request: Request, path: string) => {
  if (path.endsWith('/attribute-settings')) {
    return {
      attributes: [],
      inherited: { attributes: [], source: 'Organization' },
      source: 'Organization',
    }
  }
  if (path.endsWith('/about')) {
    return {
      canEdit: false,
      description: null,
      links: [{ description: 'Docs', id: 3, url: 'https://example.com/docs' }],
    }
  }
  return { canDelete: true, canUpdate: false }
}

test('maps space settings data', async () => {
  const { client } = createTestApiClient(respond)

  assert.deepEqual(
    await createSpaceSettingsPageDeps(client, catalog()).view({ spaceKey: 'product' }),
    {
      attributeSettings: {
        attributes: [],
        inherited: { attributes: [], source: 'organization' },
        source: 'organization',
      },
      canDelete: true,
      canUpdate: false,
      color: '#fff',
      description: '',
      links: [{ description: 'Docs', id: '3', url: 'https://example.com/docs' }],
      name: 'Product',
    },
  )
})

test('fails with 404 when the space is not in the list', async () => {
  const { client } = createTestApiClient(respond)

  await expect(
    createSpaceSettingsPageDeps(client, catalog('other')).view({ spaceKey: 'product' }),
  ).rejects.toMatchObject({ status: 404 })
})

test('saves the settings, description, links and attribute settings in one request', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null))

  await createSpaceSettingsPageDeps(client, catalog()).save({
    attributeSettings: { overridden: false, settings: [] },
    color: '#000',
    description: 'About',
    links: [
      { description: 'Docs', id: '1', url: 'https://example.com/docs' },
      { description: 'New', url: 'https://example.com/new' },
    ],
    name: 'Product',
    newKey: 'PRD',
    oldKey: 'product',
  })

  assert.equal(requests.length, 1)
  assert.equal(
    `${requests[0]!.method} ${new URL(requests[0]!.url).pathname}`,
    'PUT /api/spaces/product',
  )
  assert.deepEqual(await requests[0]!.json(), {
    attributeSettings: { overridden: false, settings: [] },
    color: '#000',
    description: 'About',
    links: [
      { description: 'Docs', url: 'https://example.com/docs' },
      { description: 'New', url: 'https://example.com/new' },
    ],
    name: 'Product',
    newKey: 'PRD',
    oldKey: 'product',
  })
})
