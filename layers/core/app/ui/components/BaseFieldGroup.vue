<!-- Stacks BaseFields, labels above their controls, with one gap between them. -->
<template>
  <div class="base-field-group">
    <slot />
  </div>
</template>

<style scoped>
.base-field-group {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}
</style>
