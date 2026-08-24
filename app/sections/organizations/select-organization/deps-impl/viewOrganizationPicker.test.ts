import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewOrganizationPicker } from './viewOrganizationPicker'

test('maps organizations response', async () => {
  const { client } = createTestApiClient(() => [
    {
      canLeave: true,
      color: null,
      id: 42,
      isPersonal: false,
      name: 'Laraue',
      slug: 'laraue',
      slugPostfix: 'HF2P0',
    },
  ])

  assert.deepEqual(await createViewOrganizationPicker(client)({}), {
    data: [
      {
        canLeave: true,
        color: '#4774d4',
        description: 'Team organization',
        id: '42',
        initial: 'L',
        isPersonal: false,
        key: 'laraue-HF2P0',
        name: 'Laraue',
      },
    ],
    status: 'success',
  })
})
