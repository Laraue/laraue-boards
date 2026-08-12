<template>
  <div class="empty-state">
    <strong>{{ title }}</strong>
    <p
      v-if="hint"
      class="muted">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hint?: string; title: string }>()
</script>

<style scoped>
.empty-state {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.empty-state p {
  line-height: 1.6;
  max-width: 420px;
}

</style>
