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
  type: 'cream' | 'light'
}>()
</script>

<style scoped>
.section {
  border-bottom: 1px solid var(--border);
  padding: 80px 60px;
}

.section.cream {
  background: var(--cream);
}

.section-inner {
  margin: 0 auto;
  max-width: 1060px;
}

.section-label {
  align-items: center;
  color: var(--accent);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: 0.14em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: 0.5;
}

.section-title {
  font-family: var(--serif);
  font-size: clamp(26px, 3vw, 42px);
  letter-spacing: -0.3px;
  line-height: 1.12;
  margin-bottom: 16px;
}

.section-sub {
  color: var(--muted);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.7;
  max-width: 560px;
}

@media (width <= 720px) {
  .section {
    padding: 60px 22px;
  }
}
</style>
