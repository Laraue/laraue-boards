<!-- The issue's agent run: its state, "Hand to agent" or "Send back to agent" (an issue the agent already worked
     on, with what's wrong), and a remove-style × beside an open run's badge to cancel it, for anyone who can edit the
     issue. Whether the user can hand the issue off, and why not, comes
     decided from the backend (handOff) - this only shows it. A run is open while it is ready or working, and
     the issue's fields are locked meanwhile. -->
<template>
  <section
    v-if="run || handOff.blocker !== 'notAllowed'"
    :aria-labelledby="headingId"
    class="issue-agent-run">
    <div class="issue-agent-run-heading">
      <h2 :id="headingId">{{ t('agent') }}</h2>
      <DocsHelpLink
        :path="['integrations', 'agent-hand-off']"
        :topic="t('agent')" />
    </div>
    <div
      v-if="rowShown"
      class="issue-agent-run-row">
      <AgentRunBadge
        v-if="badgeShown && run"
        :completed="completed"
        :in-review="inReview"
        :state="run.state"
        tooltip />
      <span
        v-else-if="noneShown"
        class="issue-agent-run-none">
        {{ t('none') }}
      </span>
      <!-- The same × as a link's remove button, right after the badge it cancels. -->
      <BaseIconButton
        v-if="canEdit && open && run"
        class="issue-agent-run-cancel"
        :disabled="pending"
        :label="t('cancel')"
        variant="danger"
        @click="cancel(run.id)">
        <IconX />
      </BaseIconButton>
      <BaseButton
        v-else-if="handOff.canSendBack"
        size="small"
        variant="ghost"
        @click="sendBackDialog?.open()">
        <IconArrowBackUp />
        {{ t('sendBack') }}
      </BaseButton>
      <BaseButton
        v-else-if="handOff.available"
        :loading="pending"
        size="small"
        variant="ghost"
        @click="startHandOff">
        <IconRobot />
        {{ t('handOff') }}
      </BaseButton>
      <!-- Not available yet: the disabled button, with the reason on hover or focus. A disabled button gets no
           pointer events, so the tooltip sits on a focusable wrapper. -->
      <BaseTooltip
        v-else-if="unavailableReason"
        :text="unavailableReason">
        <span
          :aria-label="`${t('handOff')}: ${unavailableReason}`"
          class="issue-agent-run-unavailable"
          role="note"
          tabindex="0">
          <BaseButton
            disabled
            size="small"
            variant="ghost">
            <IconRobot />
            {{ t('handOff') }}
          </BaseButton>
        </span>
      </BaseTooltip>
    </div>
    <!-- A failed run is its reason in a red frame - no "Agent failed" badge on top of it; the card on the board
         has that. Said in the open: a hover hint isn't found, nor shown on touch screens. Once the issue is completed
         there's nothing to act on: the grey "Finished without agent" badge instead, the reason stays in the history. -->
    <div
      v-if="failureShown && run"
      class="issue-agent-run-failure"
      role="status">
      <p class="issue-agent-run-failure-reason">
        <time
          v-if="run.finishedAt"
          :datetime="run.finishedAt"
          :title="formatDateTime(run.finishedAt)">
          {{ formatRecent(run.finishedAt) }}:
        </time>
        {{ run.failureReason ?? t('failedNoReason') }}
      </p>
      <p
        v-if="handOff.blocker === 'issueStarted' && !handOff.canSendBack"
        class="issue-agent-run-failure-hint">
        {{ t('retryAfterMove') }}
      </p>
    </div>
    <p
      v-if="open"
      class="issue-agent-run-note">
      {{ t('locked') }}
    </p>
    <p
      v-if="waitsForBlockers"
      class="issue-agent-run-note">
      {{ t('waitsFor', { keys: blockedBy.join(', ') }) }}
    </p>
    <p
      v-if="message && !sendingBack"
      class="form-error issue-agent-run-error"
      role="alert">
      {{ message }}
    </p>
    <BaseDialog
      ref="sendBackDialog"
      :close-label="t('close')"
      :description="t('sendBackDescription')"
      :title="t('sendBack')"
      @close="sendingBack = false"
      @submit="sendBack">
      <BaseField
        v-slot="{ id }"
        :label="t('whatsWrong')">
        <textarea
          :id="id"
          v-model="sendBackComment"
          class="issue-agent-run-comment"
          :maxlength="4096"
          :placeholder="t('whatsWrongPlaceholder')"
          required
          rows="5" />
      </BaseField>
      <p
        v-if="message && sendingBack"
        class="form-error"
        role="alert">
        {{ message }}
      </p>
      <template #actions>
        <BaseButton @click="sendBackDialog?.close()">{{ t('cancelSendBack') }}</BaseButton>
        <BaseButton
          :loading="pending"
          type="submit"
          variant="primary">
          {{ t('send') }}
        </BaseButton>
      </template>
    </BaseDialog>
  </section>
