import { assert, test } from 'vitest'

import { createTestRetroApiClient } from '#infrastructure/api/testApiClient'

import { createCreateCard } from './createCard'

test('maps the created card id and sends its section position', async () => {
  const { client, paths, requests } = createTestRetroApiClient(() => ({ id: 'card-1' }))

  const result = await createCreateCard(client)({
    retroId: '7',
    sectionId: '5',
    text: '',
    x: 10,
    y: 20,
  })

  assert.deepEqual(paths(), ['/api/retro/7/cards'])
  assert.deepEqual(await requests[0]?.json(), { sectionId: 5, text: '', x: 10, y: 20 })
  assert.deepEqual(result, { data: { id: 'card-1' }, status: 'success' })
})
