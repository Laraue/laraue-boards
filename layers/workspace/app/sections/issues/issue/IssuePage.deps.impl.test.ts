import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { toLocalIssueDateTime } from '#layers/workspace/app/sections/issues/shared/api/issueDateTime'
import { COLORS } from '#layers/workspace/app/shared/constants/colors'

import { createIssuePageDeps } from './IssuePage.deps.impl'

test('maps issue detail', async () => {
  const { client, paths } = createTestApiClient((_request, path) =>
    path === '/api/spaces/product/epics'
      ? [{ id: 7, isDefault: true, name: 'Backlog' }]
      : {
          agentHandOff: {
            available: false,
            blocker: 'BoardNotReady',
            canSendBack: false,
            missingStatusCategories: ['Review'],
          },
          assignee: {
            color: '#111',
            displayName: 'Ada',
            initials: 'A',
            isCurrentUser: true,
          },
          assigneeId: '9',
          attachments: [
            {
              fileName: 'image.png',
              fileSize: 1000,
              id: 'image',
              mimeType: 'image/png',
              originalFileId: 'original',
              previewFileId: 'preview',
              type: 'Image',
            },
            {
              fileName: 'video.mp4',
              fileSize: null,
              id: 'file',
              mimeType: 'video/mp4',
              originalFileId: 'file',
              previewFileId: 'file',
              type: 'Video',
            },
            {
              fileName: 'spec.pdf',
              fileSize: 2048,
              id: 'document',
              mimeType: 'application/pdf',
              originalFileId: 'pdf',
              previewFileId: null,
              type: 'Document',
            },
          ],
          attributeValues: [
            {
              color: '#222',
              id: 3,
              listValues: [{ id: 4, name: 'High' }],
              name: 'Priority',
              type: 'List',
              value: '4',
            },
            {
              color: '#555',
              id: 6,
              listValues: [],
              name: 'Starts',
              type: 'DateTime',
              value: '2026-08-22T12:30:00Z',
            },
            {
              color: '#666',
              id: 7,
              listValues: [],
              name: 'Estimate',
              type: 'Decimal',
              value: 1,
            },
            {
              color: '#777',
              id: 8,
              listValues: [],
              name: 'Points',
              type: 'Integer',
              value: 2,
            },
          ],
          canEdit: true,
          content: null,
          epicId: 7,
          epicName: null,
          key: 'ISS-1',
          links: [
            {
              key: 'ISS-2',
              relation: 'DuplicatedBy',
              statusCategory: 'Completed',
              statusColor: null,
              statusName: null,
              title: 'Same bug',
            },
          ],
          owner: { color: '#333', displayName: 'Grace', initials: 'G' },
          source: {
            chatTitle: 'Team',
            isPrivateChat: false,
            messageUrl: 'https://t.me/team_chat/12',
            sender: { color: '#444', displayName: 'Linus', initials: 'L' },
            sentAt: '2025-12-31T23:00:00Z',
          },
          spaceKey: 'product',
          spaceName: 'Product',
          statusCategory: 'Created',
          statusId: 5,
          statusName: null,
          time: '2026-01-01T00:00:00Z',
          title: 'Fix it',
          updatedAt: '2026-01-02T00:00:00Z',
        },
  )

  const result = await createIssuePageDeps(client).view({ issueKey: 'ISS-1' })

  assert.equal(result.content, '')
  assert.equal(result.title, 'Fix it')
  assert.equal(result.assigneeIsCurrentUser, true)
  assert.equal(result.owner, 'Grace')
  assert.deepEqual(result.source, {
    chatTitle: 'Team',
    isPrivateChat: false,
    messageUrl: 'https://t.me/team_chat/12',
  })
  assert.equal(result.boardIsBacklog, true)
  assert.equal(result.statusCategory, 'Created')
  assert.deepEqual(result.agentHandOff, {
    available: false,
    blocker: 'boardNotReady',
    canSendBack: false,
    missingStatusCategories: ['Review'],
  })
  assert.deepEqual(result.links, [
    {
      issueKey: 'ISS-2',
      relation: 'duplicatedBy',
      statusCategory: 'Completed',
      statusColor: COLORS.gray,
      statusLabel: '',
      title: 'Same bug',
    },
  ])
  assert.deepEqual(result.attributes, [
    {
      color: '#222',
      id: '3',
      name: 'Priority',
      options: [{ label: 'High', value: '4' }],
      type: 'list',
      value: '4',
    },
    {
      color: '#555',
      id: '6',
      name: 'Starts',
      type: 'dateTime',
      value: toLocalIssueDateTime('2026-08-22T12:30:00Z'),
    },
    {
      color: '#666',
      id: '7',
      name: 'Estimate',
      type: 'decimal',
      value: '1',
    },
    {
      color: '#777',
      id: '8',
      name: 'Points',
      type: 'integer',
      value: '2',
    },
  ])
  assert.deepEqual(result.attachments, [
    {
      id: 'image',
      kind: 'image',
      originalUrl: 'https://api.test/api/files/original',
      previewUrl: 'https://api.test/api/files/preview',
    },
    {
      fileName: 'spec.pdf',
      fileSize: 2048,
      id: 'document',
      kind: 'document',
      url: 'https://api.test/api/files/pdf',
    },
  ])
  assert.deepEqual(paths(), ['/api/issues/ISS-1', '/api/spaces/product/epics'])
})

