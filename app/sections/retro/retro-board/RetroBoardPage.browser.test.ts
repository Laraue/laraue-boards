import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { DOMWrapper } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { RetroBoardPageDeps } from './RetroBoardPage.deps'
import type { RetroBoardViewModel, RetroChannel, RetroChannelMessage } from './RetroBoardPage.types'
import RetroBoardPage from './RetroBoardPage.vue'

const member = {
  color: '#4774d4',
  initials: 'AL',
  name: 'Ada Lovelace',
  userId: 'user-1',
}

const board: RetroBoardViewModel = {
  canManage: true,
  cards: [
    {
      assignee: null,
      authorColor: member.color,
      authorInitials: member.initials,
      authorName: member.name,
      done: false,
      groupId: null,
      hidden: false,
      id: 'mine',
      isMine: true,
      revealed: true,
      sectionId: '1',
      text: 'My note',
      votedByMe: false,
      votes: 0,
      x: 40,
      y: 80,
    },
    {
      assignee: null,
      authorColor: '#a44',
      authorInitials: 'GH',
      authorName: 'Grace Hopper',
      done: false,
      groupId: null,
      hidden: false,
      id: 'other',
      isMine: false,
      revealed: true,
      sectionId: '1',
      text: 'Other note',
      votedByMe: false,
      votes: 0,
      x: 280,
      y: 80,
    },
  ],
  color: '#4774d4',
  discussedCardId: null,
  finished: false,
  groups: [],
  hiddenMine: 0,
  id: '7',
  me: member,
  myVotes: 0,
  name: 'Sprint 42',
  owner: member,
  participants: [member],
  phase: 'Collect',
  phaseEndsAt: null,
  revealedMine: 1,
  sections: [
    { color: '#489c61', id: '1', name: 'Good' },
    { color: '#4774d4', id: '2', name: 'Actions' },
  ],
  votesPerUser: 3,
}

const createTestChannel = () => {
  let handler: ((message: RetroChannelMessage) => void) | undefined
  const channel: RetroChannel = {
    close: vi.fn<RetroChannel['close']>(),
    onMessage: (next) => {
      handler = next
    },
    open: vi.fn<RetroChannel['open']>(async () => {}),
    publishAnnounce: vi.fn<RetroChannel['publishAnnounce']>(),
    publishCardMove: vi.fn<RetroChannel['publishCardMove']>(),
    publishCardText: vi.fn<RetroChannel['publishCardText']>(),
    publishCursor: vi.fn<RetroChannel['publishCursor']>(),
  }

  return { channel, emit: (message: RetroChannelMessage) => handler?.(message) }
}

const successfulAction = async () => ({ data: true as const, status: 'success' as const })

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
let testHost: HTMLDivElement | undefined

