import { assert, test } from 'vitest'

import { createTestRetroApiClient } from '#infrastructure/api/testApiClient'

import { createViewRetro } from './viewRetro'

const author = {
  color: '#333',
  displayName: 'Ada Lovelace',
  initials: 'AL',
  isCurrentUser: true,
  userId: 'user-1',
}

const card = {
  assignee: null,
  author,
  done: false,
  groupId: null,
  hidden: false,
  id: 'card-1',
  isMine: true,
  revealed: false,
  sectionId: 5,
  text: 'Deploys got faster',
  votedByMe: true,
  votes: 2,
  x: 10,
  y: 20,
}

test('maps the retro and counts the cards the current user still keeps covered', async () => {
  const { client, paths } = createTestRetroApiClient(() => ({
    canManage: true,
    cards: [
      card,
      { ...card, id: 'card-2', revealed: true },
      { ...card, id: 'card-3', isMine: false },
    ],
    color: '#4774d4',
    createdAt: '2026-08-20T10:00:00Z',
    currentUser: author,
    finishedAt: null,
    groups: [],
    id: 7,
    myVotes: 2,
    name: 'Sprint 42',
    owner: author,
    participants: [author],
    phase: 'Collect',
    phaseEndsAt: null,
    sections: [
      { color: '#a44', id: 6, name: 'Actions', sortOrder: 2 },
      { color: '#489c61', id: 5, name: 'Good', sortOrder: 1 },
    ],
    votesPerUser: 3,
  }))

  const result = await createViewRetro(client)({ retroId: '7' })

  assert.equal(paths()[0], '/api/retro/7')
  assert.equal(result.status, 'success')
  assert.deepEqual(result.status === 'success' ? result.data.participants[0] : undefined, {
    color: '#333',
    initials: 'AL',
    name: 'Ada Lovelace',
    userId: 'user-1',
  })
  assert.deepEqual(result.status === 'success' ? result.data.sections : undefined, [
    { color: '#489c61', id: '5', name: 'Good' },
    { color: '#a44', id: '6', name: 'Actions' },
  ])
  assert.deepEqual(
    result.status === 'success'
      ? {
          finished: result.data.finished,
          hiddenMine: result.data.hiddenMine,
          revealedMine: result.data.revealedMine,
          sectionId: result.data.cards[0]?.sectionId,
        }
      : undefined,
    { finished: false, hiddenMine: 1, revealedMine: 1, sectionId: '5' },
  )
})
