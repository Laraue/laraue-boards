<template>
  <section class="features">
    <div class="features-inner">
      <div class="section-label reveal">{{ preTitle }}</div>
      <h2 class="section-title reveal">{{ title }}</h2>
      <p class="section-sub reveal">{{ postTitle }}</p>
      <div class="features-grid">
        <NuxtLink
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feat-cell reveal"
          :style="{ animationDelay: `min(calc(var(--anim-stagger-sm) * ${index}), calc(var(--anim-stagger-sm) * 8))` }"
          :to="feature.link">
          <div class="feat-icon">
            <LandingIcon :name="feature.icon" />
          </div>
          <h3 class="feat-title">{{ feature.title }}</h3>
          <div class="feat-desc">{{ feature.description }}</div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingIconName } from './LandingIcon.vue'

import LandingIcon from './LandingIcon.vue'

export type LandingFeature = {
  description: string
  icon: LandingIconName
  link: string
  title: string
}

defineProps<{
  features: LandingFeature[]
  postTitle: string
  preTitle: string
  title: string
}>()
</script>

<style scoped>
.features {
  border-bottom: 1px solid var(--color-divider);
  padding: 88px 60px;
}

.features-inner {
  margin: 0 auto;
  max-width: 1060px;
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

.features-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 48px;
}

.feat-cell {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  color: inherit;
  padding: 28px 24px;
  text-decoration: none;
  transition:
    border-color var(--duration-base),
    transform var(--duration-base);
}

.feat-cell:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.feat-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: flex;
  height: 44px;
  justify-content: center;
  margin-bottom: 14px;
  width: 44px;
}

.feat-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.feat-title {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 8px;
}

.feat-desc {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.6;
}

@media (width <= 900px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (width <= 720px) {
  .features {
    padding: 60px 22px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