const mount = async ({
  advancePhase = vi.fn<RetroBoardPageDeps['advancePhase']>(successfulAction),
  createChannel,
  data = board,
  finishRetro = vi.fn<RetroBoardPageDeps['finishRetro']>(successfulAction),
  groupCards = vi.fn<RetroBoardPageDeps['groupCards']>(async () => ({
    data: { id: 'group-1' },
    status: 'success',
  })),
  removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(successfulAction),
  renameRetro = vi.fn<RetroBoardPageDeps['renameRetro']>(successfulAction),
  revertPhase = vi.fn<RetroBoardPageDeps['revertPhase']>(successfulAction),
  setCardAssignee = vi.fn<RetroBoardPageDeps['setCardAssignee']>(successfulAction),
  setDiscussedCard = vi.fn<RetroBoardPageDeps['setDiscussedCard']>(successfulAction),
  setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(successfulAction),
  setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction),
  transferOwnership = vi.fn<RetroBoardPageDeps['transferOwnership']>(successfulAction),
  ungroup = vi.fn<RetroBoardPageDeps['ungroup']>(successfulAction),
  updateCard = vi.fn<RetroBoardPageDeps['updateCard']>(successfulAction),
  updateSettings = vi.fn<RetroBoardPageDeps['updateSettings']>(successfulAction),
  view = vi.fn<RetroBoardPageDeps['view']>(async () => ({ data, status: 'success' })),
}: {
  advancePhase?: RetroBoardPageDeps['advancePhase']
  createChannel: RetroBoardPageDeps['createChannel']
  data?: RetroBoardViewModel
  finishRetro?: RetroBoardPageDeps['finishRetro']
  groupCards?: RetroBoardPageDeps['groupCards']
  removeCard?: RetroBoardPageDeps['removeCard']
  renameRetro?: RetroBoardPageDeps['renameRetro']
  revertPhase?: RetroBoardPageDeps['revertPhase']
  setCardAssignee?: RetroBoardPageDeps['setCardAssignee']
  setDiscussedCard?: RetroBoardPageDeps['setDiscussedCard']
  setGroupTitle?: RetroBoardPageDeps['setGroupTitle']
  setPhaseTimer?: RetroBoardPageDeps['setPhaseTimer']
  transferOwnership?: RetroBoardPageDeps['transferOwnership']
  ungroup?: RetroBoardPageDeps['ungroup']
  updateCard?: RetroBoardPageDeps['updateCard']
  updateSettings?: RetroBoardPageDeps['updateSettings']
  view?: RetroBoardPageDeps['view']
}) => {
  const deps: RetroBoardPageDeps = {
    advancePhase,
    createCard: vi.fn<RetroBoardPageDeps['createCard']>(async () => ({
      data: { id: 'new-card' },
      status: 'success',
    })),
    createChannel,
    finishRetro,
    groupCards,
    moveCard: vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction),
    removeCard,
    renameRetro,
    revertPhase,
    setCardAssignee,
    setDiscussedCard,
    setGroupTitle,
    setMyCardsRevealed: vi.fn<RetroBoardPageDeps['setMyCardsRevealed']>(successfulAction),
    setPhaseTimer,
    toggleDone: vi.fn<RetroBoardPageDeps['toggleDone']>(successfulAction),
    toggleReveal: vi.fn<RetroBoardPageDeps['toggleReveal']>(successfulAction),
    toggleVote: vi.fn<RetroBoardPageDeps['toggleVote']>(successfulAction),
    transferOwnership,
    ungroup,
    updateCard,
    updateSettings,
    view,
  }

  testHost = document.createElement('div')
  testHost.style.cssText =
    '--layout-content-padding: 0px; height: 800px; position: relative; width: 1000px'
  document.body.append(testHost)

  currentWrapper = await mountSuspended(RetroBoardPage, {
    attachTo: testHost,
    props: { deps, retroId: '7' },
    route: '/organizations/acme-ab12/retro/7',
  })
  return { advancePhase, finishRetro, revertPhase, setPhaseTimer, updateSettings, view }
}

const cardWithText = (text: string) =>
  currentWrapper
    ?.findAll('.card')
    .find((card: DOMWrapper<Element>) => card.find('.card-text').text() === text)

const buttonWithText = (text: string) =>
  currentWrapper
    ?.findAll('button')
    .find((button: DOMWrapper<Element>) => button.text().trim() === text)

afterEach(async () => {
  await currentWrapper?.unmount()
  testHost?.remove()
  vi.restoreAllMocks()
  currentWrapper = undefined
  testHost = undefined
})

it('blocks management and freezes cards during voting', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...board, canManage: false, phase: 'Vote' },
  })

  await expect
    .element(page.getByRole('button', { exact: true, name: 'Finish' }))
    .not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Collect' })).toBeDisabled()
  await expect.element(page.getByLabelText('Votes')).toBeDisabled()
  await expect.element(page.getByRole('button', { name: 'Start timer' })).toBeDisabled()

  await cardWithText('Other note')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()

  await cardWithText('My note')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()
  await cardWithText('My note')?.find('.card-text').trigger('pointerdown')
  expect(cardWithText('My note')?.classes()).not.toContain('dragging')
})

it('shows only recorded participants after finish', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      finished: true,
      participants: [{ color: '#a44', initials: 'GH', name: 'Grace Hopper', userId: 'user-2' }],
    },
  })

  const participants = currentWrapper?.get('.presence-list').text()

  expect(participants).toContain('Grace Hopper')
  expect(participants).not.toContain('Ada Lovelace')
})

