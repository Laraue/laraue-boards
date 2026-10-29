<template>
  <section
    aria-labelledby="hero-heading"
    class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <div class="platform-badges">
          <slot name="badges" />
        </div>
        <p class="hero-eyebrow">{{ preTitle }}</p>
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
  /* A board's dotted canvas: the page opens on the surface the product lives on. */
  background-color: var(--color-background);
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-muted) 28%, transparent) 1px,
    transparent 1px
  );
  background-position: -11px -11px;
  background-size: 24px 24px;
  border-bottom: 1px solid var(--color-divider);
  padding: 120px 24px 96px;
  position: relative;
}

/* Fades the dots out towards the copy, so the text sits on a calm field. */
.hero::before {
  background: linear-gradient(100deg, var(--color-background) 35%, transparent 75%);
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.hero-inner {
  align-items: center;
  display: grid;
  gap: 64px;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
  position: relative;
}

.platform-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.hero-eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: 14px;
}

.hero-title {
  font-size: clamp(36px, 4.2vw, 60px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.035em;
  line-height: 1.04;
  margin-bottom: 24px;
  text-wrap: balance;
}

.hero-sub {
  color: var(--color-muted);
  font-size: var(--font-size-xl);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 34em;
}

.hero-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-visual {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

@media (width > 900px) {
  .hero-title {
    white-space: pre-line;
  }
}

@media (width <= 1000px) {
  .hero {
    padding: 96px 16px 72px;
  }

  .hero::before {
    background: linear-gradient(180deg, var(--color-background) 30%, transparent 70%);
  }

  .hero-inner {
    gap: 56px;
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-visual {
    justify-content: center;
  }
}
</style>
