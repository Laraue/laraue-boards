<template>
  <QueryState
    :data="data"
    error-title="Could not load retro"
    loading-text="Loading retro…"
    :message="message"
    :on-retry="refresh"
    :pending="pending && !data">
    <template #default="{ data: board }">
      <section class="retro">
        <header class="retro-header">
          <div class="page-heading">
            <RetroIcon
              class="page-heading-icon"
              :style="{ color: board.color }" />
            <h1>{{ board.name }}</h1>
            <span
              v-if="board.finished"
              class="retro-finished">
              Finished
            </span>
          </div>
          <div class="retro-actions">
            <div
              aria-label="People on this retro"
              class="presence">
              <span
                v-for="member in presence"
                :key="member.userId"
                class="entity-avatar"
                :style="{ background: member.color }">
                {{ member.initials }}
              </span>
              <span
                v-if="!presence.length"
                class="muted presence-alone">
                {{ board.finished && !board.participants.length ? 'No participants' : 'Only you' }}
              </span>
              <div class="presence-list">
                <p class="presence-title">
                  {{ board.finished ? 'Participants' : 'On this retro' }}
                </p>
                <span
                  v-for="member in everyone(board)"
                  :key="member.userId"
                  class="presence-row">
                  <span
                    class="entity-avatar small"
                    :style="{ background: member.color }">
                    {{ member.initials }}
                  </span>
                  {{ member.name }}
                  <template v-if="member.userId === board.me.userId">(you)</template>
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="!board.finished"
            class="phase-bar">
            <div
              class="phases"
              role="group">
              <button
                v-for="option in PHASES"
                :key="option"
                class="secondary small"
                :class="{ active: board.phase === option }"
                :disabled="!board.canManage || !canChangePhase(board.phase, option)"
                type="button"
                @click="changePhase(option)">
                {{ option }}
              </button>
              <button
                v-if="board.canManage && board.phase === 'Actions'"
                class="secondary danger small"
                type="button"
                @click="finish">
                <Archive />
                Finish
              </button>
            </div>

            <button
              v-if="board.phase === 'Collect'"
              class="secondary small"
              :disabled="board.hiddenMine + board.revealedMine === 0"
              type="button"
              @click="setMineRevealed(board.hiddenMine > 0)">
              <Eye v-if="board.hiddenMine > 0" />
              <EyeOff v-else />
              {{ board.hiddenMine > 0 ? 'Reveal my notes' : 'Hide my notes' }}
              <template v-if="board.hiddenMine > 0">({{ board.hiddenMine }})</template>
            </button>

            <template v-if="board.phase === 'Vote'">
              <label class="phase-control">
                Votes
                <input
                  class="votes-input"
                  :disabled="!board.canManage"
                  min="1"
                  type="number"
                  :value="board.votesPerUser"
                  @change="setVotesPerUser($event)" />
              </label>
              <span class="muted">{{ board.myVotes }} / {{ board.votesPerUser }} votes</span>
              <span class="phase-control">
                <button
                  v-if="countdown === undefined"
                  class="secondary small"
                  :disabled="!board.canManage"
                  type="button"
                  @click="startTimer()">
                  <Timer />
                  Start timer
                </button>
                <template v-else>
                  <span
                    class="countdown"
                    :class="{ over: countdown === '00:00' }">
                    {{ countdown }}
                  </span>
                  <button
                    class="secondary small"
                    :disabled="!board.canManage"
                    type="button"
                    @click="stopTimer()">
                    Stop
                  </button>
                </template>
                <input
                  v-model.number="state.timerMinutes"
                  class="votes-input"
                  :disabled="!board.canManage"
                  min="1"
                  type="number" />
                min
              </span>
            </template>
          </div>
        </header>

        <RetroCanvas
          class="retro-canvas"
          :on-background-pointer-down="() => (state.selectedId = undefined)"
          :on-canvas-double-click="(point) => addCardAt(board, point)"
          :on-cursor-move="publishCursor"
          :on-node-move="moveDraggedCard"
          :on-node-move-end="commitDraggedCard">
          <template #default="{ startNodeDrag }">
            <span
              v-for="cursor in cursors"
              :key="cursor.member.userId"
              class="remote-cursor"
              :style="{ left: `${cursor.x}px`, top: `${cursor.y}px` }">
              <MousePointer2 :style="{ color: cursor.member.color }" />
              <span
                class="remote-cursor-name"
                :style="{ background: cursor.member.color }">
                {{ cursor.member.name }}
              </span>
            </span>

            <section
              v-for="(section, index) in board.sections"
              :key="section.id"
              class="zone"
              :style="zoneStyle(index)">
              <header class="zone-header">
                <span class="zone-title">
                  <span
                    class="dot"
                    :style="{ background: section.color }" />
                  <strong>{{ section.name }}</strong>
                  <span class="muted">{{ cardsOf(board, section.id).length }}</span>
                </span>
                <small class="muted">{{ sectionHint(section.name) }}</small>
              </header>
            </section>

            <article
              v-for="card in visibleCards(board)"
              :key="card.id"
              :aria-busy="state.pendingCardIds.has(card.id) || undefined"
              class="card"
              :class="{
                done: card.done,
                dragging: state.dragId === card.id,
                editing: state.editingId === card.id,
                hidden: card.hidden,
                pending: state.pendingCardIds.has(card.id),
                selected: state.selectedId === card.id,
              }"
              :style="{
                '--card-color': card.color,
                ...paperStyle(card.id),
                left: `${card.x}px`,
                top: `${card.y}px`,
              }"
              @click="selectCard(card)"
              @dblclick.stop
              @pointerdown.stop="startCardDrag($event, card, startNodeDrag)"
              @pointerenter="state.hoveredId = card.id"
              @pointerleave="state.hoveredId = undefined">
              <span
                v-if="state.hoveredId === card.id || state.selectedId === card.id"
                class="card-author"
                :style="{ background: card.authorColor }"
                :title="card.authorName">
                {{ card.authorInitials }}
              </span>
              <textarea
                v-if="state.editingId === card.id"
                :ref="setEditorRef"
                v-model="state.draft"
                v-fit-text="state.draft"
                aria-label="Edit note"
                class="card-text"
                placeholder="Add a note"
                @blur="saveDraft(card)"
                @input="publishDraft(card)"
                @keydown.ctrl.enter.prevent="saveDraft(card)"
                @keydown.esc.prevent="cancelEdit"
                @keydown.meta.enter.prevent="saveDraft(card)" />
              <p
                v-else
                v-fit-text="card.text"
                class="card-text"
                :class="{ placeholder: !card.text }">
                {{ card.text || 'Add a note' }}
              </p>
              <select
                v-if="isActionsSection(board, card.sectionId)"
                aria-label="Action owner"
                class="card-assignee"
                :disabled="!canAssign(board)"
                :value="card.assignee?.userId ?? ''"
                @change="assign(card, $event)"
                @click.stop
                @pointerdown.stop>
                <option value="">No owner</option>
                <option
                  v-for="one of board.participants"
                  :key="one.userId"
                  :value="one.userId">
                  {{ one.name }}
                </option>
              </select>
              <span
                v-if="discussionRanks.get(card.id)"
                :aria-label="discussionRanks.get(card.id) + ' place'"
                class="rank-badge"
                :class="'rank-' + discussionRanks.get(card.id)">
                <Medal />
                {{ discussionRanks.get(card.id) }}
              </span>
              <button
                v-if="state.editingId !== card.id && showVoteBadge(board, card)"
                :aria-label="card.votedByMe ? 'Remove vote from note' : 'Vote for note'"
                class="vote-badge"
                :class="{ voted: card.votedByMe }"
                :disabled="!votingOpen"
                :title="
                  votingOpen ? (card.votedByMe ? 'Remove vote' : 'Vote') : 'Start the timer to vote'
                "
                type="button"
                @click.stop="vote(card)"
                @pointerdown.stop>
                <ThumbsUp />
                <template v-if="showVoteResults(board)">{{ card.votes }}</template>
              </button>

              <div
                v-if="
                  (state.selectedId === card.id || state.editingId === card.id) &&
                  hasActions(board, card)
                "
                class="card-toolbar">
                <button
                  v-if="board.phase === 'Actions' && isActionsSection(board, card.sectionId)"
                  class="icon-btn small"
                  :title="card.done ? 'Mark as not done' : 'Mark as done'"
                  type="button"
                  @click.stop="done(card)"
                  @pointerdown.stop>
                  <CircleCheck />
                </button>
                <button
                  v-if="card.isMine && board.phase === 'Collect'"
                  class="icon-btn small"
                  :title="card.revealed ? 'Hide from the team' : 'Show to the team'"
                  type="button"
                  @click.stop="toggleReveal(card)"
                  @pointerdown.stop>
                  <Eye v-if="card.revealed" />
                  <EyeOff v-else />
                </button>
                <button
                  v-if="card.isMine"
                  aria-label="Delete note"
                  class="icon-btn small"
                  type="button"
                  @click.stop="destroy(card)"
                  @pointerdown.stop>
                  <Trash2 />
                </button>
              </div>
            </article>
          </template>
        </RetroCanvas>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import {
  Archive,
  CircleCheck,
  Eye,
  EyeOff,
  Medal,
  MousePointer2,
  ThumbsUp,
  Timer,
  Trash2,
} from '@lucide/vue'