it('starts dragging a card from its text', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })

  const card = cardWithText('My note')

  await card?.find('.card-text').trigger('pointerdown')
  expect(card?.classes()).toContain('dragging')
  window.dispatchEvent(new PointerEvent('pointerup'))
})

it('lets the facilitator move cards outside collect', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Group' },
  })

  const card = cardWithText('My note')
  await card?.find('.card-text').trigger('pointerdown')
  expect(card?.classes()).toContain('dragging')
  window.dispatchEvent(new PointerEvent('pointerup'))
})

it('lets the facilitator move cards during voting', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Vote' },
  })

  const card = cardWithText('My note')
  await card?.find('.card-text').trigger('pointerdown')
  expect(card?.classes()).toContain('dragging')
  window.dispatchEvent(new PointerEvent('pointerup'))
})

it('edits only action cards during actions', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: [
        ...board.cards,
        { ...board.cards[0]!, id: 'action', sectionId: '2', text: 'Ship the fix' },
      ],
      phase: 'Actions',
    },
  })

  await cardWithText('My note')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()

  await cardWithText('Ship the fix')?.trigger('click')
  await cardWithText('Ship the fix')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).toBeInTheDocument()
})

it('refreshes a realtime change after unchanged editing ends', async () => {
  const live = createTestChannel()
  const view = vi.fn<RetroBoardPageDeps['view']>(async () => ({ data: board, status: 'success' }))

  await mount({ createChannel: () => live.channel, view })

  await cardWithText('My note')?.trigger('click')
  await cardWithText('My note')?.trigger('click')
  live.emit({ type: 'changed' })
  expect(view).toHaveBeenCalledOnce()

  await currentWrapper?.find('textarea.card-text').trigger('blur')
  await vi.waitFor(() => expect(view).toHaveBeenCalledTimes(2))
})

it('keeps edited text visible while a slow save is pending', async () => {
  const live = createTestChannel()
  type UpdateResult = Awaited<ReturnType<RetroBoardPageDeps['updateCard']>>
  let resolveUpdate!: (result: UpdateResult) => void
  const updateCard = vi.fn<RetroBoardPageDeps['updateCard']>(
    () =>
      new Promise<UpdateResult>((resolve) => {
        resolveUpdate = resolve
      }),
  )

  await mount({ createChannel: () => live.channel, updateCard })
  await cardWithText('My note')?.trigger('click')
  await cardWithText('My note')?.trigger('click')
  await currentWrapper?.find('textarea.card-text').setValue('Saved text')
  await currentWrapper?.find('textarea.card-text').trigger('blur')

  expect(cardWithText('Saved text')).toBeDefined()
  expect(cardWithText('Add a note')).toBeUndefined()
  resolveUpdate({ data: true, status: 'success' })
})

it('selects on one click and disables a card while deleting it', async () => {
  const { channel } = createTestChannel()
  type RemoveResult = Awaited<ReturnType<RetroBoardPageDeps['removeCard']>>
  let resolveRemove!: (result: RemoveResult) => void
  const removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(
    () =>
      new Promise<RemoveResult>((resolve) => {
        resolveRemove = resolve
      }),
  )

  await mount({ createChannel: () => channel, removeCard })
  const card = cardWithText('My note')

  await card?.trigger('click')
  expect(card?.classes()).toContain('selected')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()

  await currentWrapper?.find('button[aria-label="Delete note"]').trigger('click')
  await vi.waitFor(() => expect(removeCard).toHaveBeenCalledWith({ id: 'mine' }))
  expect(card?.classes()).toContain('pending')
  expect(card?.attributes('aria-busy')).toBe('true')

  resolveRemove({ data: true, status: 'success' })
})

it('deduplicates simultaneous realtime refreshes', async () => {
  const live = createTestChannel()
  type ViewResult = Awaited<ReturnType<RetroBoardPageDeps['view']>>
  let resolveRefresh!: (result: ViewResult) => void
  const pendingRefresh = new Promise<ViewResult>((resolve) => {
    resolveRefresh = resolve
  })
  const view = vi
    .fn<RetroBoardPageDeps['view']>()
    .mockResolvedValueOnce({ data: board, status: 'success' })
    .mockReturnValue(pendingRefresh)

  await mount({ createChannel: () => live.channel, view })
  live.emit({ type: 'changed' })
  live.emit({ type: 'changed' })
  await Promise.resolve()

  expect(view).toHaveBeenCalledTimes(2)
  resolveRefresh({ data: board, status: 'success' })
})

