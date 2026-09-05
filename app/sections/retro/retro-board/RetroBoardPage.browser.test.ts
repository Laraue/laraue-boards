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
  finished: false,
  groups: [],
  id: '7',
  me: member,
  myVotes: 0,
  name: 'Sprint 42',
  owner: member,
  participants: [member],
  phase: 'Collect',
  phaseEndsAt: null,
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
    sync: vi.fn<RetroChannel['sync']>(async () => board),
  }

  return { channel, emit: (message: RetroChannelMessage) => handler?.(message) }
}

const successfulAction = async () => ({ data: true as const, status: 'success' as const })

const pointer = (type: string, clientX: number, clientY: number) =>
  new PointerEvent(type, { bubbles: true, buttons: 1, clientX, clientY })

const touchPointer = (type: string, pointerId: number, clientX: number, clientY: number) =>
  new PointerEvent(type, {
    bubbles: true,
    buttons: 1,
    clientX,
    clientY,
    pointerId,
    pointerType: 'touch',
  })

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
let testHost: HTMLDivElement | undefined

const mount = async ({
  advancePhase = vi.fn<RetroBoardPageDeps['advancePhase']>(successfulAction),
  createCard = vi.fn<RetroBoardPageDeps['createCard']>(async () => ({
    data: { id: 'new-card' },
    status: 'success',
  })),
  createChannel,
  data = board,
  finishRetro = vi.fn<RetroBoardPageDeps['finishRetro']>(successfulAction),
  groupCards = vi.fn<RetroBoardPageDeps['groupCards']>(async () => ({
    data: { id: 'group-1' },
    status: 'success',
  })),
  moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction),
  moveGroup = vi.fn<RetroBoardPageDeps['moveGroup']>(successfulAction),
  removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(successfulAction),
  renameRetro = vi.fn<RetroBoardPageDeps['renameRetro']>(successfulAction),
  resetVotes = vi.fn<RetroBoardPageDeps['resetVotes']>(successfulAction),
  revertPhase = vi.fn<RetroBoardPageDeps['revertPhase']>(successfulAction),
  setCardAssignee = vi.fn<RetroBoardPageDeps['setCardAssignee']>(successfulAction),
  setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(successfulAction),
  setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction),
  toggleDone = vi.fn<RetroBoardPageDeps['toggleDone']>(successfulAction),
  toggleVote = vi.fn<RetroBoardPageDeps['toggleVote']>(successfulAction),
  transferOwnership = vi.fn<RetroBoardPageDeps['transferOwnership']>(successfulAction),
  ungroup = vi.fn<RetroBoardPageDeps['ungroup']>(successfulAction),
  updateCard = vi.fn<RetroBoardPageDeps['updateCard']>(successfulAction),
  updateSettings = vi.fn<RetroBoardPageDeps['updateSettings']>(successfulAction),
  view = vi.fn<RetroBoardPageDeps['view']>(async () => ({ data, status: 'success' })),
}: {
  advancePhase?: RetroBoardPageDeps['advancePhase']
  createCard?: RetroBoardPageDeps['createCard']
  createChannel: RetroBoardPageDeps['createChannel']
  data?: RetroBoardViewModel
  finishRetro?: RetroBoardPageDeps['finishRetro']
  groupCards?: RetroBoardPageDeps['groupCards']
  moveCard?: RetroBoardPageDeps['moveCard']
  moveGroup?: RetroBoardPageDeps['moveGroup']
  removeCard?: RetroBoardPageDeps['removeCard']
  renameRetro?: RetroBoardPageDeps['renameRetro']
  resetVotes?: RetroBoardPageDeps['resetVotes']
  revertPhase?: RetroBoardPageDeps['revertPhase']
  setCardAssignee?: RetroBoardPageDeps['setCardAssignee']
  setGroupTitle?: RetroBoardPageDeps['setGroupTitle']
  setPhaseTimer?: RetroBoardPageDeps['setPhaseTimer']
  toggleDone?: RetroBoardPageDeps['toggleDone']
  toggleVote?: RetroBoardPageDeps['toggleVote']
  transferOwnership?: RetroBoardPageDeps['transferOwnership']
  ungroup?: RetroBoardPageDeps['ungroup']
  updateCard?: RetroBoardPageDeps['updateCard']
  updateSettings?: RetroBoardPageDeps['updateSettings']
  view?: RetroBoardPageDeps['view']
}) => {
  data = structuredClone(data)
  const deps: RetroBoardPageDeps = {
    advancePhase,
    createCard,
    createChannel,
    finishRetro,
    groupCards,
    moveCard,
    moveGroup,
    removeCard,
    renameRetro,
    resetVotes,
    revertPhase,
    setCardAssignee,
    setGroupTitle,
    setMyCardsRevealed: vi.fn<RetroBoardPageDeps['setMyCardsRevealed']>(successfulAction),
    setPhaseTimer,
    toggleDone,
    toggleReveal: vi.fn<RetroBoardPageDeps['toggleReveal']>(successfulAction),
    toggleVote,
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
  currentWrapper?.findAll('.card').find((card: DOMWrapper<Element>) => {
    const element = card.find('.card-text').element
    return element instanceof HTMLTextAreaElement
      ? element.value === text
      : card.find('.card-text').text() === text
  })

const buttonWithText = (text: string) =>
  currentWrapper
    ?.findAll('button')
    .find((button: DOMWrapper<Element>) => button.text().trim() === text)

afterEach(async () => {
  // The drag listeners live on the window and the tests share one page, so a test that leaves a
  // note in mid-drag would hold the next one's drag back.
  window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
  await currentWrapper?.unmount()
  testHost?.remove()
  vi.restoreAllMocks()
  currentWrapper = undefined
  testHost = undefined
})

it('sets the font size from the text length on first render', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })
  const text = cardWithText('My note')!.get('.card-text').element as HTMLElement

  expect(getComputedStyle(text).fontSize).toBe('34px')
})

it('fits a long note again after deselecting and reopening its editor', async () => {
  const { channel } = createTestChannel()
  const text = 'W'.repeat(120)
  await mount({
    createChannel: () => channel,
    data: { ...board, cards: [{ ...board.cards[0]!, text }] },
  })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await cardWithText(text)!.trigger('click')
    await cardWithText(text)!.trigger('click')
    const input = currentWrapper!.get('textarea.card-text').element as HTMLTextAreaElement
    // Only the size the fit calculates is checked: Caveat is loaded from the document head, which
    // the test does not mount, so the rendered pixels here belong to the fallback font.
    expect(Number.parseFloat(input.style.fontSize)).toBeLessThan(34)
    await currentWrapper!.get('textarea.card-text').trigger('blur')
    await currentWrapper!.get('.retro-canvas').trigger('pointerdown')
    window.dispatchEvent(new PointerEvent('pointerup'))
    await nextTick()
  }
})

