<template>
  <div class="heading">
    <div
      v-if="preTitle"
      class="heading-label">
      {{ preTitle }}
    </div>
    <h2 class="heading-title">{{ title }}</h2>
    <p
      v-if="postTitle"
      class="heading-sub">
      {{ postTitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  postTitle?: string
  preTitle?: string
  title: string
}>()
</script>

<style scoped>
/* The label reads like a status on the board: a ringed dot and a sentence-case name. */
.heading-label {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-full);
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  gap: 8px;
  height: 28px;
  margin-bottom: 20px;
  padding: 0 12px 0 10px;
}

.heading-label::before {
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  content: '';
  height: 10px;
  width: 10px;
}

.heading-title {
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.08;
  max-width: 20em;
  text-wrap: balance;
}

.heading-sub {
  color: var(--color-muted);
  font-size: var(--font-size-xl);
  line-height: 1.6;
  margin-top: 18px;
  max-width: 36em;
}

/* The authored line breaks only hold on wide screens; narrow ones wrap naturally. */
@media (width > 900px) {
  .heading-title {
    white-space: pre-line;
  }
}
</style>