it('replaces the realtime channel when the retro id changes', async () => {
  const first = createTestChannel()
  const second = createTestChannel()
  const createChannel = vi
    .fn<RetroBoardPageDeps['createChannel']>()
    .mockReturnValueOnce(first.channel)
    .mockReturnValueOnce(second.channel)

  await mount({ createChannel })
  await currentWrapper?.setProps({ retroId: '8' })

  await vi.waitFor(() => expect(createChannel).toHaveBeenCalledTimes(2))
  expect(createChannel).toHaveBeenNthCalledWith(1, '7')
  expect(createChannel).toHaveBeenNthCalledWith(2, '8')
  expect(first.channel.close).toHaveBeenCalledOnce()
  expect(second.channel.open).toHaveBeenCalledOnce()
})

it('shows voting actions only after the timer starts', async () => {
  const { channel } = createTestChannel()
  const voting = {
    ...board,
    cards: [
      ...board.cards,
      { ...board.cards[0]!, id: 'action', sectionId: '2', text: 'Ship the fix' },
    ],
    phase: 'Vote' as const,
    phaseEndsAt: null,
  }
  const view = vi
    .fn<RetroBoardPageDeps['view']>()
    .mockResolvedValueOnce({ data: voting, status: 'success' })
    .mockResolvedValue({
      data: { ...voting, phaseEndsAt: '2099-01-01T00:00:00Z' },
      status: 'success',
    })

  await mount({ createChannel: () => channel, view })
  await expect.element(page.getByRole('button', { name: 'Vote for note' })).not.toBeInTheDocument()

  await buttonWithText('Start timer')?.trigger('click')

  await expect
    .element(page.getByRole('button', { name: 'Vote for note' }).first())
    .toBeInTheDocument()
  expect(cardWithText('Ship the fix')?.find('.vote-badge').exists()).toBe(false)
  expect(currentWrapper?.find('.vote-badge').text()).toBe('')
})

it('hides new vote actions after the vote budget is spent', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: board.cards.map((card, index) => ({
        ...card,
        votedByMe: index === 0,
      })),
      myVotes: board.votesPerUser,
      phase: 'Vote',
      phaseEndsAt: '2099-01-01T00:00:00Z',
    },
  })

  await expect
    .element(page.getByRole('button', { name: 'Remove vote from note' }))
    .toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Vote for note' })).not.toBeInTheDocument()
})

const grace = {
  color: '#a44',
  initials: 'GH',
  name: 'Grace Hopper',
  userId: 'user-2',
}

const actionBoard: RetroBoardViewModel = {
  ...board,
  cards: [{ ...board.cards[0]!, id: 'action', sectionId: '2', text: 'Automate the release' }],
  participants: [member, grace],
  phase: 'Actions',
}

it('assigns an action item to a participant of the retro', async () => {
  const { channel } = createTestChannel()
  const setCardAssignee = vi.fn<RetroBoardPageDeps['setCardAssignee']>(successfulAction)

  await mount({ createChannel: () => channel, data: actionBoard, setCardAssignee })

  const ownerWrapper = currentWrapper!.find('.card-assignee')
  const owner = ownerWrapper.element as HTMLSelectElement

  expect(ownerWrapper.exists()).toBe(true)
  expect(owner.disabled).toBe(false)
  expect([...owner.options].map((option) => option.text)).toEqual([
    'No owner',
    member.name,
    grace.name,
  ])

  owner.value = grace.userId
  await ownerWrapper.trigger('change')

  expect(setCardAssignee).toHaveBeenCalledWith({ assigneeId: grace.userId, id: 'action' })
})