it('saves clearing an existing note but does not update an unchanged empty note', async () => {
  const { channel } = createTestChannel()
  const updateCard = vi.fn<RetroBoardPageDeps['updateCard']>(successfulAction)
  await mount({
    createChannel: () => channel,
    data: { ...board, cards: [...board.cards, { ...board.cards[0]!, id: 'empty', text: '' }] },
    updateCard,
  })
  await cardWithText('My note')!.trigger('click')
  await cardWithText('My note')!.trigger('click')
  await currentWrapper!.get('textarea.card-text').setValue('')
  await currentWrapper!.get('textarea.card-text').trigger('blur')
  expect(updateCard).toHaveBeenCalledExactlyOnceWith({ id: 'mine', text: '' })

  await currentWrapper!.get('.retro-canvas').trigger('pointerdown')
  window.dispatchEvent(new PointerEvent('pointerup'))
  await cardWithText('')!.trigger('click')
  await cardWithText('')!.trigger('click')
  await currentWrapper!.get('textarea.card-text').trigger('blur')
  expect(updateCard).toHaveBeenCalledOnce()
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
  await expect.element(page.getByRole('button', { name: 'Collect' })).not.toBeInTheDocument()
  await expect.element(page.getByLabelText('Votes per person')).not.toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { exact: true, name: 'Start' }))
    .not.toBeInTheDocument()

  await cardWithText('Other note')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()

  await cardWithText('My note')?.trigger('click')
  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).not.toBeInTheDocument()
  // The whole note is frozen, dragging included: a phase the team may not write in is a phase it
  // may not rearrange either.
  await cardWithText('My note')?.find('.card-text').trigger('pointerdown')
  expect(cardWithText('My note')?.classes()).not.toContain('dragging')
})

it('hides phase controls when they have no actions', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      canManage: false,
      cards: [],
      phase: 'Discuss',
      phaseEndsAt: null,
    },
  })

  expect(currentWrapper!.find('.phase-controls').exists()).toBe(false)
})

it('hides the timer separator before an unavailable stop action', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...board, canManage: false, phaseEndsAt: '2099-01-01T00:00:00Z' },
  })

  expect(currentWrapper!.findAll('.phase-timer-separator')).toHaveLength(0)
})

it('starts editing a created card', async () => {
  const { channel } = createTestChannel()
  const createCard = vi.fn<RetroBoardPageDeps['createCard']>(async () => {
    return { data: { id: 'new-card' }, status: 'success' }
  })

  await mount({ createCard, createChannel: () => channel })
  await nextTick()
  await currentWrapper!.find('.retro-canvas').trigger('dblclick', {
    clientX: 1900,
    clientY: 900,
  })

  await vi.waitFor(() => expect(createCard).toHaveBeenCalledOnce())
  await vi.waitFor(() => expect(currentWrapper!.find('textarea.card-text').exists()).toBe(true))

  await currentWrapper!.find('textarea.card-text').trigger('blur')
  expect(currentWrapper!.findAll('.card')).toHaveLength(board.cards.length + 1)
})

it('creates and focuses immediately, then saves typed text after the create response', async () => {
  const { channel } = createTestChannel()
  type CreateResult = Awaited<ReturnType<RetroBoardPageDeps['createCard']>>
  let resolveCreate!: (result: CreateResult) => void
  const createCard = vi.fn<RetroBoardPageDeps['createCard']>(
    () =>
      new Promise((resolve) => {
        resolveCreate = resolve
      }),
  )
  const updateCard = vi.fn<RetroBoardPageDeps['updateCard']>(successfulAction)
  await mount({ createCard, createChannel: () => channel, updateCard })
  currentWrapper!.get('.retro-canvas').element.dispatchEvent(
    new MouseEvent('dblclick', {
      bubbles: true,
      clientX: 400,
      clientY: 300,
    }),
  )
  await nextTick()
  const editor = currentWrapper!.get('textarea.card-text')
  expect(document.activeElement).toBe(editor.element)
  await nextTick()
  expect(currentWrapper!.findAll('.card')).toHaveLength(board.cards.length + 1)
  await editor.setValue('Typed before the response')
  await editor.trigger('blur')
  expect(cardWithText('Typed before the response')).toBeDefined()
  expect(updateCard).not.toHaveBeenCalled()
  resolveCreate({ data: { id: 'created-card' }, status: 'success' })
  await vi.waitFor(() =>
    expect(updateCard).toHaveBeenCalledWith({
      id: 'created-card',
      text: 'Typed before the response',
    }),
  )
  expect(currentWrapper!.findAll('.card')).toHaveLength(board.cards.length + 1)
  expect(cardWithText('Typed before the response')).toBeDefined()
})

it('keeps a failed creation and its text for retry', async () => {
  const { channel } = createTestChannel()
  const createCard = vi
    .fn<RetroBoardPageDeps['createCard']>()
    .mockResolvedValueOnce({ code: 500, status: 'error' })
    .mockResolvedValueOnce({ data: { id: 'retried-card' }, status: 'success' })
  await mount({ createCard, createChannel: () => channel })
  await currentWrapper!.get('.retro-canvas').trigger('dblclick', { clientX: 400, clientY: 300 })
  await currentWrapper!.get('textarea.card-text').setValue('Keep this note')
  await currentWrapper!.get('textarea.card-text').trigger('blur')
  await vi.waitFor(() => expect(buttonWithText('Retry saving')).toBeDefined())
  await buttonWithText('Retry saving')!.trigger('click')
  await vi.waitFor(() => expect(createCard).toHaveBeenCalledTimes(2))
  expect(createCard.mock.calls[1]![0].text).toBe('Keep this note')
  expect(cardWithText('Keep this note')).toBeDefined()
})

it('creates from the native click following a canvas double tap', async () => {
  const { channel } = createTestChannel()
  const createCard = vi.fn<RetroBoardPageDeps['createCard']>(async () => ({
    data: { id: 'touch-created' },
    status: 'success',
  }))
  await mount({ createCard, createChannel: () => channel })
  const canvas = currentWrapper!.get('.retro-canvas')
  const tap = () => {
    for (const type of ['pointerdown', 'pointerup']) {
      canvas.element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          clientX: 400,
          clientY: 300,
          isPrimary: true,
          pointerId: 1,
          pointerType: 'touch',
        }),
      )
    }
    canvas.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  tap()
  expect(createCard).not.toHaveBeenCalled()
  tap()
  await nextTick()
  const editor = currentWrapper!.get('textarea.card-text')
  expect(document.activeElement).toBe(editor.element)
  await nextTick()
  expect(createCard).toHaveBeenCalledOnce()
})