test('returns the new issue key after moving it to another space', async () => {
  const { client } = createTestApiClient((request) =>
    request.method === 'PUT' ? new Response(null, { status: 204 }) : { 'ISS-42': 'BACKLOG-9000' },
  )

  const result = await createIssuePageDeps(client).saveIssue({
    assigneeId: '4',
    attributeValues: [],
    boardId: '8',
    content: 'Updated issue',
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousSpaceKey: 'ISS',
    previousStatusId: '2',
    removeAttachmentIds: [],
    spaceKey: 'BRD',
    statusId: '3',
    title: 'Updated title',
  })

  assert.deepEqual(
    { issueKey: result.issueKey, previousIssueKey: result.previousIssueKey },
    { issueKey: 'BACKLOG-9000', previousIssueKey: 'ISS-42' },
  )
})

test('only moves the status of an issue handed to the agent', async () => {
  const { client, requests } = createTestApiClient(() => ({ 'ISS-42': 'ISS-42' }))

  await createIssuePageDeps(client).saveIssue({
    assigneeId: '4',
    attributeValues: [],
    boardId: '7',
    content: 'Updated issue',
    fieldsLocked: true,
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousSpaceKey: 'ISS',
    previousStatusId: '2',
    removeAttachmentIds: [],
    spaceKey: 'ISS',
    statusId: '3',
    title: 'Updated title',
  })

  assert.deepEqual(
    requests.map((value) => `${value.method} ${new URL(value.url).pathname}`),
    ['POST /api/issues/status'],
  )
})

test('reports a partial save when moving the issue fails', async () => {
  const { client } = createTestApiClient((request) =>
    request.method === 'PUT'
      ? new Response(null, { status: 204 })
      : new Response(null, { status: 503 }),
  )

  const result = await createIssuePageDeps(client).saveIssue({
    assigneeId: '4',
    attributeValues: [],
    boardId: '8',
    content: 'Updated issue',
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousSpaceKey: 'ISS',
    previousStatusId: '2',
    removeAttachmentIds: [],
    spaceKey: 'BRD',
    statusId: '3',
    title: 'Updated title',
  })

  assert.deepEqual(result, {
    boardId: '7',
    complete: false,
    content: 'Updated issue',
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousIssueKey: 'ISS-42',
    previousStatusId: '2',
    spaceKey: 'ISS',
    statusId: '2',
    title: 'Updated title',
  })
})
