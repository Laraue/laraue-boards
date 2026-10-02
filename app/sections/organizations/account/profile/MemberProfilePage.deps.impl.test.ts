import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMemberProfilePageDeps } from './MemberProfilePage.deps.impl'

test('sends the name and color', async () => {
  const { client, requests } = createTestApiClient()

  await createMemberProfilePageDeps(client).update({ color: '#4774d4', displayName: ' Ada ' })

  assert.deepEqual(await requests[0]!.json(), { color: '#4774d4', displayName: 'Ada' })
})

test('sends no name when it is empty, to take it from the profile again', async () => {
  const { client, requests } = createTestApiClient()

  await createMemberProfilePageDeps(client).update({ color: '#4774d4', displayName: '  ' })

  assert.deepEqual(await requests[0]!.json(), { color: '#4774d4', displayName: null })
})
