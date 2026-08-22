<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled">
    <option value="">None</option>
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
const model = defineModel<string>({ required: true })
</script>
