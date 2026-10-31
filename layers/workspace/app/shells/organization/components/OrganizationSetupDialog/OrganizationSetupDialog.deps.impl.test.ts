import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS, DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'

import { createOrganizationSetupDialogDeps } from './OrganizationSetupDialog.deps.impl'

const members = [
  { isCurrentUser: false, userId: 'other-user' },
  { isCurrentUser: true, userId: 'current-user' },
]

const issueFields = async (request: Request) => {
  const formData = await request.formData()
  return {
    assigneeId: formData.get('AssigneeId'),
    statusId: formData.get('StatusId'),
    title: formData.get('Title'),
  }
}

test('creates the board and puts each issue in its status, assigned to the current user', async () => {
  const { client, paths, requests } = createTestApiClient((request, path) => {
    if (path === '/api/epics' && request.method === 'POST') {
      return 42
    }
    if (path === '/api/epics/42') {
      // Out of order on purpose: the board's columns go by sortOrder.
      return {
        statuses: [
          { id: 102, sortOrder: 1 },
          { id: 101, sortOrder: 0 },
        ],
      }
    }
    if (path === '/api/organizations/members') {
      return members
    }
    return 'DEF-1'
  })

  await createOrganizationSetupDialogDeps(client).addDemoData({
    boardName: 'Getting started',
    issues: [
      { statusIndex: 1, title: 'Second column' },
      { statusIndex: 0, title: 'First column' },
    ],
    spaceKey: 'MAR',
    statuses: [
      { category: 'Created', name: 'To Do' },
      { category: 'Completed', name: 'Done' },
    ],
    target: 'board',
  })

  const board = requests.find((request) => new URL(request.url).pathname === '/api/epics')!
  assert.deepEqual(await board.json(), {
    color: DEFAULT_COLOR,
    name: 'Getting started',
    spaceKey: 'MAR',
    statuses: [
      { category: 'Created', color: COLORS.gray, name: 'To Do' },
      { category: 'Completed', color: COLORS.green, name: 'Done' },
    ],
  })

  const issues = requests.filter((request) => new URL(request.url).pathname === '/api/issues')
  assert.deepEqual(await Promise.all(issues.map(issueFields)), [
    { assigneeId: 'current-user', statusId: '102', title: 'Second column' },
    { assigneeId: 'current-user', statusId: '101', title: 'First column' },
  ])
  assert.equal(paths().at(-1), '/api/issues')
})

test('puts every issue in the backlog status without creating a board', async () => {
  const { client, paths, requests } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces/MAR/epics') {
      return [
        { id: 7, isDefault: false },
        { id: 8, isDefault: true },
      ]
    }
    if (path === '/api/epics/8') {
      return { statuses: [{ id: 801, sortOrder: 0 }] }
    }
    if (path === '/api/organizations/members') {
      return members
    }
    return 'MAR-1'
  })

  await createOrganizationSetupDialogDeps(client).addDemoData({
    boardName: 'Ignored',
    issues: [
      { statusIndex: 3, title: 'An idea' },
      { statusIndex: 0, title: 'Another idea' },
    ],
    spaceKey: 'MAR',
    statuses: [{ category: 'Created', name: 'To Do' }],
    target: 'backlog',
  })

  assert.notInclude(paths(), '/api/epics')
  const issues = requests.filter((request) => new URL(request.url).pathname === '/api/issues')
  assert.deepEqual(
    (await Promise.all(issues.map(issueFields))).map(({ statusId }) => statusId),
    ['801', '801'],
  )
})

test('renames the space with its color and completes the setup', async () => {
  const { client, paths, requests } = createTestApiClient(() => ({}))
  const deps = createOrganizationSetupDialogDeps(client)

  await deps.renameSpace({ color: '#123', key: 'DEF', name: 'Marketing', newKey: 'MAR' })
  await deps.complete({ demoDataAdded: true })

  assert.deepEqual(paths(), ['/api/spaces/DEF', '/api/organizations/current/setup'])
  assert.deepEqual(await requests[0]!.json(), { color: '#123', name: 'Marketing', newKey: 'MAR' })
  assert.deepEqual(await requests[1]!.json(), { demoDataAdded: true })
})
