import type { RetroApiClient } from '#infrastructure/api/client'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import { createAdvancePhase } from './advancePhase'
import { createCreateCard } from './createCard'
import { createCreateChannel } from './createChannel'
import { createFinishRetro } from './finishRetro'
import { createMoveCard } from './moveCard'
import { createRemoveCard } from './removeCard'
import { createRevertPhase } from './revertPhase'
import { createSetCardAssignee } from './setCardAssignee'
import { createSetDiscussedCard } from './setDiscussedCard'
import { createSetMyCardsRevealed } from './setMyCardsRevealed'
import { createSetPhaseTimer } from './setPhaseTimer'
import { createToggleDone } from './toggleDone'
import { createToggleReveal } from './toggleReveal'
import { createToggleVote } from './toggleVote'
import { createUpdateCard } from './updateCard'
import { createUpdateSettings } from './updateSettings'
import { createViewRetro } from './viewRetro'

export const createRetroBoardPageDeps = (
  client: RetroApiClient,
  retroHubUrl: string,
): RetroBoardPageDeps => ({
  advancePhase: createAdvancePhase(client),
  createCard: createCreateCard(client),
  createChannel: createCreateChannel(retroHubUrl),
  finishRetro: createFinishRetro(client),
  moveCard: createMoveCard(client),
  removeCard: createRemoveCard(client),
  revertPhase: createRevertPhase(client),
  setCardAssignee: createSetCardAssignee(client),
  setDiscussedCard: createSetDiscussedCard(client),
  setMyCardsRevealed: createSetMyCardsRevealed(client),
  setPhaseTimer: createSetPhaseTimer(client),
  toggleDone: createToggleDone(client),
  toggleReveal: createToggleReveal(client),
  toggleVote: createToggleVote(client),
  updateCard: createUpdateCard(client),
  updateSettings: createUpdateSettings(client),
  view: createViewRetro(client),
})
