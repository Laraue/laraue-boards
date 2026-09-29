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
  background: linear-gradient(180deg, var(--ink) 0%, #050403 100%);
  overflow: hidden;
  padding: 100px 60px;
  position: relative;
  text-align: center;
}

.cta-section::before {
  background-image:
    linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px);
  background-size: 48px 48px;
  content: '';
  inset: 0;
  position: absolute;
}

.cta-section::after {
  background: radial-gradient(circle, rgb(200 75 47 / 18%) 0%, transparent 70%);
  content: '';
  height: 600px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 50%;
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
  color: rgb(247 244 238 / 35%);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.cta-title {
  color: #fff;
  font-family: var(--serif);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.08;
  margin-bottom: 16px;
}

.cta-sub {
  color: rgb(247 244 238 / 50%);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 40px;
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
