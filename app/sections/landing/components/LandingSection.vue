<template>
  <section
    class="section"
    :class="type">
    <div class="section-inner">
      <div>
        <div
          v-if="preTitle"
          class="section-label reveal">
          {{ preTitle }}
        </div>
        <h2 class="section-title reveal">{{ title }}</h2>
        <p class="section-sub reveal">{{ postTitle }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  postTitle?: string
  preTitle?: string
  title?: string
  type: 'alt' | 'plain'
}>()
</script>

<style scoped>
.section {
  border-bottom: 1px solid var(--color-divider);
  padding: 88px 24px;
}

.section.alt {
  background: var(--color-workspace);
}

.section-inner {
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
}

.section-label {
  align-items: center;
  color: var(--color-accent);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  gap: 8px;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--color-accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: 0.5;
}

.section-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}

.section-sub {
  color: var(--color-muted);
  font-size: 17px;
  line-height: 1.7;
  max-width: 560px;
}

@media (width <= 720px) {
  .section {
    padding: 60px 22px;
  }
}
</style>
