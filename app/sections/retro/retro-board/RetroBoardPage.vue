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
        <div class="retro-title">
          <h1 v-if="!canRename(board)">{{ board.name }}</h1>
          <input
            v-else
            ref="nameInput"
            aria-label="Retro name"
            class="retro-name-input"
            maxlength="128"
            :value="board.name"
            @change="rename($event)" />
          <button
            v-if="canRename(board)"
            aria-label="Edit retro name"
            class="icon-btn small retro-name-edit"
            title="Edit retro name"
            type="button"
            @click.stop="focusNameInput"
            @pointerdown.stop>
            <Pencil />
          </button>
          <span
            v-if="board.finished"
            class="retro-finished">
            Finished
          </span>
        </div>
        <div
          aria-label="People on this retro"
          class="presence"
          :style="{ '--presence-step': `${presenceStep(everyone(board).length)}px` }"
          tabindex="0">
          <span
            v-for="member in everyone(board)"
            :key="member.userId"
            class="entity-avatar"
            :style="{ background: member.color }">
            {{ member.initials }}
          </span>
          <div class="presence-menu">
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
                <Crown
                  v-if="member.userId === board.owner.userId"
                  aria-label="Owner"
                  class="presence-role"
                  role="img" />
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

        <aside
          v-if="!board.finished"
          :aria-label="board.canManage ? 'Facilitator controls' : 'Current phase controls'"
          class="facilitator-panel">
          <header class="facilitator-panel-header">
            <button
              v-if="board.canManage"
              aria-controls="facilitator-phases"
              :aria-expanded="!state.phasesCollapsed"
              class="facilitator-panel-toggle"
              type="button"
              @click="state.phasesCollapsed = !state.phasesCollapsed">
              <h2>Retro plan</h2>
              <ChevronDown aria-hidden="true" />
            </button>
            <div v-else>
              <h2>Current phase</h2>
            </div>
            <div class="board-help">
              <button
                aria-label="Guide"
                class="board-help-trigger"
                type="button">
                <CircleHelp />
              </button>
              <div class="board-help-panel">
                <p class="board-help-heading">Keyboard shortcuts</p>
                <ul class="board-help-list">
                  <li>
                    <kbd>Delete</kbd>
                    /
                    <kbd>Backspace</kbd>
                    deletes the selected note
                  </li>
                  <li v-if="board.canManage">
                    <kbd>Ctrl</kbd>
                    /
                    <kbd>Cmd</kbd>
                    + click picks notes to merge into a topic
                  </li>
                  <li>
                    <kbd>Ctrl</kbd>
                    /
                    <kbd>Cmd</kbd>
                    +
                    <kbd>Enter</kbd>
                    saves a note being edited
                  </li>
                  <li>
                    <kbd>Esc</kbd>
                    cancels editing a note
                  </li>
                </ul>
                <p class="board-help-heading">On the board</p>
                <ul class="board-help-list">
                  <li>Double-click (or double-tap) an empty spot to add a note</li>
                  <li>Drag a note to move it between sections</li>
                  <li>Pinch, or scroll with a modifier, to zoom - drag the background to pan</li>
                </ul>
              </div>
            </div>
          </header>

          <nav
            v-if="board.canManage"
            v-show="!state.phasesCollapsed"
            id="facilitator-phases"
            aria-label="Retro phases"
            class="facilitator-phases">
            <button
              v-for="(phase, index) in PHASES"
              :key="phase"
              :aria-current="board.phase === phase ? 'step' : undefined"
              :aria-label="phase"
              class="facilitator-phase"
              :class="{
                active: board.phase === phase,
                done: PHASES.indexOf(board.phase) > index,
              }"
              :disabled="phase !== board.phase && !canChangePhase(board.phase, phase)"
              :title="`${PHASE_GUIDES[phase].title} — ${PHASE_GUIDES[phase].action}`"
              type="button"
              @click="board.phase !== phase && changePhase(phase)">
              <span class="facilitator-phase-index">{{ index + 1 }}</span>
              <span class="facilitator-phase-copy">
                <span class="facilitator-phase-title">
                  <component :is="PHASE_ICONS[phase]" />
                  <strong>{{ phase }}</strong>
                </span>
                <small>{{ PHASE_GUIDES[phase].title }}</small>
              </span>
            </button>
          </nav>

          <div class="facilitator-current">
            <div class="facilitator-current-title">
              <component :is="PHASE_ICONS[board.phase]" />
              <strong>{{ phaseGuide(board).title }}</strong>
            </div>
            <p>{{ phaseGuide(board).action }}</p>
          </div>

          <div
            v-if="
              board.phase !== 'Actions' &&
              ((board.phase === 'Collect' && board.hiddenMine + board.revealedMine > 0) ||
                board.phase === 'Vote' ||
                (canRunTimer(board) && (board.canManage || countdown !== undefined)))
            "
            class="phase-controls">
            <div
              v-if="board.phase === 'Collect' && board.hiddenMine + board.revealedMine > 0"
              class="phase-control">
              <span class="phase-control-label">
                <StickyNote aria-hidden="true" />
                Notes:
              </span>
              <button
                :aria-label="board.hiddenMine > 0 ? 'Show my notes' : 'Hide my notes'"
                class="secondary small"
                :class="{ danger: board.hiddenMine > 0 }"
                type="button"
                @click="setMineRevealed(board.hiddenMine > 0)">
                {{ board.hiddenMine > 0 ? 'Private' : 'Visible' }}
              </button>
            </div>

            <div
              v-if="board.phase === 'Vote'"
              class="phase-control vote-controls">
              <span class="phase-control-label">
                <ThumbsUp aria-hidden="true" />
                Votes:
              </span>
              <div class="vote-counter">
                <span>{{ board.myVotes }} of</span>
                <input
                  v-if="board.canManage"
                  aria-label="Votes per person"
                  class="secondary small vote-counter-limit"
                  max="99"
                  min="1"
                  type="number"
                  :value="board.votesPerUser"
                  @change="setVotesPerUser($event)" />
                <strong v-else>{{ board.votesPerUser }}</strong>
              </div>

              <button
                v-if="canResetVotes(board)"
                aria-label="Reset votes"
                class="secondary small reset-votes"
                title="Clear every vote so the team can vote again"
                type="button"
                @click="resetVotes()">
                <RotateCcw />
              </button>
            </div>

            <div
              v-if="canRunTimer(board) && (board.canManage || countdown !== undefined)"
              class="phase-control phase-timer"
              :class="{ 'phase-timer--over': countdown === '00:00' }">
              <span class="phase-control-label">
                <Timer aria-hidden="true" />
                Timer:
              </span>
              <template v-if="countdown === undefined">
                <input
                  v-model.number="state.timerMinutes"
                  aria-label="Timer duration in minutes"
                  class="secondary small phase-timer-minutes"
                  :disabled="!board.canManage"
                  max="60"
                  min="1"
                  type="number"
                  @change="state.timerMinutes = Math.min(60, Math.max(1, state.timerMinutes))" />
                <span>min</span>
                <button
                  class="secondary small phase-timer-start"
                  :disabled="!board.canManage"
                  type="button"
                  @click="startTimer()">
                  Start
                </button>
              </template>
              <template v-else>
                <Timer />
                <span
                  class="countdown"
                  :class="{ over: countdown === '00:00' }">
                  {{ countdown }}
                </span>
                <button
                  v-if="board.canManage"
                  class="secondary small danger phase-timer-stop"
                  type="button"
                  @click="stopTimer()">
                  Stop
                </button>
              </template>
            </div>
          </div>

          <div
            v-if="board.canManage"
            class="facilitator-phase-actions">
            <button
              v-if="previousPhase(board.phase)"
              class="secondary small"
              type="button"
              @click="changePreviousPhase(board.phase)">
              Back
            </button>
            <button
              v-if="nextPhase(board.phase)"
              class="primary small"
              type="button"
              @click="changeNextPhase(board.phase)">
              Next phase
            </button>
          </div>

          <button
            v-if="board.canManage && board.phase === 'Actions'"
            class="secondary danger small facilitator-finish"
            type="button"
            @click="finish">
            <Archive />
            Finish retro
          </button>
        </aside>

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
              :class="{ 'zone--closed': dragRejects(board, section.id) }"
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
                v-if="state.editingId !== card.id && isActionsSection(board, card.sectionId)"
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
                v-if="state.editingId !== card.id && votingOpen && showVoteBadge(board, card)"
                :aria-label="votedByMe(board, card) ? 'Remove vote from topic' : 'Vote for topic'"
                class="vote-badge"
                :class="{ voted: votedByMe(board, card) }"
                :title="votedByMe(board, card) ? 'Remove vote' : 'Vote for this topic'"
                type="button"
                @click.stop="vote(card)"
                @pointerdown.stop>
                <ThumbsUp />
                <template v-if="votedByMe(board, card)">Voted</template>
              </button>
              <span
                v-else-if="
                  state.editingId !== card.id &&
                  showVoteResults(board) &&
                  showVoteBadge(board, card)
                "
                :aria-label="`${topicVotes(board, card)} votes`"
                class="vote-badge vote-result">
                <ThumbsUp />
                {{ topicVotes(board, card) }}
              </span>

              <div
                v-if="
                  state.editingId !== card.id &&
                  state.selectedId === card.id &&
                  hasActions(board, card)
                "
                class="card-toolbar">
                <button
                  v-if="canEditCard(board, card)"
                  aria-label="Edit note"
                  class="icon-btn small"
                  title="Edit note"
                  type="button"
                  @click.stop="startEdit(card)"
                  @pointerdown.stop>
                  <Pencil />
                </button>
                <button
                  v-if="canTickOff(board, card)"
                  class="icon-btn small"
                  :title="card.done ? 'Mark as not done' : 'Mark as done'"
                  type="button"
                  @click.stop="done(card)"
                  @pointerdown.stop>
                  <CircleCheck />
                </button>
                <button
                  v-if="
                    card.isMine &&
                    board.phase === 'Collect' &&
                    !isActionsSection(board, card.sectionId)
                  "
                  class="icon-btn small"
                  :title="card.revealed ? 'Hide from the team' : 'Show to the team'"
                  type="button"
                  @click.stop="toggleReveal(card)"
                  @pointerdown.stop>
                  <Eye v-if="card.revealed" />
                  <EyeOff v-else />
                </button>
                <button
                  v-if="card.isMine || board.canManage"
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
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Crown,
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
  Pencil,
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