it('turns the notes toggle back to private as soon as a note is written', async () => {
  const { channel } = createTestChannel()
  const createCard = vi.fn<RetroBoardPageDeps['createCard']>(async () => ({
    data: { id: 'new-card' },
    status: 'success',
  }))

  await mount({ createCard, createChannel: () => channel })

  // Every note of mine is revealed, so the board says so.
  expect(buttonWithText('Visible')).toBeDefined()

  await currentWrapper!.find('.retro-canvas').trigger('dblclick', { clientX: 400, clientY: 300 })
  await vi.waitFor(() => expect(createCard).toHaveBeenCalledOnce())

  // A fresh note starts covered, and the toggle has to say that before it is moved or saved.
  expect(buttonWithText('Private')).toBeDefined()
  expect(buttonWithText('Visible')).toBeUndefined()
})

it('shows only recorded participants after finish', async () => {
  const { channel } = createTestChannel()
  const createChannel = vi.fn<RetroBoardPageDeps['createChannel']>(() => channel)

  await mount({
    createChannel,
    data: {
      ...board,
      finished: true,
      participants: [{ color: '#a44', initials: 'GH', name: 'Grace Hopper', userId: 'user-2' }],
    },
  })

  const participants = currentWrapper?.get('.presence-list').text()

  expect(participants).toContain('Grace Hopper')
  expect(participants).not.toContain('Ada Lovelace')
  expect(createChannel).not.toHaveBeenCalled()
})

it('starts dragging a card from its text', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })

  const card = cardWithText('My note')

  await card?.find('.card-text').trigger('pointerdown')
  expect(card?.classes()).toContain('dragging')
  window.dispatchEvent(new PointerEvent('pointerup'))
})

it('zooms the board with a two-finger pinch', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })
  const canvas = currentWrapper!.get('.retro-canvas')

  canvas.element.dispatchEvent(touchPointer('pointerdown', 1, 200, 200))
  canvas.element.dispatchEvent(touchPointer('pointerdown', 2, 300, 200))
  window.dispatchEvent(touchPointer('pointermove', 2, 400, 200))
  await nextTick()

  expect(currentWrapper!.get('.scene').attributes('style')).toContain('scale(2)')
  window.dispatchEvent(touchPointer('pointerup', 1, 200, 200))
  window.dispatchEvent(touchPointer('pointerup', 2, 400, 200))
})

it('zooms when both fingers start on a card without moving or editing it', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)
  await mount({ createChannel: () => channel, moveCard })
  const card = cardWithText('My note')!
  card.element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 200,
      clientY: 200,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'touch',
    }),
  )
  card.element.dispatchEvent(touchPointer('pointerdown', 2, 300, 200))
  card.element.dispatchEvent(touchPointer('pointermove', 2, 400, 200))
  await nextTick()
  expect(currentWrapper!.get('.scene').attributes('style')).toContain('scale(2)')
  card.element.dispatchEvent(touchPointer('pointerup', 1, 200, 200))
  card.element.dispatchEvent(touchPointer('pointerup', 2, 400, 200))
  await card.trigger('click')
  expect(moveCard).not.toHaveBeenCalled()
  expect(card.classes()).not.toContain('editing')
  expect(card.classes()).not.toContain('dragging')
})

it('opens card editing from the pencil action', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel })
  await cardWithText('My note')?.trigger('click')
  await currentWrapper?.find('button[aria-label="Edit note"]').trigger('click')

  await expect.element(page.getByRole('textbox', { name: 'Edit note' })).toBeInTheDocument()
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

it('syncs a realtime change after unchanged editing ends', async () => {
  const live = createTestChannel()
  const view = vi.fn<RetroBoardPageDeps['view']>(async () => ({ data: board, status: 'success' }))

  await mount({ createChannel: () => live.channel, view })

  await cardWithText('My note')?.trigger('click')
  await cardWithText('My note')?.trigger('click')
  live.emit({ type: 'changed' })
  expect(view).toHaveBeenCalledOnce()
  expect(live.channel.sync).not.toHaveBeenCalled()

  await currentWrapper?.find('textarea.card-text').trigger('blur')
  await vi.waitFor(() => expect(live.channel.sync).toHaveBeenCalledOnce())
})

it('applies a live card update without reloading the board', async () => {
  const live = createTestChannel()
  const view = vi.fn<RetroBoardPageDeps['view']>(async () => ({
    data: structuredClone(board),
    status: 'success',
  }))

  await mount({ createChannel: () => live.channel, view })
  live.emit({
    card: {
      author: member,
      authorId: member.userId,
      covered: false,
      done: false,
      groupId: null,
      id: 'mine',
      revealed: true,
      sectionId: '1',
      text: 'Updated live',
      x: 40,
      y: 80,
    },
    type: 'card-upserted',
  })
  await nextTick()

  expect(cardWithText('Updated live')).toBeDefined()
  expect(view).toHaveBeenCalledOnce()
})

it('picks up a group made elsewhere on the next sync', async () => {
  const live = createTestChannel()
  const grouped = structuredClone(board)
  grouped.phase = 'Group'
  grouped.cards = grouped.cards.map((card) =>
    card.id === 'mine' || card.id === 'other' ? { ...card, groupId: 'group-live' } : card,
  )
  grouped.groups = [
    { cardIds: ['mine', 'other'], id: 'group-live', title: '', votedByMe: false, votes: 0 },
  ]
  live.channel.sync = vi.fn<RetroChannel['sync']>(async () => grouped)

  await mount({ createChannel: () => live.channel, data: { ...board, phase: 'Group' } })
  live.emit({ type: 'changed' })
  await vi.waitFor(() => expect(currentWrapper!.find('.group-box').exists()).toBe(true))
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
  expect(cardWithText('')).toBeUndefined()
  resolveUpdate({ data: true, status: 'success' })
})

it('selects on touch and focuses from the click following the second tap', async () => {
  const { channel } = createTestChannel()
  await mount({ createChannel: () => channel })
  const card = cardWithText('My note')!
  const tap = () => {
    for (const type of ['pointerdown', 'pointerup']) {
      card.element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          clientX: 100,
          clientY: 100,
          isPrimary: true,
          pointerId: 1,
          pointerType: 'touch',
        }),
      )
    }
  }

  tap()
  await card.trigger('click')
  expect(card.classes()).toContain('selected')
  expect(currentWrapper!.find('textarea.card-text').exists()).toBe(false)

  tap()
  await card.trigger('click')
  const editor = currentWrapper!.get('textarea.card-text')
  expect(document.activeElement).toBe(editor.element)
  expect(editor.isVisible()).toBe(true)
})

it('selects on one click and drops a deleted card before the server answers', async () => {
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
  // Gone straight away - the request is still on the wire.
  expect(cardWithText('My note')).toBeUndefined()

  resolveRemove({ data: true, status: 'success' })
})