import { RetroIcon } from '~/constants/icons'
import RetroCanvas from '~/sections/retro/retro-board/components/RetroCanvas/RetroCanvas.vue'
import type { RetroBoardPageDeps } from '~/sections/retro/retro-board/RetroBoardPage.deps'
import type {
  RetroBoardViewModel,
  RetroCardViewModel,
  RetroChannel,
  RetroChannelMessage,
  RetroMember,
  RetroPhase,
} from '~/sections/retro/retro-board/RetroBoardPage.types'

const props = defineProps<{ deps: RetroBoardPageDeps; retroId: string }>()
const CURSOR_TTL_MS = 5000
const LIVE_TTL_MS = 2000

const PHASES: RetroPhase[] = ['Collect', 'Group', 'Vote', 'Discuss', 'Actions']

const previousPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) - 1]
const nextPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) + 1]
const canChangePhase = (current: RetroPhase, target: RetroPhase) =>
  target === previousPhase(current) || target === nextPhase(current)

const ZONE_WIDTH = 880
const ZONE_HEIGHT = 720
const ZONE_GAP = 24
const CARD_SIZE = 160
const MAX_CARD_FONT_SIZE = 30
const MIN_CARD_FONT_SIZE = 12

const fitCardText = (element: HTMLElement) => {
  let fontSize = MAX_CARD_FONT_SIZE

  element.style.fontSize = `${fontSize}px`
  while (
    fontSize > MIN_CARD_FONT_SIZE &&
    (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
  ) {
    fontSize -= 1
    element.style.fontSize = `${fontSize}px`
  }
}

const vFitText = {
  mounted: fitCardText,
  updated: (
    element: HTMLElement,
    binding: { oldValue: string | undefined; value: string | undefined },
  ) => {
    if (binding.value !== binding.oldValue) {
      fitCardText(element)
    }
  },
}

const editor = shallowRef<HTMLTextAreaElement>()
const setEditorRef = (element: unknown) => {
  editor.value = element instanceof HTMLTextAreaElement ? element : undefined
}

const state = reactive({
  draft: '',
  dragDistance: 0,
  dragId: undefined as string | undefined,
  dragPosition: undefined as undefined | { x: number; y: number },
  editingId: undefined as string | undefined,
  hoveredId: undefined as string | undefined,
  joined: new Map<string, RetroMember>(),
  now: Date.now(),
  pendingCardIds: new Set<string>(),
  pendingTexts: new Map<string, string>(),
  refreshPending: false,
  remoteCursors: new Map<string, { at: number; member: RetroMember; x: number; y: number }>(),
  remoteMoves: new Map<string, { at: number; x: number; y: number }>(),
  remoteTexts: new Map<string, { at: number; text: string }>(),
  selectedId: undefined as string | undefined,
  timerMinutes: 5,
})

const {
  data,
  message,
  pending,
  refresh: refreshQuery,
} = await useQuery(
  () => `retro:${props.retroId}`,
  (_nuxtApp, { signal }) => props.deps.view({ retroId: props.retroId, signal }),
  { watch: [() => props.retroId] },
)
const refresh = () => refreshQuery({ dedupe: 'defer' })

const toast = useToast()
let channel: RetroChannel | undefined
let lastCardClickAt = 0
let lastCardClickId: string | undefined

const clearBoardState = () => {
  state.dragDistance = 0
  state.dragId = undefined
  state.dragPosition = undefined
  state.draft = ''
  state.editingId = undefined
  state.hoveredId = undefined
  state.joined.clear()
  state.pendingCardIds.clear()
  state.pendingTexts.clear()
  state.refreshPending = false
  state.remoteCursors.clear()
  state.remoteMoves.clear()
  state.remoteTexts.clear()
  state.selectedId = undefined
  lastCardClickAt = 0
  lastCardClickId = undefined
}

const onChannelMessage = (source: RetroChannel, incoming: RetroChannelMessage) => {
  if (source !== channel) {
    return
  }
  if (incoming.type === 'leave') {
    state.joined.delete(incoming.member.userId)
    return
  }
  if (incoming.type === 'join') {
    state.joined.set(incoming.member.userId, incoming.member)
    source.publishAnnounce()
    return
  }
  if (incoming.type === 'presence') {
    state.joined.set(incoming.member.userId, incoming.member)
    return
  }
  if (incoming.type === 'cursor') {
    state.remoteCursors.set(incoming.member.userId, {
      at: Date.now(),
      member: incoming.member,
      x: incoming.x,
      y: incoming.y,
    })
    return
  }
  if (incoming.type === 'card-move') {
    state.remoteMoves.set(incoming.cardId, { at: Date.now(), x: incoming.x, y: incoming.y })
    return
  }
  if (incoming.type === 'card-text') {
    state.remoteTexts.set(incoming.cardId, { at: Date.now(), text: incoming.text })
    return
  }
  if (incoming.type === 'changed') {
    // A refresh mid-typing would replace the text node under the caret.
    if (state.editingId === undefined) {
      void refresh()
    } else {
      state.refreshPending = true
    }
  }
}

const openChannel = () => {
  channel?.close()
  clearBoardState()

  const next = props.deps.createChannel(props.retroId)

  channel = next
  next.onMessage((incoming) => onChannelMessage(next, incoming))
  void next.open().catch(() => {
    if (channel === next) {
      toast.show('Could not connect to live updates')
    }
  })
}

onMounted(openChannel)
watch(
  () => props.retroId,
  () => channel && openChannel(),
)
onBeforeUnmount(() => {
  const current = channel

  channel = undefined
  current?.close()
})

// The same person in a second tab is still you, not a teammate standing next to you.
const presence = computed(() => {
  const board = data.value
  const members = board?.finished ? board.participants : [...state.joined.values()]

  return members?.filter((member) => member.userId !== board?.me.userId) ?? []
})

// Avatars stand for the teammates next to you; the hover list names everyone, you included.
const everyone = (board: RetroBoardViewModel) =>
  board.finished ? board.participants : [board.me, ...presence.value]

useHead({ title: computed(() => data.value?.name ?? 'Retro') })

// The first four sections form a 2x2 board; anything after it stacks in a column on the right.
const zoneRect = (index: number) => {
  const column = index < 4 ? index % 2 : 2
  const row = index < 4 ? Math.floor(index / 2) : index - 4

  return {
    height: index < 4 ? ZONE_HEIGHT : ZONE_HEIGHT * 2 + ZONE_GAP,
    left: column * (ZONE_WIDTH + ZONE_GAP),
    top: row * (ZONE_HEIGHT + ZONE_GAP),
    width: ZONE_WIDTH,
  }
}

const zoneStyle = (index: number) => {
  const rect = zoneRect(index)

  return {
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
  }
}

const zoneIndexAt = (x: number, y: number, sectionCount: number) => {
  const distance = (index: number) => {
    const rect = zoneRect(index)
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    return (centerX - x) ** 2 + (centerY - y) ** 2
  }

  return Array.from({ length: sectionCount }, (_value, index) => index).reduce(
    (closest, index) => (distance(index) < distance(closest) ? index : closest),
    0,
  )
}

const actionCards = (board: RetroBoardViewModel) =>
  board.cards.filter((card) => card.sectionId === board.sections.at(-1)?.id)

const topicRanks = (board: RetroBoardViewModel) => {
  const topics = board.cards.filter((card) => card.sectionId !== board.sections.at(-1)?.id)
  const scores = [...new Set(topics.map((card) => card.votes).filter((votes) => votes > 0))]
    .toSorted((left, right) => right - left)
    .slice(0, 3)
  const ranks = new Map<string, number>()

  for (const card of topics) {
    const rank = scores.indexOf(card.votes) + 1

    if (rank > 0) {
      ranks.set(card.id, rank)
    }
  }
  return ranks
}

const discussionRanks = computed(() => {
  const board = data.value

  return board?.phase === 'Discuss' ? topicRanks(board) : new Map<string, number>()
})

const cardsOf = (board: RetroBoardViewModel, sectionId: string) =>
  board.cards.filter((card) => card.sectionId === sectionId)

const sectionColorAt = (board: RetroBoardViewModel, x: number, y: number) =>
  board.sections[zoneIndexAt(x + CARD_SIZE / 2, y + CARD_SIZE / 2, board.sections.length)]?.color

const HIDDEN_TEXT = '•••••• ••••• ••••••'

const visibleCards = (board: RetroBoardViewModel) =>
  board.cards.map((card) => {
    // While dragging, the note already wears the colour of the zone it is heading into.
    const moved = state.remoteMoves.get(card.id)
    const dragged =
      (card.id === state.dragId ? state.dragPosition : undefined) ??
      (moved && { x: moved.x, y: moved.y })
    const remoteText =
      state.editingId === card.id
        ? undefined
        : (state.pendingTexts.get(card.id) ?? state.remoteTexts.get(card.id)?.text)

    return {
      ...card,
      ...(remoteText === undefined ? {} : { text: remoteText }),
      // The server strips the text of a covered note, and live typing must not leak it either.
      ...(card.hidden ? { text: HIDDEN_TEXT } : {}),
      ...dragged,
      color:
        (dragged
          ? sectionColorAt(board, dragged.x, dragged.y)
          : board.sections.find((section) => section.id === card.sectionId)?.color) ?? board.color,
    }
  })

const SECTION_HINTS: Record<string, string> = {
  actions: 'Follow-ups the team commits to',
  bad: 'Add things that went badly',
  good: 'Add things that went well',
  start: 'Add things the team should start doing',
  stop: 'Add things the team should stop doing',
}

const sectionHint = (name: string) =>
  SECTION_HINTS[name.toLowerCase()] ?? 'Double-click the area to add a note'

const isActionsSection = (board: RetroBoardViewModel, sectionId: string) =>
  board.sections.at(-1)?.id === sectionId

const canChangeSection = (board: RetroBoardViewModel, sectionId: string) =>
  !board.finished &&
  ((board.phase === 'Collect' && !isActionsSection(board, sectionId)) ||
    (board.phase === 'Actions' && isActionsSection(board, sectionId)))

const canChangeCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canChangeSection(board, card.sectionId)

const canMoveSection = (board: RetroBoardViewModel, sectionId: string) =>
  !board.finished &&
  (board.canManage || (board.phase === 'Collect' && !isActionsSection(board, sectionId)))

const canMoveCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canMoveSection(board, card.sectionId)

const { execute: executeCreate } = useAction(props.deps.createCard)
const { execute: executeMove } = useAction(props.deps.moveCard)
const { execute: executeUpdate } = useAction(props.deps.updateCard)
const { execute: executeVote } = useAction(props.deps.toggleVote)
const { execute: executeAssign } = useAction(props.deps.setCardAssignee)
const { execute: executeDone } = useAction(props.deps.toggleDone)
const { execute: executeRemove } = useAction(props.deps.removeCard)
const { execute: executeReveal } = useAction(props.deps.toggleReveal)
const { execute: executeRevealMine } = useAction(props.deps.setMyCardsRevealed)
const { execute: executeFinish } = useAction(props.deps.finishRetro)
const { execute: executeAdvancePhase } = useAction(props.deps.advancePhase)
const { execute: executeRevertPhase } = useAction(props.deps.revertPhase)
const { execute: executeSettings } = useAction(props.deps.updateSettings)
const { execute: executeTimer } = useAction(props.deps.setVoteTimer)

const saveSettings = async (votesPerUser: number) => {
  const board = data.value

  if (!board?.canManage) {
    return
  }
  await executeSettings({ phase: board.phase, retroId: props.retroId, votesPerUser })
  await refresh()
}

const changePhase = async (phase: RetroPhase) => {
  const board = data.value
  const reverting = board && phase === previousPhase(board.phase)

  if (!board?.canManage || !canChangePhase(board.phase, phase)) {
    return
  }
  if (board.phase === 'Vote' && board.voteEndsAt) {
    const stopped = await executeTimer({ minutes: null, retroId: props.retroId })

    if (!stopped) {
      return
    }
  }
  const executePhase = reverting ? executeRevertPhase : executeAdvancePhase

  if (await executePhase({ phase, retroId: props.retroId })) {
    await refresh()
  }
}

const setVotesPerUser = (event: Event) =>
  saveSettings(Math.max(1, Number((event.target as HTMLInputElement).value)))

// The timer lives on its own endpoint: editing settings mid-vote must not restart the countdown.
const setTimer = async (minutes: null | number) => {
  if (!data.value?.canManage) {
    return
  }
  await executeTimer({ minutes, retroId: props.retroId })
  await refresh()
}

const startTimer = () => setTimer(Math.max(1, state.timerMinutes))

const stopTimer = () => setTimer(null)

let ticker: number | undefined

// The countdown and the expiry of remote cursors only tick in front of a user.
onMounted(() => {
  ticker = window.setInterval(() => {
    state.now = Date.now()
    for (const [userId, cursor] of state.remoteCursors) {
      if (state.now - cursor.at > CURSOR_TTL_MS) {
        state.remoteCursors.delete(userId)
      }
    }
    // An overlay outlives the drag or the sentence it belongs to by a moment: dropping it the
    // instant a reload lands would snap the card back for the frame before the next message.
    // Once the messages stop, the stored data already says the same thing and it can go.
    for (const [cardId, move] of state.remoteMoves) {
      if (state.now - move.at > LIVE_TTL_MS) {
        state.remoteMoves.delete(cardId)
      }
    }
    for (const [cardId, text] of state.remoteTexts) {
      if (state.now - text.at > LIVE_TTL_MS) {
        state.remoteTexts.delete(cardId)
      }
    }
  }, 1000)
})

onBeforeUnmount(() => clearInterval(ticker))

const cursors = computed(() => [...state.remoteCursors.values()])

// One message per animation frame: as smooth as the monitor allows, without flooding the channel.
const onNextFrame = () => {
  let frame = 0
  let send: (() => void) | undefined

  return {
    cancel: () => cancelAnimationFrame(frame),
    schedule: (action: () => void) => {
      send = action
      frame ||= requestAnimationFrame(() => {
        frame = 0
        send?.()
      })
    },
  }
}

const cursorFrame = onNextFrame()
const moveFrame = onNextFrame()

onBeforeUnmount(() => {
  cursorFrame.cancel()
  moveFrame.cancel()
})

const publishCursor = (point: { x: number; y: number }) => {
  const current = channel

  cursorFrame.schedule(() => current?.publishCursor(point.x, point.y))
}

const publishDraft = (card: RetroCardViewModel) => {
  // A note nobody may read yet must not leak keystroke by keystroke either.
  if (data.value?.phase === 'Collect' && !card.revealed) {
    return
  }
  channel?.publishCardText(card.id, state.draft)
}

const countdown = computed(() => {
  const endsAt = data.value?.voteEndsAt

  if (!endsAt || data.value?.phase !== 'Vote') {
    return undefined
  }
  const left = Math.max(0, Math.floor((Date.parse(endsAt) - state.now) / 1000))

  return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
})

const votingOpen = computed(() => {
  const endsAt = data.value?.voteEndsAt

  return data.value?.phase === 'Vote' && !!endsAt && Date.parse(endsAt) > state.now
})

// Only the facilitator closing Vote reveals the totals - a local countdown hitting zero is not
// enough, and the API keeps them at zero until then anyway.
const showVoteResults = (board: RetroBoardViewModel) => board.finished || board.phase !== 'Vote'

const showVoteBadge = (board: RetroBoardViewModel, card: RetroCardViewModel) => {
  if (isActionsSection(board, card.sectionId)) {
    return false
  }
  if (showVoteResults(board)) {
    return card.votes > 0
  }
  return countdown.value !== undefined && (card.votedByMe || board.myVotes < board.votesPerUser)
}

const startEdit = (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !card.isMine || !canChangeCard(board, card)) {
    return
  }
  state.draft = card.text
  state.editingId = card.id
  void nextTick(() => editor.value?.focus())
}