const PHASE_GUIDES: Record<RetroPhase, { action: string; title: string }> = {
  Actions: {
    action: 'Turn the discussion into clear commitments and assign an owner.',
    title: 'Create action items',
  },
  Collect: {
    action: 'Add notes to the board. Your covered notes stay private until you reveal them.',
    title: 'Share your perspective',
  },
  Discuss: {
    action: 'Start with the highlighted topics and agree on what matters most.',
    title: 'Discuss the results',
  },
  Group: {
    action: 'The facilitator combines related notes into topics.',
    title: 'Group similar notes',
  },
  Vote: {
    action: 'Choose the topics worth discussing. Voting opens while the timer is running.',
    title: 'Vote on topics',
  },
}

const UNSECTIONED_CARD_COLOR = '#c99724'

const previousPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) - 1]
const nextPhase = (phase: RetroPhase) => PHASES[PHASES.indexOf(phase) + 1]
const canChangePhase = (current: RetroPhase, target: RetroPhase) =>
  target === previousPhase(current) || target === nextPhase(current)

const phaseGuide = (board: RetroBoardViewModel) => {
  if (board.phase === 'Vote' && votingOpen.value) {
    return {
      action: `${Math.max(0, board.votesPerUser - board.myVotes)} votes left while the timer runs.`,
      title: PHASE_GUIDES.Vote.title,
    }
  }
  if (board.phase === 'Vote' && board.phaseEndsAt) {
    return {
      action: 'Voting is closed. The facilitator can move to the results.',
      title: 'Voting closed',
    }
  }
  return PHASE_GUIDES[board.phase]
}

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
    (element.scrollHeight > element.clientHeight + 4 || element.scrollWidth > element.clientWidth)
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

