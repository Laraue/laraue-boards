<!-- The issue's agent run in the properties: its state, "Hand to agent" for the assignee (their own
     runner picks it up), and a remove-style × beside an open run's badge to cancel it, for anyone who can
     edit the issue. A run is open while it is
     ready or working, and the issue's fields are locked meanwhile. A blocked issue can be handed off:
     its run waits until the blockers are completed, which the note says. -->
<template>
  <section
    v-if="run || (canEdit && assigneeIsCurrentUser)"
    :aria-labelledby="headingId"
    class="issue-agent-run">
    <div class="issue-agent-run-heading">
      <h2 :id="headingId">{{ t('agent') }}</h2>
      <DocsHelpLink
        :path="['integrations', 'agent-hand-off']"
        :topic="t('agent')" />
    </div>
    <div class="issue-agent-run-row">
      <AgentRunBadge
        v-if="badgeShown && run"
        :state="run.state"
        :title="run.failureReason ?? undefined" />
      <span
        v-else-if="!canHandOff"
        class="issue-agent-run-none">
        {{ t('none') }}
      </span>
      <template v-if="canEdit">
        <!-- The same × as a link's remove button, right after the badge it cancels. -->
        <BaseIconButton
          v-if="open && run"
          :disabled="pending"
          :label="t('cancel')"
          variant="danger"
          @click="cancel(run.id)">
          <IconX />
        </BaseIconButton>
        <BaseButton
          v-else-if="handOffShown"
          :class="{ 'issue-agent-run-action': badgeShown }"
          :loading="pending"
          size="small"
          variant="ghost"
          @click="handOff">
          <IconRobot />
          {{ t('handOff') }}
        </BaseButton>
        <!-- Not available yet: the disabled button, with the reason on hover or focus. A disabled button gets no
             pointer events, so the tooltip sits on a focusable wrapper. -->
        <BaseTooltip
          v-else-if="handOffUnavailable"
          :text="handOffUnavailable">
          <span
            :aria-label="`${t('handOff')}: ${handOffUnavailable}`"
            :class="['issue-agent-run-unavailable', { 'issue-agent-run-action': badgeShown }]"
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
      </template>
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
      v-if="message"
      class="form-error issue-agent-run-error"
      role="alert">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { IconRobot, IconX } from '@tabler/icons-vue'

import AgentRunBadge from '~/components/agent-run-badge/AgentRunBadge.vue'
import DocsHelpLink from '~/components/docs-help-link/DocsHelpLink.vue'
import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

import type { IssueAgentRunDeps, IssueAgentRunViewModel } from './IssueAgentRun.deps'

const props = defineProps<{
  // Only the assignee hands an issue to the agent: the run goes to their own runner.
  assigneeIsCurrentUser: boolean
  // Keys of the issues that block this one and aren't completed yet.
  blockedBy: string[]
  canEdit: boolean
  deps: IssueAgentRunDeps
  issueKey: string
  // The issue is past not started: only a not started issue is handed off.
  issueStarted: boolean
  // What the issue's board lacks for the agent (not started, in progress, in review statuses).
  missingStatusCategories: StatusCategory[]
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
    created: 'Not started',
    handOff: 'Hand to agent',
    inProgress: 'In progress',
    issueStarted: 'Move the issue to a not started status to hand it to the agent.',
    locked: 'Editing is locked while the agent has the issue. Cancel the run to change it.',
    none: 'Not handed off',
    review: 'In review',
    stop: 'Stop agent',
    waitsFor: 'Blocked by {keys}: the agent starts once they are completed.',
  },
  ru: {
    agent: 'Агент',
    boardNotReady:
      'Чтобы передавать задачи агенту, добавьте на доску статусы для этапов: {statuses}.',
    cancel: 'Отменить запуск',
    cancelConfirm: 'Остановить агента на этой задаче?',
    created: 'Не начато',
    handOff: 'Передать агенту',
    inProgress: 'В работе',
    issueStarted: 'Переведите задачу в не начатый статус, чтобы передать её агенту.',
    locked: 'Пока задача у агента, её нельзя редактировать. Отмените запуск, чтобы изменить её.',
    none: 'Не передана',
    review: 'На проверке',
    stop: 'Остановить',
    waitsFor: 'Заблокирована задачами {keys}: агент начнёт, когда они будут завершены.',
  },
})

const confirm = useConfirm()

const headingId = useId()

const open = computed(() => props.run?.state === 'ready' || props.run?.state === 'working')
const badgeShown = computed(() => open.value || props.run?.state === 'failed')
const canHandOff = computed(() => props.canEdit && props.assigneeIsCurrentUser && !open.value)

const CATEGORY_KEYS = {
  Completed: null,
  Created: 'created',
  InProgress: 'inProgress',
  Review: 'review',
} as const satisfies Record<StatusCategory, 'created' | 'inProgress' | 'review' | null>

// Why the assignee can't hand the issue off yet: the agent moves it not started -> in progress -> in review.
const handOffUnavailable = computed(() => {
  if (!canHandOff.value) {
    return null
  }
  if (props.missingStatusCategories.length) {
    const statuses = props.missingStatusCategories
      .flatMap((category) => {
        const key = CATEGORY_KEYS[category]
        return key ? [t(key)] : []
      })
      .join(', ')
    return t('boardNotReady', { statuses })
  }
  return props.issueStarted ? t('issueStarted') : null
})

const handOffShown = computed(() => canHandOff.value && !handOffUnavailable.value)
// A working run already started; for any other state the blockers decide when the agent can start.
const waitsForBlockers = computed(
  () => props.blockedBy.length > 0 && props.run?.state !== 'working',
)

const { execute, message, pending } = useApiAction((action: () => Promise<void>) => action())

const handOff = async () => {
  if (await execute(() => props.deps.handOff({ issueKey: props.issueKey }))) {
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

.issue-agent-run-none {
  color: var(--color-muted);
}

.issue-agent-run-action {
  margin-left: auto;
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

.issue-agent-run-error,
.issue-agent-run-note {
  margin: 0;
}

.issue-agent-run-note {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}
</style>