const cancelEdit = () => {
  state.editingId = undefined
  state.refreshPending = false
  void refresh()
}

const removeCard = async (card: RetroCardViewModel) => {
  if (state.pendingCardIds.has(card.id)) {
    return
  }
  state.pendingCardIds.add(card.id)
  try {
    await executeRemove({ id: card.id })
    await refresh()
  } finally {
    state.pendingCardIds.delete(card.id)
  }
}

const saveDraft = async (card: RetroCardViewModel) => {
  const board = data.value

  if (state.editingId !== card.id || !board || !canChangeCard(board, card)) {
    state.editingId = undefined
    state.refreshPending = false
    return
  }
  const text = state.draft.trim()
  const refreshPending = state.refreshPending
  const changed = text !== card.text

  state.editingId = undefined
  state.refreshPending = false
  if (text && changed) {
    state.pendingTexts.set(card.id, text)
  }
  try {
    if (!text) {
      // An empty note is an abandoned one, whether it was just created or cleared.
      await removeCard(card)
      return
    } else if (changed) {
      await executeUpdate({ id: card.id, text })
    } else if (!refreshPending) {
      return
    }
    await refresh()
  } finally {
    state.pendingTexts.delete(card.id)
  }
}

const createCardAt = async (sectionId: string, x: number, y: number) => {
  const created = await executeCreate({ retroId: props.retroId, sectionId, text: '', x, y })

  await refresh()

  const card = created && data.value?.cards.find((item) => item.id === created.id)
  if (card) {
    startEdit(card)
  }
}

