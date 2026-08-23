<template>
  <template
    v-for="attribute in attributes"
    :key="attribute.id">
    <label :for="`${idPrefix}-${attribute.id}`">
      {{ attribute.name }}
    </label>
    <div class="attribute-field">
      <span
        class="attribute-dot"
        :style="{ background: attribute.color }" />
      <IssueAttributeTextField
        v-if="attribute.type === 'text'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeListField
        v-else-if="attribute.type === 'list'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        :options="attribute.options"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeIntegerField
        v-else-if="attribute.type === 'integer'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
        @update:model-value="update(attribute.id, $event)" />
      <IssueAttributeDecimalField
        v-else-if="attribute.type === 'decimal'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :model-value="modelValue[attribute.id] ?? ''"
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
    </div>
  </template>
</template>

<script setup lang="ts">
import { assertNever } from '~/utils/assertNever'

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
  }>(),
  {
    disabled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()
const idPrefix = useId()

const update = (id: string, value: string) => {
  const next = { ...props.modelValue }
  next[id] = value
  emit('update:modelValue', next)
}
</script>

<style scoped>
.attribute-field {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr);
}

.attribute-dot {
  border-radius: var(--radius-pill);
  height: 8px;
  width: 8px;
}
</style>
