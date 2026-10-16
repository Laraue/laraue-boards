<template>
  <div class="info-card">
    <div class="info-card-head">
      <div class="info-card-icon">
        <slot name="icon" />
      </div>
      <h3 class="info-card-title">{{ title }}</h3>
    </div>
    <p class="info-card-desc">{{ description }}</p>
    <!-- The points stack like cards in a column, so the list reads as the board it describes. -->
    <ul
      v-if="items"
      class="info-card-list">
      <li
        v-for="item in items"
        :key="item">
        {{ item }}
      </li>
    </ul>
    <div class="info-card-links">
      <a
        class="info-card-link"
        :href="linkHref"
        :rel="external ? 'noopener' : undefined"
        :target="external ? '_blank' : undefined">
        {{ linkText }}
        <IconArrowUpRight
          v-if="external"
          stroke="2" />
      </a>
      <a
        v-if="moreHref && moreText"
        class="info-card-more"
        :href="moreHref">
        {{ moreText }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'

defineProps<{
  description: string
  external?: boolean
  items?: string[]
  linkHref: string
  linkText: string
  moreHref?: string
  moreText?: string
  title: string
}>()
</script>

<style scoped>
.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.info-card-head {
  align-items: center;
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}

.info-card-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 12px;
  color: var(--color-accent);
  display: flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.info-card-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.info-card-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.015em;
  line-height: var(--line-height-heading);
}

.info-card-desc {
  color: var(--color-muted);
  font-size: var(--font-size-lg);
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 38em;
}

.info-card-list {
  background: var(--color-soft);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 28px;
  padding: 8px;
}

.info-card-list li {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 10px;
  display: flex;
  font-size: var(--font-size-md);
  gap: 12px;
  line-height: 1.4;
  padding: 10px 14px;
}

.info-card-list li::before {
  border: 1.5px solid var(--color-accent);
  border-radius: 50%;
  content: '';
  flex-shrink: 0;
  height: 10px;
  width: 10px;
}

.info-card-links {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0 24px;
  margin-top: auto;
}

.info-card-link {
  align-items: center;
  color: var(--color-accent);
  display: inline-flex;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  gap: 4px;
  min-height: var(--control-height);
  text-decoration: none;
}

.info-card-link svg {
  height: 16px;
  width: 16px;
}

.info-card-link:hover {
  color: var(--color-accent-hover);
}

.info-card-more {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-md);
  min-height: var(--control-height);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-underline-offset: 4px;
}

.info-card-more:hover {
  color: var(--color-text);
  text-decoration-color: currentcolor;
}

@media (width <= 560px) {
  .info-card {
    padding: 22px;
  }
}
</style>
