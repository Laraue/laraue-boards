<!-- The issue's agent run while it matters: waiting for a runner, being worked on, or failed. A
     finished or cancelled run shows nothing. -->
<template>
  <BaseBadge
    v-if="shown"
    :variant="VARIANTS[shown]">
    <IconRobot class="agent-run-icon" />
    {{ t(shown) }}
  </BaseBadge>
</template>

<script setup lang="ts">
import { IconRobot } from '@tabler/icons-vue'

import type { AgentRunState } from './AgentRunBadge.types'

const props = defineProps<{ state: AgentRunState }>()

const { t } = useI18n({
  en: {
    failed: 'Agent failed',
    ready: 'For agent',
    working: 'Agent working',
  },
  ru: {
    failed: 'Агент не справился',
    ready: 'Для агента',
    working: 'Агент работает',
  },
})

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
</script>

<style scoped>
.agent-run-icon {
  height: 12px;
  margin-right: var(--space-1);
  width: 12px;
}
</style>
