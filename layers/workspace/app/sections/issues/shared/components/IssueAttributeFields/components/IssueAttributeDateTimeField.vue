<template>
  <AppDatePicker
    v-model="model"
    :aria-labelledby="`${id}-label`"
    :disabled="disabled"
    with-time />
</template>

<script setup lang="ts">
import AppDatePicker from '#layers/workspace/app/shared/components/AppDatePicker.vue'

// Named by the attribute's label, whose id is this field's id with "-label".
defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
</script>