it('clears the owner of an action item', async () => {
  const { channel } = createTestChannel()
  const setCardAssignee = vi.fn<RetroBoardPageDeps['setCardAssignee']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: {
      ...actionBoard,
      cards: actionBoard.cards.map((card) => ({ ...card, assignee: grace })),
    },
    setCardAssignee,
  })

  const ownerWrapper = currentWrapper!.find('.card-assignee')
  const owner = ownerWrapper.element as HTMLSelectElement

  expect(owner.value).toBe(grace.userId)

  owner.value = ''
  await ownerWrapper.trigger('change')

  expect(setCardAssignee).toHaveBeenCalledWith({ assigneeId: null, id: 'action' })
})

it('keeps the owner readable but locked on a finished retro', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...actionBoard,
      cards: actionBoard.cards.map((card) => ({ ...card, assignee: grace })),
      finished: true,
    },
  })

  const ownerWrapper = currentWrapper!.find('.card-assignee')
  const owner = ownerWrapper.element as HTMLSelectElement

  expect(owner.disabled).toBe(true)
  expect(owner.value).toBe(grace.userId)
})

it('shows no owner picker on a topic note', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })

  expect(currentWrapper?.find('.card-assignee').exists()).toBe(false)
})

const groupingBoard: RetroBoardViewModel = { ...board, phase: 'Group' }

it('merges the picked notes into a topic', async () => {
  const { channel } = createTestChannel()
  const groupCards = vi.fn<RetroBoardPageDeps['groupCards']>(async () => ({
    data: { id: 'group-1' },
    status: 'success',
  }))

  await mount({ createChannel: () => channel, data: groupingBoard, groupCards })

  expect(buttonWithText('Merge into a topic')).toBeUndefined()

  await cardWithText('My note')?.trigger('click')
  await cardWithText('Other note')?.trigger('click')

  expect(cardWithText('My note')?.classes()).toContain('group-picked')
  await buttonWithText('Merge into a topic')?.trigger('click')

  expect(groupCards).toHaveBeenCalledWith({ cardIds: ['mine', 'other'], retroId: '7' })
})

it('does not offer merging to a participant', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...groupingBoard, canManage: false },
  })
  await cardWithText('My note')?.trigger('click')

  expect(cardWithText('My note')?.classes()).not.toContain('group-picked')
  expect(buttonWithText('Merge into a topic')).toBeUndefined()
})

const groupedBoard: RetroBoardViewModel = {
  ...groupingBoard,
  cards: groupingBoard.cards.map((card) => ({ ...card, groupId: 'group-1' })),
  groups: [
    {
      cardIds: ['mine', 'other'],
      id: 'group-1',
      title: 'Painful releases',
      votedByMe: false,
      votes: 4,
    },
  ],
}

it('draws the topic around its notes and renames it', async () => {
  const { channel } = createTestChannel()
  const setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, setGroupTitle })

  const box = currentWrapper!.find('.group-box')

  expect(box.exists()).toBe(true)

  const title = box.find('input')

  expect((title.element as HTMLInputElement).value).toBe('Painful releases')

  ;(title.element as HTMLInputElement).value = 'Slow releases'
  await title.trigger('change')

  expect(setGroupTitle).toHaveBeenCalledWith({
    groupId: 'group-1',
    retroId: '7',
    title: 'Slow releases',
  })
})

it('splits the topic back into notes', async () => {
  const { channel } = createTestChannel()
  const ungroup = vi.fn<RetroBoardPageDeps['ungroup']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, ungroup })
  await currentWrapper?.find('.group-ungroup').trigger('click')

  expect(ungroup).toHaveBeenCalledWith({ groupId: 'group-1', retroId: '7' })
})

it('freezes the topic once voting has started', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...groupedBoard, phase: 'Vote', phaseEndsAt: '2099-01-01T00:00:00Z' },
  })

  expect(currentWrapper?.find('.group-ungroup').exists()).toBe(false)
  expect((currentWrapper!.find('.group-title').element as HTMLInputElement).disabled).toBe(true)
})

it('shows one score for every note of a topic', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...groupedBoard, phase: 'Discuss' },
  })

  expect(
    currentWrapper!.findAll('.vote-badge').map((badge: DOMWrapper<Element>) => badge.text()),
  ).toEqual(['4', '4'])
})

it('keeps vote totals hidden while the phase is still Vote', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: board.cards.map((card) => ({ ...card, votes: 2 })),
      phase: 'Vote',
      phaseEndsAt: '2000-01-01T00:00:00Z',
    },
  })

  expect(currentWrapper?.find('.vote-badge').text()).toBe('')
})

