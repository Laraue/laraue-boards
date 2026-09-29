<template>
  <a
    class="btn"
    :class="type"
    :href="link"
    :rel="isExternal ? 'noopener' : undefined"
    :target="isExternal ? '_blank' : undefined">
    {{ title }}
    <svg
      v-if="type === 'site'"
      fill="none"
      height="16"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2.2"
      viewBox="0 0 24 24"
      width="16">
      <circle
        cx="12"
        cy="12"
        r="10" />
      <line
        x1="2"
        x2="22"
        y1="12"
        y2="12" />
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
    <svg
      v-else
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.54-.46.67-.93.42l-2.58-1.9-1.24 1.2c-.14.13-.26.25-.52.25l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.36 14.5l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.83.7z" />
    </svg>
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: string
  title: string
  type: 'site' | 'telegram'
}>()

const isExternal = computed(() => props.link.startsWith('http'))
</script>

<style scoped>
.btn {
  align-items: center;
  border-radius: var(--radius-control);
  display: inline-flex;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  gap: 8px;
  padding: 12px 24px;
  text-decoration: none;
  transition:
    background var(--duration-base),
    transform 0.15s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn.site {
  background: var(--btn-site-bg, var(--color-accent));
  color: var(--btn-site-color, #fff);
}

.btn.site:hover {
  background: var(--btn-site-hover, color-mix(in srgb, var(--color-accent) 85%, #000));
}

.btn.telegram {
  background: var(--btn-alt-bg, var(--color-surface));
  border: 1px solid var(--btn-alt-border, var(--color-border));
  color: var(--btn-alt-color, var(--color-text));
}

.btn.telegram:hover {
  background: var(--btn-alt-hover, var(--color-hover));
}
</style>
