<template>
  <QueryState
    :data="data"
    error-title="Could not load retro"
    loading-text="Loading retro…"
    :message="message"
    :on-retry="refresh"
    :pending="pending && !data">
    <template #default="{ data: board }">
      <section
        class="retro"
        :class="{ 'retro--focused': state.fullscreen }">
        <header class="retro-header">
          <div class="retro-title">
            <h1 v-if="!canRename(board)">{{ board.name }}</h1>
            <input
              v-else
              aria-label="Retro name"
              class="retro-name-input"
              maxlength="128"
              :value="board.name"
              @change="rename($event)" />
            <span
              v-if="board.finished"
              class="retro-finished">
              Finished
            </span>
          </div>
          <div class="retro-actions">
            <div
              aria-label="People on this retro"
              class="presence"
              tabindex="0">
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
                  <span
                    v-if="member.userId === board.owner.userId"
                    class="muted presence-role">
                    owner
                  </span>
                  <button
                    v-else-if="canHandOver(board)"
                    class="secondary small"
                    type="button"
                    @click="handOver(member)">
                    Make owner
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div class="phase-stack">
            <div class="phase-navigation">
              <button
                aria-label="Previous phase"
                class="icon-btn secondary small phase-step"
                :disabled="board.finished || !board.canManage || !previousPhase(board.phase)"
                type="button"
                @click="movePhase(previousPhase(board.phase))">
                <ChevronLeft />
              </button>
              <details class="phase-picker">
                <summary class="phase-picker-trigger">
                  <component :is="PHASE_ICONS[board.phase]" />
                  {{ board.phase }}
                </summary>
                <div
                  aria-label="Phase"
                  class="phase-rail"
                  role="group"
                  @click="closePhaseMenu($event)">
                  <button
                    v-for="option in PHASES"
                    :key="option"
                    class="secondary small"
                    :class="{ active: board.phase === option }"
                    :disabled="
                      board.finished || !board.canManage || !canChangePhase(board.phase, option)
                    "
                    type="button"
                    @click="changePhase(option)">
                    <component :is="PHASE_ICONS[option]" />
                    {{ option }}
                  </button>
                  <button
                    class="secondary danger small"
                    :disabled="board.finished || !board.canManage || board.phase !== 'Actions'"
                    type="button"
                    @click="finish">
                    <Archive />
                    Finish
                  </button>
                </div>
              </details>
              <button
                aria-label="Next phase"
                class="icon-btn secondary small phase-step"
                :disabled="board.finished || !board.canManage || !nextPhase(board.phase)"
                type="button"
                @click="movePhase(nextPhase(board.phase))">
                <ChevronRight />
              </button>
            </div>

            <div
              v-if="!board.finished && board.phase !== 'Actions'"
              class="phase-controls">
              <button
                v-if="board.phase === 'Collect'"
                :aria-label="board.hiddenMine > 0 ? 'Show my notes' : 'Hide my notes'"
                class="phase-chip"
                :class="{ 'phase-chip--warn': board.hiddenMine > 0 }"
                :disabled="board.hiddenMine + board.revealedMine === 0"
                type="button"
                @click="setMineRevealed(board.hiddenMine > 0)">
                <EyeOff v-if="board.hiddenMine > 0" />
                <Eye v-else />
                {{ board.hiddenMine > 0 ? 'Notes private' : 'Notes visible' }}
              </button>

              <div
                v-if="board.phase === 'Vote'"
                class="phase-chip">
                <ThumbsUp />
                <span>{{ board.myVotes }} of</span>
                <input
                  aria-label="Votes per person"
                  class="phase-chip-number"
                  :disabled="!board.canManage"
                  min="1"
                  type="number"
                  :value="board.votesPerUser"
                  @change="setVotesPerUser($event)" />
                <span>used</span>
              </div>

              <button
                v-if="canResetVotes(board)"
                class="phase-chip"
                title="Clear every vote so the team can vote again"
                type="button"
                @click="resetVotes()">
                <RotateCcw />
                Reset votes
              </button>

              <div
                v-if="canRunTimer(board)"
                class="phase-chip"
                :class="{ 'phase-chip--warn': countdown === '00:00' }">
                <Timer />
                <template v-if="countdown === undefined">
                  <button
                    class="phase-chip-action"
                    :disabled="!board.canManage"
                    type="button"
                    @click="startTimer()">
                    Start
                  </button>
                  <span class="phase-chip-separator">·</span>
                  <input
                    v-model.number="state.timerMinutes"
                    aria-label="Timer duration in minutes"
                    class="phase-chip-number"
                    :disabled="!board.canManage"
                    min="1"
                    type="number" />
                  <span>min</span>
                </template>
                <template v-else>
                  <span
                    class="countdown"
                    :class="{ over: countdown === '00:00' }">
                    {{ countdown }}
                  </span>
                  <span class="phase-chip-separator">·</span>
                  <button
                    class="phase-chip-action"
                    :disabled="!board.canManage"
                    type="button"
                    @click="stopTimer()">
                    Stop
                  </button>
                </template>
              </div>
            </div>
          </div>
        </header>

        <RetroCanvas
          class="retro-canvas"
          :on-background-pointer-down="() => (state.selectedId = undefined)"
          :on-canvas-double-click="(point) => addCardAt(board, point)"
          :on-cursor-move="publishCursor"
          :on-node-move="moveDraggedCard"
          :on-node-move-end="commitDraggedCard">
          <template #controls>
            <button
              :aria-label="state.fullscreen ? 'Leave full screen' : 'Open full screen'"
              class="icon-btn"
              :title="state.fullscreen ? 'Leave full screen' : 'Open full screen'"
              type="button"
              @click="toggleFullscreen">
              <Minimize v-if="state.fullscreen" />
              <Maximize v-else />
            </button>
          </template>

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

            <div
              v-for="group in groupBoxes(board)"
              :key="group.id"
              class="group-box"
              :style="{
                height: `${group.height}px`,
                left: `${group.left}px`,
                top: `${group.top}px`,
                width: `${group.width}px`,
              }"
              @pointerdown="startGroupDrag($event, group.id, group.cardIds, startNodeDrag)">
              <div class="group-header">
                <input
                  aria-label="Topic title"
                  class="group-title"
                  :disabled="!canGroup(board)"
                  :placeholder="`Topic of ${group.cardIds.length} notes`"
                  :value="group.title"
                  @change="renameGroup(group.id, $event)"
                  @pointerdown.stop />
                <button
                  v-if="canGroup(board)"
                  aria-label="Ungroup topic"
                  class="icon-btn small group-ungroup"
                  title="Ungroup"
                  type="button"
                  @click.stop="splitGroup(group.id)"
                  @pointerdown.stop>
                  <Ungroup />
                </button>
              </div>
            </div>

            <article
              v-for="card in visibleCards(board)"
              :key="card.id"
              class="card"
              :class="{
                done: card.done,
                discussed: board.discussedCardId === card.id,
                'group-picked': state.groupSelection.includes(card.id),
                dragging: state.dragId === card.id || state.dragOffsets.has(card.id),
                editing: state.editingId === card.id,
                hidden: card.hidden,
                selected: state.selectedId === card.id,
              }"
              :style="{
                '--card-color': card.color,
                ...paperStyle(card.id),
                left: `${card.x}px`,
                top: `${card.y}px`,
              }"
              @click="selectCard(card, $event)"
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
                maxlength="200"
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
              <details
                v-if="isActionsSection(board, card.sectionId)"
                class="assignee"
                @click.stop
                @pointerdown.stop>
                <summary
                  aria-label="Assignee"
                  class="assignee-trigger"
                  :class="{ 'assignee-trigger--empty': !card.assignee }">
                  <span
                    v-if="card.assignee"
                    class="entity-avatar small"
                    :style="{ background: card.assignee.color }">
                    {{ card.assignee.initials }}
                  </span>
                  <UserRound v-else />
                  <span class="assignee-name">{{ card.assignee?.name ?? 'Unassigned' }}</span>
                </summary>
                <div
                  v-if="canAssign(board)"
                  class="assignee-list">
                  <button
                    v-for="one of board.participants"
                    :key="one.userId"
                    class="assignee-row"
                    :class="{ active: card.assignee?.userId === one.userId }"
                    type="button"
                    @click="assign(card, one.userId, $event)">
                    <span
                      class="entity-avatar small"
                      :style="{ background: one.color }">
                      {{ one.initials }}
                    </span>
                    {{ one.name }}
                  </button>
                  <button
                    class="assignee-row"
                    :class="{ active: !card.assignee }"
                    type="button"
                    @click="assign(card, null, $event)">
                    <UserRound />
                    Unassigned
                  </button>
                </div>
              </details>
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
                :aria-label="votedByMe(board, card) ? 'Remove vote from note' : 'Vote for note'"
                class="vote-badge"
                :class="{ voted: votedByMe(board, card) }"
                :disabled="!votingOpen"
                :title="
                  votingOpen
                    ? votedByMe(board, card)
                      ? 'Remove vote'
                      : 'Vote'
                    : 'Start the timer to vote'
                "
                type="button"
                @click.stop="vote(card)"
                @pointerdown.stop>
                <ThumbsUp />
                <template v-if="showVoteResults(board)">{{ topicVotes(board, card) }}</template>
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
                  v-if="canPickTopic(board, card)"
                  class="icon-btn small"
                  :title="
                    board.discussedCardId === card.id ? 'Stop discussing' : 'Discuss this topic'
                  "
                  type="button"
                  @click.stop="discuss(card)"
                  @pointerdown.stop>
                  <MessagesSquare />
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

        <div
          v-if="state.groupSelection.length > 0"
          aria-label="Group selection"
          class="merge-bar"
          role="toolbar">
          <Group />
          <span>
            {{ state.groupSelection.length }}
            {{ state.groupSelection.length === 1 ? 'note' : 'notes' }}
            selected
          </span>
          <button
            class="primary small"
            :disabled="state.groupSelection.length < 2"
            type="button"
            @click="mergeSelection()">
            <Group />
            Merge into a topic
          </button>
          <button
            class="secondary small"
            type="button"
            @click="state.groupSelection = []">
            Clear
          </button>
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  EyeOff,
  Group,
  ListChecks,
  Maximize,
  Medal,
  RotateCcw,
  MessagesSquare,
  Minimize,
  MousePointer2,
  StickyNote,
  ThumbsUp,
  Timer,
  UserRound,
  Trash2,
  Ungroup,
} from '@lucide/vue'

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
const PHASE_ICONS = {
  Actions: ListChecks,
  Collect: StickyNote,
  Discuss: MessagesSquare,
  Group,
  Vote: ThumbsUp,
}

const previousPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) - 1]
const nextPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) + 1]
const canChangePhase = (current: RetroPhase, target: RetroPhase) =>
  target === previousPhase(current) || target === nextPhase(current)

const ZONE_WIDTH = 880
const ZONE_HEIGHT = 720
const ZONE_GAP = 24
type DiscussionTopic = {
  cardIds: string[]
  id: string
  title: string
  votes: number
}

const CARD_SIZE = 160
// Not a cap on the discussion - just how many topics are marked as the ones to start with.
const PRIORITY_TOPICS = 3
const GROUP_PADDING = 8
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
  dragGroupId: undefined as string | undefined,
  dragId: undefined as string | undefined,
  // Notes of the dragged group, kept at their distance from the one under the pointer.
  dragOffsets: new Map<string, { x: number; y: number }>(),
  dragPosition: undefined as undefined | { x: number; y: number },
  dragStartPosition: undefined as undefined | { x: number; y: number },
  editingId: undefined as string | undefined,
  // Notes the server has not told us about yet: one created here, or one deleted here. They keep
  // the board honest while the request is still on the wire.
  draftCards: [] as RetroCardViewModel[],
  fullscreen: false,
  groupSelection: [] as string[],
  hoveredId: undefined as string | undefined,
  joined: new Map<string, RetroMember>(),
  now: Date.now(),
  pendingTexts: new Map<string, string>(),
  refreshPending: false,
  remoteCursors: new Map<string, { at: number; member: RetroMember; x: number; y: number }>(),
  remoteMoves: new Map<string, { at: number; x: number; y: number }>(),
  remoteTexts: new Map<string, { at: number; text: string }>(),
  removedCardIds: new Set<string>(),
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