</template>

<script setup lang="ts">
import { IconArrowBackUp, IconRobot, IconX } from '@tabler/icons-vue'

import AgentRunBadge from '~/components/agent-run-badge/AgentRunBadge.vue'
import DocsHelpLink from '~/components/docs-help-link/DocsHelpLink.vue'
import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

import type {
  AgentHandOffViewModel,
  IssueAgentRunDeps,
  IssueAgentRunViewModel,
} from './IssueAgentRun.deps'

const props = defineProps<{
  // Keys of the issues that block this one and aren't completed yet.
  blockedBy: string[]
  // Who can cancel an open run: anyone who can edit the issue.
  canEdit: boolean
  // The issue is in a Completed status: a failed run then shows as finished without the agent, not as a failure.
  completed: boolean
  deps: IssueAgentRunDeps
  // Whether the user can hand the issue off now, and why not - as the backend decided.
  handOff: AgentHandOffViewModel
  // The issue is in a Review status: a done run's badge then asks for a review.
  inReview: boolean
  issueKey: string
  onChanged: () => Promise<void> | void
  run: IssueAgentRunViewModel | null
}>()

const { t } = useI18n({
  en: {
    agent: 'Agent',
    boardNotReady:
      'To hand issues to the agent, add statuses for these stages to the board: {statuses}.',
    cancel: 'Cancel run',
    cancelConfirm: 'Stop the agent on this issue?',
    cancelSendBack: 'Cancel',
    close: 'Close',
    created: 'Not started',
    failedNoReason: 'The agent gave up.',
    handOff: 'Hand to agent',
    inProgress: 'In progress',
    issueStarted: 'Move the issue to a not started status to hand it to the agent.',
    locked: 'Editing is locked while the agent has the issue. Cancel the run to change it.',
    needsApiKey: 'Create an API key for your agent runner first: Account → API keys.',
    none: 'Not handed off',
    retryAfterMove: 'To try again, move the issue back to a not started status.',
    review: 'In review',
    send: 'Send to agent',
    sendBack: 'Send back to agent',
    sendBackDescription:
      'Your comment is added to the issue, which moves back to not started and goes to the agent again. It continues on the same branch.',
    stop: 'Stop agent',
    waitsFor: 'Blocked by {keys}: the agent starts once they are completed.',
    whatsWrong: "What's wrong",
    whatsWrongPlaceholder:
      'For example: the button is still blue - make it match the other primary buttons.',
  },
  ru: {
    agent: 'Агент',
    boardNotReady:
      'Чтобы передавать задачи агенту, добавьте на доску статусы для этапов: {statuses}.',
    cancel: 'Отменить запуск',
    cancelConfirm: 'Остановить агента на этой задаче?',
    cancelSendBack: 'Отмена',
    close: 'Закрыть',
    created: 'Не начато',
    failedNoReason: 'Агент не справился.',
    handOff: 'Передать агенту',
    inProgress: 'В работе',
    issueStarted: 'Переведите задачу в не начатый статус, чтобы передать её агенту.',
    locked: 'Пока задача у агента, её нельзя редактировать. Отмените запуск, чтобы изменить её.',
    needsApiKey: 'Сначала создайте API-ключ для раннера агента: Аккаунт → API-ключи.',
    none: 'Не передана',
    retryAfterMove: 'Чтобы попробовать снова, верните задачу в не начатый статус.',
    review: 'На проверке',
    send: 'Отправить агенту',
    sendBack: 'Вернуть агенту',
    sendBackDescription:
      'Ваш комментарий добавится к задаче, она вернётся в не начатый статус и снова уйдёт агенту. Он продолжит на той же ветке.',
    stop: 'Остановить',
    waitsFor: 'Заблокирована задачами {keys}: агент начнёт, когда они будут завершены.',
    whatsWrong: 'Что не так',
    whatsWrongPlaceholder:
      'Например: кнопка всё ещё синяя — сделайте её как остальные основные кнопки.',
  },
})

const confirm = useConfirm()
const { formatDateTime, formatRecent } = useFormatters()

const headingId = useId()

