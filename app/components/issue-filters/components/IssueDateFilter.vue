<template>
  <div class="range-filter">
    <BaseField
      :id="`${id}-from`"
      :label="t('from')">
      <input
        :id="`${id}-from`"
        autofocus
        type="date"
        :value="model[0] ?? ''"
        @input="update(0, $event)" />
    </BaseField>
    <BaseField
      :id="`${id}-to`"
      :label="t('to')">
      <input
        :id="`${id}-to`"
        type="date"
        :value="model[1] ?? ''"
        @input="update(1, $event)" />
    </BaseField>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()

const { t } = useI18n({
  en: { from: 'From', to: 'To' },
  ru: { from: 'От', to: 'До' },
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
