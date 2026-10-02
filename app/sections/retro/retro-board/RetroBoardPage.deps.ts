export type RetroPhase = 'Actions' | 'Collect' | 'Discuss' | 'Group' | 'Vote'

export type RetroGroupViewModel = {
  cardIds: string[]
  id: string
  title: string
  votedByMe: boolean
  votes: number
}

export type RetroCardViewModel = {
  assignee: null | RetroMember
  authorColor: string
  authorInitials: string
  authorName: string
  done: boolean
  groupId: null | string
  hidden: boolean
  id: string
  isMine: boolean
  revealed: boolean
  sectionId: string
  text: string
  votedByMe: boolean
  votes: number
  x: number
  y: number
}

export type RetroSectionViewModel = {
  color: string
  id: string
  name: string
}

export type RetroMember = {
  color: string
  initials: string
  name: string
  userId: string
}

export type RetroChannelMessage =
  | {
      card: {
        author: RetroMember
        authorId: string
        covered: boolean
        done: boolean
        groupId: null | string
        id: string
        revealed: boolean
        sectionId: string
        text: string
        x: number
        y: number
      }
      type: 'card-upserted'
    }
  | { cardId: string; groupId: null | string; type: 'card-move'; x: number; y: number }
  | { cardId: string; text: string; type: 'card-text' }
  | { member: RetroMember; type: 'cursor'; x: number; y: number }
  | { member: RetroMember; type: 'join' | 'leave' | 'presence' }
  | { type: 'changed' }

export type RetroChannel = {
  close: () => void
  onMessage: (handler: (message: RetroChannelMessage) => void) => void
  open: () => Promise<void>
  publishAnnounce: () => void
  publishCardMove: (cardId: string, groupId: null | string, x: number, y: number) => void
  publishCardText: (cardId: string, text: string) => void
  publishCursor: (x: number, y: number) => void
  sync: () => Promise<RetroBoardViewModel>
}

export type RetroBoardViewModel = {
  canManage: boolean
  cards: RetroCardViewModel[]
  color: string
  finished: boolean
  groups: RetroGroupViewModel[]
  id: string
  me: RetroMember
  myVotes: number
  name: string
  owner: RetroMember
  participants: RetroMember[]
  phase: RetroPhase
  phaseEndsAt: null | string
  sections: RetroSectionViewModel[]
  votesPerUser: number
}

export type RetroBoardPageDeps = {
  advancePhase: (input: { phase: RetroPhase; retroId: string }) => Promise<void>
  // Resolves with the id of the new card.
  createCard: (input: {
    retroId: string
    sectionId: string
    text: string
    x: number
    y: number
  }) => Promise<string>
  createChannel: (retroId: string) => RetroChannel
  finishRetro: (input: { retroId: string }) => Promise<void>
  // Resolves with the id of the new topic.
  groupCards: (input: {
    cards: { id: string; x: number; y: number }[]
    retroId: string
  }) => Promise<string>
  moveCard: (input: {
    groupId: null | string
    id: string
    sectionId: string
    x: number
    y: number
  }) => Promise<void>
  moveGroup: (input: {
    deltaX: number
    deltaY: number
    groupId: string
    retroId: string
    sectionId: string
  }) => Promise<void>
  removeCard: (input: { id: string }) => Promise<void>
  renameRetro: (input: { name: string; retroId: string }) => Promise<void>
  resetVotes: (input: { retroId: string }) => Promise<void>
  revertPhase: (input: { phase: RetroPhase; retroId: string }) => Promise<void>
  setCardAssignee: (input: { assigneeId: null | string; id: string }) => Promise<void>
  setGroupTitle: (input: { groupId: string; retroId: string; title: string }) => Promise<void>
  setMyCardsRevealed: (input: { retroId: string; revealed: boolean }) => Promise<void>
  setPhaseTimer: (input: { minutes: null | number; retroId: string }) => Promise<void>
  toggleDone: (input: { done: boolean; id: string }) => Promise<void>
  toggleReveal: (input: { id: string; revealed: boolean }) => Promise<void>
  toggleVote: (input: { id: string; voted: boolean }) => Promise<void>
  transferOwnership: (input: { retroId: string; userId: string }) => Promise<void>
  ungroup: (input: { groupId: string; retroId: string }) => Promise<void>
  updateCard: (input: { id: string; text: string }) => Promise<void>
  updateSettings: (input: {
    phase: RetroPhase
    retroId: string
    votesPerUser: number
  }) => Promise<void>
  view: (input: { retroId: string; signal?: AbortSignal }) => Promise<RetroBoardViewModel>
}
