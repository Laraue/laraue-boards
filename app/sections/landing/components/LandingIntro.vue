<template>
  <section
    aria-labelledby="hero-heading"
    class="hero">
    <slot name="background" />
    <div class="hero-inner">
      <div>
        <div class="platform-badges">
          <slot name="badges" />
        </div>
        <div class="hero-eyebrow">{{ preTitle }}</div>
        <h1
          id="hero-heading"
          class="hero-title">
          {{ title }}
        </h1>
        <p class="hero-sub">{{ postTitle }}</p>
        <div class="hero-actions">
          <slot name="actions" />
        </div>
      </div>
      <div class="hero-visual">
        <slot name="visual" />
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
.hero {
  align-items: center;
  background: var(--ink);
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  padding: 100px 60px 80px;
  position: relative;
}

.hero-inner {
  align-items: center;
  display: grid;
  gap: 80px;
  grid-template-columns: 1fr 1fr;
  margin: 0 auto;
  max-width: 1060px;
  position: relative;
  width: 100%;
  z-index: 1;
}

.platform-badges {
  align-items: center;
  animation: fade-up var(--anim-duration-lg) 0s var(--anim-ease) both;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
  opacity: 0;
}

.hero-eyebrow {
  animation: fade-up var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both;
  color: rgb(247 244 238 / 40%);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin-bottom: 16px;
  opacity: 0;
  text-transform: uppercase;
}

.hero-title {
  animation: fade-up var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both;
  color: #fff;
  font-family: var(--serif);
  font-size: clamp(32px, 4vw, 56px);
  letter-spacing: -0.5px;
  line-height: 1.05;
  margin-bottom: 12px;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.hero-sub {
  animation: fade-up var(--anim-duration-lg) calc(var(--anim-stagger) * 2) var(--anim-ease) both;
  color: rgb(247 244 238 / 60%);
  font-size: 18px;
  font-weight: 300;
  line-height: 1.65;
  margin-bottom: 36px;
  max-width: 460px;
}

.hero-actions {
  animation: fade-up var(--anim-duration-lg) calc(var(--anim-stagger) * 3) var(--anim-ease) both;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-visual {
  animation: fade-up var(--anim-duration-lg) var(--anim-stagger) var(--anim-ease) both;
  display: flex;
  justify-content: center;
  position: relative;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 860px) {
  .hero-visual {
    order: -1;
  }
}

@media (width <= 720px) {
  .hero {
    padding: 80px 22px 60px;
  }

  .hero-inner {
    gap: 48px;
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .platform-badges,
  .hero-eyebrow,
  .hero-title,
  .hero-sub,
  .hero-actions,
  .hero-visual {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
