<!-- Reloads the data of the view on screen (see useViewRefresh), without reloading the page. -->
<template>
  <BaseIconButton
    v-if="available"
    :label="t('refresh')"
    :loading="state.refreshing"
    @click="refresh">
    <IconRefresh />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { IconRefresh } from '@tabler/icons-vue'

const { available, refreshAll } = useViewRefreshTargets()
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
    await refreshAll()
  } finally {
    state.refreshing = false
  }
}
</script>
