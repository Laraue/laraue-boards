import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceAboutSettingsDeps } from './SpaceAboutSettings.deps.impl'

test('clears the description when it is saved empty', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null))

  await createSpaceAboutSettingsDeps(client).saveDescription({ description: '  ', spaceKey: 'WEB' })

  assert.equal(new URL(requests[0]!.url).pathname, '/api/spaces/WEB/description')
  assert.deepEqual(await requests[0]!.json(), { description: null })
})

test('adds a link and returns it with a string id', async () => {
  const { client, requests } = createTestApiClient(() => ({
    description: 'Docs',
    id: 7,
    url: 'https://example.com/docs',
  }))

  const link = await createSpaceAboutSettingsDeps(client).createLink({
    description: 'Docs',
    spaceKey: 'WEB',
    url: 'https://example.com/docs',
  })

  assert.deepEqual(link, { description: 'Docs', id: '7', url: 'https://example.com/docs' })
  assert.deepEqual(await requests[0]!.json(), {
    description: 'Docs',
    url: 'https://example.com/docs',
  })
})

test('shows a space without a description as an empty one', async () => {
  const { client } = createTestApiClient(() => ({ canEdit: false, description: null, links: [] }))

  const about = await createSpaceAboutSettingsDeps(client).view({ spaceKey: 'WEB' })

  assert.deepEqual(about, { canEdit: false, description: '', links: [] })
})
