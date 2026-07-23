import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadOrganizations } from './loadOrganizations'

test('maps organization options', async () => {
  const { client } = createTestApiClient(() => [{ id: 1, name: 'Acme' }])

  assert.deepEqual(await createLoadOrganizations(client)({}), {
    data: [{ label: 'Acme', value: '1' }],
    status: 'success',
  })
})