const endDrag = () => {
  state.dragGroupId = undefined
  state.dragId = undefined
  state.dragOffsets.clear()
  state.dragPosition = undefined
  state.dragStartPosition = undefined
}

const clearBoardState = () => {
  state.dragDistance = 0
  endDrag()
  state.draft = ''
  state.editingId = undefined
  state.hoveredId = undefined
  state.joined.clear()
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
// Everyone who belongs to this retro: whoever is connected right now plus whoever joined earlier
// and stepped away - handing the retro over to them is still valid.
const everyone = (board: RetroBoardViewModel) => {
  if (board.finished) {
    return board.participants
  }
  const seen = new Map([[board.me.userId, board.me]])

  for (const member of [...presence.value, ...board.participants]) {
    if (!seen.has(member.userId)) {
      seen.set(member.userId, member)
    }
  }
  return [...seen.values()]
}

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
  // The zones are not a grid of equal cells - the actions column is twice as tall as the ones
  // beside it - so the zone a point sits in wins over the zone whose middle is nearest.
  const inside = Array.from({ length: sectionCount }, (_value, index) => index).find((index) => {
    const rect = zoneRect(index)

    return (
      x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height
    )
  })

  if (inside !== undefined) {
    return inside
  }
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
  boardCards(board).filter((card) => card.sectionId === board.sections.at(-1)?.id)

// A topic is a group of notes or a single ungrouped note - never a note inside a group, so a
// merged topic is one line with one score.
const orderedTopics = (board: RetroBoardViewModel) => {
  const actionsSectionId = board.sections.at(-1)?.id
  const topics = new Map<string, DiscussionTopic>()

  // Tied topics are ordered by id: dragging a note changes its place in the stack, and the board
  // would reshuffle the medals under the team every time someone tidied it up.
  board.cards.forEach((card) => {
    if (card.sectionId === actionsSectionId) {
      return
    }
    const group = groupOf(board, card)

    if (!group) {
      topics.set(card.id, {
        cardIds: [card.id],
        id: card.id,
        title: card.text,
        votes: card.votes,
      })

      return
    }
    const existing = topics.get(group.id)

    if (existing) {
      existing.cardIds.push(card.id)

      return
    }
    topics.set(group.id, {
      cardIds: [card.id],
      id: group.id,
      title: group.title,
      votes: group.votes,
    })
  })

  return [...topics.values()]
    .toSorted(
      (left, right) => right.votes - left.votes || left.id.localeCompare(right.id),
    )
    .map((topic) => ({
      ...topic,
      title: topic.title || `${topic.cardIds.length} notes`,
    }))
}

// Every note of the leading topics wears its medal; ties never hand out a fourth one, because the
// order is total. Scores are zero until the facilitator closes Vote, so the medals appear together
// with the results and stay on the board for the rest of the retro, finished included.
const discussionRanks = computed(() => {
  const board = data.value
  const ranks = new Map<string, number>()

  if (!board) {
    return ranks
  }
  orderedTopics(board)
    .filter((topic) => topic.votes > 0)
    .slice(0, PRIORITY_TOPICS)
    .forEach((topic, index) => {
      for (const cardId of topic.cardIds) {
        ranks.set(cardId, index + 1)
      }
    })

  return ranks
})

const cardsOf = (board: RetroBoardViewModel, sectionId: string) =>
  boardCards(board).filter((card) => card.sectionId === sectionId)

const sectionColorAt = (board: RetroBoardViewModel, x: number, y: number) =>
  board.sections[zoneIndexAt(x + CARD_SIZE / 2, y + CARD_SIZE / 2, board.sections.length)]?.color

const HIDDEN_TEXT = '•••••• ••••• ••••••'

// What the board actually holds right now: the server's answer, minus what we just deleted, plus
// what we just created. A refresh drops each patch as soon as the answer carries it.
const boardCards = (board: RetroBoardViewModel) => [
  ...board.cards.filter((card) => !state.removedCardIds.has(card.id)),
  ...state.draftCards.filter((draft) => !board.cards.some((card) => card.id === draft.id)),
]

watch(data, (board) => {
  if (!board) {
    return
  }
  if (!canGroup(board)) {
    state.groupSelection = []
  }
  const known = new Set(board.cards.map((card) => card.id))

  state.draftCards = state.draftCards.filter((draft) => !known.has(draft.id))
  for (const id of state.removedCardIds) {
    if (!known.has(id)) {
      state.removedCardIds.delete(id)
    }
  }
})

// Where a note currently sits on the board, overlays included.
const drawnPosition = (board: RetroBoardViewModel, cardId: string) => {
  const card = visibleCards(board).find((item) => item.id === cardId)

  return card && { x: card.x, y: card.y }
}

// A note being dragged, or one carried along because its topic is: everything moves as one.
const draggedPosition = (cardId: string) => {
  const position = state.dragPosition

  if (!position) {
    return undefined
  }
  if (cardId === state.dragId) {
    return position
  }
  const offset = state.dragOffsets.get(cardId)

  return offset && { x: position.x + offset.x, y: position.y + offset.y }
}

const visibleCards = (board: RetroBoardViewModel) =>
  boardCards(board).map((card) => {
    // While dragging, the note already wears the colour of the zone it is heading into.
    const moved = state.remoteMoves.get(card.id)
    const dragged = draggedPosition(card.id) ?? (moved && { x: moved.x, y: moved.y })
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

// Topics are how the owner runs the room, not a step of it: a badly cut topic has to be fixable
// while the team is already talking about it.
const canGroup = (board: RetroBoardViewModel) => !board.finished && board.canManage

const groupOf = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  card.groupId === null ? undefined : board.groups.find((group) => group.id === card.groupId)

// A grouped note shows the score of its whole topic - that is what the vote counts for.
const topicVotes = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  groupOf(board, card)?.votes ?? card.votes

const votedByMe = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  groupOf(board, card)?.votedByMe ?? card.votedByMe

// The topic is drawn as the box that holds every note of the group.
const groupBoxes = (board: RetroBoardViewModel) => {
  const positions = new Map(visibleCards(board).map((card) => [card.id, card]))

  return board.groups.flatMap((group) => {
    const members = group.cardIds
      .map((cardId) => positions.get(cardId))
      .filter((card) => card !== undefined)

    if (members.length === 0) {
      return []
    }
    const left = Math.min(...members.map((card) => card.x))
    const top = Math.min(...members.map((card) => card.y))

    return [
      {
        cardIds: group.cardIds,
        height: Math.max(...members.map((card) => card.y)) + CARD_SIZE - top + GROUP_PADDING * 2,
        id: group.id,
        left: left - GROUP_PADDING,
        title: group.title,
        top: top - GROUP_PADDING,
        width: Math.max(...members.map((card) => card.x)) + CARD_SIZE - left + GROUP_PADDING * 2,
      },
    ]
  })
}

const isActionsSection = (board: RetroBoardViewModel, sectionId: string) =>
  board.sections.at(-1)?.id === sectionId

const canChangeSection = (board: RetroBoardViewModel, sectionId: string) =>
  !board.finished &&
  ((board.phase === 'Collect' && !isActionsSection(board, sectionId)) ||
    (board.phase === 'Actions' && isActionsSection(board, sectionId)))

const canChangeCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canChangeSection(board, card.sectionId)

// Sliding a note around is layout, not content, so it works in every phase. Only crossing the
// actions border turns the note into something else, and that still obeys the phase.
const canMoveCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  !board.finished && !card.hidden

const canDropOn = (board: RetroBoardViewModel, card: RetroCardViewModel, sectionId: string) =>
  canMoveCard(board, card) &&
  (isActionsSection(board, sectionId) === isActionsSection(board, card.sectionId) ||
    canChangeSection(board, sectionId))

const { execute: executeCreate } = useAction(props.deps.createCard)
const { execute: executeMove } = useAction(props.deps.moveCard)
const { execute: executeMoveGroup } = useAction(props.deps.moveGroup)
const { execute: executeUpdate } = useAction(props.deps.updateCard)
const { execute: executeVote } = useAction(props.deps.toggleVote)
const { execute: executeAssign } = useAction(props.deps.setCardAssignee)
const { execute: executeDiscuss } = useAction(props.deps.setDiscussedCard)
const { execute: executeGroup } = useAction(props.deps.groupCards)
const { execute: executeUngroup } = useAction(props.deps.ungroup)
const { execute: executeResetVotes } = useAction(props.deps.resetVotes)
const { execute: executeGroupTitle } = useAction(props.deps.setGroupTitle)
const { execute: executeDone } = useAction(props.deps.toggleDone)
const { execute: executeRemove } = useAction(props.deps.removeCard)
const { execute: executeReveal } = useAction(props.deps.toggleReveal)
const { execute: executeRename } = useAction(props.deps.renameRetro)
const { execute: executeRevealMine } = useAction(props.deps.setMyCardsRevealed)
const { execute: executeFinish } = useAction(props.deps.finishRetro)
const { execute: executeHandOver } = useAction(props.deps.transferOwnership)
const { execute: executeAdvancePhase } = useAction(props.deps.advancePhase)
const { execute: executeRevertPhase } = useAction(props.deps.revertPhase)
const { execute: executeSettings } = useAction(props.deps.updateSettings)
const { execute: executeTimer } = useAction(props.deps.setPhaseTimer)

const saveSettings = async (votesPerUser: number) => {
  const board = data.value

  if (!board?.canManage) {
    return
  }
  await executeSettings({ phase: board.phase, retroId: props.retroId, votesPerUser })
  await refresh()
}

const closePhaseMenu = (event: MouseEvent) =>
  (event.currentTarget as HTMLElement).closest('details')?.removeAttribute('open')

const changePhase = async (phase: RetroPhase) => {
  const board = data.value
  const reverting = board && phase === previousPhase(board.phase)

  if (!board?.canManage || !canChangePhase(board.phase, phase)) {
    return
  }
  const executePhase = reverting ? executeRevertPhase : executeAdvancePhase

  if (await executePhase({ phase, retroId: props.retroId })) {
    await refresh()
  }
}

const movePhase = (phase: RetroPhase | undefined) => phase && changePhase(phase)

// A retro is born named after its date; the facilitator renames it to what it was about.
const canRename = (board: RetroBoardViewModel) => board.canManage && !board.finished

const rename = async (event: Event) => {
  const board = data.value
  const input = event.target as HTMLInputElement
  const name = input.value.trim()

  if (!board || !canRename(board) || name === board.name) {
    return
  }
  if (name.length === 0) {
    input.value = board.name

    return
  }
  await executeRename({ name, retroId: props.retroId })
  await refresh()
}

// Running the retro is a role, not a birthright of whoever pressed "Start retro".
const canHandOver = (board: RetroBoardViewModel) => board.canManage && !board.finished

const handOver = async (member: RetroMember) => {
  const board = data.value

  if (!board || !canHandOver(board)) {
    return
  }
  await executeHandOver({ retroId: props.retroId, userId: member.userId })
  await refresh()
}

const setVotesPerUser = (event: Event) =>
  saveSettings(Math.max(1, Number((event.target as HTMLInputElement).value)))

// Timing a phase is the facilitator's call, so it makes no sense once the retro is read-only.
const canRunTimer = (board: RetroBoardViewModel) => !board.finished && board.phase !== 'Actions'

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

// The board fills the browser window rather than the screen: the team keeps its tabs, its
// bookmarks and its other windows, and just loses the app chrome around the board.
const toggleFullscreen = () => {
  state.fullscreen = !state.fullscreen
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
  const endsAt = data.value?.phaseEndsAt

  if (!endsAt) {
    return undefined
  }
  const left = Math.max(0, Math.floor((Date.parse(endsAt) - state.now) / 1000))

  return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
})

const votingOpen = computed(() => {
  const endsAt = data.value?.phaseEndsAt

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
    return topicVotes(board, card) > 0
  }
  return (
    countdown.value !== undefined && (votedByMe(board, card) || board.myVotes < board.votesPerUser)
  )
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
  if (state.removedCardIds.has(card.id)) {
    return
  }
  // The note goes now; if the server says no, it comes back.
  state.removedCardIds.add(card.id)
  if (await executeRemove({ id: card.id })) {
    void refresh()

    return
  }
  state.removedCardIds.delete(card.id)
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
  const board = data.value
  const created = await executeCreate({ retroId: props.retroId, sectionId, text: '', x, y })

  if (!board || !created) {
    return
  }
  // Waiting for the whole board to come back before showing one empty note is a second round trip
  // the writer has to sit through - we know everything about the note we just asked for.
  const draft: RetroCardViewModel = {
    assignee: null,
    authorColor: board.me.color,
    authorInitials: board.me.initials,
    authorName: board.me.name,
    done: false,
    groupId: null,
    hidden: false,
    id: created.id,
    isMine: true,
    revealed: false,
    sectionId,
    text: '',
    votedByMe: false,
    votes: 0,
    x,
    y,
  }

  state.draftCards.push(draft)
  startEdit(draft)
  void refresh()
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
  state.dragGroupId = undefined
  state.dragId = card.id
  // Where the note is drawn, not where the last answer put it: a live move from someone else
  // would otherwise make it jump back the moment it is picked up.
  state.dragPosition = drawnPosition(board, card.id) ?? { x: card.x, y: card.y }
  state.dragStartPosition = undefined
  state.dragOffsets.clear()
  startNodeDrag(event)
}

// Dragging a note moves that note; dragging the frame around a topic moves the whole topic.
const startGroupDrag = (
  event: PointerEvent,
  groupId: string,
  cardIds: string[],
  startNodeDrag: (event: PointerEvent) => void,
) => {
  const board = data.value
  const members = board && visibleCards(board).filter((card) => cardIds.includes(card.id))
  const lead = members?.[0]

  if (!board || !lead || !members || !canMoveCard(board, lead)) {
    return
  }
  state.dragDistance = 0
  state.dragGroupId = groupId
  state.dragId = lead.id
  state.dragPosition = { x: lead.x, y: lead.y }
  state.dragStartPosition = { x: lead.x, y: lead.y }
  state.dragOffsets = new Map(
    members.slice(1).map((card) => [card.id, { x: card.x - lead.x, y: card.y - lead.y }]),
  )
  startNodeDrag(event)
}

const moveDraggedCard = (deltaX: number, deltaY: number) => {
  if (!state.dragPosition || !state.dragId) {
    return
  }
  state.dragDistance += Math.hypot(deltaX, deltaY)
  state.dragPosition = { x: state.dragPosition.x + deltaX, y: state.dragPosition.y + deltaY }

  const { dragId } = state
  const current = channel
  const moved = [dragId, ...state.dragOffsets.keys()]

  moveFrame.schedule(() => {
    for (const id of moved) {
      const position = draggedPosition(id)

      if (position) {
        current?.publishCardMove(id, position.x, position.y)
      }
    }
  })
}

const commitDraggedCard = async () => {
  const id = state.dragId
  const position = state.dragPosition
  const groupId = state.dragGroupId
  const startPosition = state.dragStartPosition

  if (!id || !position) {
    return
  }
  if (state.dragDistance <= 4) {
    endDrag()

    return
  }
  const board = data.value
  const dragged = board && boardCards(board).find((item) => item.id === id)

  if (!board || !dragged) {
    endDrag()

    return
  }
  const sections = board.sections
  const index = zoneIndexAt(position.x + CARD_SIZE / 2, position.y + CARD_SIZE / 2, sections.length)
  const sectionId = sections[index]?.id

  if (groupId && startPosition) {
    // The topic follows the note under the pointer, section and all, so its notes keep wearing
    // the colour of the category they now sit in.
    if (!sectionId || !canDropOn(board, dragged, sectionId)) {
      endDrag()

      return
    }
    try {
      await executeMoveGroup({
        deltaX: position.x - startPosition.x,
        deltaY: position.y - startPosition.y,
        groupId,
        retroId: props.retroId,
        sectionId,
      })
      await refresh()
    } finally {
      endDrag()
    }

    return
  }

  if (!sectionId || !canDropOn(board, dragged, sectionId)) {
    endDrag()

    return
  }
  const carried = [...state.dragOffsets.entries()].map(([cardId, offset]) => ({
    cardId,
    x: position.x + offset.x,
    y: position.y + offset.y,
  }))

  try {
    await executeMove({ id, sectionId, x: position.x, y: position.y })
    for (const item of carried) {
      await executeMove({ id: item.cardId, sectionId, x: item.x, y: item.y })
    }
    // The dropped position has to hold until the stored one arrives, or the card snaps back
    // to where the drag started for as long as the reload takes.
    await refresh()
  } finally {
    endDrag()
  }
}

const selectCard = (card: RetroCardViewModel, event: MouseEvent) => {
  const board = data.value

  if (
    board &&
    canGroup(board) &&
    !isActionsSection(board, card.sectionId) &&
    (event.ctrlKey || event.metaKey)
  ) {
    toggleGroupSelection(card)
  }
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
  canPickTopic(board, card) ||
  (canChangeCard(board, card) && (card.isMine || isActionsSection(board, card.sectionId)))

// Walking the team through topics is the facilitator's job, and only during Discuss.
const canPickTopic = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  !board.finished &&
  board.canManage &&
  board.phase === 'Discuss' &&
  !isActionsSection(board, card.sectionId)

const toggleGroupSelection = (card: RetroCardViewModel) => {
  state.groupSelection = state.groupSelection.includes(card.id)
    ? state.groupSelection.filter((id) => id !== card.id)
    : [...state.groupSelection, card.id]
}

const mergeSelection = async () => {
  const board = data.value

  if (!board || !canGroup(board) || state.groupSelection.length < 2) {
    return
  }
  await executeGroup({ cardIds: state.groupSelection, retroId: props.retroId })
  state.groupSelection = []
  await refresh()
}

const splitGroup = async (groupId: string) => {
  const board = data.value

  if (!board || !canGroup(board)) {
    return
  }
  await executeUngroup({ groupId, retroId: props.retroId })
  await refresh()
}

const renameGroup = async (groupId: string, event: Event) => {
  const board = data.value

  if (!board || !canGroup(board)) {
    return
  }
  await executeGroupTitle({
    groupId,
    retroId: props.retroId,
    title: (event.target as HTMLInputElement).value,
  })
  await refresh()
}

const discuss = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !canPickTopic(board, card)) {
    return
  }
  await executeDiscuss({
    cardId: board.discussedCardId === card.id ? null : card.id,
    retroId: props.retroId,
  })
  await refresh()
}

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
  // A vote belongs to the whole topic, so the note toggles what the topic shows - not its own
  // flag, which only the note the server keeps the vote on ever carries.
  await executeVote({ id: card.id, voted: !votedByMe(board, card) })
  await refresh()
}

