<template>
  <div class="range-filter">
    <BaseField
      :id="`${id}-from`"
      :label="t('minimum')">
      <input
        :id="`${id}-from`"
        autofocus
        step="any"
        type="number"
        :value="model[0] ?? ''"
        @input="update(0, $event)" />
    </BaseField>
    <BaseField
      :id="`${id}-to`"
      :label="t('maximum')">
      <input
        :id="`${id}-to`"
        step="any"
        type="number"
        :value="model[1] ?? ''"
        @input="update(1, $event)" />
    </BaseField>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'

defineProps<{ id: string }>()

const { t } = useI18n({
  en: { maximum: 'Maximum', minimum: 'Minimum' },
  ru: { maximum: 'Максимум', minimum: 'Минимум' },
})

const model = defineModel<string[]>({ required: true })

const update = (index: number, event: Event) => {
  const value = [...model.value]
  value[index] = (event.target as HTMLInputElement).value
  model.value = [value[0] ?? '', value[1] ?? '']
}
</script>

<style scoped>
.range-filter {
  display: grid;
  gap: var(--space-3);
}

input {
  max-width: none;
}
</style>