it('shows vote totals once the facilitator moves on to discussion', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: board.cards.map((card) => ({ ...card, votes: 2 })),
      phase: 'Discuss',
      phaseEndsAt: null,
    },
  })

  expect(currentWrapper?.find('.vote-badge').text()).toBe('2')
})

it('keeps all topics visible and ranks vote leaders during discussion', async () => {
  const { channel } = createTestChannel()
  const topics = ['First', 'Second', 'Third', 'Also third', 'Fifth'].map((text, index) => ({
    ...board.cards[0]!,
    id: `topic-${index}`,
    text,
    votes: [4, 4, 2, 2, 1][index]!,
  }))

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: [
        ...topics,
        { ...board.cards[0]!, id: 'action', sectionId: '2', text: 'Ship the fix' },
      ],
      phase: 'Discuss',
      sections: [
        { color: '#489c61', id: '1', name: 'Good' },
        { color: '#4774d4', id: '2', name: 'Actions' },
      ],
    },
  })

  expect(
    currentWrapper?.findAll('.card-text').map((card: DOMWrapper<Element>) => card.text()),
  ).toEqual(['First', 'Second', 'Third', 'Also third', 'Fifth', 'Ship the fix'])
  // Equal votes no longer widen the leading set: the board order breaks the tie, so exactly
  // three medals are handed out however many topics share a score.
  expect(cardWithText('First')?.find('.rank-badge').text()).toBe('1')
  expect(cardWithText('Second')?.find('.rank-badge').text()).toBe('2')
  expect(cardWithText('Third')?.find('.rank-badge').text()).toBe('3')
  expect(cardWithText('Also third')?.find('.rank-badge').exists()).toBe(false)
  expect(cardWithText('Fifth')?.find('.rank-badge').exists()).toBe(false)
  expect(cardWithText('Ship the fix')?.find('.rank-badge').exists()).toBe(false)
})

it('keeps all topics visible during discussion when nobody voted', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      phase: 'Discuss',
      sections: [
        { color: '#489c61', id: '1', name: 'Good' },
        { color: '#4774d4', id: '2', name: 'Actions' },
      ],
    },
  })

  expect(
    currentWrapper?.findAll('.card-text').map((card: DOMWrapper<Element>) => card.text()),
  ).toEqual(['My note', 'Other note'])
  expect(currentWrapper?.find('.rank-badge').exists()).toBe(false)
})

const twoPeopleBoard: RetroBoardViewModel = {
  ...board,
  participants: [member, grace],
}

it('renames the retro from its default date name', async () => {
  const { channel } = createTestChannel()
  const renameRetro = vi.fn<RetroBoardPageDeps['renameRetro']>(successfulAction)

  await mount({ createChannel: () => channel, renameRetro })

  const input = currentWrapper!.find('.retro-name-input')

  ;(input.element as HTMLInputElement).value = '  Sprint 43  '
  await input.trigger('change')

  expect(renameRetro).toHaveBeenCalledWith({ name: 'Sprint 43', retroId: '7' })
})

it('shows the name as plain text to everyone but the facilitator', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel, data: { ...board, canManage: false } })

  expect(currentWrapper?.find('.retro-name-input').exists()).toBe(false)
  expect(currentWrapper?.find('h1').text()).toBe('Sprint 42')
})

it('hands the retro over to another participant', async () => {
  const { channel } = createTestChannel()
  const transferOwnership = vi.fn<RetroBoardPageDeps['transferOwnership']>(successfulAction)

  await mount({ createChannel: () => channel, data: twoPeopleBoard, transferOwnership })
  await buttonWithText('Make facilitator')?.trigger('click')

  expect(transferOwnership).toHaveBeenCalledWith({ retroId: '7', userId: grace.userId })
})

it('offers no hand-over to a participant or on a finished retro', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...twoPeopleBoard, canManage: false },
  })

  expect(buttonWithText('Make facilitator')).toBeUndefined()

  await currentWrapper?.unmount()
  await mount({ createChannel: () => channel, data: { ...twoPeopleBoard, finished: true } })

  expect(buttonWithText('Make facilitator')).toBeUndefined()
})

