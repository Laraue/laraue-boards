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
  | { cardId: string; text: string; type: 'card-text' }
  | { cardId: string; type: 'card-move'; x: number; y: number }
  | { member: RetroMember; type: 'cursor'; x: number; y: number }
  | { member: RetroMember; type: 'join' | 'leave' | 'presence' }
  | { type: 'changed' }

export type RetroChannel = {
  close: () => void
  onMessage: (handler: (message: RetroChannelMessage) => void) => void
  open: () => Promise<void>
  publishAnnounce: () => void
  publishCardMove: (cardId: string, x: number, y: number) => void
  publishCardText: (cardId: string, text: string) => void
  publishCursor: (x: number, y: number) => void
}

export type RetroBoardViewModel = {
  canManage: boolean
  cards: RetroCardViewModel[]
  color: string
  discussedCardId: null | string
  finished: boolean
  groups: RetroGroupViewModel[]
  hiddenMine: number
  id: string
  me: RetroMember
  myVotes: number
  name: string
  participants: RetroMember[]
  phase: RetroPhase
  phaseEndsAt: null | string
  revealedMine: number
  sections: RetroSectionViewModel[]
  votesPerUser: number
}