const addCardAt = async (board: RetroBoardViewModel, point: { x: number; y: number }) => {
  const index = zoneIndexAt(point.x, point.y, board.sections.length)
  const sectionId = board.sections[index]?.id

  if (sectionId && canChangeSection(board, sectionId)) {
    await createCardAt(sectionId, point.x - CARD_SIZE / 2, point.y - CARD_SIZE / 2)
  }
}

const startCardDrag = (
  event: PointerEvent,
  card: RetroCardViewModel,
  startNodeDrag: (event: PointerEvent) => void,
) => {
  const board = data.value

  if (!board || state.editingId === card.id || !canMoveCard(board, card)) {
    return
  }
  state.dragDistance = 0
  state.selectedId = card.id
  state.dragId = card.id
  state.dragPosition = { x: card.x, y: card.y }
  startNodeDrag(event)
}

const moveDraggedCard = (deltaX: number, deltaY: number) => {
  if (!state.dragPosition || !state.dragId) {
    return
  }
  state.dragDistance += Math.hypot(deltaX, deltaY)
  state.dragPosition = { x: state.dragPosition.x + deltaX, y: state.dragPosition.y + deltaY }

  const { dragId, dragPosition } = state
  const current = channel

  moveFrame.schedule(() => current?.publishCardMove(dragId, dragPosition.x, dragPosition.y))
}

