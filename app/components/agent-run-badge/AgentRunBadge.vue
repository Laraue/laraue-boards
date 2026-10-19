<!-- The issue's agent run while it matters: waiting for a runner, being worked on, or failed. A
     finished or cancelled run shows nothing. -->
<template>
  <!-- What the state means, as a tooltip (reachable by keyboard) where there's one badge, or as a native title
       on board cards, which render too many for tooltip components. -->
  <BaseTooltip
    v-if="shown && tooltip"
    :text="hint">
    <span
      :aria-label="`${t(shown)}: ${hint}`"
      class="agent-run-badge-hint"
      role="note"
      tabindex="0">
      <BaseBadge :variant="VARIANTS[shown]">
        <IconRobot class="agent-run-icon" />
        {{ t(shown) }}
      </BaseBadge>
    </span>
  </BaseTooltip>
  <BaseBadge
    v-else-if="shown"
    :title="hint"
    :variant="VARIANTS[shown]">
    <IconRobot class="agent-run-icon" />
    {{ t(shown) }}
  </BaseBadge>
</template>

<script setup lang="ts">
import { IconRobot } from '@tabler/icons-vue'

import type { AgentRunState } from './AgentRunBadge.types'

const props = defineProps<{
  state: AgentRunState
  // Explain the state in a tooltip instead of a native title.
  tooltip?: boolean
}>()

const { t } = useI18n({
  en: {
    failed: 'Agent failed',
    failedHint: "The agent couldn't finish. Open the issue to see why.",
    ready: 'For agent',
    readyHint: "Handed to the agent: waits for the assignee's runner to pick it up.",
    working: 'Agent working',
    workingHint: "The assignee's agent is working on this issue.",
  },
  ru: {
    failed: 'Агент не справился',
    failedHint: 'Агент не смог закончить. Причина — на странице задачи.',
    ready: 'Для агента',
    readyHint: 'Передана агенту: ждёт, пока её заберёт раннер исполнителя.',
    working: 'Агент работает',
    workingHint: 'Агент исполнителя работает над этой задачей.',
  },
})

const HINT_KEYS = {
  failed: 'failedHint',
  ready: 'readyHint',
  working: 'workingHint',
} as const

const VARIANTS = {
  failed: 'danger',
  ready: 'neutral',
  working: 'accent',
} as const

const shown = computed(() =>
  props.state === 'ready' || props.state === 'working' || props.state === 'failed'
    ? props.state
    : null,
)

const hint = computed(() => (shown.value ? t(HINT_KEYS[shown.value]) : ''))
</script>

<style scoped>
.agent-run-badge-hint {
  border-radius: var(--radius-full);
  display: inline-flex;
}

.agent-run-badge-hint:focus-visible {
  outline: 2px solid var(--color-focus);
}

.agent-run-icon {
  height: 12px;
  margin-right: var(--space-1);
  width: 12px;
}
</style>
