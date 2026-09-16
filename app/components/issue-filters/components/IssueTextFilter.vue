<template>
  <label :for="id">{{ t('value') }}</label>
  <input
    :id="id"
    v-model="model"
    autofocus
    :placeholder="t('enterValue')"
    type="search" />
</template>

<script setup lang="ts">
defineProps<{ id: string }>()

const { t } = useI18n({
  en: { enterValue: 'Enter a value', value: 'Value' },
  ru: { enterValue: 'Введите значение', value: 'Значение' },
})

const model = defineModel<string>({ required: true })
</script>

<style scoped>
label {
  margin-top: 0;
}

input {
  max-width: none;
}
</style>
