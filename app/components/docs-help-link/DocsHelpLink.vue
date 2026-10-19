<!-- A question-mark icon beside a section heading that opens the section's documentation page in a new tab. -->
<template>
  <BaseIconButton
    class="docs-help-link"
    :label="t('open', { topic })"
    rel="noopener noreferrer"
    target="_blank"
    :to="docsPath(locale, path)"
    :tooltip="t('hint')">
    <IconHelpCircle />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { IconHelpCircle } from '@tabler/icons-vue'

import { docsPath } from '~/sections/docs/docsPaths'

defineProps<{
  // The page under /documentation, e.g. ['features', 'issue-links'].
  path: string[]
  // What the page explains, for the link's accessible name: "Links", "Agent".
  topic: string
}>()

const { locale, t } = useI18n({
  en: {
    hint: 'How it works',
    open: '{topic}: how it works (opens the documentation in a new tab)',
  },
  ru: {
    hint: 'Как это работает',
    open: '{topic}: как это работает (документация откроется в новой вкладке)',
  },
})
</script>

<style scoped>
.docs-help-link {
  color: var(--color-muted);
}
</style>
