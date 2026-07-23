import { assert, test } from 'vitest'

import type { components } from '#infrastructure/api/generated'

import { mapBoardPage } from './mapBoardPage'

type Schemas = components['schemas']

test('maps board columns, their issues, and attributes', () => {
  const board: Schemas['EpicDto'] = {
    canCreateIssues: true,
    canDelete: true,
    canDeleteIssues: true,
    canUpdate: true,
    canUpdateIssues: true,
    color: '#111',
    name: 'Roadmap',
    statuses: [
      { color: '#222', id: 2, name: 'Done', sortOrder: 2 },
      { color: '#333', id: 1, name: 'To do', sortOrder: 1 },
    ],
  }
  const issues: Schemas['ColumnIssues'][] = [
    {
      items: {
        data: [
          {
            assignee: 'Ada',
            assigneeColor: '#444',
            assigneeInitial: null,
            content: null,
            epicId: 7,
            id: 1,
            key: 'ISS-1',
            spaceId: 3,
            statusId: 1,
            time: '2026-01-01T00:00:00Z',
          },
        ],
        hasNext: true,
        totalCount: 2,
      },
      statusId: 1,
    },
  ]

  const result = mapBoardPage('7', board, issues, [
    { color: '#555', id: '4', name: 'Priority', type: 'text' },
  ])

  assert.deepEqual(result, {
    attributes: [{ color: '#555', id: '4', name: 'Priority', type: 'text' }],
    canCreateIssues: true,
    canDelete: true,
    canMoveIssues: true,
    canUpdate: true,
    color: '#111',
    columns: [
      {
        color: '#333',
        hasNext: true,
        id: '1',
        issueCount: 2,
        issues: [
          {
            assigneeColor: '#444',
            assigneeInitial: '?',
            assigneeName: 'Ada',
            content: '',
            issueKey: 'ISS-1',
            time: '2026-01-01T00:00:00Z',
          },
        ],
        title: 'To do',
      },
      {
        color: '#222',
        hasNext: false,
        id: '2',
        issueCount: 0,
        issues: [],
        title: 'Done',
      },
    ],
    id: '7',
    issueCount: 2,
    title: 'Roadmap',
  })
})
