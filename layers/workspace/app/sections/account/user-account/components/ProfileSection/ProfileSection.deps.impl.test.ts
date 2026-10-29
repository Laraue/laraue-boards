import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createProfileSectionDeps } from './ProfileSection.deps.impl'

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
    await createProfileSectionDeps(client).update({
      displayName: ' Ada Lovelace ',
      familyName: 'Lovelace ',
      givenName: ' Ada',
    }),
    { displayName: 'Ada Lovelace', familyName: '', givenName: 'Ada' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    displayName: 'Ada Lovelace',
    familyName: 'Lovelace',
    givenName: 'Ada',
  })
})

test('sends no given or family name when they are empty, to clear them', async () => {
  const { client, requests } = createTestApiClient(() => savedProfile)

  await createProfileSectionDeps(client).update({
    displayName: 'Ada',
    familyName: ' ',
    givenName: '',
  })

  assert.deepEqual(await requests[0]!.json(), {
    displayName: 'Ada',
    familyName: null,
    givenName: null,
  })
})
