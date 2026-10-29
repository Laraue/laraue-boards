<!-- How an issue was created (the web app, Telegram, MCP, an agent), as a small icon. A native title, not a tooltip
     component: board cards and list rows render too many of them. -->
<template>
  <span
    :aria-label="label"
    class="issue-source-icon"
    role="img"
    :title="label">
    <component
      :is="ICONS[source.kind]"
      aria-hidden="true" />
  </span>
</template>

<script setup lang="ts">
import { IconBrandTelegram, IconBrowser, IconPlugConnected, IconRobot } from '@tabler/icons-vue'

import type { IssueSource } from './IssueSourceIcon.types'

const props = defineProps<{
  source: IssueSource
}>()

const { t } = useI18n({
  en: {
    agent: 'Created by agent',
    agentWithKey: 'Created by agent · {key}',
    mcp: 'Created via MCP',
    mcpWithKey: 'Created via MCP · {key}',
    telegram: 'Created from Telegram',
    web: 'Created in the web app',
  },
  ru: {
    agent: 'Создана агентом',
    agentWithKey: 'Создана агентом · {key}',
    mcp: 'Создана через MCP',
    mcpWithKey: 'Создана через MCP · {key}',
    telegram: 'Создана из Telegram',
    web: 'Создана в веб-приложении',
  },
})

const ICONS = {
  agent: IconRobot,
  mcp: IconPlugConnected,
  telegram: IconBrandTelegram,
  web: IconBrowser,
} as const satisfies Record<IssueSource['kind'], unknown>

const label = computed(() => {
  const { keyName, kind } = props.source
  if (kind === 'telegram' || kind === 'web') {
    return t(kind)
  }

  return keyName ? t(`${kind}WithKey`, { key: keyName }) : t(kind)
})
</script>

<style scoped>
.issue-source-icon {
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
}

.issue-source-icon .tabler-icon {
  height: 1em;
  width: 1em;
}
</style>
