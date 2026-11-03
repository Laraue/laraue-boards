<!-- An attribute in the list being reordered: a drag handle, its icon and name. -->
<template>
  <div
    ref="element"
    class="order-row"
    :class="{ 'order-row--dragging': isDragging }">
    <div ref="handle">
      <BaseIconButton
        :disabled="disabled"
        :label="`${t('reorder')} ${name}`"
        style="cursor: grab; touch-action: none">
        <IconGripVertical />
      </BaseIconButton>
    </div>
    <AttributeIcon :style="{ color }" />
    <span class="order-row-name">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { IconGripVertical } from '@tabler/icons-vue'
import { computed, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'

const props = defineProps<{
  color: string
  disabled: boolean
  id: string
  index: number
  name: string
}>()

const { t } = useI18n({
  en: { reorder: 'Move' },
  ru: { reorder: 'Переместить' },
})

const element = useTemplateRef('element')
const handleRoot = useTemplateRef('handle')
const handle = computed(() => handleRoot.value?.querySelector<HTMLButtonElement>('button') ?? null)
const { isDragging } = useSortable({
  disabled: computed(() => props.disabled),
  element,
  handle,
  id: computed(() => props.id),
  index: computed(() => props.index),
})
</script>

<style scoped>
.order-row {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-height: 2.75rem;
  padding: var(--space-1) var(--space-2);
}

.order-row + .order-row {
  border-top: 1px solid var(--color-divider);
}

.order-row--dragging {
  opacity: 0.45;
}

.order-row-name {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
