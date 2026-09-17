<template>
  <AppErrorState
    :code="`${t('error')} ${statusCode}`"
    :message="message"
    :title="title">
    <button
      class="primary"
      type="button"
      @click="retry">
      <RefreshCw />
      {{ t('tryAgain') }}
    </button>
    <button
      class="secondary"
      type="button"
      @click="goHome">
      <House />
      {{ t('goHome') }}
    </button>
  </AppErrorState>
</template>

<script setup lang="ts">
import { House, RefreshCw } from '@lucide/vue'

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n({
  en: {
    accessDenied: 'Access denied',
    error: 'Error',
    goHome: 'Go home',
    missingSession: 'Your session is missing or has expired.',
    noPermission: 'You do not have permission to open this page.',
    pageMoved: 'The page may have moved, or the link may be incorrect.',
    pageNotFound: 'Page not found',
    requestFailed: 'Request could not be completed',
    retryRequest: 'Check the address and try your request again.',
    serviceUnavailable: 'The service is temporarily unavailable. Please try again.',
    signInRequired: 'Sign in required',
    somethingWrong: 'Something went wrong',
    tryAgain: 'Try again',
  },
  ru: {
    accessDenied: 'Доступ запрещён',
    error: 'Ошибка',
    goHome: 'На главную',
    missingSession: 'Сессия отсутствует или истекла.',
    noPermission: 'У вас нет доступа к этой странице.',
    pageMoved: 'Возможно, страница была перемещена или ссылка неверна.',
    pageNotFound: 'Страница не найдена',
    requestFailed: 'Не удалось выполнить запрос',
    retryRequest: 'Проверьте адрес и повторите запрос.',
    serviceUnavailable: 'Сервис временно недоступен. Повторите попытку.',
    signInRequired: 'Требуется войти',
    somethingWrong: 'Что-то пошло не так',
    tryAgain: 'Повторить попытку',
  },
})

const statusCode = computed(() => Number(props.error.statusCode) || 500)
const title = computed(() => {
  if (statusCode.value === 401) {
    return t('signInRequired')
  }
  if (statusCode.value === 403) {
    return t('accessDenied')
  }
  if (statusCode.value === 404) {
    return t('pageNotFound')
  }
  if (statusCode.value < 500) {
    return t('requestFailed')
  }
  return t('somethingWrong')
})
useHead({ title: computed(() => `${title.value} · Laraue Boards`) })
const message = computed(() => {
  if (statusCode.value === 401) {
    return t('missingSession')
  }
  if (statusCode.value === 403) {
    return t('noPermission')
  }
  if (statusCode.value === 404) {
    return t('pageMoved')
  }
  if (statusCode.value < 500) {
    return t('retryRequest')
  }
  return t('serviceUnavailable')
})

const retry = () => globalThis.location.reload()
const goHome = () => clearError({ redirect: '/' })
</script>
