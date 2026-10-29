<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator
    color="var(--color-accent)"
    :height="3" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <BaseToasts
    :dismiss="toastService.dismiss"
    :dismiss-label="t('dismiss')"
    :toasts="toasts" />
  <BaseConfirmHost
    :answer="confirmation.answer"
    :cancel-label="t('cancel')"
    :confirm-label="t('confirm')"
    :danger-label="t('delete')"
    :request="pendingConfirmation" />
  <CookieConsent
    v-if="consentVisible"
    :on-choice="onConsentChoice" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useHead, useRoute, useSeoMeta } from '#app'
import { NuxtLayout, NuxtLoadingIndicator, NuxtPage, NuxtRouteAnnouncer } from '#components'
import CookieConsent from '#layers/core/app/analytics/components/CookieConsent.vue'
import { createConsentController } from '#layers/core/app/analytics/consent/ConsentController'
import { createConsentControllerDeps } from '#layers/core/app/analytics/consent/ConsentController.deps.impl'
import type { ConsentState } from '#layers/core/app/analytics/consent/ConsentState'
import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'
import { isConsentPage } from '#layers/core/app/analytics/consent/decision'
import { laraueIconUrl } from '#layers/core/app/branding/laraueIcons'
import { useI18n, useLocale } from '#layers/core/app/i18n/useI18n'
import { useAppPreferences } from '#layers/core/app/preferences/useAppPreferences'
import BaseConfirmHost from '#layers/core/app/ui/components/BaseConfirmHost.vue'
import BaseToasts from '#layers/core/app/ui/components/BaseToasts.vue'
import { useConfirmationService } from '#layers/core/app/ui/composables/useConfirm'
import { useToast } from '#layers/core/app/ui/composables/useToast'

const { theme } = useAppPreferences()
const locale = useLocale()
const toastService = useToast()
const { toasts } = toastService
const confirmation = useConfirmationService()
const { pending: pendingConfirmation } = confirmation
onBeforeUnmount(() => {
  confirmation.answer(false)
  toastService.dispose()
})
const { t } = useI18n({
  en: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    dismiss: 'Dismiss',
    siteDescription: 'Laraue Boards — manage tasks and team work with Telegram and AI agents.',
  },
  ru: {
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    delete: 'Удалить',
    dismiss: 'Закрыть',
    siteDescription:
      'Laraue Boards — управление задачами и командной работой с Telegram и ИИ-агентами.',
  },
})
useSeoMeta({ description: () => t('siteDescription') }, { tagPriority: 'low' })
const route = useRoute()

const consent = ref<ConsentState>({ consent: null, required: true, resolved: false })
const consentDeps = createConsentControllerDeps()
const consentController = createConsentController(consentDeps)
const consentVisible = computed(
  () =>
    consent.value.resolved &&
    consent.value.required &&
    consent.value.consent === null &&
    isConsentPage(route.path),
)
const onConsentChoice = (choice: ConsentChoice) => {
  consentDeps.saveChoice(choice)
  consent.value = { ...consent.value, consent: choice }
}
onMounted(async () => {
  consent.value = { ...(await consentController.resolve()), resolved: true }
})
watch(
  () => [consent.value.consent, route.path],
  () => consentController.apply(consent.value.consent, route.path),
)

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value, lang: locale.value },
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
}))
</script>