it('lets the facilitator delete another participant note', async () => {
  const { channel } = createTestChannel()
  const removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(successfulAction)

  await mount({ createChannel: () => channel, removeCard })
  await cardWithText('Other note')?.trigger('click')
  await currentWrapper?.find('button[aria-label="Delete note"]').trigger('click')

  expect(removeCard).toHaveBeenCalledWith({ id: 'other' })
})

it('brings a deleted card back when the server refuses', async () => {
  const { channel } = createTestChannel()
  const removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(async () => ({
    code: 500,
    status: 'error' as const,
  }))

  await mount({ createChannel: () => channel, removeCard })
  await cardWithText('My note')?.trigger('click')
  await currentWrapper?.find('button[aria-label="Delete note"]').trigger('click')

  await vi.waitFor(() => expect(cardWithText('My note')).toBeDefined())
})

it('deduplicates simultaneous realtime syncs', async () => {
  const live = createTestChannel()
  let resolveSync!: (result: RetroBoardViewModel) => void
  const pendingSync = new Promise<RetroBoardViewModel>((resolve) => {
    resolveSync = resolve
  })
  const sync = vi.fn<RetroChannel['sync']>().mockReturnValue(pendingSync)
  live.channel.sync = sync

  await mount({ createChannel: () => live.channel })
  live.emit({ type: 'changed' })
  live.emit({ type: 'changed' })
  await Promise.resolve()

  expect(sync).toHaveBeenCalledOnce()
  resolveSync(board)
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
  const live = createTestChannel()
  const voting = {
    ...board,
    cards: [
      ...board.cards,
      { ...board.cards[0]!, id: 'action', sectionId: '2', text: 'Ship the fix' },
    ],
    phase: 'Vote' as const,
    phaseEndsAt: null,
  }

  await mount({ createChannel: () => live.channel, data: voting })
  await expect.element(page.getByRole('button', { name: 'Vote for topic' })).not.toBeInTheDocument()

  live.channel.sync = vi.fn<RetroChannel['sync']>(async () => ({
    ...voting,
    phaseEndsAt: '2099-01-01T00:00:00Z',
  }))
  await buttonWithText('Start')?.trigger('click')
  live.emit({ type: 'changed' })

  await expect
    .element(page.getByRole('button', { name: 'Vote for topic' }).first())
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
    .element(page.getByRole('button', { name: 'Remove vote from topic' }))
    .toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Vote for topic' })).not.toBeInTheDocument()
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

  expect(currentWrapper!.find('.assignee-trigger').text()).toBe('Unassigned')
  expect(
    currentWrapper!.findAll('.assignee-row').map((row: DOMWrapper<Element>) => row.text()),
  ).toEqual([`${member.initials} ${member.name}`, `${grace.initials} ${grace.name}`, 'Unassigned'])

  await currentWrapper!
    .findAll('.assignee-row')
    .find((row: DOMWrapper<Element>) => row.text().includes(grace.name))
    ?.trigger('click')

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

  expect(currentWrapper!.find('.assignee-trigger').text()).toContain(grace.name)

  await currentWrapper!
    .findAll('.assignee-row')
    .find((row: DOMWrapper<Element>) => row.text() === 'Unassigned')
    ?.trigger('click')

  expect(setCardAssignee).toHaveBeenCalledWith({ assigneeId: null, id: 'action' })
})

it('keeps the board visible without editing controls after finish', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: {
      ...actionBoard,
      cards: actionBoard.cards.map((card) => ({ ...card, assignee: grace })),
      finished: true,
    },
  })

  expect(currentWrapper!.find('.finished-screen').exists()).toBe(false)
  expect(currentWrapper!.find('.retro-canvas').exists()).toBe(true)
  expect(currentWrapper!.find('.board-help').exists()).toBe(false)
  expect(currentWrapper!.find('.assignee-trigger').exists()).toBe(true)
})

it('shows no owner picker on a topic note', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel, data: groupedBoard })

  expect(currentWrapper?.find('.assignee').exists()).toBe(false)
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

  await cardWithText('My note')?.trigger('click', { ctrlKey: true })
  await cardWithText('Other note')?.trigger('click', { metaKey: true })

  expect(cardWithText('My note')?.classes()).toContain('group-picked')
  await buttonWithText('Merge into a topic')?.trigger('click')

  // The board lays the topic out, so it is the board that sends where each note goes.
  expect(groupCards).toHaveBeenCalledWith({
    cards: [
      { id: 'mine', x: expect.any(Number), y: expect.any(Number) },
      { id: 'other', x: expect.any(Number), y: expect.any(Number) },
    ],
    retroId: '7',
  })
})

it('merges notes that already belong to different topics', async () => {
  const { channel } = createTestChannel()
  const groupCards = vi.fn<RetroBoardPageDeps['groupCards']>(async () => ({
    data: { id: 'group-3' },
    status: 'success',
  }))
  const twoTopics: RetroBoardViewModel = {
    ...groupingBoard,
    cards: [
      { ...groupingBoard.cards[0]!, groupId: 'group-1' },
      { ...groupingBoard.cards[1]!, groupId: 'group-2' },
    ],
    groups: [
      { cardIds: ['mine'], id: 'group-1', title: 'One', votedByMe: false, votes: 0 },
      { cardIds: ['other'], id: 'group-2', title: 'Two', votedByMe: false, votes: 0 },
    ],
  }

  await mount({ createChannel: () => channel, data: twoTopics, groupCards })
  await cardWithText('My note')?.trigger('click', { ctrlKey: true })
  await cardWithText('Other note')?.trigger('click', { ctrlKey: true })
  await buttonWithText('Merge into a topic')?.trigger('click')

  expect(groupCards).toHaveBeenCalled()
})

it('starts a new selection when a note of another section is picked', async () => {
  const { channel } = createTestChannel()
  const acrossSections: RetroBoardViewModel = {
    ...groupingBoard,
    cards: [
      { ...groupingBoard.cards[0]!, sectionId: '1' },
      { ...groupingBoard.cards[1]!, sectionId: '2', x: 1000 },
    ],
    sections: [
      { color: '#489c61', id: '1', name: 'Good' },
      { color: '#d46f47', id: '2', name: 'Bad' },
      { color: '#4774d4', id: '3', name: 'Actions' },
    ],
  }

  await mount({ createChannel: () => channel, data: acrossSections })
  await cardWithText('My note')?.trigger('click', { ctrlKey: true })
  await cardWithText('Other note')?.trigger('click', { ctrlKey: true })

  // A topic lives in one section, so the second pick replaces the first instead of joining it.
  expect(cardWithText('My note')?.classes()).not.toContain('group-picked')
  expect(cardWithText('Other note')?.classes()).toContain('group-picked')
  expect(buttonWithText('Merge into a topic')?.attributes('disabled')).toBeDefined()
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
  await title.trigger('blur')

  expect(setGroupTitle).toHaveBeenCalledWith({
    groupId: 'group-1',
    retroId: '7',
    title: 'Slow releases',
  })
})

