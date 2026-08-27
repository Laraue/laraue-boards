import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'

export type PresenceMember = {
  color: string
  initials: string
  name: string
  userId: string
}

export type ChannelMessage =
  | { cardId: string; text: string; type: 'card-text' }
  | { cardId: string; type: 'card-move'; x: number; y: number }
  | { member: PresenceMember; type: 'cursor'; x: number; y: number }
  | { member: PresenceMember; type: 'join' | 'leave' | 'presence' }
  | { type: 'changed' }

type HubMember = {
  color: string
  displayName: string
  initials: string
  userId: string
}

const toMember = (member: HubMember): PresenceMember => ({
  color: member.color,
  initials: member.initials,
  name: member.displayName,
  userId: member.userId,
})

const createHubChannel = (baseUrl: string, retroId: string) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/retro`, { withCredentials: true })
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
  connection.on('card-move', (cardId: string, x: number, y: number) =>
    emit({ cardId, type: 'card-move', x, y }),
  )
  connection.on('card-text', (cardId: string, text: string) =>
    emit({ cardId, text, type: 'card-text' }),
  )
  connection.on('changed', () => emit({ type: 'changed' }))

  const join = () => connection.invoke('Join', Number(retroId))

  // A reconnect starts a new connection, and group membership does not survive it.
  connection.onreconnected(() => void join())

  const send = (method: string, ...args: unknown[]) => {
    if (connection.state === HubConnectionState.Connected) {
      void connection.send(method, ...args)
    }
  }

  return {
    close: () => {
      void connection.stop()
    },
    onMessage: (handler: (message: ChannelMessage) => void) => {
      handlers.add(handler)
    },
    open: () => connection.start().then(join),
    publishAnnounce: () => send('Announce'),
    publishCardMove: (cardId: string, x: number, y: number) => send('MoveCard', cardId, x, y),
    publishCardText: (cardId: string, text: string) => send('SetCardText', cardId, text),
    publishCursor: (x: number, y: number) => send('Cursor', x, y),
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
}

export const createRetroChannel = (baseUrl: string, retroId: string): RetroChannel =>
  import.meta.client ? createHubChannel(baseUrl, retroId) : inertChannel
