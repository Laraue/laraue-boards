import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateGlobalProfile } from './updateGlobalProfile'

const savedProfile = {
  displayName: 'Ada Lovelace',
  familyName: null,
  givenName: 'Ada',
  initials: 'AL',
  userName: null,
}

test('sends the trimmed names and returns the saved profile', async () => {
  const { client, requests } = createTestApiClient(() => savedProfile)

  assert.deepEqual(
    await createUpdateGlobalProfile(client)({
      displayName: ' Ada Lovelace ',
      familyName: 'Lovelace ',
      givenName: ' Ada',
    }),
    {
      data: { displayName: 'Ada Lovelace', familyName: '', givenName: 'Ada' },
      status: 'success',
    },
  )
  assert.deepEqual(await requests[0]!.json(), {
    displayName: 'Ada Lovelace',
    familyName: 'Lovelace',
    givenName: 'Ada',
  })
})

test('sends no given or family name when they are empty, to clear them', async () => {
  const { client, requests } = createTestApiClient(() => savedProfile)

  await createUpdateGlobalProfile(client)({ displayName: 'Ada', familyName: ' ', givenName: '' })

  assert.deepEqual(await requests[0]!.json(), {
    displayName: 'Ada',
    familyName: null,
    givenName: null,
  })
})
