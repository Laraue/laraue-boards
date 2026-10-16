<!-- The issue's agent run in the properties: its state, and "Hand to agent" or "Cancel" for
     someone who can edit the issue. A run is open while it is ready or working. -->
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
        v-else
        :loading="pending"
        size="small"
        variant="ghost"
        @click="handOff">
        {{ t('handOff') }}
      </BaseButton>
    </template>
  </div>
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
    none: 'Not handed off',
    stop: 'Stop agent',
  },
  ru: {
    cancel: 'Отменить запуск',
    cancelConfirm: 'Остановить агента на этой задаче?',
    handOff: 'Передать агенту',
    none: 'Не передана',
    stop: 'Остановить',
  },
})

const confirm = useConfirm()

const open = computed(() => props.run?.state === 'ready' || props.run?.state === 'working')
const badgeShown = computed(() => open.value || props.run?.state === 'failed')

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

.issue-agent-run-error {
  grid-column: 1 / -1;
  margin: 0;
}
</style>
