<template>
  <span
    class="platform-badge"
    :class="type">
    <svg
      v-if="type === 'tg'"
      fill="currentColor"
      viewBox="0 0 24 24">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.54-.46.67-.93.42l-2.58-1.9-1.24 1.2c-.14.13-.26.25-.52.25l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.36 14.5l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.83.7z" />
    </svg>
    <svg
      v-else
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24">
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
    {{ title }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  type: 'tg' | 'web'
}>()
</script>

<style scoped>
.platform-badge {
  align-items: center;
  border-radius: 20px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 6px;
  letter-spacing: 0.04em;
  padding: 5px 12px;
}

.platform-badge.web {
  background: rgb(45 125 210 / 20%);
  border: 1px solid rgb(45 125 210 / 30%);
  color: #6ab0f0;
}

.platform-badge.tg {
  background: rgb(34 158 217 / 20%);
  border: 1px solid rgb(34 158 217 / 30%);
  color: #7dd3f5;
}

.platform-badge svg {
  flex-shrink: 0;
  height: 12px;
  width: 12px;
}
</style>
