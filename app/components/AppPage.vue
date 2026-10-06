<template>
  <div
    class="app-page"
    :class="{ contained }">
    <slot name="header" />
    <div
      class="app-page-content"
      :class="{ padded }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ contained?: boolean; padded?: boolean }>(), { padded: true })
</script>

<style scoped>
.app-page {
  display: flex;
  flex-direction: column;
  min-height: min-content;
  min-width: 0;
}

.app-page-content {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.app-page-content.padded {
  padding: var(--layout-content-padding, var(--space-6));
}

.app-page.contained {
  min-height: 0;
}

.app-page.contained > .app-page-content {
  flex: 1;
}
</style>
