<template>
  <!-- The local poster loads immediately; YouTube's player is requested only after a click. -->
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
      fetchpriority="high"
      height="720"
      sizes="(max-width: 1000px) calc(100vw - 32px), (max-width: 1360px) calc((100vw - 112px) / 2.1), 595px"
      :src="poster640"
      :srcset="`${poster640} 640w, ${poster960} 960w, ${poster1280} 1280w`"
      width="1280" />
    <span class="video-play"><IconPlayerPlayFilled /></span>
  </button>
</template>

<script setup lang="ts">
import { IconPlayerPlayFilled } from '@tabler/icons-vue'
import { nextTick, ref } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import poster640 from '#layers/site/app/assets/images/boards-demo-640.webp'
import poster960 from '#layers/site/app/assets/images/boards-demo-960.webp'
import poster1280 from '#layers/site/app/assets/images/boards-demo-1280.webp'

// The Product Hunt demo on the Laraue YouTube channel, made in laraue-boards-videos.
const videoId = 'A_yg1Asvkq0'

const playing = ref(false)
const player = ref<HTMLIFrameElement>()

const play = async (): Promise<void> => {
  playing.value = true
  await nextTick()
  player.value?.focus()
}

const { t } = useI18n({
  en: {
    video_play: 'Play the video: Laraue Boards in a minute and a half',
    video_title: 'Laraue Boards in a minute and a half',
  },
  ru: {
    video_play: 'Смотреть видео: Laraue Boards за полторы минуты',
    video_title: 'Laraue Boards за полторы минуты',
  },
})
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
