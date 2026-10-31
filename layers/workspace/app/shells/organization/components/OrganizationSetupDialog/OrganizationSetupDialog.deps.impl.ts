import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'
import { COLORS, DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'

import type { DemoData, OrganizationSetupDialogDeps } from './OrganizationSetupDialog.deps'

// Status colors by meaning, so a board made in the window reads like the rest of the app.
const STATUS_COLORS: Record<StatusCategory, string> = {
  Completed: COLORS.green,
  Created: COLORS.gray,
  InProgress: COLORS.blue,
  Review: COLORS.purple,
}

const loadStatusIds = async (client: ApiClient, boardId: string): Promise<string[]> => {
  const board = await request(
    client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } } }),
  )
  return [...(board.statuses ?? [])]
    .sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
    .map((status) => String(status.id))
}

const createBoard = async (client: ApiClient, input: DemoData): Promise<string[]> => {
  const boardId = await request(
    client.POST('/api/epics', {
      body: {
        color: DEFAULT_COLOR,
        name: input.boardName,
        spaceKey: input.spaceKey,
        statuses: input.statuses.map(({ category, name }) => ({
          category,
          color: STATUS_COLORS[category],
          name,
        })),
      },
      parseAs: 'text',
    }),
  )
  return loadStatusIds(client, String(boardId))
}

// The backlog has one technical status that its issues land in.
const loadBacklogStatusId = async (client: ApiClient, spaceKey: string): Promise<string> => {
  const boards = await request(
    client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } } }),
  )
  const backlog = boards.find((board) => board.isDefault)
  const statusId = backlog && (await loadStatusIds(client, String(backlog.id)))[0]
  if (!statusId) {
    throw new ApiError(404)
  }
  return statusId
}

const loadCurrentUserId = async (client: ApiClient, spaceKey: string): Promise<string> => {
  const members = await request(
    client.GET('/api/organizations/members', { params: { query: { spaceKey } } }),
  )
  const current = members.find((member) => member.isCurrentUser)
  if (!current) {
    throw new ApiError(404)
  }
  return current.userId
}

export const createOrganizationSetupDialogDeps = (
  client: ApiClient,
): OrganizationSetupDialogDeps => ({
  addDemoData: async (input) => {
    const [statusIds, assigneeId] = await Promise.all([
      input.target === 'board'
        ? createBoard(client, input)
        : loadBacklogStatusId(client, input.spaceKey).then((statusId) => [statusId]),
      loadCurrentUserId(client, input.spaceKey),
    ])

    // One after another, so the issues keep the order they have in the window.
    for (const issue of input.issues) {
      const statusId = input.target === 'board' ? statusIds[issue.statusIndex] : statusIds[0]
      const formData = new FormData()
      formData.append('AssigneeId', assigneeId)
      formData.append('StatusId', statusId!)
      formData.append('Title', issue.title)
      formData.append('Content', '')
      await request(
        client.POST('/api/issues', { body: {}, bodySerializer: () => formData, parseAs: 'text' }),
      )
    }
  },

  complete: async ({ demoDataAdded }) => {
    await request(client.POST('/api/organizations/current/setup', { body: { demoDataAdded } }))
  },

  renameSpace: async ({ color, key, name, newKey }) => {
    await request(
      client.PUT('/api/spaces/{key}', {
        body: { color, name, newKey },
        params: { path: { key } },
      }),
    )
  },
})
