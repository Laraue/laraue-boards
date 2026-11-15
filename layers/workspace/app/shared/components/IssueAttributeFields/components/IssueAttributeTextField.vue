<template>
  <BaseInput
    :id="id"
    v-model="model"
    :disabled="disabled"
    type="text" />
</template>

<script setup lang="ts">
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'

defineProps<{ disabled: boolean; id: string }>()
const model = defineModel<string>({ required: true })
</script>
