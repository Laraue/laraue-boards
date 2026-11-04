<template>
  <BaseInput
    :id="id"
    :disabled="disabled"
    inputmode="numeric"
    :model-value="model"
    pattern="-?[0-9]+"
    type="text"
    @input="update" />
</template>

<script setup lang="ts">
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'

defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
const update = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (/^-?\d*$/.test(input.value)) {
    model.value = input.value
  } else {
    input.value = model.value
  }
}
</script>
