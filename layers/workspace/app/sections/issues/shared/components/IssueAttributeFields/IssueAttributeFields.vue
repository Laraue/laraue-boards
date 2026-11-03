<template>
  <template
    v-for="attribute in attributes"
    :key="attribute.id">
    <label
      :id="`${idPrefix}-${attribute.id}-label`"
      :class="{ 'attribute-label-muted': isMuted(attribute.id) }"
      :for="`${idPrefix}-${attribute.id}`">
      {{ attribute.name }}
    </label>
    <div
      class="attribute-field"
      :class="{
        'attribute-field-inline': selectVariant === 'inline',
        'attribute-field-muted': isMuted(attribute.id),
      }">
      <AttributeIcon
        class="attribute-icon"
        :style="{ color: attribute.color }" />
      <IssueAttributeTextField
        v-if="attribute.type === 'text'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        :placeholder="placeholder"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeListField
        v-else-if="attribute.type === 'list'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        :options="attribute.options"
        :variant="selectVariant"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeIntegerField
        v-else-if="attribute.type === 'integer'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        :placeholder="placeholder"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeDecimalField
        v-else-if="attribute.type === 'decimal'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        :placeholder="placeholder"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeDateField
        v-else-if="attribute.type === 'date'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeDateTimeField
        v-else-if="attribute.type === 'dateTime'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        @update:model-value="update(attribute.id, $event)" />
      <template v-else>{{ assertNever(attribute) }}</template>
      <!-- A native title, like the issue lists' marks: says why the row is quieter. -->
      <span
        v-if="isMuted(attribute.id)"
        :aria-label="mutedHint"
        class="attribute-muted-mark"
        role="img"
        :title="mutedHint">
        <IconEyeOff
          aria-hidden="true"
          :size="16" />
      </span>
    </div>
  </template>
</template>

<script setup lang="ts">
import { IconEyeOff } from '@tabler/icons-vue'
import { computed, useId } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { BaseSelectVariant } from '#layers/core/app/ui/components/BaseSelect.vue'
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import IssueAttributeDateField from './components/IssueAttributeDateField.vue'
import IssueAttributeDateTimeField from './components/IssueAttributeDateTimeField.vue'
import IssueAttributeDecimalField from './components/IssueAttributeDecimalField.vue'
import IssueAttributeIntegerField from './components/IssueAttributeIntegerField.vue'
import IssueAttributeListField from './components/IssueAttributeListField.vue'
import IssueAttributeTextField from './components/IssueAttributeTextField.vue'
import type { IssueAttributeField } from './IssueAttributeFields.types'

const props = withDefaults(
  defineProps<{
    attributes: IssueAttributeField[]
    disabled?: boolean
    modelValue: Record<string, string>
    // Quieter rows, still editable - e.g. attributes the issue's board doesn't use - each marked with
    // mutedHint, which says why.
    mutedHint?: string
    mutedIds?: string[]
    selectVariant?: BaseSelectVariant
  }>(),
  {
    disabled: false,
    mutedHint: undefined,
    mutedIds: () => [],
    selectVariant: 'default',
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()
const idPrefix = useId()

const { t } = useI18n({
  en: { empty: 'Empty' },
  ru: { empty: 'Пусто' },
})
// Inline, an empty field has no border, so the hint shows that there is a value to set.
const placeholder = computed(() => (props.selectVariant === 'inline' ? t('empty') : undefined))

const isMuted = (id: string) => props.mutedIds.includes(id)

const update = (id: string, value: string) => {
  const next = { ...props.modelValue }
  next[id] = value
  emit('update:modelValue', next)
}
</script>

<style scoped>
/* The icon sits inside the field, where a select shows its own icon. */
.attribute-field {
  display: grid;
  min-width: 0;
  position: relative;
}

.attribute-field-inline :deep(input) {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  field-sizing: content;
  justify-self: start;
  max-width: 100%;
  min-width: calc(var(--space-8) * 2);
  width: auto;
}

.attribute-field-inline :deep(input:hover:not(:disabled, :focus)) {
  border-color: var(--color-border-hover);
}

.attribute-field-inline :deep(input:focus) {
  border-color: var(--color-focus);
}

/* Muted fields: the values in the muted color and the icon toned down, the controls still work; the
   mark at the end says why. */
.attribute-field-muted {
  align-items: center;
  column-gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr) auto;
}

.attribute-muted-mark {
  color: var(--color-muted);
  display: inline-flex;
}

.attribute-field-muted :deep(input),
.attribute-field-muted :deep(button) {
  color: var(--color-muted);
}

.attribute-field-muted .attribute-icon {
  opacity: 0.6;
}

/* A date picker in Properties reads as the other inline values: no frame until hover or focus. */
.attribute-field-inline :deep(.base-date-picker-root) {
  justify-self: start;
  max-width: 100%;
}

.attribute-field-inline :deep(.base-date-picker) {
  background: transparent;
  border-color: transparent;
}

.attribute-field-inline :deep(.base-date-picker:hover:not([data-disabled], :focus-within)) {
  border-color: var(--color-border-hover);
}

.attribute-field-inline :deep(.base-date-picker:focus-within) {
  border-color: var(--color-focus);
}

.attribute-icon {
  left: calc(var(--space-3) + 1px);
  pointer-events: none;
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  z-index: 1;
}

.attribute-field :deep(:is(input, .base-select, .base-date-picker)) {
  padding-left: calc(var(--space-3) + var(--icon-size) + var(--space-2));
}
</style>