const commitDraggedCard = async () => {
  const id = state.dragId
  const position = state.dragPosition

  if (!id || !position) {
    return
  }
  if (state.dragDistance <= 4) {
    state.dragId = undefined
    state.dragPosition = undefined
    return
  }
  const board = data.value
  const sections = board?.sections ?? []
  const index = zoneIndexAt(position.x + CARD_SIZE / 2, position.y + CARD_SIZE / 2, sections.length)
  const sectionId = sections[index]?.id

  if (!board || !sectionId || !canMoveSection(board, sectionId)) {
    state.dragId = undefined
    state.dragPosition = undefined
    return
  }
  try {
    await executeMove({ id, sectionId, x: position.x, y: position.y })
    // The dropped position has to hold until the stored one arrives, or the card snaps back
    // to where the drag started for as long as the reload takes.
    await refresh()
  } finally {
    state.dragId = undefined
    state.dragPosition = undefined
  }
}

const selectCard = (card: RetroCardViewModel) => {
  const now = Date.now()
  const repeatedClick = lastCardClickId === card.id && now - lastCardClickAt <= 500

  state.selectedId = card.id
  lastCardClickAt = state.dragDistance <= 4 ? now : 0
  lastCardClickId = state.dragDistance <= 4 ? card.id : undefined
  if (repeatedClick && state.dragDistance <= 4) {
    startEdit(card)
  }
}

