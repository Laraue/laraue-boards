<template>
  <input
    :id="id"
    v-model="model"
    :autofocus="autofocus"
    :disabled="disabled"
    :placeholder="placeholder"
    :type="type" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    autofocus?: boolean
    disabled: boolean
    id: string
    placeholder?: string
    type?: 'search' | 'text'
  }>(),
  { autofocus: false, type: 'text' },
)
const model = defineModel<string>({ required: true })
</script>
