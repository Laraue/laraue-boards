import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'

export type PresenceMember = {
  color: string
  initials: string
  name: string
  userId: string
}

export type ChannelMessage =
  | { card: ChannelCard; type: 'card-upserted' }
  | { cardId: string; groupId: null | string; type: 'card-move'; x: number; y: number }
  | { cardId: string; text: string; type: 'card-text' }
  | { member: PresenceMember; type: 'cursor'; x: number; y: number }
  | { member: PresenceMember; type: 'join' | 'leave' | 'presence' }
  | { type: 'changed' }

export type ChannelCard = {
  author: PresenceMember
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

type HubMember = {
  color: string
  displayName: string
  initials: string
  userId: string
}

type HubCard = {
  author: HubMember
  covered: boolean
  done: boolean
  groupId: null | number | string
  id: string
  revealed: boolean
  sectionId: number | string
  text: string
  x: number
  y: number
}

const toMember = (member: HubMember): PresenceMember => ({
  color: member.color,
  initials: member.initials,
  name: member.displayName,
  userId: member.userId,
})

const createHubChannel = (hubUrl: string, retroId: string) => {
  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect()
    .build()

  const handlers = new Set<(message: ChannelMessage) => void>()
  const emit = (message: ChannelMessage) => {
    for (const handler of handlers) {
      handler(message)
    }
  }

  for (const type of ['join', 'leave', 'presence'] as const) {
    connection.on(type, (member: HubMember) => emit({ member: toMember(member), type }))
  }
  connection.on('cursor', (member: HubMember, x: number, y: number) =>
    emit({ member: toMember(member), type: 'cursor', x, y }),
  )
  connection.on(
    'card-move',
    (cardId: string, x: number, y: number, groupId: null | number | string | undefined) =>
      emit({ cardId, groupId: groupId == null ? null : String(groupId), type: 'card-move', x, y }),
  )
  connection.on('card-text', (cardId: string, text: string) =>
    emit({ cardId, text, type: 'card-text' }),
  )
  connection.on('card-upserted', (card: HubCard) =>
    emit({
      card: {
        author: toMember(card.author),
        authorId: card.author.userId,
        covered: card.covered,
        done: card.done,
        groupId: card.groupId === null ? null : String(card.groupId),
        id: card.id,
        revealed: card.revealed,
        sectionId: String(card.sectionId),
        text: card.text,
        x: Number(card.x),
        y: Number(card.y),
      },
      type: 'card-upserted',
    }),
  )
  connection.on('changed', () => emit({ type: 'changed' }))

  const join = () => connection.invoke('Join', Number(retroId))

  // A reconnect starts a new connection, and group membership does not survive it.
  connection.onreconnected(() => void join().then(() => emit({ type: 'changed' })))

  const send = (method: string, ...args: unknown[]) => {
    if (connection.state === HubConnectionState.Connected) {
      void connection.send(method, ...args)
    }
  }

  return {
    close: () => {
      handlers.clear()
      void connection.stop()
    },
    onMessage: (handler: (message: ChannelMessage) => void) => {
      handlers.add(handler)
    },
    open: () => connection.start().then(join),
    publishAnnounce: () => send('Announce'),
    publishCardMove: (cardId: string, groupId: null | string, x: number, y: number) =>
      send('MoveCard', cardId, x, y, groupId),
    publishCardText: (cardId: string, text: string) => send('SetCardText', cardId, text),
    publishCursor: (x: number, y: number) => send('Cursor', x, y),
    sync: <Response>() => connection.invoke<Response>('Sync'),
  }
}

export type RetroChannel = ReturnType<typeof createHubChannel>

const noop = () => {}

const inertChannel: RetroChannel = {
  close: noop,
  onMessage: noop,
  open: () => Promise.resolve(),
  publishAnnounce: noop,
  publishCardMove: noop,
  publishCardText: noop,
  publishCursor: noop,
  sync: <Response>() =>
    Promise.reject(new Error('Realtime channel is unavailable')) as Promise<Response>,
}

export const createRetroChannel = (hubUrl: string, retroId: string): RetroChannel =>
  import.meta.client ? createHubChannel(hubUrl, retroId) : inertChannel
