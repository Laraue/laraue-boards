<template>
  <BaseDatePicker
    v-model="model"
    :aria-labelledby="`${id}-label`"
    :disabled="disabled" />
</template>

<script setup lang="ts">
// Named by the attribute's label, whose id is this field's id with "-label".
defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
</script>
