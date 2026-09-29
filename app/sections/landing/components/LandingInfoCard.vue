<template>
  <div class="info-card reveal">
    <div class="info-card-icon">
      <slot name="icon" />
    </div>
    <div class="info-card-title">{{ title }}</div>
    <p class="info-card-desc">{{ description }}</p>
    <ul
      v-if="items"
      class="info-card-list">
      <li
        v-for="item in items"
        :key="item">
        {{ item }}
      </li>
    </ul>
    <a
      class="info-card-link"
      :href="linkHref"
      :rel="external ? 'noopener' : undefined"
      :target="external ? '_blank' : undefined">
      {{ linkText }} &#8594;
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string
  external?: boolean
  items?: string[]
  linkHref: string
  linkText: string
  title: string
}>()
</script>

<style scoped>
.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-card);
  padding: 36px 36px 32px;
  transition:
    box-shadow var(--duration-base),
    transform var(--duration-base);
}

.info-card:hover {
  box-shadow: var(--shadow-popover);
  transform: translateY(-3px);
}

.info-card-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: flex;
  height: 44px;
  justify-content: center;
  margin-bottom: 16px;
  width: 44px;
}

.info-card-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.info-card-title {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 10px;
}

.info-card-desc {
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.65;
  margin-bottom: 24px;
}

.info-card-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 28px;
}

.info-card-list li {
  align-items: flex-start;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-body);
  gap: 10px;
  line-height: 1.4;
}

.info-card-list li::before {
  color: var(--color-accent);
  content: '✓';
  flex-shrink: 0;
  font-weight: var(--font-weight-bold);
  margin-top: 1px;
}

.info-card-link {
  align-items: center;
  color: var(--color-accent);
  display: inline-flex;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  gap: 6px;
  text-decoration: none;
  transition: gap 0.15s;
}

.info-card:hover .info-card-link {
  gap: 10px;
}
</style>