const nameInput = shallowRef<HTMLInputElement>()
const focusNameInput = () => {
  nameInput.value?.focus()
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
  // Keep a newly created note visible while the server response is on the wire.
  draftCards: [] as RetroCardViewModel[],
  fullscreen: false,
  groupSelection: [] as string[],
  hoveredId: undefined as string | undefined,
  joined: new Map<string, RetroMember>(),
  now: Date.now(),
  pendingTexts: new Map<string, string>(),
  phasesCollapsed: true,
  refreshPending: false,
  remoteCursors: new Map<string, { at: number; member: RetroMember; x: number; y: number }>(),
  remoteMoves: new Map<string, { at: number; x: number; y: number }>(),
  remoteTexts: new Map<string, { at: number; text: string }>(),
  removedCardIds: new Set<string>(),
  selectedId: undefined as string | undefined,
  timerMinutes: 1,
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
  state.draftCards = []
  state.editingId = undefined
  state.fullscreen = false
  state.groupSelection = []
  state.hoveredId = undefined
  state.joined.clear()
  state.pendingTexts.clear()
  state.refreshPending = false
  state.remoteCursors.clear()
  state.remoteMoves.clear()
  state.remoteTexts.clear()
  state.removedCardIds.clear()
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
  if (incoming.type === 'card-upserted') {
    const board = data.value

    if (!board || board.finished) {
      return
    }
    const current = board.cards.find((card) => card.id === incoming.card.id)
    const isMine = incoming.card.authorId === board.me.userId
    const text =
      isMine && incoming.card.covered
        ? (state.pendingTexts.get(incoming.card.id) ?? current?.text ?? incoming.card.text)
        : incoming.card.text
    const card: RetroCardViewModel = {
      assignee: current?.assignee ?? null,
      authorColor: incoming.card.author.color,
      authorInitials: incoming.card.author.initials,
      authorName: incoming.card.author.name,
      done: incoming.card.done,
      groupId: incoming.card.groupId,
      hidden: incoming.card.covered && !isMine,
      id: incoming.card.id,
      isMine,
      revealed: incoming.card.revealed,
      sectionId: incoming.card.sectionId,
      text,
      votedByMe: current?.votedByMe ?? false,
      votes: current?.votes ?? 0,
      x: incoming.card.x,
      y: incoming.card.y,
    }

    const index = board.cards.findIndex((existing) => existing.id === card.id)

    if (index === -1) {
      board.cards.push(card)
    } else {
      board.cards.splice(index, 1, card)
    }
    state.draftCards = state.draftCards.filter((draft) => draft.id !== card.id)
    triggerRef(data)
    state.remoteTexts.delete(card.id)
    return
  }
  if (incoming.type === 'group-upserted') {
    const board = data.value

    if (!board || board.finished) {
      return
    }
    if (!board.groups.some((group) => group.id === incoming.id)) {
      board.groups = [
        ...board.groups,
        {
          cardIds: incoming.cardIds,
          id: incoming.id,
          title: '',
          votedByMe: false,
          votes: 0,
        },
      ]
    }
    board.cards = board.cards.map((card) =>
      incoming.cardIds.includes(card.id) ? { ...card, groupId: incoming.id } : card,
    )
    triggerRef(data)
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

  if (data.value?.finished) {
    channel = undefined
    return
  }

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

const PRESENCE_WIDTH = 220
const AVATAR_SIZE = 28
const PRESENCE_STEP = 24

// The strip is the same width whoever shows up: past the point where the squares would push it
// wider, they slide further under each other instead. A sliver each is enough to count heads.
const presenceStep = (count: number) =>
  Math.max(8, Math.min(PRESENCE_STEP, (PRESENCE_WIDTH - AVATAR_SIZE) / Math.max(1, count - 1)))

// Everyone on the retro wears the same square, you included: singling yourself out with a label
// only asks the reader to work out who the odd one is.
// Everyone who belongs to this retro: whoever is connected right now plus whoever joined earlier
// and stepped away - handing the retro over to them is still valid.
const everyone = (board: RetroBoardViewModel) => {
  const members = board.finished
    ? board.participants
    : [board.me, ...presence.value, ...board.participants]
  const seen = new Map<string, RetroMember>()

  for (const member of members) {
    if (!seen.has(member.userId)) {
      seen.set(member.userId, member)
    }
  }
  return [...seen.values()].toSorted(
    (one, another) =>
      Number(another.userId === board.owner.userId) - Number(one.userId === board.owner.userId),
  )
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
    .toSorted((left, right) => right.votes - left.votes || left.id.localeCompare(right.id))
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

// The colour of the zone a dragged note is heading into - unless that zone refuses the note, and
// then it keeps its own, so the colour never promises a move that will not happen.
const draggedColor = (
  board: RetroBoardViewModel,
  card: RetroCardViewModel,
  position: { x: number; y: number },
) => {
  const index = zoneIndexAt(
    position.x + CARD_SIZE / 2,
    position.y + CARD_SIZE / 2,
    board.sections.length,
  )
  const section = board.sections[index]

  return section && canDropOn(board, card, section.id) ? section.color : undefined
}

const HIDDEN_TEXT = '•••••• ••••• ••••••'

// What the board actually holds right now: the server's answer plus a note just created here.
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
    const cardSection = board.sections.find((candidate) => candidate.id === card.sectionId)

    return {
      ...card,
      ...(remoteText === undefined ? {} : { text: remoteText }),
      // The server strips the text of a covered note, and live typing must not leak it either.
      ...(card.hidden ? { text: HIDDEN_TEXT } : {}),
      ...dragged,
      color:
        (dragged ? draggedColor(board, card, dragged) : undefined) ??
        cardSection?.color ??
        UNSECTIONED_CARD_COLOR,
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

// The phases pace the team, not the facilitator: running the room means fixing whatever the room
// got wrong, whenever it comes up, so the owner is bound by none of them.
const canChangeSection = (board: RetroBoardViewModel, sectionId: string) =>
  !board.finished &&
  (board.canManage ||
    (board.phase === 'Collect' && !isActionsSection(board, sectionId)) ||
    (board.phase === 'Actions' && isActionsSection(board, sectionId)))

const canChangeCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canChangeSection(board, card.sectionId)

const canEditCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  card.isMine && canChangeCard(board, card)

// Moving a note is a change like any other: the team may do it while that kind of note is open,
// the owner whenever the room needs it.
const canMoveCard = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  !board.finished &&
  !card.hidden &&
  (board.canManage ||
    (board.phase === 'Collect' && !isActionsSection(board, card.sectionId)) ||
    board.phase === 'Actions')

// Crossing the actions border turns a note into a commitment or back, so it belongs to the
// Actions phase - both ways, or a note dropped there by mistake would be stuck.
// A topic is a cluster inside one section: carrying one of its notes into another section would
// break the topic up and strand the votes it holds, so the whole topic travels, by its frame.
const canDropOn = (board: RetroBoardViewModel, card: RetroCardViewModel, sectionId: string) =>
  canMoveCard(board, card) &&
  (card.groupId === null || sectionId === card.sectionId) &&
  (board.canManage ||
    (board.phase === 'Collect' &&
      !isActionsSection(board, card.sectionId) &&
      !isActionsSection(board, sectionId)) ||
    (board.phase === 'Actions' &&
      (isActionsSection(board, card.sectionId) || isActionsSection(board, sectionId))))

// While a note is in the air, a section that will not take it says so: a drop that silently snaps
// the note back reads as a bug, not as a rule.
const dragRejects = (board: RetroBoardViewModel, sectionId: string) => {
  const dragged = state.dragPosition
    ? boardCards(board).find((card) => card.id === state.dragId)
    : undefined

  return dragged !== undefined && !canDropOn(board, dragged, sectionId)
}

const { execute: executeCreate } = useAction(props.deps.createCard)
const { execute: executeMove } = useAction(props.deps.moveCard)
const { execute: executeMoveGroup } = useAction(props.deps.moveGroup)
const { execute: executeUpdate } = useAction(props.deps.updateCard)
const { execute: executeVote } = useAction(props.deps.toggleVote)
const { execute: executeAssign } = useAction(props.deps.setCardAssignee)
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

const changePreviousPhase = (phase: RetroPhase) => {
  const target = previousPhase(phase)
  if (target) {
    return changePhase(target)
  }
}

const changeNextPhase = (phase: RetroPhase) => {
  const target = nextPhase(phase)
  if (target) {
    return changePhase(target)
  }
}

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
  saveSettings(Math.min(99, Math.max(1, Number((event.target as HTMLInputElement).value))))

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

const startTimer = () => setTimer(Math.min(60, Math.max(1, state.timerMinutes)))

const stopTimer = () => setTimer(null)

let ticker: number | undefined

// The countdown and the expiry of remote cursors only tick in front of a user.
const startTicker = () => {
  if (ticker !== undefined || data.value?.finished) {
    return
  }
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
}

const stopTicker = () => {
  clearInterval(ticker)
  ticker = undefined
}

onMounted(startTicker)
onBeforeUnmount(stopTicker)

watch(
  () => data.value?.finished,
  (finished) => {
    if (!finished) {
      startTicker()
      return
    }
    const current = channel

    channel = undefined
    current?.close()
    clearBoardState()
    stopTicker()
    window.removeEventListener('keydown', onKeyDown)
  },
)

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
  const group = groupOf(board, card)

  if (group && group.cardIds[0] !== card.id) {
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

  if (!board || !canEditCard(board, card)) {
    return
  }
  state.draft = card.text
  state.editingId = card.id
  void nextTick(() => editor.value?.focus())
}

const cancelEdit = () => {
  const refreshPending = state.refreshPending

  state.editingId = undefined
  state.refreshPending = false
  if (refreshPending) {
    void refresh()
  }
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
    if (refreshPending) {
      await refresh()
    }
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

  if (
    !board ||
    !lead ||
    !members ||
    members.some((card) => card.id === state.editingId) ||
    !canMoveCard(board, lead)
  ) {
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

// Actions carried over from the last retro are the first thing a new one looks at, so ticking one
// off belongs to no single phase - and the whole team keeps that within reach.
const canTickOff = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  !board.finished && isActionsSection(board, card.sectionId)

const hasActions = (board: RetroBoardViewModel, card: RetroCardViewModel) =>
  canTickOff(board, card) ||
  (canChangeCard(board, card) &&
    (card.isMine || board.canManage || isActionsSection(board, card.sectionId)))

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
  const cardIds = [...state.groupSelection]
  const created = await executeGroup({ cardIds, retroId: props.retroId })

  if (created) {
    if (!board.groups.some((group) => group.id === created.id)) {
      board.groups.push({ cardIds, id: created.id, title: '', votedByMe: false, votes: 0 })
    }
    for (const card of board.cards) {
      if (cardIds.includes(card.id)) {
        card.groupId = created.id
      }
    }
    triggerRef(data)
  }
  state.groupSelection = []
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

// Covering a note is for what its author is still writing: a commitment the team already agreed
// on has nothing left to hide.
const toggleReveal = async (card: RetroCardViewModel) => {
  const board = data.value

  if (!board || !card.isMine || isActionsSection(board, card.sectionId)) {
    return
  }
  if (!canChangeCard(board, card)) {
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

// Resetting votes is useful only while the room is still voting.
const canResetVotes = (board: RetroBoardViewModel) =>
  !board.finished && board.canManage && board.phase === 'Vote'

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

  if (!board || !canTickOff(board, card)) {
    return
  }
  await executeDone({ done: !card.done, id: card.id })
  await refresh()
}

// An action item without an owner is fine - the team may not have picked one yet.
const canAssign = (board: RetroBoardViewModel) =>
  !board.finished && (board.canManage || board.phase === 'Actions')

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

  if (!board || (!card.isMine && !board.canManage) || !canChangeCard(board, card)) {
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

  if (
    board &&
    card &&
    (card.isMine || board.canManage) &&
    state.editingId === undefined &&
    canChangeCard(board, card)
  ) {
    event.preventDefault()
    void destroy(card)
  }
}

onMounted(() => {
  if (!data.value?.finished) {
    window.addEventListener('keydown', onKeyDown)
  }
})
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
  --facilitator-width: 240px;
  --retro-title-size: 24px;

  container-type: inline-size;
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

.retro > .retro-canvas {
  border: 0;
  border-radius: 0;
  height: 100%;
  inset: 0;
  position: absolute;
  width: 100%;
}

.facilitator-panel {
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--color-surface) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 84%, transparent);
  border-radius: var(--radius-card);
  box-shadow: 0 4px 14px #10182814;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  position: absolute;
  right: var(--space-3);
  top: var(--space-4);
  width: var(--facilitator-width);
  z-index: 6;
}

.facilitator-panel:has(.board-help:hover),
.facilitator-panel:has(.board-help:focus-within) {
  z-index: 100;
}

.facilitator-panel-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.facilitator-panel-header h2 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.facilitator-panel-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  display: flex;
  flex: 1;
  gap: var(--space-1);
  justify-content: flex-start;
  min-width: 0;
  padding: 0;
  text-align: left;
}

.facilitator-panel-toggle:focus-visible {
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.facilitator-panel-toggle > svg {
  color: var(--color-muted);
  height: 14px;
  transition: transform var(--duration-fast) var(--ease-standard);
  width: 14px;
}

.facilitator-panel-toggle[aria-expanded='false'] > svg {
  transform: rotate(-90deg);
}

.facilitator-phases {
  display: grid;
  gap: 2px;
}

.facilitator-phase {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  cursor: pointer;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 24px minmax(0, 1fr);
  min-height: 48px;
  padding: var(--space-1) var(--space-2);
  text-align: left;
  transition:
    background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

.facilitator-phase:hover:not(:disabled):not(.active) {
  background: var(--color-hover);
  color: var(--color-text);
}

.facilitator-phase:disabled {
  cursor: default;
  opacity: 0.45;
}

.facilitator-phase:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.facilitator-phase.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.facilitator-phase-index {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  font-size: var(--font-size-caption);
  height: 22px;
  justify-content: center;
  width: 22px;
}

.facilitator-phase.done .facilitator-phase-index {
  background: var(--color-soft);
  color: var(--color-muted);
}

.facilitator-phase.active .facilitator-phase-index {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.facilitator-phase-title {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

.facilitator-phase-title > svg {
  height: 12px;
  width: 12px;
}

.facilitator-phase-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.facilitator-phase-copy strong {
  color: var(--color-text);
  font-size: var(--font-size-small);
}

.facilitator-phase.active .facilitator-phase-copy strong {
  color: var(--color-accent);
}

.facilitator-phase-copy small {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.facilitator-current {
  border-top: 1px solid var(--color-border);
  margin-top: 0;
  padding-top: var(--space-3);
}

.facilitator-current-title {
  margin-top: var(--space-1);
}

.facilitator-current-title > svg {
  color: var(--color-accent);
  display: inline-block;
  height: 17px;
  margin-right: var(--space-2);
  vertical-align: -0.2em;
  width: 17px;
}

.facilitator-current p {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  line-height: 1.4;
  margin: var(--space-1) 0 0;
}

.facilitator-phase-actions {
  display: flex;
  gap: var(--space-1);
}

.facilitator-phase-actions > button {
  flex: 1;
  justify-content: center;
}

.facilitator-finish {
  justify-content: center;
  width: 100%;
}

.board-help {
  align-items: center;
  display: flex;
  position: relative;
}

.board-help-trigger {
  align-items: center;
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  height: var(--icon-btn-size);
  justify-content: center;
  padding: 0 var(--space-3);
}

.board-help-trigger:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.board-help-trigger:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.board-help-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  display: none;
  gap: var(--space-2);
  margin-top: var(--space-2);
  max-height: calc(100dvh - 96px);
  max-width: calc(100vw - var(--space-4));
  overflow-y: auto;
  padding: var(--space-3);
  position: absolute;
  right: 0;
  top: 100%;
  width: 400px;
  z-index: 100;
}

.board-help:hover .board-help-panel,
.board-help:focus-within .board-help-panel {
  display: grid;
}

.board-help-heading {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.board-help-heading:not(:first-child) {
  margin-top: var(--space-1);
}

.presence-role {
  color: #b7791f;
  height: 14px;
  width: 14px;
}

.board-help-list {
  display: grid;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.board-help-list li {
  line-height: 1.4;
}

.board-help-list kbd {
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  font-family: inherit;
  font-size: var(--font-size-caption);
  padding: 1px 5px;
}

.retro-title {
  align-items: center;
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--color-surface) 10%, transparent);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-1);
  left: var(--space-3);
  max-width: calc(100% - var(--facilitator-width) - var(--space-8));
  min-width: 0;
  overflow: hidden;
  padding: var(--space-1) var(--space-2);
  pointer-events: auto;
  position: absolute;
  top: var(--space-4);
  width: fit-content;
  z-index: 8;
}

.retro-title h1,
.retro-name-input {
  font-size: var(--retro-title-size);
  letter-spacing: -0.04em;
  line-height: 1.1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retro-title h1 {
  font-weight: var(--font-weight-extrabold);
}

.retro-name-input {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  color: inherit;
  field-sizing: content;
  flex: 1 1 auto;
  font-family: inherit;
  font-weight: var(--font-weight-bold);
  height: auto;
  max-width: 100%;
  padding: 0;
  width: auto;
}

.retro-name-input:hover {
  background: transparent;
}

.retro-name-input:focus {
  background: transparent;
  outline: none;
}

.retro-name-edit {
  background: transparent;
  border: 0;
  box-shadow: none;
  color: var(--color-muted);
}

.retro-name-edit:hover {
  background: var(--color-hover);
  color: var(--color-text);
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
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-control) - 2px);
  box-shadow: none;
  display: flex;
  left: var(--space-4);
  max-width: 220px;
  outline: none;
  position: absolute;
  top: calc(var(--space-4) + 42px + var(--space-2));
  z-index: 8;
}

.presence:focus-visible {
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-focus);
}

.presence > .entity-avatar {
  height: 28px;
  margin-right: calc(var(--presence-step, 24px) - 28px);
  outline: 2px solid var(--color-surface);
  width: 28px;
}

.presence > .entity-avatar:last-of-type {
  margin-right: 0;
}

.presence-menu {
  left: 0;
  opacity: 0;
  padding-top: var(--space-2);
  pointer-events: none;
  position: absolute;
  top: calc(100% - var(--space-1));
  transition: opacity 0.12s ease;
  z-index: 5;
}

.presence:hover .presence-menu,
.presence:focus-within .presence-menu {
  opacity: 1;
  pointer-events: auto;
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
  padding: var(--space-3);
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

.presence-row .secondary {
  margin-left: auto;
}

.facilitator-panel-header .board-help-trigger {
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-control) - 2px);
  box-shadow: none;
  height: 16px;
  padding: 0;
  width: 16px;
}

.facilitator-panel-header .board-help-trigger > svg {
  height: 16px;
  width: 16px;
}

/* Phase controls: contextual actions inside the current panel. */
.phase-controls {
  align-items: start;
  display: grid;
  gap: var(--space-1);
  justify-items: start;
  min-height: 0;
  pointer-events: auto;
  position: static;
  width: 100%;
}

/* Technical status rows: label, value, then an optional action. */
.phase-control {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height-small);
  width: 100%;
}

.phase-control-label {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  flex: 0 0 60px;
  font-size: var(--font-size-small);
  gap: var(--space-1);
}

.phase-control-label > svg {
  height: 14px;
  width: 14px;
}

.vote-controls {
  justify-content: flex-start;
}

.vote-controls .vote-counter {
  flex: none;
  justify-content: flex-start;
}

.vote-counter,
.phase-timer {
  align-items: center;
  color: var(--color-text);
  display: flex;
  flex: none;
  font-size: var(--font-size-small);
  justify-content: flex-start;
  white-space: nowrap;
}

.vote-counter {
  gap: var(--space-1);
}

.phase-timer--over {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border-radius: calc(var(--radius-control) - 2px);
  color: var(--color-danger);
  padding: 0 var(--space-2);
}

/* Keep editable numbers compact while using the same control style as buttons. */
.vote-counter-limit,
.phase-timer-minutes {
  appearance: textfield;
  field-sizing: content;
  max-width: 34px;
  min-width: 24px;
  text-align: center;
  width: auto;
}

.vote-counter-limit:disabled,
.phase-timer-minutes:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.vote-counter-limit::-webkit-inner-spin-button,
.vote-counter-limit::-webkit-outer-spin-button,
.phase-timer-minutes::-webkit-inner-spin-button,
.phase-timer-minutes::-webkit-outer-spin-button {
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

/* A section that refuses the note in the air: dimmed and struck out with a hatch. */
.zone--closed {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 8px,
    color-mix(in srgb, var(--color-border) 60%, transparent) 8px 10px
  );
  opacity: 0.55;
}

.zone-header {
  display: grid;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
}

.zone-header small {
  font-size: var(--font-size-body);
}

.zone-title {
  align-items: center;
  display: flex;
  font-size: 16px;
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
  --curl-light: #0000002e;
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
  border-radius: var(--radius-card);
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

.card.done .card-text {
  color: var(--color-muted);
  text-decoration: line-through;
}

.card-text {
  background: transparent;
  border: 0;
  border-radius: 0;
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
  bottom: calc(-1 * var(--card-strip) - 4px);
  left: 50%;
  max-width: calc(100% - var(--icon-btn-size) * 2);
  position: absolute;
  translate: -50% 0;
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
  color: var(--color-muted);
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
  border-radius: var(--radius-small);
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
  bottom: calc(-1 * var(--card-strip) - 4px);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  gap: 4px;
  position: absolute;
  right: var(--space-2);
  transition: var(--transition-press);
  translate: 0;
}

.vote-badge:not(:disabled):hover {
  background: var(--color-hover);
}

.vote-badge:not(:disabled):active {
  translate: 0 var(--press-offset);
}

.vote-result {
  pointer-events: none;
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
  bottom: calc(-1 * var(--card-strip) - 4px);
  box-shadow: var(--shadow-card);
  color: var(--rank-color);
  display: flex;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  gap: 4px;
  left: var(--space-2);
  pointer-events: none;
  position: absolute;
  translate: 0;
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

@media (max-width: 767px) {
  .retro {
    --facilitator-width: 220px;
    --retro-title-size: 18px;
  }

  .retro-title {
    height: var(--icon-btn-size);
    left: calc(var(--icon-btn-size) + var(--space-4));
    max-width: calc(100% - var(--space-8) - var(--icon-btn-size));
  }

  .facilitator-panel {
    bottom: var(--space-3);
    left: var(--space-3);
    padding: var(--space-2);
    right: auto;
    top: auto;
  }

  .presence {
    max-width: 76px;
  }

  .presence > .entity-avatar:nth-of-type(n + 3) {
    display: none;
  }
}
</style>
