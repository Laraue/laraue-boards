<template>
  <div class="app-page">
    <slot name="header" />
    <div
      class="app-page-content"
      :class="{ padded }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean }>(), { padded: true })
</script>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.app-page-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.app-page-content.padded {
  padding: var(--layout-content-padding, var(--space-6));
}
</style>