it('shows a new vote limit straight away, without the old number flashing back', async () => {
  const { channel } = createTestChannel()
  type SettingsResult = Awaited<ReturnType<RetroBoardPageDeps['updateSettings']>>
  let resolveSave!: (result: SettingsResult) => void
  const updateSettings = vi.fn<RetroBoardPageDeps['updateSettings']>(
    () =>
      new Promise<SettingsResult>((resolve) => {
        resolveSave = resolve
      }),
  )

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Vote' },
    updateSettings,
  })

  const limit = currentWrapper!.get('.vote-counter-limit')
  await limit.trigger('focus')
  await limit.setValue('5')
  await nextTick()
  await nextTick()

  expect(updateSettings).toHaveBeenCalledOnce()
  expect((currentWrapper!.get('.vote-counter-limit').element as HTMLInputElement).value).toBe('5')

  resolveSave({ data: true, status: 'success' })
  await nextTick()

  expect((currentWrapper!.get('.vote-counter-limit').element as HTMLInputElement).value).toBe('5')
})

it('shows a renamed topic straight away, without the old headline flashing back', async () => {
  const { channel } = createTestChannel()
  type TitleResult = Awaited<ReturnType<RetroBoardPageDeps['setGroupTitle']>>
  let resolveSave!: (result: TitleResult) => void
  const setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(
    () =>
      new Promise<TitleResult>((resolve) => {
        resolveSave = resolve
      }),
  )

  await mount({ createChannel: () => channel, data: groupedBoard, setGroupTitle })

  const title = currentWrapper!.get('.group-box input')
  await title.trigger('focus')
  await title.setValue('Slow releases')
  await title.trigger('blur')
  await nextTick()
  await nextTick()

  // The save is still in flight, and the board already reads the way the room left it.
  expect(setGroupTitle).toHaveBeenCalledOnce()
  expect((currentWrapper!.get('.group-box input').element as HTMLInputElement).value).toBe(
    'Slow releases',
  )

  resolveSave({ data: true, status: 'success' })
  await nextTick()

  expect((currentWrapper!.get('.group-box input').element as HTMLInputElement).value).toBe(
    'Slow releases',
  )
})

it('puts the old topic headline back when the rename is refused', async () => {
  const { channel } = createTestChannel()
  const setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(async () => ({
    code: 500,
    status: 'error' as const,
  }))

  await mount({ createChannel: () => channel, data: groupedBoard, setGroupTitle })

  const title = currentWrapper!.get('.group-box input')
  await title.trigger('focus')
  await title.setValue('Slow releases')
  await title.trigger('blur')
  await vi.waitFor(() =>
    expect((currentWrapper!.get('.group-box input').element as HTMLInputElement).value).toBe(
      'Painful releases',
    ),
  )
})

it('saves a topic title when the click lands on the canvas', async () => {
  const { channel } = createTestChannel()
  const setGroupTitle = vi.fn<RetroBoardPageDeps['setGroupTitle']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, setGroupTitle })

  const title = currentWrapper!.get('.group-box input').element as HTMLInputElement
  title.focus()
  title.value = 'Slow releases'

  currentWrapper!.get('.canvas-wrapper').element.dispatchEvent(pointer('pointerdown', 20, 600))
  await nextTick()

  await vi.waitFor(() =>
    expect(setGroupTitle).toHaveBeenCalledWith({
      groupId: 'group-1',
      retroId: '7',
      title: 'Slow releases',
    }),
  )
})

it('drags a topic by its frame and a note on its own', async () => {
  const { channel } = createTestChannel()

  await mount({ createChannel: () => channel, data: groupedBoard })
  await currentWrapper?.find('.group-box').trigger('pointerdown')

  expect(cardWithText('My note')?.classes()).toContain('dragging')
  expect(cardWithText('Other note')?.classes()).toContain('dragging')

  await currentWrapper?.find('.card-text').trigger('pointerdown')

  expect(cardWithText('Other note')?.classes()).not.toContain('dragging')
})

it('uses the same 32px boundary to leave and rejoin a group', async () => {
  const { channel } = createTestChannel()
  await mount({ createChannel: () => channel, data: groupedBoard })
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 140, 100))
  await nextTick()
  expect(currentWrapper!.get('.group-box').attributes('style')).toContain('left: 72px')
  window.dispatchEvent(pointer('pointermove', 139, 100))
  await nextTick()
  expect(currentWrapper!.get('.group-box').attributes('style')).toContain('left: 272px')
  window.dispatchEvent(pointer('pointermove', 140, 100))
  await nextTick()
  expect(currentWrapper!.get('.group-box').attributes('style')).toContain('left: 72px')
  window.dispatchEvent(pointer('pointerup', 140, 100))
})

it('stores a topic drag as one group movement', async () => {
  const { channel } = createTestChannel()
  const moveGroup = vi.fn<RetroBoardPageDeps['moveGroup']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, moveGroup })
  currentWrapper?.find('.group-box').element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 120, 130))
  window.dispatchEvent(pointer('pointerup', 120, 130))

  await vi.waitFor(() =>
    expect(moveGroup).toHaveBeenCalledWith({
      deltaX: 20,
      deltaY: 30,
      groupId: 'group-1',
      retroId: '7',
      sectionId: '1',
    }),
  )
})

it('does not apply a group movement twice when sync arrives before the API response', async () => {
  const live = createTestChannel()
  let resolveMove!: (value: Awaited<ReturnType<RetroBoardPageDeps['moveGroup']>>) => void
  const moveGroup = vi.fn<RetroBoardPageDeps['moveGroup']>(
    () =>
      new Promise((resolve) => {
        resolveMove = resolve
      }),
  )
  await mount({ createChannel: () => live.channel, data: groupedBoard, moveGroup })
  const box = currentWrapper!.get('.group-box')
  expect(box.attributes('style')).toContain('left: 32px')
  expect(box.attributes('style')).toContain('width: 416px')
  box.element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 120, 130))
  window.dispatchEvent(pointer('pointerup', 120, 130))
  await vi.waitFor(() => expect(moveGroup).toHaveBeenCalledOnce())
  live.channel.sync = vi.fn<RetroChannel['sync']>(async () => ({
    ...structuredClone(groupedBoard),
    cards: groupedBoard.cards.map((card) => ({ ...card, x: card.x + 20, y: card.y + 30 })),
    name: 'Synced during drop',
  }))
  live.emit({ type: 'changed' })
  await vi.waitFor(() =>
    expect((currentWrapper!.get('.retro-name-input').element as HTMLInputElement).value).toBe(
      'Synced during drop',
    ),
  )
  resolveMove({ data: true, status: 'success' })
  await vi.waitFor(() => expect(cardWithText('My note')!.classes()).not.toContain('dragging'))
  expect(cardWithText('My note')!.attributes('style')).toContain('left: 60px')
  expect(cardWithText('Other note')!.attributes('style')).toContain('left: 300px')
  expect(currentWrapper!.get('.group-box').attributes('style')).toContain('left: 52px')
  expect(currentWrapper!.get('.group-box').attributes('style')).toContain('width: 416px')
})

