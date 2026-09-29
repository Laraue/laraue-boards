<template>
  <svg
    aria-hidden="true"
    class="landing-icon"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.7"
    viewBox="0 0 24 24">
    <template v-if="name === 'board'">
      <rect
        height="17"
        rx="2.5"
        width="15"
        x="4.5"
        y="4" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8 11.5h8M8 15h8M8 18.5h4.5" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect
        height="9"
        rx="2.2"
        width="14"
        x="5"
        y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle
        cx="12"
        cy="15.2"
        fill="currentColor"
        r="1.15"
        stroke="none" />
    </template>
    <template v-else-if="name === 'chat'">
      <path d="M4 5h16v11H9l-4 4v-4H4Z" />
      <path d="M8 9h8M8 12.5h5" />
    </template>
    <template v-else-if="name === 'tag'">
      <path
        d="M12.6 3H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .59 1.41l8 8a2 2 0 0 0 2.82 0l6.6-6.6a2 2 0 0 0 0-2.82l-8-8A2 2 0 0 0 12.6 3Z" />
      <circle
        cx="8.5"
        cy="8.5"
        fill="currentColor"
        r="1.3"
        stroke="none" />
    </template>
    <template v-else-if="name === 'gear'">
      <circle
        cx="12"
        cy="12"
        r="3" />
      <path
        d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </template>
    <template v-else-if="name === 'partners'">
      <circle
        cx="9"
        cy="12"
        r="5" />
      <circle
        cx="15"
        cy="12"
        r="5" />
    </template>
    <template v-else-if="name === 'search'">
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect
        height="13"
        rx="2.2"
        width="18"
        x="3"
        y="6" />
      <path d="M4 7.5 12 13l8-5.5" />
    </template>
    <template v-else-if="name === 'sparkle'">
      <path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" />
    </template>
    <template v-else-if="name === 'camera'">
      <rect
        height="13"
        rx="2.5"
        width="18"
        x="3"
        y="7" />
      <path d="M8 7l1.4-2.5h5.2L16 7" />
      <circle
        cx="12"
        cy="13.5"
        r="3.5" />
    </template>
    <template v-else-if="name === 'edit'">
      <path d="M4 20l.9-4.2L15.6 5 19 8.4 8.3 19.1 4 20Z" />
      <path d="M13.3 6.5 17.5 10.7" />
    </template>
    <template v-else-if="name === 'brain'">
      <path d="M9.5 4.5A2.8 2.8 0 0 0 7 8.2 2.8 2.8 0 0 0 5.5 13a2.8 2.8 0 0 0 3 4.7" />
      <path d="M14.5 4.5a2.8 2.8 0 0 1 2.5 3.7A2.8 2.8 0 0 1 18.5 13a2.8 2.8 0 0 1-3 4.7" />
      <path d="M9.5 4.5v14M14.5 4.5v14" />
    </template>
    <template v-else-if="name === 'globe'">
      <circle
        cx="12"
        cy="12"
        r="8.5" />
      <path d="M3.5 12h17" />
      <path
        d="M12 3.5c2.4 2.4 3.7 5.3 3.7 8.5s-1.3 6.1-3.7 8.5c-2.4-2.4-3.7-5.3-3.7-8.5S9.6 5.9 12 3.5Z" />
    </template>
    <template v-else-if="name === 'code'">
      <path d="M8.5 8 4 12l4.5 4M15.5 8 20 12l-4.5 4" />
      <path d="M13.8 4.5 10.2 19.5" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M5 4.5h6a2 2 0 0 1 2 2V19a1.6 1.6 0 0 0-1.6-1.6H5Z" />
      <path d="M19 4.5h-6a2 2 0 0 0-2 2V19a1.6 1.6 0 0 1 1.6-1.6H19Z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
export type LandingIconName =
  | 'board'
  | 'book'
  | 'brain'
  | 'camera'
  | 'chat'
  | 'code'
  | 'edit'
  | 'gear'
  | 'globe'
  | 'lock'
  | 'mail'
  | 'partners'
  | 'search'
  | 'sparkle'
  | 'tag'

defineProps<{ name: LandingIconName }>()
</script>

<style scoped>
.landing-icon {
  flex-shrink: 0;
  height: 16px;
  width: 16px;
}
</style>
