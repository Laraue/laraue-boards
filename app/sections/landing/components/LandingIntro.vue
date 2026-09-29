<template>
  <section
    aria-labelledby="hero-heading"
    class="hero">
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
  background: radial-gradient(
    circle at 88% -8%,
    color-mix(in srgb, var(--color-accent) 10%, transparent),
    transparent 55%
  );
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  padding: 100px 24px 80px;
  position: relative;
}

.hero-inner {
  align-items: center;
  display: grid;
  gap: 80px;
  grid-template-columns: 1fr 1fr;
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
  position: relative;
  width: 100%;
  z-index: 1;
}

.platform-badges {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.hero-eyebrow {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.03em;
  line-height: 1.08;
  margin-bottom: 16px;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.hero-sub {
  color: var(--color-muted);
  font-size: 18px;
  line-height: 1.65;
  margin-bottom: 36px;
  max-width: 460px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-visual {
  display: flex;
  /* The right edge of the content, where the header ends too. */
  justify-content: flex-end;
  position: relative;
}

@media (width <= 720px) {
  .hero {
    padding: 80px 22px 60px;
  }

  .hero-inner {
    gap: 48px;
    grid-template-columns: 1fr;
  }

  .hero-visual {
    justify-content: center;
  }
}
</style>
