<!-- A list of BaseListRows in one card, the rows divided by lines. -->
<template>
  <div class="base-list">
    <slot />
  </div>
</template>

<style scoped>
.base-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  display: grid;
  /* Row hover fills stay inside the rounded corners. */
  overflow: hidden;
}
</style>
