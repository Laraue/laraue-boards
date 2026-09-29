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
  background: #17151f;
  border-top: 1px solid rgb(255 255 255 / 10%);
  overflow: hidden;
  padding: 80px 60px;
  position: relative;
}

.features-inner {
  margin: 0 auto;
  max-width: 1060px;
}

.section-label {
  align-items: center;
  color: rgb(247 244 238 / 40%);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: 0.14em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: rgb(247 244 238 / 20%);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
}

.section-title {
  color: #fff;
  font-family: var(--serif);
  font-size: clamp(26px, 3vw, 42px);
  letter-spacing: -0.3px;
  line-height: 1.12;
  margin-bottom: 16px;
}

.section-sub {
  color: rgb(247 244 238 / 50%);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.7;
  max-width: 560px;
}

.features-grid {
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 52px;
}

.feat-cell {
  background: rgb(255 255 255 / 4%);
  border: 1px solid rgb(255 255 255 / 8%);
  color: inherit;
  padding: 30px 26px;
  text-decoration: none;
  transition: background 0.2s;
}

.feat-cell:hover {
  background: rgb(255 255 255 / 7%);
}

.feat-icon {
  align-items: center;
  background: var(--accent-light);
  border-radius: 11px;
  color: var(--accent);
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
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.1px;
  margin-bottom: 9px;
}

.feat-desc {
  color: rgb(247 244 238 / 45%);
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
