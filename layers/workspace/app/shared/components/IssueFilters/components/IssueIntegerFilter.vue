<template>
  <div class="range-filter">
    <BaseField
      :id="`${id}-from`"
      :label="t('minimum')">
      <BaseInput
        :id="`${id}-from`"
        autofocus
        :model-value="model[0] ?? ''"
        type="number"
        @update:model-value="update(0, $event)" />
    </BaseField>
    <BaseField
      :id="`${id}-to`"
      :label="t('maximum')">
      <BaseInput
        :id="`${id}-to`"
        :model-value="model[1] ?? ''"
        type="number"
        @update:model-value="update(1, $event)" />
    </BaseField>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'

defineProps<{ id: string }>()

const { t } = useI18n({
  en: { maximum: 'Maximum', minimum: 'Minimum' },
  ru: { maximum: 'Максимум', minimum: 'Минимум' },
})

const model = defineModel<string[]>({ required: true })

const update = (index: number, val: string) => {
  const value = [...model.value]
  value[index] = val
  model.value = [value[0] ?? '', value[1] ?? '']
}
</script>

<style scoped>
.range-filter {
  display: grid;
  gap: var(--space-3);
}

.range-filter :deep(.base-input) {
  max-width: none;
}
</style>
