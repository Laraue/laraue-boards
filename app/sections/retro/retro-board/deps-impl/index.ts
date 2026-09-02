import type { RetroApiClient } from '#infrastructure/api/client'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import { createAdvancePhase } from './advancePhase'
import { createCreateCard } from './createCard'
import { createCreateChannel } from './createChannel'
import { createFinishRetro } from './finishRetro'
import { createGroupCards } from './groupCards'
import { createMoveCard } from './moveCard'
import { createMoveGroup } from './moveGroup'
import { createRemoveCard } from './removeCard'
import { createRenameRetro } from './renameRetro'
import { createResetVotes } from './resetVotes'
import { createRevertPhase } from './revertPhase'
import { createSetCardAssignee } from './setCardAssignee'
import { createSetDiscussedCard } from './setDiscussedCard'
import { createSetGroupTitle } from './setGroupTitle'
import { createSetMyCardsRevealed } from './setMyCardsRevealed'
import { createSetPhaseTimer } from './setPhaseTimer'
import { createToggleDone } from './toggleDone'
import { createToggleReveal } from './toggleReveal'
import { createToggleVote } from './toggleVote'
import { createTransferOwnership } from './transferOwnership'
import { createUngroup } from './ungroup'
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
  groupCards: createGroupCards(client),
  moveCard: createMoveCard(client),
  moveGroup: createMoveGroup(client),
  removeCard: createRemoveCard(client),
  renameRetro: createRenameRetro(client),
  resetVotes: createResetVotes(client),
  revertPhase: createRevertPhase(client),
  setCardAssignee: createSetCardAssignee(client),
  setDiscussedCard: createSetDiscussedCard(client),
  setGroupTitle: createSetGroupTitle(client),
  setMyCardsRevealed: createSetMyCardsRevealed(client),
  setPhaseTimer: createSetPhaseTimer(client),
  toggleDone: createToggleDone(client),
  toggleReveal: createToggleReveal(client),
  toggleVote: createToggleVote(client),
  transferOwnership: createTransferOwnership(client),
  ungroup: createUngroup(client),
  updateCard: createUpdateCard(client),
  updateSettings: createUpdateSettings(client),
  view: createViewRetro(client),
})
