<template>
  <!-- YouTube's poster until pressed, so the landing loads nothing from YouTube's player before that. -->
  <iframe
    v-if="playing"
    ref="player"
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
    allowfullscreen
    class="video"
    :src="`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`"
    :title="t('video_title')"></iframe>
  <button
    v-else
    :aria-label="t('video_play')"
    class="video"
    type="button"
    @click="play">
    <img
      alt=""
      :src="`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`" />
    <span class="video-play"><IconPlayerPlayFilled /></span>
  </button>
</template>

<script setup lang="ts">
import { IconPlayerPlayFilled } from '@tabler/icons-vue'

import type { Locale } from '~/composables/useI18n'

const props = defineProps<{ locale: Locale }>()

// The Product Hunt demo on the Laraue YouTube channel, made in laraue-boards-videos.
const videoId = 'A_yg1Asvkq0'

const playing = ref(false)
const player = ref<HTMLIFrameElement>()

const play = async (): Promise<void> => {
  playing.value = true
  await nextTick()
  player.value?.focus()
}

const { t } = useI18n(
  {
    en: {
      video_play: 'Play the video: Laraue Boards in a minute and a half',
      video_title: 'Laraue Boards in a minute and a half',
    },
    ru: {
      video_play: 'Смотреть видео: Laraue Boards за полторы минуты',
      video_title: 'Laraue Boards за полторы минуты',
    },
  },
  props.locale,
)
</script>

<style scoped>
/* The poster and, once pressed, the player take the same 16:9 box. */
.video {
  aspect-ratio: 16 / 9;
  background: var(--color-soft);
  border: 1px solid var(--color-border-surface);
  border-radius: 20px;
  display: block;
  overflow: hidden;
  padding: 0;
  position: relative;
  width: 100%;
}

button.video {
  cursor: pointer;
}

button.video:focus-visible {
  border-color: var(--color-focus);
  outline: none;
}

.video img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.video-play {
  align-items: center;
  background: var(--color-accent);
  border-radius: var(--radius-card);
  color: var(--color-on-action);
  display: flex;
  height: 4rem;
  inset: 0;
  justify-content: center;
  margin: auto;
  position: absolute;
  transition: background 120ms ease;
  width: 5.75rem;
}

button.video:hover .video-play,
button.video:focus-visible .video-play {
  background: var(--color-accent-hover);
}

.video-play svg {
  height: 2.25rem;
  width: 2.25rem;
}
</style>
