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
