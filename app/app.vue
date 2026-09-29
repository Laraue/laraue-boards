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
const route = useRoute()

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value, lang: locale.value },
  // The Mini App SDK is only needed by the app, not by the (public, indexed) landing page.
  script:
    process.env.NODE_ENV === 'test' || route.meta.layout === 'landing'
      ? []
      : [{ src: 'https://telegram.org/js/telegram-web-app.js?61' }],
  // The tab icon follows the OS/browser theme: the transparent mark on dark tabs, the standard
  // one on light tabs. The light links come last on purpose - browsers that ignore `media` fall
  // back to the last declared icon.
  link: [
    {
      href: laraueIconUrl('favicon-transparent'),
      media: '(prefers-color-scheme: dark)',
      rel: 'icon',
      type: 'image/png',
    },
    {
      href: laraueIconUrl('favicon-32x32-transparent'),
      media: '(prefers-color-scheme: dark)',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      href: laraueIconUrl('favicon-16x16-transparent'),
      media: '(prefers-color-scheme: dark)',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      href: laraueIconUrl('favicon-black'),
      media: '(prefers-color-scheme: light)',
      rel: 'icon',
      type: 'image/png',
    },
    {
      href: laraueIconUrl('favicon-32x32-black'),
      media: '(prefers-color-scheme: light)',
      rel: 'icon',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      href: laraueIconUrl('favicon-16x16-black'),
      media: '(prefers-color-scheme: light)',
      rel: 'icon',
      sizes: '16x16',
      type: 'image/png',
    },
    { href: laraueIconUrl('apple-touch-icon-black'), rel: 'apple-touch-icon', sizes: '180x180' },
  ],
  titleTemplate: (title) => (title ? `${title} · Laraue Boards` : 'Laraue Boards'),
}))
</script>
