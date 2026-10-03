<template>
  <BaseSelect
    :id="id"
    v-model="model"
    :disabled="disabled"
    :options="[{ label: t('none'), value: '' }, ...options]" />
</template>

<script setup lang="ts">
defineProps<{
  disabled: boolean
  id: string
  options: Array<{ label: string; value: string }>
}>()

const { t } = useI18n({
  en: { none: 'None' },
  ru: { none: 'Нет' },
})

const model = defineModel<string>({ required: true })
</script>
