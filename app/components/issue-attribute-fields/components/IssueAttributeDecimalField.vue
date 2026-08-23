<template>
  <input
    :id="id"
    :disabled="disabled"
    inputmode="numeric"
    pattern="-?[0-9]+(?:\.[0-9]+)?"
    type="text"
    :value="model"
    @input="update" />
</template>

<script setup lang="ts">
defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
const update = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (/^-?\d*(?:\.\d*)?$/.test(input.value)) {
    model.value = input.value
  } else {
    input.value = model.value
  }
}
</script>