/*
 * Deterministic per-card paper variation. Physical model: the note is pressed onto the board at
 * one spot (the pin), and everything around it lifts off — the further an edge is from the pin,
 * the more it peels, catching light (curl out) or folding under into shade (curl in). Shadow
 * drifts away from the pin, since that side of the sheet stands off the board.
 */
const paperStyle = (id: string) => {
  let seed = 2166136261

  for (const char of id) {
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619)
  }

  const next = (min: number, max: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return min + (seed / 4294967296) * (max - min)
  }
  const corner = () => `${next(1, 6).toFixed(1)}px`

  const radius = `${corner()} ${corner()} ${corner()} ${corner()}`
  const pinX = next(15, 85)
  const pinY = next(6, 45)
  /* Pinned dead centre: the sheet lies flat. Pinned near a corner: the far side peels wide open. */
  const offCentre = Math.min(1, Math.hypot((pinX - 50) / 50, (pinY - 50) / 50))

  return {
    '--card-curl-hold': `${(74 - offCentre * 28).toFixed(0)}%`,
    '--card-curl-out': next(0, 1) > 0.35 ? '1' : '0',
    '--card-curl-strength': (0.45 + offCentre * 0.55).toFixed(2),
    '--card-pin-x': `${pinX.toFixed(0)}%`,
    '--card-pin-y': `${pinY.toFixed(0)}%`,
    '--card-radius': radius,
    '--card-shadow-depth': (next(0.7, 1.15) + offCentre * 0.35).toFixed(2),
    '--card-shadow-x': `${(((50 - pinX) / 50) * 4).toFixed(1)}px`,
    '--card-tilt': `${next(-3.2, 3.2).toFixed(2)}deg`,
  }
}

const hasActions = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canChangeCard(board, card) && (card.isMine || isActionsSection(board, card.sectionId))

const toggleReveal = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !card.isMine || !canChangeCard(board, card)) {
    return
  }
  await executeReveal({ id: card.id, revealed: !card.revealed })
  await refresh()
}

const setMineRevealed = async (revealed: boolean) => {
  await executeRevealMine({ retroId: props.retroId, revealed })
  await refresh()
}

const vote = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !votingOpen.value || isActionsSection(board, card.sectionId)) {
    return
  }
  await executeVote({ id: card.id, voted: !card.votedByMe })
  await refresh()
}

const done = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || board.phase !== 'Actions' || !isActionsSection(board, card.sectionId)) {
    return
  }
  await executeDone({ done: !card.done, id: card.id })
  await refresh()
}

// An action item without an owner is fine - the team may not have picked one yet.
const canAssign = (board: RetroBoardViewModel) => !board.finished && board.phase === 'Actions'

const assign = async (card: RetroCardViewModel, event: Event) => {
  const board = data.value
  const assigneeId = (event.target as HTMLSelectElement).value || null

  if (!board || !canAssign(board) || !isActionsSection(board, card.sectionId)) {
    return
  }
  await executeAssign({ assigneeId, id: card.id })
  await refresh()
}

const destroy = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !card.isMine || !canChangeCard(board, card)) {
    return
  }
  state.selectedId = undefined
  await removeCard(card)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Delete' && event.key !== 'Backspace') {
    return
  }
  const board = data.value
  const card = data.value?.cards.find((item) => item.id === state.selectedId)

  if (board && card?.isMine && state.editingId === undefined && canChangeCard(board, card)) {
    event.preventDefault()
    void destroy(card)
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

const finish = async () => {
  const board = data.value

  if (!board?.canManage) {
    return
  }
  const ranks = topicRanks(board)
  const topics = board.cards
    .filter((card) => ranks.has(card.id))
    .toSorted((left, right) => (ranks.get(left.id) ?? 4) - (ranks.get(right.id) ?? 4))
  const actions = actionCards(board)
  const summary = [
    'Finish this retro?',
    '',
    'Top topics:',
    ...(topics.length ? topics.map((card) => `• ${card.text}`) : ['• None']),
    '',
    'Actions:',
    ...(actions.length
      ? actions.map((card) => `• ${card.text}${card.done ? ' (done)' : ''}`)
      : ['• No action items created. Finish anyway?']),
  ].join('\n')

  if (!confirm(summary)) {
    return
  }
  await executeFinish({ retroId: props.retroId })
  await refresh()
}
</script>

<style scoped>
.retro {
  height: calc(100% + var(--layout-content-padding) + var(--layout-content-padding));
  margin: calc(-1 * var(--layout-content-padding));
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: calc(100% + var(--layout-content-padding) + var(--layout-content-padding));
}

.retro-canvas {
  border: 0;
  border-radius: 0;
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
}

.retro-header {
  align-items: center;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  inset: var(--space-4) var(--space-4) auto;
  pointer-events: none;
  position: absolute;
  z-index: 7;
}

.retro-header .page-heading,
.retro-actions,
.phase-bar {
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 76%, transparent);
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
  height: var(--control-height);
}