it('ignores deletion shortcuts in other editors while a card is selected', async () => {
  const { channel } = createTestChannel()
  const removeCard = vi.fn<RetroBoardPageDeps['removeCard']>(successfulAction)
  await mount({ createChannel: () => channel, data: groupedBoard, removeCard })
  await cardWithText('My note')!.trigger('click')
  const editable = document.createElement('div')
  editable.contentEditable = 'true'
  const child = document.createElement('span')
  editable.append(child)
  testHost!.append(editable)
  const targets = [
    currentWrapper!.get('.group-title').element,
    currentWrapper!.get('.retro-name-input').element,
    currentWrapper!.get('.phase-timer-minutes').element,
    child,
  ]
  for (const target of targets) {
    for (const key of ['Backspace', 'Delete']) {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key })
      target.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
  }
  expect(removeCard).not.toHaveBeenCalled()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }))
  await vi.waitFor(() => expect(removeCard).toHaveBeenCalledExactlyOnceWith({ id: 'mine' }))
})

it('splits the topic back into notes', async () => {
  const { channel } = createTestChannel()
  const ungroup = vi.fn<RetroBoardPageDeps['ungroup']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, ungroup })
  await currentWrapper?.find('.group-ungroup').trigger('click')

  expect(ungroup).toHaveBeenCalledWith({ groupId: 'group-1', retroId: '7' })
})

it('leaves the topic in the owner hands once voting has started', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...groupedBoard, phase: 'Vote', phaseEndsAt: '2099-01-01T00:00:00Z' },
  })

  // A topic cut the wrong way has to be fixable while the team is already voting on it.
  expect(currentWrapper?.find('.group-ungroup').exists()).toBe(true)
  expect((currentWrapper!.find('.group-title').element as HTMLInputElement).disabled).toBe(false)
})

it('clears every vote for the owner', async () => {
  const { channel } = createTestChannel()
  const resetVotes = vi.fn<RetroBoardPageDeps['resetVotes']>(successfulAction)
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount({
    createChannel: () => channel,
    data: { ...groupedBoard, phase: 'Vote' },
    resetVotes,
  })
  await currentWrapper!.find('button[aria-label="Reset votes"]').trigger('click')

  expect(resetVotes).toHaveBeenCalledWith({ retroId: '7' })
})

it('takes the vote off a topic from its group control', async () => {
  const { channel } = createTestChannel()
  const toggleVote = vi.fn<RetroBoardPageDeps['toggleVote']>(successfulAction)
  const votedTopic: RetroBoardViewModel = {
    ...groupedBoard,
    // The server keeps the vote on one note of the topic; the others carry no flag of their own.
    cards: groupedBoard.cards.map((card) => ({ ...card, votedByMe: card.id === 'mine' })),
    groups: groupedBoard.groups.map((group) => ({ ...group, votedByMe: true })),
    myVotes: 1,
    phase: 'Vote',
    phaseEndsAt: '2099-01-01T00:00:00Z',
  }

  await mount({ createChannel: () => channel, data: votedTopic, toggleVote })
  await currentWrapper!.find('.group-vote-toolbar .vote-badge').trigger('click')

  expect(toggleVote).toHaveBeenCalledWith({ id: 'mine', voted: false })
})

it('shows one score for the whole topic', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...groupedBoard, phase: 'Discuss' },
  })

  expect(
    currentWrapper!.findAll('.vote-badge').map((badge: DOMWrapper<Element>) => badge.text()),
  ).toEqual(['#1 · 4 votes'])
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

  expect(currentWrapper?.find('.vote-badge').exists()).toBe(false)
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

  expect(currentWrapper?.find('.vote-badge').text()).toBe('#1 · 2 votes')
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
    currentWrapper?.findAll('span.card-text').map((card: DOMWrapper<Element>) => card.text()),
  ).toEqual(['First', 'Second', 'Third', 'Also third', 'Fifth', 'Ship the fix'])
  // Equal votes no longer widen the leading set: the board order breaks the tie, so exactly
  // three trophies are handed out however many topics share a score.
  expect(cardWithText('First')?.find('.vote-result').classes()).toContain('rank-1')
  expect(cardWithText('Second')?.find('.vote-result').classes()).toContain('rank-2')
  expect(cardWithText('Third')?.find('.vote-result').classes()).toContain('rank-3')
  expect(cardWithText('Also third')?.find('.vote-result .lucide-trophy').exists()).toBe(false)
  expect(cardWithText('Fifth')?.find('.vote-result .lucide-trophy').exists()).toBe(false)
  expect(cardWithText('Ship the fix')?.find('.vote-result').exists()).toBe(false)
})

it('lets a topic carried into the actions keep the place it won', async () => {
  const { channel } = createTestChannel()
  const topics = ['First', 'Second', 'Third'].map((text, index) => ({
    ...board.cards[0]!,
    id: `topic-${index}`,
    // The winner has already been discussed and carried into the actions.
    sectionId: index === 0 ? '2' : '1',
    text,
    votes: [4, 3, 2][index]!,
  }))

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      cards: topics,
      phase: 'Discuss',
      sections: [
        { color: '#489c61', id: '1', name: 'Good' },
        { color: '#4774d4', id: '2', name: 'Actions' },
      ],
    },
  })

  // A place is what the room voted, so the runner-up does not inherit the trophy - the winner
  // simply stops showing one once it has become an action item.
  expect(cardWithText('First')?.find('.vote-result').exists()).toBe(false)
  expect(cardWithText('Second')?.find('.vote-result').classes()).toContain('rank-2')
  expect(cardWithText('Third')?.find('.vote-result').classes()).toContain('rank-3')
})

it('holds a live refresh back while a topic title is being typed', async () => {
  const live = createTestChannel()
  const renamed = structuredClone(groupedBoard)
  renamed.groups[0]!.title = 'Renamed elsewhere'
  live.channel.sync = vi.fn<RetroChannel['sync']>(async () => renamed)

  await mount({ createChannel: () => live.channel, data: groupedBoard })

  const title = currentWrapper!.get('.group-box input')
  await title.trigger('focus')
  await title.setValue('Half typed')

  live.emit({ type: 'changed' })
  await nextTick()
  await nextTick()

  expect((title.element as HTMLInputElement).value).toBe('Half typed')
  expect(live.channel.sync).not.toHaveBeenCalled()
})