// A vote that went wrong is the owner's to undo - the room votes again from a clean board.
const canResetVotes = (board: RetroBoardViewModel) =>
  !board.finished && board.canManage && (board.phase === 'Vote' || board.phase === 'Discuss')

const resetVotes = async () => {
  const board = data.value

  if (!board || !canResetVotes(board) || !confirm('Clear every vote on this board?')) {
    return
  }
  await executeResetVotes({ retroId: props.retroId })
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

const assign = async (card: RetroCardViewModel, assigneeId: null | string, event: MouseEvent) => {
  const board = data.value

  // The list is a popover of its own; picking from it closes it.
  ;(event.currentTarget as HTMLElement).closest('details')?.removeAttribute('open')
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
  // Finishing cannot be undone, so the click is worth one question - but the board itself is the
  // summary, and nobody reads a listing pasted into a browser dialog.
  if (!confirm('Finish this retro? It becomes read-only for everyone.')) {
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

.retro--focused {
  background: var(--color-background);
  height: 100%;
  inset: 0;
  margin: 0;
  position: fixed;
  width: 100%;
  z-index: 20;
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
  --retro-title-size: clamp(24px, 2.2vw, 30px);
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 7;
}

.retro-actions,
.phase-chip,
.phase-picker-trigger,
.phase-rail {
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 76%, transparent);
  box-shadow: var(--shadow-card);
  box-sizing: border-box;
}

.retro-title {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  left: var(--space-4);
  max-width: min(360px, 30vw);
  min-height: var(--control-height);
  min-width: 0;
  padding: var(--space-1) 0;
  pointer-events: auto;
  position: absolute;
  top: var(--space-4);
  width: fit-content;
}

.retro-title h1,
.retro-name-input {
  font-size: var(--retro-title-size);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.retro-name-input {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  box-shadow: none;
  color: inherit;
  field-sizing: content;
  font-family: inherit;
  height: auto;
  max-width: 100%;
  min-width: 4ch;
  padding: 0;
  width: auto;
}

.retro-name-input:hover {
  background: transparent;
  border-bottom-color: var(--color-border);
}

.retro-name-input:focus {
  background: transparent;
  border-bottom-color: var(--color-accent);
  outline: none;
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
  max-width: 220px;
  min-height: var(--control-height-small);
  outline: none;
}

.presence:focus-visible {
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-focus);
}

.presence > .entity-avatar {
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
  left: 0;
  min-width: 200px;
  opacity: 0;
  padding: var(--space-3);
  pointer-events: none;
  position: absolute;
  top: calc(100% + var(--space-2));
  transition: opacity 0.12s ease;
  z-index: 5;
}

.presence:hover .presence-list,
.presence:focus-within .presence-list {
  opacity: 1;
  pointer-events: auto;
}

.presence-title {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  margin: 0;
}

.presence-role {
  margin-left: auto;
}

.presence-row {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

.presence-row .entity-avatar {
  margin: 0;
  outline: none;
}

.retro-actions {
  align-items: center;
  border-radius: var(--radius-card);
  display: flex;
  left: var(--space-4);
  min-height: var(--control-height);
  padding: var(--space-1) var(--space-3);
  pointer-events: auto;
  position: absolute;
  top: calc(var(--space-4) + var(--control-height) + var(--space-1));
}

.phase-stack {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
  position: absolute;
  right: var(--space-4);
  top: var(--space-4);
  width: 200px;
}

.phase-navigation {
  align-items: start;
  display: grid;
  gap: var(--space-1);
  grid-template-columns: 32px 128px 32px;
  justify-content: end;
  pointer-events: auto;
  width: 100%;
}

.phase-step {
  height: calc(var(--retro-title-size) * 1.1 + 2px);
  width: 32px;
}

.phase-picker {
  width: 128px;
}

.phase-picker-trigger {
  align-items: center;
  background: var(--color-accent);
  border-color: var(--color-accent);
  border-radius: var(--radius-control);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  height: calc(var(--retro-title-size) * 1.1 + 2px);
  list-style: none;
  padding: 0 var(--space-3);
  pointer-events: auto;
}

.phase-picker-trigger::-webkit-details-marker {
  display: none;
}

.phase-picker-trigger:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

/* A single segmented control keeps the meeting sequence readable without covering the board. */
.phase-rail {
  border-radius: var(--radius-card);
  display: none;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
  max-width: none;
  overflow: visible;
  padding: var(--space-1);
  pointer-events: auto;
}

.phase-picker[open] > .phase-rail {
  display: flex;
}

.phase-rail button {
  background: transparent;
  border-color: transparent;
  color: var(--color-muted);
  flex: none;
  justify-content: flex-start;
  width: 100%;
}

.phase-controls {
  align-items: center;
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: var(--space-2);
  justify-content: flex-end;
  max-width: calc(100vw - var(--space-8));
  overflow-x: auto;
  pointer-events: auto;
  white-space: nowrap;
  width: max-content;
}

.phase-rail .active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.phase-rail .active:disabled {
  opacity: 1;
}

.phase-chip {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  flex: none;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  height: 36px;
  justify-content: center;
  padding: 0 var(--space-3);
  white-space: nowrap;
  width: auto;
}

button.phase-chip {
  font-weight: var(--font-weight-semibold);
}

button.phase-chip:hover:not(:disabled) {
  background: var(--color-hover);
}

.phase-chip--warn {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.phase-chip-action {
  background: transparent;
  border: 0;
  color: inherit;
  font-weight: var(--font-weight-semibold);
  padding: 0;
}

.phase-chip-action:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.phase-chip-number {
  appearance: textfield;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  field-sizing: content;
  font-weight: var(--font-weight-semibold);
  height: 24px;
  max-width: 4ch;
  min-width: 2ch;
  padding: 0;
  text-align: center;
  width: auto;
}

.phase-chip-number:focus {
  border-bottom-color: var(--color-accent);
  box-shadow: none;
}

.phase-chip-number:disabled {
  border-bottom-color: transparent;
  color: inherit;
}

.phase-chip-number::-webkit-inner-spin-button,
.phase-chip-number::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.phase-chip-separator {
  color: var(--color-muted);
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
  /* Height of every badge straddling the bottom edge - rank, assignee, votes. */
  --card-strip: var(--space-5);
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

/* Hovering reads a note, it does not reorder the board - a click brings one to the front. */
.card:hover {
  box-shadow: var(--sticky-shadow-lift);
}

.card.selected,
.card.editing {
  z-index: 3;
}

/* An open owner list must not slide under the note next to it. */
.card:has(details[open]) {
  z-index: 5;
}

.card.dragging {
  box-shadow: var(--sticky-shadow-lift);
  cursor: grabbing;
  z-index: 4;
}

.group-box {
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  border: 2px solid color-mix(in srgb, var(--color-accent) 58%, transparent);
  border-radius: var(--radius-lg);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 12%, transparent);
  cursor: grab;
  position: absolute;
  z-index: 0;
}

.group-title,
.group-ungroup {
  pointer-events: auto;
}

.group-header {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  left: 50%;
  max-width: calc(100% - var(--space-4));
  pointer-events: auto;
  position: absolute;
  top: -40px;
  transform: translateX(-50%);
  width: max-content;
  z-index: 1;
}

.group-title {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  box-shadow: none;
  color: var(--color-text);
  field-sizing: content;
  font-family: inherit;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  height: var(--control-height-small);
  max-width: 100%;
  padding: 0 var(--space-2);
  position: static;
  width: fit-content;
}

.group-title:focus {
  border-color: var(--color-accent);
  box-shadow: none;
  outline: none;
}

.group-ungroup {
  position: static;
}

.card.group-picked {
  background-color: color-mix(in srgb, var(--color-accent) 7%, var(--card-color));
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

.merge-bar {
  align-items: center;
  background: color-mix(in srgb, var(--color-accent) 9%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
  border-radius: var(--radius-card);
  bottom: calc(var(--space-4) + var(--icon-btn-size) + var(--space-2));
  box-shadow: var(--shadow-card);
  display: flex;
  gap: var(--space-3);
  left: 50%;
  padding: var(--space-2) var(--space-4);
  position: fixed;
  transform: translateX(-50%);
  z-index: 5;
}

.merge-bar > svg {
  color: var(--color-accent);
  flex: none;
}

.merge-bar .primary {
  align-items: center;
  display: inline-flex;
  gap: var(--space-1);
}

.merge-bar .primary svg {
  height: 15px;
  width: 15px;
}

.card.discussed {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
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
  padding: 0;
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

/*
 * Who owns the action is a person, so it is picked from the faces of the room, not a dropdown.
 * It rides the bottom edge between the rank and the vote, the way every other badge does, so the
 * note itself keeps all of its writing space.
 */
.assignee {
  bottom: 0;
  left: 50%;
  max-width: calc(100% - var(--icon-btn-size) * 2);
  position: absolute;
  translate: -50% 50%;
}

.assignee-trigger {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-caption);
  gap: 4px;
  list-style: none;
  min-width: 0;
  padding: 0 var(--space-2) 0 2px;
}

.assignee-trigger--empty {
  padding-left: var(--space-2);
}

.assignee-trigger .entity-avatar.small {
  font-size: 8px;
  height: 14px;
  width: 14px;
}

.assignee-trigger > .lucide {
  height: 12px;
  width: 12px;
}

.assignee-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assignee-trigger .entity-avatar {
  flex: none;
}

.assignee-trigger::-webkit-details-marker {
  display: none;
}

.assignee-trigger--empty {
  color: var(--color-muted);
}

.assignee-trigger > svg {
  height: 14px;
  width: 14px;
}

/* The list belongs to a note, not to the page - it stays as small as the names it holds. */
.assignee-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  bottom: calc(100% + var(--space-1));
  box-shadow: var(--shadow-popover);
  display: grid;
  gap: 1px;
  left: 50%;
  max-width: 180px;
  padding: 3px;
  position: absolute;
  translate: -50% 0;
  width: max-content;
  z-index: 7;
}

.assignee-row {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: inherit;
  display: flex;
  font-size: var(--font-size-caption);
  gap: var(--space-1);
  justify-content: flex-start;
  min-height: 0;
  padding: 3px var(--space-2) 3px 3px;
  white-space: nowrap;
}

.assignee-row .entity-avatar.small {
  font-size: 9px;
  height: 18px;
  width: 18px;
}

.assignee-row > .lucide {
  height: 12px;
  margin: 3px;
  width: 12px;
}

.assignee-row:hover {
  background: var(--color-soft);
}

.assignee-row.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
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

/* One badge size all along the bottom edge: rank on the left, assignee in the middle, votes on
   the right. */
.vote-badge,
.rank-badge,
.assignee-trigger {
  box-sizing: border-box;
  height: var(--card-strip);
}

.vote-badge,
.rank-badge {
  justify-content: center;
  min-height: 0;
  padding: 2px var(--space-2);
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
  right: var(--space-3);
  transition: var(--transition-press);
  translate: 0 50%;
}

.vote-badge:not(:disabled):hover {
  background: var(--color-hover);
}

.vote-badge:not(:disabled):active {
  translate: 0 calc(50% + var(--press-offset));
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

.vote-badge .lucide,
.rank-badge .lucide {
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
  left: var(--space-3);
  pointer-events: none;
  position: absolute;
  translate: 0 50%;
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

@media (max-width: 760px) {
  .retro-title {
    left: var(--space-3);
    max-width: calc(100% - 228px);
    padding-left: calc(var(--icon-btn-size) + var(--space-4));
    top: var(--space-3);
  }

  .retro-actions {
    left: var(--space-3);
    padding-inline: var(--space-2);
    top: calc(var(--space-3) + var(--control-height));
  }

  .presence {
    max-width: 76px;
  }

  .presence > .entity-avatar:nth-of-type(n + 3) {
    display: none;
  }

  .phase-stack {
    right: var(--space-3);
    top: var(--space-3);
  }
}
</style>