.retro-header .page-heading {
  border-radius: var(--radius-card);
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  max-width: min(360px, 32vw);
  padding: var(--space-1) var(--space-3);
  pointer-events: auto;
  width: fit-content;
}

.retro-finished {
  background: color-mix(in srgb, var(--color-chart-done) 14%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-chart-done);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
}

.presence {
  align-items: center;
  display: flex;
  min-height: var(--control-height-small);
}

.presence .entity-avatar {
  margin-right: -8px;
  outline: 2px solid var(--color-surface);
}

.presence-alone {
  font-size: var(--font-size-caption);
}

.presence-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  display: grid;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-width: 200px;
  opacity: 0;
  padding: var(--space-3);
  pointer-events: none;
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  transition: opacity 0.12s ease;
  z-index: 5;
}

.presence:hover .presence-list {
  opacity: 1;
  pointer-events: auto;
}

.presence-title {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  margin: 0;
}

.presence-row {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.presence-row .entity-avatar {
  margin: 0;
  outline: none;
}

.retro-actions {
  align-items: center;
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-2);
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  padding: var(--space-1) var(--space-3);
  pointer-events: auto;
  position: relative;
}

.phase-bar {
  align-items: center;
  border-radius: var(--radius-card);
  column-gap: var(--space-2);
  display: flex;
  flex-wrap: nowrap;
  font-size: var(--font-size-caption);
  grid-column: 2;
  grid-row: 1;
  justify-content: flex-start;
  justify-self: start;
  max-width: 100%;
  overflow-x: auto;
  padding: var(--space-1) var(--space-2);
  pointer-events: auto;
  white-space: nowrap;
  width: max-content;
}

.phases {
  display: flex;
  gap: var(--space-1);
}

.phases .active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.phases .active:disabled {
  opacity: 1;
}

.phase-control {
  align-items: center;
  display: flex;
  font-weight: 400;
  gap: var(--space-1);
  margin: 0;
}

.votes-input {
  appearance: textfield;
  height: var(--control-height-small);
  width: 40px;
}

.votes-input::-webkit-inner-spin-button,
.votes-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.countdown {
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
}

.countdown.over {
  color: var(--color-danger);
}

.card.hidden .card-text {
  filter: blur(4px);
  user-select: none;
}

.zone {
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  position: absolute;
}

.zone-header {
  display: grid;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
}

.zone-title {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

/* Paper sticky note: flat pastel square, barely rounded, tilted, lifted by a layered shadow. */
/* Tilt, shadow direction/depth and corner rounding vary per card via --card-* set inline. */
.card {
  --sticky-depth: var(--card-shadow-depth, 1);
  --sticky-dx: var(--card-shadow-x, 0px);
  --curl-light: #ffffff47;
  --curl-dark: #10182818;
  /* Lifted paper either catches the light or folds into shade; --card-curl-out picks which. */
  --curl-base: color-mix(
    in srgb,
    var(--curl-light) calc(var(--card-curl-out, 0) * 100%),
    var(--curl-dark)
  );
  /* ...and how far off-centre the pin sits decides how hard that reads. */
  --curl-tint: color-mix(
    in srgb,
    var(--curl-base) calc(var(--card-curl-strength, 0.6) * 100%),
    #0000
  );
  --sticky-shadow:
    calc(var(--sticky-dx) * 0.2) 1px 1px #10182814,
    calc(var(--sticky-dx) * 0.6) calc(6px * var(--sticky-depth))
      calc(12px * var(--sticky-depth)) -6px #10182824,
    var(--sticky-dx) calc(16px * var(--sticky-depth)) calc(26px * var(--sticky-depth)) -14px
      #1018282e;
  --sticky-shadow-lift:
    calc(var(--sticky-dx) * 0.2) 2px 4px #1018281a,
    calc(var(--sticky-dx) * 0.6) calc(14px * var(--sticky-depth))
      calc(24px * var(--sticky-depth)) -9px #10182830,
    var(--sticky-dx) calc(28px * var(--sticky-depth)) calc(44px * var(--sticky-depth)) -22px
      #10182836;
  align-items: flex-start;
  background:
    radial-gradient(
      112% 112% at var(--card-pin-x, 50%) var(--card-pin-y, 12%),
      #0000 var(--card-curl-hold, 35%),
      var(--curl-tint) 100%
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--card-color) 30%, var(--color-surface)),
      color-mix(in srgb, var(--card-color) 19%, var(--color-surface)) 40px
    ),
    var(--color-surface);
  border: 0;
  border-radius: var(--card-radius, 2px);
  box-shadow: var(--sticky-shadow);
  cursor: grab;
  display: flex;
  height: 160px;
  justify-content: flex-start;
  padding: var(--space-3);
  position: absolute;
  rotate: var(--card-tilt, 0deg);
  transition:
    box-shadow var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
  width: 160px;
}

:root[data-theme='dark'] .card {
  --curl-light: #ffffff21;
  --curl-dark: #00000047;
  --sticky-shadow:
    calc(var(--sticky-dx) * 0.2) 1px 1px #0000004d,
    calc(var(--sticky-dx) * 0.6) calc(6px * var(--sticky-depth))
      calc(12px * var(--sticky-depth)) -6px #00000059,
    var(--sticky-dx) calc(16px * var(--sticky-depth)) calc(26px * var(--sticky-depth)) -14px
      #00000066;
  --sticky-shadow-lift:
    calc(var(--sticky-dx) * 0.2) 2px 4px #0000004d,
    calc(var(--sticky-dx) * 0.6) calc(14px * var(--sticky-depth))
      calc(24px * var(--sticky-depth)) -9px #00000066,
    var(--sticky-dx) calc(28px * var(--sticky-depth)) calc(44px * var(--sticky-depth)) -22px
      #00000070;
}

