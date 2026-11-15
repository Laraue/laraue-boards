<template>
  <div class="range-filter">
    <BaseField
      v-slot="{ labelId }"
      :label="t('from')">
      <AppDatePicker
        :aria-labelledby="labelId"
        :max="model[1] ?? ''"
        :model-value="model[0] ?? ''"
        with-time
        @update:model-value="update(0, $event)" />
    </BaseField>
    <BaseField
      v-slot="{ labelId }"
      :label="t('to')">
      <AppDatePicker
        :aria-labelledby="labelId"
        :min="model[0] ?? ''"
        :model-value="model[1] ?? ''"
        with-time
        @update:model-value="update(1, $event)" />
    </BaseField>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import AppDatePicker from '#layers/workspace/app/shared/components/AppDatePicker.vue'

const { t } = useI18n({
  en: { from: 'From', to: 'To' },
  ru: { from: 'От', to: 'До' },
})

const model = defineModel<string[]>({ required: true })

const update = (index: number, date: string) => {
  const value = [...model.value]
  value[index] = date
  model.value = [value[0] ?? '', value[1] ?? '']
}
</script>

<style scoped>
.range-filter {
  display: grid;
  gap: var(--space-3);
}
</style>
