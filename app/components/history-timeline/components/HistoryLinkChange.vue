<template>
  <span>{{ change.action === 'added' ? t('added') : t('removed') }}:</span>
  <div class="history-values">
    <span class="history-new-value">
      {{ t(change.relation) }}
      <NuxtLink
        v-if="change.issueKey"
        :to="organizationRoutes.issue(change.issueKey)">
        {{ change.issueKey }}
      </NuxtLink>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { HistoryLinkChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryLinkChangeViewModel }>()

const { t } = useI18n({
  en: {
    added: 'Added link',
    blockedBy: 'blocked by',
    blocks: 'blocks',
    duplicatedBy: 'duplicated by',
    duplicates: 'duplicates',
    relatesTo: 'relates to',
    removed: 'Removed link',
  },
  ru: {
    added: 'Связь добавлена',
    blockedBy: 'заблокирована',
    blocks: 'блокирует',
    duplicatedBy: 'дублируется',
    duplicates: 'дублирует',
    relatesTo: 'связана с',
    removed: 'Связь удалена',
  },
})

const organizationRoutes = useOrganizationRoutes()
</script>

<style scoped>
.history-values,
.history-new-value {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  min-width: 0;
}

.history-values {
  flex: 1;
}

.history-new-value {
  color: var(--color-text);
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