.card:hover {
  box-shadow: var(--sticky-shadow-lift);
  z-index: 2;
}

.card.selected,
.card.editing {
  z-index: 3;
}

.card.dragging {
  box-shadow: var(--sticky-shadow-lift);
  cursor: grabbing;
  z-index: 4;
}

.card.pending {
  opacity: 0.55;
  pointer-events: none;
}

.card.done .card-text {
  color: var(--color-muted);
  text-decoration: line-through;
}

.card-text {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-sizing: border-box;
  color: inherit;
  cursor: inherit;
  font-family: 'Caveat', 'Inter', cursive;
  font-size: 30px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  margin: 0;
  max-height: 100%;
  min-height: 0;
  outline: none;
  overflow: hidden;
  overflow-wrap: anywhere;
  padding: 0 0 var(--space-3);
  text-align: left;
  user-select: none;
  white-space: pre-wrap;
  width: 100%;
}

textarea.card-text {
  caret-color: var(--color-accent);
  cursor: text;
  resize: none;
  user-select: text;
}

textarea.card-text:hover,
textarea.card-text:focus {
  border: 0;
}

textarea.card-text:focus {
  box-shadow: none;
}

.card-text.placeholder {
  color: var(--color-muted);
}

.card-author {
  border-radius: 50%;
  color: #fff;
  display: grid;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  height: var(--icon-btn-size-small);
  left: 50%;
  outline: 2px solid var(--color-workspace);
  place-items: center;
  pointer-events: none;
  position: absolute;
  text-transform: uppercase;
  top: 0;
  translate: -50% -50%;
  width: var(--icon-btn-size-small);
}

.remote-cursor {
  pointer-events: none;
  position: absolute;
  z-index: 6;
}

.remote-cursor-name {
  border-radius: var(--radius-pill);
  color: #fff;
  font-size: var(--font-size-caption);
  left: 14px;
  padding: 1px 8px;
  position: absolute;
  top: 12px;
  white-space: nowrap;
}

.card-assignee {
  background: #ffffff5c;
  border: 1px solid #10182824;
  border-radius: var(--radius-sm);
  color: inherit;
  font-family: inherit;
  font-size: var(--font-size-sm);
  margin-top: auto;
  max-width: 100%;
  padding: 2px var(--space-2);
  width: 100%;
}

.card-assignee:disabled {
  background: transparent;
  border-color: transparent;
  opacity: 1;
}

.card-toolbar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  bottom: calc(100% + var(--space-2));
  box-shadow: var(--shadow-card);
  display: flex;
  gap: 2px;
  padding: 3px;
  position: absolute;
  right: 0;
}

.card-toolbar .icon-btn {
  background: transparent;
  border: 0;
  border-radius: var(--radius-pill);
}

.card-toolbar .icon-btn:hover {
  background: var(--color-hover);
}

.vote-badge,
.rank-badge {
  height: var(--icon-btn-size);
  justify-content: center;
  padding: 0;
  width: var(--icon-btn-size);
}

.vote-badge {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  bottom: 0;
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  gap: 4px;
  position: absolute;
  right: 0;
  transition: var(--transition-press);
  translate: 50% 50%;
}

.vote-badge:not(:disabled):hover {
  background: var(--color-hover);
}

.vote-badge:not(:disabled):active {
  translate: 50% calc(50% + var(--press-offset));
}

.vote-badge:disabled {
  /* In Discuss the counter only reports results, so it stays fully readable. */
  cursor: default;
  opacity: 1;
}

.vote-badge.voted {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.vote-badge .lucide {
  height: 12px;
  width: 12px;
}

.rank-badge {
  --rank-color: var(--color-muted);
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--rank-color);
  border-radius: var(--radius-pill);
  bottom: 0;
  box-shadow: var(--shadow-card);
  color: var(--rank-color);
  display: flex;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  gap: 4px;
  left: 0;
  pointer-events: none;
  position: absolute;
  translate: -50% 50%;
}

.rank-badge.rank-1 {
  --rank-color: #b7791f;
}

.rank-badge.rank-2 {
  --rank-color: #6b7280;
}

.rank-badge.rank-3 {
  --rank-color: #a15c35;
}

.rank-badge .lucide {
  height: 12px;
  width: 12px;
}

:root[data-theme='dark'] .rank-badge.rank-1 {
  --rank-color: #f2c14e;
}

:root[data-theme='dark'] .rank-badge.rank-2 {
  --rank-color: #c7ced9;
}

:root[data-theme='dark'] .rank-badge.rank-3 {
  --rank-color: #d9956a;
}

.entity-avatar.small {
  font-size: 10px;
  height: 20px;
  width: 20px;
}

@media (max-width: 1100px) {
  .retro-header {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .retro-actions {
    grid-column: 2;
  }

  .phase-bar {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

@media (max-width: 640px) {
  .retro-header {
    inset: var(--space-3) var(--space-3) auto;
  }

  .retro-header .page-heading {
    max-width: calc(100% - 72px);
    padding-left: calc(var(--icon-btn-size) + var(--space-4));
  }

  .retro-header .page-heading > .muted,
  .retro-header .page-heading-icon {
    display: none;
  }

  .retro-actions {
    padding-inline: var(--space-2);
  }

  .presence > .entity-avatar {
    display: none;
  }

  .phase-bar {
    max-width: 100%;
  }

  .phase-control {
    flex: none;
  }
}
</style>
