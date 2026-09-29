<template>
  <section class="cta-section">
    <div class="cta-inner">
      <div class="cta-label reveal">{{ preTitle }}</div>
      <h2 class="cta-title reveal">{{ title }}</h2>
      <p class="cta-sub reveal">{{ postTitle }}</p>
      <div class="cta-actions reveal">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  postTitle: string
  preTitle: string
  title: string
}>()
</script>

<style scoped>
.cta-section {
  --btn-site-bg: #fff;
  --btn-site-color: var(--color-accent);
  --btn-site-hover: color-mix(in srgb, #fff 88%, transparent);
  --btn-alt-bg: transparent;
  --btn-alt-border: rgb(255 255 255 / 50%);
  --btn-alt-color: #fff;
  --btn-alt-hover: rgb(255 255 255 / 14%);

  background: var(--landing-cta-bg);
  border-bottom: 1px solid var(--landing-cta-border);
  border-top: 1px solid var(--landing-cta-border);
  color: #fff;
  overflow: hidden;
  padding: 96px 60px;
  position: relative;
  text-align: center;
}

.cta-section::after {
  background: radial-gradient(circle, rgb(255 255 255 / 16%) 0%, transparent 70%);
  content: '';
  height: 600px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%);
  width: 600px;
}

.cta-inner {
  margin: 0 auto;
  max-width: 640px;
  position: relative;
  z-index: 1;
}

.cta-label {
  color: rgb(255 255 255 / 70%);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.cta-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.12;
  margin-bottom: 16px;
}

.cta-sub {
  color: rgb(255 255 255 / 80%);
  font-size: 17px;
  line-height: 1.6;
  margin-bottom: 36px;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
}

@media (width <= 720px) {
  .cta-section {
    padding: 60px 22px;
  }
}
</style>
