<!-- The section that shows the button passes exactly what it reloads. -->
<template>
  <BaseIconButton
    :label="t('refresh')"
    :loading="state.refreshing"
    @click="refresh">
    <IconRefresh />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { IconRefresh } from '@tabler/icons-vue'
import { reactive } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'

const props = defineProps<{ onRefresh: () => Promise<unknown> | void }>()
const { t } = useI18n({
  en: { refresh: 'Refresh' },
  ru: { refresh: 'Обновить' },
})

const state = reactive({ refreshing: false })

// The button is disabled while it waits, so repeated clicks don't send parallel requests.
const refresh = async () => {
  if (state.refreshing) {
    return
  }
  state.refreshing = true
  try {
    await props.onRefresh()
  } finally {
    state.refreshing = false
  }
}
</script>
