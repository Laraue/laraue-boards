<template>
  <label :for="`${id}-from`">{{ t('from') }}</label>
  <input
    :id="`${id}-from`"
    autofocus
    type="date"
    :value="model[0] ?? ''"
    @input="update(0, $event)" />
  <label :for="`${id}-to`">{{ t('to') }}</label>
  <input
    :id="`${id}-to`"
    type="date"
    :value="model[1] ?? ''"
    @input="update(1, $event)" />
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
label:first-child {
  margin-top: 0;
}

input {
  max-width: none;
}
</style>
