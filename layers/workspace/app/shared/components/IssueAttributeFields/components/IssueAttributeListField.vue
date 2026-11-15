<template>
  <BaseSelect
    :id="id"
    v-model="model"
    :disabled="disabled"
    :options="[{ label: t('none'), value: '' }, ...options]" />
</template>

<script setup lang="ts">
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'

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
