<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator
    color="var(--color-accent)"
    :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToasts />
</template>

<script setup lang="ts">
const { locale, theme } = useAppPreferences()

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value, lang: locale.value },
  link: [{ href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' }],
  titleTemplate: (title) => (title ? `${title} · Laraue Boards` : 'Laraue Boards'),
}))
</script>
