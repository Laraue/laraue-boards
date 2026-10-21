<!-- The issue's agent run, once the issue was ever handed off - the badge stays: waiting for a runner, being
     worked on, failed, done and waiting for review (while the issue is in a Review status), done, or cancelled. -->
<template>
  <!-- What the state means, as a tooltip (reachable by keyboard) where there's one badge, or as a native title
       on board cards, which render too many for tooltip components. -->
  <BaseTooltip
    v-if="tooltip"
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
    v-else
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
  // The issue is in a Review status: a done run then asks the person to check it.
  inReview?: boolean
  state: AgentRunState
  // Explain the state in a tooltip instead of a native title.
  tooltip?: boolean
}>()

const { t } = useI18n({
  en: {
    cancelled: 'Agent cancelled',
    cancelledHint: 'The agent run was cancelled.',
    done: 'Done by agent',
    doneHint: 'The agent worked on this issue.',
    failed: 'Agent failed',
    failedHint: "The agent couldn't finish. Open the issue to see why.",
    ready: 'For agent',
    readyHint: "Handed to the agent: waits for the assignee's runner to pick it up.",
    review: 'Agent done · review',
    reviewHint: 'The agent finished: check its changes, then move the issue on or send it back.',
    working: 'Agent working',
    workingHint: "The assignee's agent is working on this issue.",
  },
  ru: {
    cancelled: 'Агент отменён',
    cancelledHint: 'Запуск агента отменён.',
    done: 'Сделано агентом',
    doneHint: 'Агент работал над этой задачей.',
    failed: 'Агент не справился',
    failedHint: 'Агент не смог закончить. Причина — на странице задачи.',
    ready: 'Для агента',
    readyHint: 'Передана агенту: ждёт, пока её заберёт раннер исполнителя.',
    review: 'Агент готов · проверьте',
    reviewHint:
      'Агент закончил: проверьте изменения, затем двигайте задачу дальше или верните агенту.',
    working: 'Агент работает',
    workingHint: 'Агент исполнителя работает над этой задачей.',
  },
})

type Shown = 'cancelled' | 'done' | 'failed' | 'ready' | 'review' | 'working'

const HINT_KEYS = {
  cancelled: 'cancelledHint',
  done: 'doneHint',
  failed: 'failedHint',
  ready: 'readyHint',
  review: 'reviewHint',
  working: 'workingHint',
} as const satisfies Record<Shown, string>

const VARIANTS = {
  cancelled: 'neutral',
  done: 'success',
  failed: 'danger',
  ready: 'neutral',
  review: 'warning',
  working: 'accent',
} as const satisfies Record<Shown, string>

const shown = computed((): Shown => {
  if (props.state === 'done') {
    return props.inReview ? 'review' : 'done'
  }

  return props.state
})

const hint = computed(() => t(HINT_KEYS[shown.value]))
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
