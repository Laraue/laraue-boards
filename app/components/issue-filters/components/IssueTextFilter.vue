<template>
  <input
    :id="id"
    v-model="model"
    :aria-label="t('value')"
    autofocus
    :placeholder="t('enterValue')"
    type="text" />
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
input {
  max-width: none;
}
</style>
