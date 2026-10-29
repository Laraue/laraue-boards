import type { components } from '#infrastructure/api/generated'

import type { SpaceAboutViewModel } from './components/SpaceAbout/SpaceAbout.types'

export type SpaceBoardStatus = 'Active' | 'Done' | 'New'

export type SpaceBoardSummary = {
  color: string
  // ISO date, for sorting by creation.
  createdAt: string
  id: string
  issueCount: number
  kind: 'backlog' | 'board'
  name: string
  status: SpaceBoardStatus
  statuses: Array<{
    category: components['schemas']['StatusCategory']
    color: string
    count: number
    name: string
  }>
}

export type SpacePageData = {
  about: SpaceAboutViewModel
  boards: SpaceBoardSummary[]
  canCreateBoards: boolean
  canManage: boolean
  color: string
  name: string
}

export type SpacePageDeps = {
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<SpacePageData>
}
