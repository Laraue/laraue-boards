<template>
  <input
    :id="id"
    v-model="model"
    :disabled="disabled"
    step="any"
    type="number" />
</template>

<script setup lang="ts">
defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
</script>
