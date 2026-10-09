<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  /* Rows and their hover fill stay inside the rounded corners. */
  overflow: hidden;
}
</style>
