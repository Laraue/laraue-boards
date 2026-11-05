<template>
  <BaseInput
    v-model="model"
    :aria-label="label"
    class="page-header-search"
    :placeholder="label"
    type="search" />
</template>

<script setup lang="ts">
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'

defineProps<{ label: string }>()
const model = defineModel<string>({ required: true })
</script>

<style scoped>
.page-header-search {
  max-width: none;
  min-width: 0;
  width: 10rem;
}
</style>