it.each([
  [
    'a cursor',
    {
      member: { color: '#fff', initials: 'GH', name: 'G', userId: 'u2' },
      type: 'cursor' as const,
      x: 10,
      y: 10,
    },
  ],
  [
    'a card move',
    { cardId: 'other', groupId: 'group-1', type: 'card-move' as const, x: 300, y: 90 },
  ],
] as const)('survives %s while the topic title is being typed', async (_name, message) => {
  const live = createTestChannel()

  await mount({ createChannel: () => live.channel, data: groupedBoard })

  const title = currentWrapper!.get('.group-box input')
  ;(title.element as HTMLInputElement).focus()
  await title.trigger('focus')
  await title.setValue('Half typed')

  live.emit(message as RetroChannelMessage)
  await nextTick()
  await nextTick()

  expect((currentWrapper!.get('.group-box input').element as HTMLInputElement).value).toBe(
    'Half typed',
  )
})

it('keeps the timer duration being typed through a live update', async () => {
  const live = createTestChannel()

  await mount({ createChannel: () => live.channel, data: groupedBoard })

  const timer = currentWrapper!.get('.phase-timer-minutes')
  ;(timer.element as HTMLInputElement).focus()
  await timer.setValue('42')

  live.emit({
    member: { color: '#fff', initials: 'GH', name: 'G', userId: 'u2' },
    type: 'cursor',
    x: 10,
    y: 10,
  })
  await nextTick()
  await nextTick()

  expect((currentWrapper!.get('.phase-timer-minutes').element as HTMLInputElement).value).toBe('42')
})

it('keeps a note being edited through a live update', async () => {
  const live = createTestChannel()

  await mount({ createChannel: () => live.channel, data: groupedBoard })
  await cardWithText('My note')?.trigger('click')
  await cardWithText('My note')?.trigger('click')

  const editor = currentWrapper!.get('textarea.card-text')
  ;(editor.element as HTMLTextAreaElement).focus()
  await editor.setValue('Half typed')

  live.emit({
    member: { color: '#fff', initials: 'GH', name: 'G', userId: 'u2' },
    type: 'cursor',
    x: 10,
    y: 10,
  })
  await nextTick()
  await nextTick()

  expect((currentWrapper!.get('textarea.card-text').element as HTMLTextAreaElement).value).toBe(
    'Half typed',
  )
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
    currentWrapper?.findAll('span.card-text').map((card: DOMWrapper<Element>) => card.text()),
  ).toEqual(['My note', 'Other note'])
  expect(currentWrapper?.find('.vote-result .lucide-trophy').exists()).toBe(false)
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
  await buttonWithText('Make owner')?.trigger('click')

  expect(transferOwnership).toHaveBeenCalledWith({ retroId: '7', userId: grace.userId })
})

it('offers no hand-over to a participant or on a finished retro', async () => {
  const { channel } = createTestChannel()

  await mount({
    createChannel: () => channel,
    data: { ...twoPeopleBoard, canManage: false },
  })

  expect(buttonWithText('Make owner')).toBeUndefined()

  await currentWrapper?.unmount()
  await mount({ createChannel: () => channel, data: { ...twoPeopleBoard, finished: true } })

  expect(buttonWithText('Make owner')).toBeUndefined()
})

it('shows vote results on a finished retro without the phase controls', async () => {
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

  expect(currentWrapper!.find('.finished-screen').exists()).toBe(false)
  expect(currentWrapper!.find('.retro-canvas').exists()).toBe(true)
  expect(currentWrapper!.find('.board-help').exists()).toBe(false)
  expect(currentWrapper!.find('.phase-stepper').exists()).toBe(false)
  expect(currentWrapper!.findAll('.vote-result')).toHaveLength(2)
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
  await buttonWithText('Finish retro')?.trigger('click')

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
  await currentWrapper?.find('button[aria-label="Discuss"]').trigger('click')

  await vi.waitFor(() => expect(advancePhase).toHaveBeenCalledOnce())
  expect(advancePhase).toHaveBeenCalledWith({ phase: 'Discuss', retroId: '7' })
  // The server drops the running timer on every phase move, so the client must not race it.
  expect(setPhaseTimer).not.toHaveBeenCalled()
})

it('runs a timer in the collect phase too', async () => {
  const { channel } = createTestChannel()
  const setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction)

  await mount({ createChannel: () => channel, setPhaseTimer })
  await buttonWithText('Start')?.trigger('click')

  expect(setPhaseTimer).toHaveBeenCalledWith({ minutes: 1, retroId: '7' })
})

it('stops a running timer', async () => {
  const { channel } = createTestChannel()
  const setPhaseTimer = vi.fn<RetroBoardPageDeps['setPhaseTimer']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Group', phaseEndsAt: '2099-01-01T00:00:00Z' },
    setPhaseTimer,
  })
  await buttonWithText('Stop')?.trigger('click')

  expect(setPhaseTimer).toHaveBeenCalledWith({ minutes: null, retroId: '7' })
})

it('returns to the previous phase directly', async () => {
  const { channel } = createTestChannel()
  const revertPhase = vi.fn<RetroBoardPageDeps['revertPhase']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, phase: 'Group' },
    revertPhase,
  })
  await currentWrapper?.find('button[aria-label="Collect"]').trigger('click')

  await vi.waitFor(() => expect(revertPhase).toHaveBeenCalledOnce())
  expect(revertPhase).toHaveBeenCalledWith({ phase: 'Collect', retroId: '7' })
})

// The actions column is the second zone: its left edge sits a whole zone plus the gap to the
// right, so a note has to travel that far to reach it.
const dragMyNoteIntoActions = async () => {
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 1100, 100))
  // The drag is picked up on its own frame, so one tick is not always enough.
  await nextTick()
}

it('lets the owner carry a note into the actions section in any phase', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({ createChannel: () => channel, data: { ...board, phase: 'Vote' }, moveCard })
  await dragMyNoteIntoActions()
  window.dispatchEvent(pointer('pointerup', 1100, 100))

  await vi.waitFor(() =>
    expect(moveCard).toHaveBeenCalledWith({
      groupId: null,
      id: 'mine',
      sectionId: '2',
      x: 1040,
      y: 80,
    }),
  )
  await vi.waitFor(() =>
    expect(cardWithText('My note')?.attributes('style')).toContain('left: 1040px'),
  )
})

