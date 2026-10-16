<template>
  <section
    class="section"
    :class="[type, { split }]">
    <div class="section-inner">
      <div class="section-head">
        <div
          v-if="preTitle"
          class="section-label">
          {{ preTitle }}
        </div>
        <h2 class="section-title">{{ title }}</h2>
        <p
          v-if="postTitle"
          class="section-sub">
          {{ postTitle }}
        </p>
      </div>
      <div class="section-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  postTitle?: string
  preTitle?: string
  /** The heading stays in a narrow column on the left while the content runs beside it. */
  split?: boolean
  title?: string
  type: 'alt' | 'plain'
}>()
</script>

<style scoped>
.section {
  border-bottom: 1px solid var(--color-divider);
  padding: 112px 24px;
}

.section.alt {
  background: var(--color-workspace);
}

.section-inner {
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
}

/* The label reads like a status on the board: a ringed dot and a sentence-case name. */
.section-label {
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

.section-label::before {
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  content: '';
  height: 10px;
  width: 10px;
}

.section-title {
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.08;
  margin-bottom: 18px;
  max-width: 20em;
  text-wrap: balance;
}

.section-sub {
  color: var(--color-muted);
  font-size: var(--font-size-xl);
  line-height: 1.6;
  max-width: 36em;
}

.section-body {
  margin-top: 56px;
}

.split .section-inner {
  align-items: start;
  display: grid;
  gap: 64px;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
}

.split .section-head {
  position: sticky;
  top: 96px;
}

.split .section-body {
  margin-top: 0;
}

@media (width > 900px) {
  .section-title {
    white-space: pre-line;
  }
}

@media (width <= 900px) {
  .section {
    padding: 72px 16px;
  }

  .section-body {
    margin-top: 40px;
  }

  .split .section-inner {
    display: block;
  }

  .split .section-head {
    position: static;
  }

  .split .section-body {
    margin-top: 40px;
  }
}
</style>
