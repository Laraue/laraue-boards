<template>
  <Transition name="slide-fade">
    <div
      v-if="count"
      class="bulk-bar">
      <span>{{ selectedLabel }}</span>
      <div class="bulk-actions">
        <BaseButton
          size="small"
          variant="ghost"
          @click="onClear">
          {{ t('clear') }}
        </BaseButton>
        <BaseButton
          size="small"
          variant="primary"
          @click="onAction">
          <IconArrowsLeftRight />
          {{ actionLabel }}
        </BaseButton>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { IconArrowsLeftRight } from '@tabler/icons-vue'

const props = defineProps<{
  actionLabel: string
  count: number
  onAction: () => void
  onClear: () => void
}>()
const { t } = useI18n({
  en: { clear: 'Clear', selected: '{count} selected' },
  ru: { clear: 'Очистить', selected: '{count} выбрано' },
})
const selectedLabel = computed(() => t('selected', { count: props.count }))
</script>

<style scoped>
.bulk-bar {
  align-items: center;
  background: var(--color-feed);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-body);
  gap: var(--space-3);
  justify-content: space-between;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.bulk-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