it('keeps a participant from moving a topic note into Actions', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, canManage: false, phase: 'Actions' },
    moveCard,
  })
  await dragMyNoteIntoActions()
  window.dispatchEvent(pointer('pointerup', 1100, 100))

  expect(moveCard).not.toHaveBeenCalled()
})

it('keeps a participant action inside Actions', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      canManage: false,
      cards: [{ ...board.cards[0]!, sectionId: '2', x: 940 }],
      phase: 'Actions',
    },
    moveCard,
  })
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 1000, 100))
  window.dispatchEvent(pointer('pointermove', 100, 100))
  window.dispatchEvent(pointer('pointerup', 100, 100))

  expect(moveCard).not.toHaveBeenCalled()
})

it('lets a participant move an action within Actions', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      canManage: false,
      cards: [{ ...board.cards[0]!, sectionId: '2', x: 940 }],
      phase: 'Actions',
    },
    moveCard,
  })
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 1000, 100))
  window.dispatchEvent(pointer('pointermove', 1050, 100))
  await nextTick()
  window.dispatchEvent(pointer('pointerup', 1050, 100))

  await vi.waitFor(() =>
    expect(moveCard).toHaveBeenCalledWith(expect.objectContaining({ sectionId: '2' })),
  )
})

it('shows a participant the actions section will not take the note, and keeps it out', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({
    createChannel: () => channel,
    data: { ...board, canManage: false },
    moveCard,
  })
  await dragMyNoteIntoActions()

  const zones = currentWrapper!.findAll('.zone')

  expect(zones[0]!.classes()).not.toContain('zone--closed')
  expect(zones[1]!.classes()).toContain('zone--closed')
  // The note keeps its own colour rather than promising the move it will not be allowed to make.
  expect(cardWithText('My note')?.attributes('style')).toContain('#489c61')

  window.dispatchEvent(pointer('pointerup', 1100, 100))
  await nextTick()

  expect(moveCard).not.toHaveBeenCalled()
})

it('draws the owner first and everyone as one square', async () => {
  const { channel } = createTestChannel()
  const owner = { color: '#a44', initials: 'GH', name: 'Grace Hopper', userId: 'user-2' }

  await mount({
    createChannel: () => channel,
    data: {
      ...board,
      owner,
      participants: [member, owner],
    },
  })

  expect(
    currentWrapper!
      .findAll('.presence > .entity-avatar')
      .map((avatar: DOMWrapper<Element>) => avatar.text()),
  ).toEqual(['GH', 'AL'])
})

it('slides the squares further under each other as the room fills up', async () => {
  const { channel } = createTestChannel()
  const crowd = Array.from({ length: 12 }, (_value, index) => ({
    color: '#a44',
    initials: `U${index}`,
    name: `User ${index}`,
    userId: `crowd-${index}`,
  }))

  await mount({ createChannel: () => channel, data: { ...board, participants: crowd } })

  // Thirteen squares of 28px would run past 220px at the natural 24px step, so they overlap more.
  const strip = currentWrapper!.get('.presence')

  expect(strip.attributes('style')).toContain('--presence-step: 16px')
})

it('lets the owner move a topic note out of its group', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({ createChannel: () => channel, data: groupedBoard, moveCard })
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 1100, 100))
  await nextTick()

  expect(currentWrapper!.findAll('.zone')[1]!.classes()).not.toContain('zone--closed')

  window.dispatchEvent(pointer('pointerup', 1100, 100))
  await vi.waitFor(() =>
    expect(moveCard).toHaveBeenCalledWith({
      groupId: null,
      id: 'mine',
      sectionId: '2',
      x: 1040,
      y: 80,
    }),
  )
})

// A note in the first section, and a topic waiting in the second one, so a drag across the border
// has a topic to land in.
const crossSectionBoard: RetroBoardViewModel = {
  ...board,
  cards: [
    { ...board.cards[0]!, sectionId: '1', x: 40, y: 80 },
    { ...board.cards[1]!, groupId: 'group-2', sectionId: '2', x: 1000, y: 80 },
    {
      ...board.cards[1]!,
      groupId: 'group-2',
      id: 'third',
      sectionId: '2',
      text: 'Third note',
      x: 1180,
      y: 80,
    },
  ],
  groups: [{ cardIds: ['other', 'third'], id: 'group-2', title: '', votedByMe: false, votes: 0 }],
  phase: 'Group',
  sections: [
    { color: '#489c61', id: '1', name: 'Good' },
    { color: '#d46f47', id: '2', name: 'Bad' },
    { color: '#4774d4', id: '3', name: 'Actions' },
  ],
}

it('drops a note into the topic of the section it was carried into', async () => {
  const { channel } = createTestChannel()
  const moveCard = vi.fn<RetroBoardPageDeps['moveCard']>(successfulAction)

  await mount({ createChannel: () => channel, data: crossSectionBoard, moveCard })
  cardWithText('My note')!.element.dispatchEvent(pointer('pointerdown', 100, 100))
  window.dispatchEvent(pointer('pointermove', 1100, 100))
  await nextTick()

  // What the preview promised while dragging is what the drop has to save.
  window.dispatchEvent(pointer('pointerup', 1100, 100))
  await vi.waitFor(() =>
    expect(moveCard).toHaveBeenCalledWith({
      groupId: 'group-2',
      id: 'mine',
      sectionId: '2',
      x: 1040,
      y: 80,
    }),
  )
})

const carriedActionBoard: RetroBoardViewModel = {
  ...board,
  canManage: false,
  cards: [
    {
      assignee: null,
      authorColor: member.color,
      authorInitials: member.initials,
      authorName: member.name,
      done: false,
      groupId: null,
      hidden: false,
      id: 'carried',
      isMine: true,
      revealed: true,
      sectionId: '2',
      text: 'Ship the fix',
      votedByMe: false,
      votes: 0,
      x: 900,
      y: 40,
    },
  ],
}

it('ticks off an action carried over from the last retro before Actions', async () => {
  const { channel } = createTestChannel()
  const toggleDone = vi.fn<RetroBoardPageDeps['toggleDone']>(successfulAction)

  await mount({ createChannel: () => channel, data: carriedActionBoard, toggleDone })
  await cardWithText('Ship the fix')?.trigger('click')

  const buttons = currentWrapper!
    .findAll('.card-toolbar .icon-btn')
    .map(
      (button: DOMWrapper<Element>) =>
        button.attributes('title') ?? button.attributes('aria-label'),
    )

  // Nothing is left to hide about a commitment the team already agreed on.
  expect(buttons).toEqual(['Mark as done', 'Delete note'])

  await currentWrapper?.find('.card-toolbar .icon-btn').trigger('click')

  await vi.waitFor(() => expect(toggleDone).toHaveBeenCalledWith({ done: true, id: 'carried' }))
})
