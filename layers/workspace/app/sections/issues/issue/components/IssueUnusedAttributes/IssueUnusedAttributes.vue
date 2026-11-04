<!-- Cells of the Properties grid around it, so the rows line up with the properties above. -->
<template>
  <template v-if="kept.length">
    <button
      :aria-expanded="open"
      class="unused-attributes-toggle"
      type="button"
      @click="open = !open">
      {{ t('notAvailableOnBoard') }}
      <span class="unused-attributes-count">{{ kept.length }}</span>
      <IconChevronDown class="unused-attributes-chevron" />
    </button>
    <template v-if="open">
      <template
        v-for="attribute in kept"
        :key="attribute.id">
        <span class="unused-attribute-name">{{ attribute.name }}</span>
        <span class="unused-attribute-value">
          <AttributeIcon :style="{ color: attribute.color }" />
          <span class="unused-attribute-text">{{ display(attribute) }}</span>
          <BaseIconButton
            v-if="!disabled"
            :label="`${t('clear')} ${attribute.name}`"
            @click="clear(attribute.id)">
            <IconX />
          </BaseIconButton>
        </span>
      </template>
    </template>
  </template>
</template>

<script setup lang="ts">
import { IconChevronDown, IconX } from '@tabler/icons-vue'
import { computed, ref } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import type { IssueAttributeField } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'

const props = withDefaults(
  defineProps<{
    attributes: IssueAttributeField[]
    disabled?: boolean
    modelValue: Record<string, string>
  }>(),
  { disabled: false },
)
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const { t } = useI18n({
  en: { clear: 'Clear', notAvailableOnBoard: 'Not available on this board' },
  ru: { clear: 'Очистить', notAvailableOnBoard: 'Недоступны на этой доске' },
})
const { formatDate, formatDateTime } = useFormatters()

const open = ref(false)

const kept = computed(() => props.attributes.filter((attribute) => props.modelValue[attribute.id]))

const display = (attribute: IssueAttributeField) => {
  const value = props.modelValue[attribute.id] ?? ''
  switch (attribute.type) {
    case 'list':
      return attribute.options.find((option) => option.value === value)?.label ?? value
    // A date has no time zone: read it as the local day, not UTC midnight.
    case 'date':
      return formatDate(`${value}T00:00:00`)
    case 'dateTime':
      return formatDateTime(value)
    default:
      return value
  }
}

const clear = (id: string) => {
  emit('update:modelValue', { ...props.modelValue, [id]: '' })
}
</script>

<style scoped>
.unused-attributes-toggle {
  align-items: center;
  background: none;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: var(--space-1);
  grid-column: 1 / -1;
  height: 100%;
  padding: 0;
  text-align: start;
}

.unused-attributes-toggle:hover {
  color: var(--color-text);
}

.unused-attributes-chevron {
  flex: none;
  transition: rotate var(--duration-fast) var(--ease-standard);
}

.unused-attributes-toggle[aria-expanded='true'] .unused-attributes-chevron {
  rotate: 180deg;
}

.unused-attributes-count {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  padding-inline: var(--space-2);
}

.unused-attribute-name {
  color: var(--color-muted);
  min-width: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unused-attribute-value {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding-left: calc(var(--space-3) + 1px);
}

.unused-attribute-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .unused-attributes-chevron {
    transition: none;
  }
}
</style>
