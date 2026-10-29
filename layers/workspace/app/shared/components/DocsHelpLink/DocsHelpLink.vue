<!-- A question-mark icon beside a section heading that opens the section's documentation page in a new tab. -->
<template>
  <BaseIconButton
    class="docs-help-link"
    :label="t('open', { topic })"
    rel="noopener noreferrer"
    target="_blank"
    :to="localePath({ name: 'documentation-path', params: { path: path } }, locale)"
    :tooltip="t('hint')">
    <IconHelpCircle />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { IconHelpCircle } from '@tabler/icons-vue'

import { useLocalePath } from '#imports'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'

defineProps<{
  // The page under /documentation, e.g. ['features', 'issue-links'].
  path: string[]
  // What the page explains, for the link's accessible name: "Links", "Agent".
  topic: string
}>()

const localePath = useLocalePath()
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
