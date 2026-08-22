<template>
  <input
    :id="id"
    v-model="model"
    :autofocus="autofocus"
    :disabled="disabled"
    :step="1"
    type="datetime-local" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ autofocus?: boolean; disabled: boolean; id: string }>(), {
  autofocus: false,
})
const model = defineModel<string>({ required: true })
</script>
