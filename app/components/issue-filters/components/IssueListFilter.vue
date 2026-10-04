<template>
  <fieldset :aria-label="t('options')">
    <BaseCheckbox
      v-for="option in options"
      :key="option.value"
      :model-value="model.includes(option.value)"
      @update:model-value="toggle(option.value)">
      {{ option.label }}
    </BaseCheckbox>
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{ options: Array<{ label: string; value: string }> }>()

const { t } = useI18n({
  en: { options: 'Options' },
  ru: { options: 'Варианты' },
})

const model = defineModel<string[]>({ required: true })

const toggle = (option: string) => {
  model.value = model.value.includes(option)
    ? model.value.filter((value) => value !== option)
    : [...model.value, option]
}
</script>

<style scoped>
fieldset {
  border: 0;
  display: grid;
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--space-1) var(--space-4);
}
</style>
