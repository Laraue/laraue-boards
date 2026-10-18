<!-- The issue's agent run in the properties: its state, "Hand to agent" for the assignee (their own
     runner picks it up), and "Cancel run" for anyone who can edit the issue. A run is open while it is
     ready or working, and the issue's fields are locked meanwhile. A blocked issue can be handed off:
     its run waits until the blockers are completed, which the note says. -->
<template>
  <div class="issue-agent-run">
    <AgentRunBadge
      v-if="run"
      :state="run.state"
      :title="run.failureReason ?? undefined" />
    <span
      v-if="!badgeShown"
      class="issue-agent-run-none">
      {{ t('none') }}
    </span>
    <template v-if="canEdit">
      <BaseButton
        v-if="open && run"
        :loading="pending"
        size="small"
        variant="ghost"
        @click="cancel(run.id)">
        {{ t('cancel') }}
      </BaseButton>
      <BaseButton
        v-else-if="assigneeIsCurrentUser"
        :loading="pending"
        size="small"
        variant="ghost"
        @click="handOff">
        {{ t('handOff') }}
      </BaseButton>
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
</template>

<script setup lang="ts">
import AgentRunBadge from '~/components/agent-run-badge/AgentRunBadge.vue'

import type { IssueAgentRunDeps, IssueAgentRunViewModel } from './IssueAgentRun.deps'

const props = defineProps<{
  // Only the assignee hands an issue to the agent: the run goes to their own runner.
  assigneeIsCurrentUser: boolean
  // Keys of the issues that block this one and aren't completed yet.
  blockedBy: string[]
  canEdit: boolean
  deps: IssueAgentRunDeps
  issueKey: string
  onChanged: () => Promise<void> | void
  run: IssueAgentRunViewModel | null
}>()

const { t } = useI18n({
  en: {
    cancel: 'Cancel run',
    cancelConfirm: 'Stop the agent on this issue?',
    handOff: 'Hand to agent',
    locked: 'Editing is locked while the agent has the issue. Cancel the run to change it.',
    none: 'Not handed off',
    stop: 'Stop agent',
    waitsFor: 'Blocked by {keys}: the agent starts once they are completed.',
  },
  ru: {
    cancel: 'Отменить запуск',
    cancelConfirm: 'Остановить агента на этой задаче?',
    handOff: 'Передать агенту',
    locked: 'Пока задача у агента, её нельзя редактировать. Отмените запуск, чтобы изменить её.',
    none: 'Не передана',
    stop: 'Остановить',
    waitsFor: 'Заблокирована задачами {keys}: агент начнёт, когда они будут завершены.',
  },
})

const confirm = useConfirm()

const open = computed(() => props.run?.state === 'ready' || props.run?.state === 'working')
const badgeShown = computed(() => open.value || props.run?.state === 'failed')
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
.issue-agent-run {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  min-width: 0;
  padding: 0 var(--space-3);
}

.issue-agent-run-none {
  color: var(--color-muted);
}

.issue-agent-run-error,
.issue-agent-run-note {
  grid-column: 1 / -1;
  margin: 0;
}

.issue-agent-run-note {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}
</style>