it('keeps medals and vote counts on a finished board', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: board.cards.map((card, index) => ({ ...card, votes: 3 - index })),
      finished: true,
      phase: 'Actions',
      sections: [
        { color: '#489c61', id: '1', name: 'Good' },
        { color: '#4774d4', id: '2', name: 'Actions' },
      ],
    },
  })

  expect(cardWithText('My note')?.find('.rank-badge').text()).toBe('1')
  expect(cardWithText('Other note')?.find('.rank-badge').text()).toBe('2')
  expect(cardWithText('My note')?.find('.vote-badge').text()).toBe('3')
  expect(cardWithText('Other note')?.find('.vote-badge').text()).toBe('2')
})

it('asks once before finishing, because finishing cannot be undone', async () => {
  const { channel } = createTestChannel()
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
  const finishRetro = vi.fn<RetroBoardPageDeps['finishRetro']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: board.cards.map((card, index) => ({ ...card, votes: 2 - index })),
      phase: 'Actions',
      sections: [
        { color: '#489c61', id: '1', name: 'Good' },
        { color: '#4774d4', id: '2', name: 'Actions' },
      ],
    },
    finishRetro,
  })
  await buttonWithText('Finish')?.trigger('click')

  expect(confirm).toHaveBeenCalledWith('Finish this retro? It becomes read-only for everyone.')
  await vi.waitFor(() => expect(finishRetro).toHaveBeenCalledWith({ retroId: '7' }))
})

it('advances the phase without stopping the timer by hand', async () => {
  const { channel } = createTestChannel()
  const setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction)
  const advancePhase = vi.fn<RetroBoardPageDeps['advancePhase']>(successfulAction)

  await mount({
    advancePhase,
    createChannel: () => channel,
    data: { ...board, phase: 'Vote', phaseEndsAt: '2099-01-01T00:00:00Z' },
    setPhaseTimer,
  })
  await buttonWithText('Discuss')?.trigger('click')

  await vi.waitFor(() => expect(advancePhase).toHaveBeenCalledOnce())
  expect(advancePhase).toHaveBeenCalledWith({ phase: 'Discuss', retroId: '7' })
  // The server drops the running timer on every phase move, so the client must not race it.
  expect(setPhaseTimer).not.toHaveBeenCalled()
})

it('runs a timer in the collect phase too', async () => {
  const { channel } = createTestChannel()
  const setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction)

  await mount({ createChannel: () => channel, setPhaseTimer })
  await buttonWithText('Start timer')?.trigger('click')

  expect(setPhaseTimer).toHaveBeenCalledWith({ minutes: 5, retroId: '7' })
})

it('extends a running timer from now', async () => {
  const { channel } = createTestChannel()
  const setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Group', phaseEndsAt: '2099-01-01T00:00:00Z' },
    setPhaseTimer,
  })
  await buttonWithText('Extend')?.trigger('click')

  expect(setPhaseTimer).toHaveBeenCalledWith({ minutes: 5, retroId: '7' })
})

it('lets the facilitator pick the topic under discussion', async () => {
  const { channel } = createTestChannel()
  const setDiscussedCard = vi.fn<RetroBoardPageDeps['setDiscussedCard']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Discuss' },
    setDiscussedCard,
  })
  await cardWithText('My note')?.trigger('click')
  await currentWrapper?.find('.card-toolbar .icon-btn').trigger('click')

  expect(setDiscussedCard).toHaveBeenCalledWith({ cardId: 'mine', retroId: '7' })
})

it('outlines the topic the team is discussing', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...board, discussedCardId: 'mine', phase: 'Discuss' },
  })

  expect(cardWithText('My note')?.classes()).toContain('discussed')
})

it('returns to the previous phase directly', async () => {
  const { channel } = createTestChannel()
  const revertPhase = vi.fn<RetroBoardPageDeps['revertPhase']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Group' },
    revertPhase,
  })
  await buttonWithText('Collect')?.trigger('click')

  await vi.waitFor(() => expect(revertPhase).toHaveBeenCalledOnce())
  expect(revertPhase).toHaveBeenCalledWith({ phase: 'Collect', retroId: '7' })
})