const open = computed(() => props.run?.state === 'ready' || props.run?.state === 'working')
// A failed run shows its reason instead of a badge - until the issue is completed without it.
const failureShown = computed(() => props.run?.state === 'failed' && !props.completed)
const badgeShown = computed(() => !!props.run && !failureShown.value)

const CATEGORY_KEYS = {
  Completed: null,
  Created: 'created',
  InProgress: 'inProgress',
  Review: 'review',
} as const satisfies Record<StatusCategory, 'created' | 'inProgress' | 'review' | null>

// The words for why the hand-off isn't available yet; the reason itself is the backend's.
const unavailableReason = computed(() => {
  switch (props.handOff.blocker) {
    case 'noApiKey':
      return t('needsApiKey')
    case 'boardNotReady':
      return t('boardNotReady', {
        statuses: props.handOff.missingStatusCategories
          .flatMap((category) => {
            const key = CATEGORY_KEYS[category]
            return key ? [t(key)] : []
          })
          .join(', '),
      })
    case 'issueStarted':
      // Sending back moves the issue to not started itself.
      return props.handOff.canSendBack ? null : t('issueStarted')
    default:
      return null
  }
})

// "Not handed off" for someone who sees the section but has nothing else in its first row.
const noneShown = computed(
  () =>
    !badgeShown.value &&
    !props.handOff.available &&
    !unavailableReason.value &&
    !failureShown.value,
)

const rowShown = computed(
  () =>
    badgeShown.value ||
    props.handOff.available ||
    props.handOff.canSendBack ||
    !!unavailableReason.value ||
    noneShown.value,
)
// A working run already started; for any other state the blockers decide when the agent can start.
const waitsForBlockers = computed(
  () => props.blockedBy.length > 0 && props.run?.state !== 'working',
)

const { execute, message, pending } = useApiAction((action: () => Promise<void>) => action())

const startHandOff = async () => {
  if (await execute(() => props.deps.handOff({ issueKey: props.issueKey }))) {
    await props.onChanged()
  }
}

const sendBackDialog = useTemplateRef('sendBackDialog')
const sendBackComment = ref('')
// The send back dialog shows its own error; the section's line is for the other actions.
const sendingBack = ref(false)

const sendBack = async () => {
  sendingBack.value = true
  const comment = sendBackComment.value.trim()
  if (
    comment &&
    (await execute(() => props.deps.sendBack({ comment, issueKey: props.issueKey })))
  ) {
    sendingBack.value = false
    sendBackComment.value = ''
    sendBackDialog.value?.close()
    await props.onChanged()
  }
}

const cancel = async (runId: string) => {
  if (
    (await confirm({ action: t('stop'), danger: true, title: t('cancelConfirm') })) &&
    (await execute(() => props.deps.cancel({ runId })))
  ) {
    await props.onChanged()
  }
}
</script>

<style scoped>
.issue-agent-run-comment {
  resize: vertical;
  width: 100%;
}

/* A section of its own under Links, shaped the same way. */
.issue-agent-run {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

.issue-agent-run-heading {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

.issue-agent-run h2 {
  font-size: inherit;
  margin: 0;
}

.issue-agent-run-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-height: var(--control-height);
  min-width: 0;
}

/* The badge and its cancel × at one height, the small control size - larger than a plain badge, so the ×
   is easy to hit. :deep - both render inside child components (the × through BaseButton's tooltip), so they
   don't carry this component's scope. */
.issue-agent-run-row :deep(.base-badge) {
  height: var(--icon-btn-size-small);
  padding: 0 var(--space-3);
}

.issue-agent-run-row :deep(.issue-agent-run-cancel) {
  --icon-btn-size: var(--icon-btn-size-small);
}

.issue-agent-run-row :deep(.issue-agent-run-cancel svg) {
  height: 16px;
  width: 16px;
}

.issue-agent-run-none {
  color: var(--color-muted);
}

.issue-agent-run-unavailable {
  border-radius: var(--radius-control);
  display: inline-flex;
}

.issue-agent-run-unavailable:focus-visible {
  outline: 2px solid var(--color-focus);
}

.issue-agent-run-unavailable :deep(button) {
  pointer-events: none;
}

.issue-agent-run-failure {
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-control);
  display: grid;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
}

.issue-agent-run-failure-reason {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  margin: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.issue-agent-run-failure-reason time {
  color: var(--color-muted);
}

.issue-agent-run-failure-hint {
  color: var(--color-muted);
  margin: 0;
}

.issue-agent-run-error,
.issue-agent-run-note {
  margin: 0;
}

.issue-agent-run-note {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}
</style>
