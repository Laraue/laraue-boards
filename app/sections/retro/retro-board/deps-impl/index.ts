import type { RetroApiClient } from '#infrastructure/api/client'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import { createCreateCard } from './createCard'
import { createCreateChannel } from './createChannel'
import { createFinishRetro } from './finishRetro'
import { createMoveCard } from './moveCard'
import { createRemoveCard } from './removeCard'
import { createSetMyCardsRevealed } from './setMyCardsRevealed'
import { createSetVoteTimer } from './setVoteTimer'
import { createToggleDone } from './toggleDone'
import { createToggleReveal } from './toggleReveal'
import { createToggleVote } from './toggleVote'
import { createUpdateCard } from './updateCard'
import { createUpdateSettings } from './updateSettings'
import { createViewRetro } from './viewRetro'

export const createRetroBoardPageDeps = (
  client: RetroApiClient,
  realtimeBaseUrl: string,
): RetroBoardPageDeps => ({
  createCard: createCreateCard(client),
  createChannel: createCreateChannel(realtimeBaseUrl),
  finishRetro: createFinishRetro(client),
  moveCard: createMoveCard(client),
  removeCard: createRemoveCard(client),
  setMyCardsRevealed: createSetMyCardsRevealed(client),
  setVoteTimer: createSetVoteTimer(client),
  toggleDone: createToggleDone(client),
  toggleReveal: createToggleReveal(client),
  toggleVote: createToggleVote(client),
  updateCard: createUpdateCard(client),
  updateSettings: createUpdateSettings(client),
  view: createViewRetro(client),
})
