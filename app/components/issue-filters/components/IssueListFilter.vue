<template>
  <fieldset>
    <legend>Options</legend>
    <label
      v-for="option in options"
      :key="option.value">
      <input
        :checked="model.includes(option.value)"
        type="checkbox"
        @change="toggle(option.value)" />
      <span>{{ option.label }}</span>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{ options: Array<{ label: string; value: string }> }>()
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
  gap: var(--space-2);
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--space-1) var(--space-4);
}

legend {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}

label {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  margin: 0;
}
</style>
