import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type {
  BoardSettingsColumn,
  BoardSettingsColumnDraft,
  BoardSettingsPageData,
} from './BoardSettingsPage.types'

export type RemoveBoard = (input: { boardId: string }) => Promise<ActionResult<true>>

export type SaveBoardSettings = (input: {
  boardId: string
  color: string
  columns: BoardSettingsColumnDraft[]
  name: string
  originalColumns: BoardSettingsColumn[]
}) => Promise<ActionResult<true>>

export type ViewBoardSettings = (input: {
  boardId: string
  signal?: AbortSignal
}) => Promise<QueryResult<BoardSettingsPageData>>

export type BoardSettingsPageDeps = {
  remove: RemoveBoard
  save: SaveBoardSettings
  view: ViewBoardSettings
}
