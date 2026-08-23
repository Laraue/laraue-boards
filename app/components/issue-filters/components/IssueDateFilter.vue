<template>
  <label :for="`${id}-from`">From</label>
  <input
    :id="`${id}-from`"
    autofocus
    type="date"
    :value="model[0] ?? ''"
    @input="update(0, $event)" />
  <label :for="`${id}-to`">To</label>
  <input
    :id="`${id}-to`"
    type="date"
    :value="model[1] ?? ''"
    @input="update(1, $event)" />
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
const model = defineModel<string[]>({ required: true })

const update = (index: number, event: Event) => {
  const value = [...model.value]
  value[index] = (event.target as HTMLInputElement).value
  model.value = [value[0] ?? '', value[1] ?? '']
}
</script>

<style scoped>
label:first-child {
  margin-top: 0;
}

input {
  max-width: none;
}
</style>
