<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled">
    <option value="">{{ t('none') }}</option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value">
      {{ option.label }}
    </option>
  </select>
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
