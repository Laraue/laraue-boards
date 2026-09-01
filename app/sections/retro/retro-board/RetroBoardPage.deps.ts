import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { RetroBoardViewModel, RetroChannel, RetroPhase } from './RetroBoardPage.types'

export type RetroBoardPageDeps = {
  advancePhase: (input: { phase: RetroPhase; retroId: string }) => Promise<ActionResult<true>>
  createCard: (input: {
    retroId: string
    sectionId: string
    text: string
    x: number
    y: number
  }) => Promise<ActionResult<{ id: string }>>
  createChannel: (retroId: string) => RetroChannel
  finishRetro: (input: { retroId: string }) => Promise<ActionResult<true>>
  groupCards: (input: {
    cardIds: string[]
    retroId: string
  }) => Promise<ActionResult<{ id: string }>>
  moveCard: (input: {
    id: string
    sectionId: string
    x: number
    y: number
  }) => Promise<ActionResult<true>>
  removeCard: (input: { id: string }) => Promise<ActionResult<true>>
  revertPhase: (input: { phase: RetroPhase; retroId: string }) => Promise<ActionResult<true>>
  setCardAssignee: (input: { assigneeId: null | string; id: string }) => Promise<ActionResult<true>>
  setDiscussedCard: (input: {
    cardId: null | string
    retroId: string
  }) => Promise<ActionResult<true>>
  setGroupTitle: (input: {
    groupId: string
    retroId: string
    title: string
  }) => Promise<ActionResult<true>>
  setMyCardsRevealed: (input: { retroId: string; revealed: boolean }) => Promise<ActionResult<true>>
  setPhaseTimer: (input: { minutes: null | number; retroId: string }) => Promise<ActionResult<true>>
  toggleDone: (input: { done: boolean; id: string }) => Promise<ActionResult<true>>
  toggleReveal: (input: { id: string; revealed: boolean }) => Promise<ActionResult<true>>
  toggleVote: (input: { id: string; voted: boolean }) => Promise<ActionResult<true>>
  transferOwnership: (input: { retroId: string; userId: string }) => Promise<ActionResult<true>>
  ungroup: (input: { groupId: string; retroId: string }) => Promise<ActionResult<true>>
  updateCard: (input: { id: string; text: string }) => Promise<ActionResult<true>>
  updateSettings: (input: {
    phase: RetroPhase
    retroId: string
    votesPerUser: number
  }) => Promise<ActionResult<true>>
  view: (input: {
    retroId: string
    signal?: AbortSignal
  }) => Promise<QueryResult<RetroBoardViewModel>>
}
