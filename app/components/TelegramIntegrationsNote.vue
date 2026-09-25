<template>
  <p class="integration-note">
    <Info aria-hidden="true" />
    <span>
      Telegram integrations — saving chat messages as issues, /save, and inline search — work only
      when you sign in with Telegram. A Google account can use the web app only.
    </span>
  </p>
</template>

<script setup lang="ts">
import { Info } from '@lucide/vue'
</script>

<style scoped>
.integration-note {
  align-items: flex-start;
  background: var(--color-accent-soft);
  border-radius: var(--radius-control);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  line-height: 1.5;
  margin: 0;
  padding: var(--space-3);
  text-align: left;
}

.integration-note .lucide {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 16px;
  width: 16px;
}
</style>
