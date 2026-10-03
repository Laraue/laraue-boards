<template>
  <component
    :is="icons[name]"
    aria-hidden="true"
    class="landing-icon"
    :stroke="1.7" />
</template>

<script setup lang="ts">
import {
  IconBook,
  IconBrain,
  IconCamera,
  IconClipboardText,
  IconCode,
  IconHeartHandshake,
  IconLock,
  IconMail,
  IconMessage,
  IconPencil,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTag,
  IconWorld,
} from '@tabler/icons-vue'

const icons = {
  board: IconClipboardText,
  book: IconBook,
  brain: IconBrain,
  camera: IconCamera,
  chat: IconMessage,
  code: IconCode,
  edit: IconPencil,
  gear: IconSettings,
  globe: IconWorld,
  lock: IconLock,
  mail: IconMail,
  partners: IconHeartHandshake,
  search: IconSearch,
  sparkle: IconSparkles,
  tag: IconTag,
}

export type LandingIconName = keyof typeof icons

defineProps<{ name: LandingIconName }>()
</script>

<style scoped>
.landing-icon {
  flex-shrink: 0;
  height: 16px;
  width: 16px;
}
</style>
