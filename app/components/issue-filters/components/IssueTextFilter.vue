<template>
  <label :for="id">Value</label>
  <input
    :id="id"
    v-model="model"
    autofocus
    placeholder="Enter a value"
    type="search" />
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
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
