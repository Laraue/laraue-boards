<template>
  <section class="features">
    <div class="features-inner">
      <div class="section-label reveal">{{ t('feat_label') }}</div>
      <h2 class="section-title reveal">{{ t('feat_title') }}</h2>
      <p class="section-sub reveal">{{ t('feat_sub') }}</p>
      <div class="features-grid">
        <NuxtLink
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feat-cell reveal"
          :style="{
            animationDelay: `min(calc(var(--anim-stagger-sm) * ${index}), calc(var(--anim-stagger-sm) * 8))`,
          }"
          :to="feature.link">
          <div class="feat-icon">
            <LandingIcon :name="feature.icon" />
          </div>
          <h3 class="feat-title">{{ feature.title }}</h3>
          <div class="feat-desc">{{ feature.description }}</div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { githubUrl, laraueUrl } from '../landingLinks'
import type { LandingIconName } from './LandingIcon.vue'
import LandingIcon from './LandingIcon.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      f1d: 'Drag-and-drop cards across columns. Clean, fast, works on any screen.',
      f1t: 'Visual Kanban Boards',
      f2d: 'Send any Telegram message to the bot and it turns into a task on your board instantly — with a 👍 to confirm.',
      f2t: 'Telegram message to task',
      f3d: 'Photos, videos and whole albums become one card with all the attachments, in original quality.',
      f3t: 'Media and albums',
      f4d: 'Edit the message in Telegram and the card changes with it. The reaction turns into a ❤.',
      f4t: 'Edits sync back',
      f5d: 'Group epics into spaces per project. Every issue gets a key like WRK-42 you can quote in a chat.',
      f5t: 'Spaces and issue keys',
      f6d: 'An admin defines attributes — task type, due by — and the team fills them in on issues.',
      f6t: 'Custom attributes',
      f7d: 'Shared boards, and permissions set per operation on spaces, epics and issues.',
      f7t: 'Organization & permissions',
      f8d: 'Login via Telegram — no new password. Your data is never sold.',
      f8t: 'Privacy first',
      f9d: 'The backend and the frontend are public. Read exactly what happens to your message.',
      f9t: 'Open source',
      f10d: "Send /aisave and a messy, rambling message becomes a clean title with a bullet-point description. Free while it's in testing.",
      f10t: 'AI-cleaned cards',
      f11d: 'Type @msgboard_bot and a query in any Telegram chat to find an issue — no need to open the app.',
      f11t: 'Search from any chat',
      feat_label: 'Everything you need',
      feat_sub: 'Deliberately simple. Every feature earns its place.',
      feat_title: "Nothing you don't",
    },
    ru: {
      f1d: 'Drag-and-drop карточки по колонкам. Работает на любом экране.',
      f1t: 'Визуальные Kanban-доски',
      f2d: 'Отправьте сообщение боту — оно станет задачей на доске, а бот подтвердит это реакцией 👍.',
      f2t: 'Сообщение Telegram в задачу',
      f3d: 'Фото, видео и целые альбомы становятся одной карточкой со всеми вложениями, в исходном качестве.',
      f3t: 'Медиа и альбомы',
      f4d: 'Отредактируйте сообщение в Telegram — карточка изменится. Реакция сменится на ❤.',
      f4t: 'Правки синхронизируются',
      f5d: 'Группируйте эпики в спейсы по проектам. У каждого issue есть номер вида WRK-42 — на него можно сослаться в чате.',
      f5t: 'Спейсы и номера issues',
      f6d: 'Админ задаёт атрибуты — тип задачи, выполнить до — а команда заполняет их в issues.',
      f6t: 'Кастомные атрибуты',
      f7d: 'Общие доски и права, настраиваемые по операциям над спейсами, эпиками и issues.',
      f7t: 'Организация и права',
      f8d: 'Вход через Telegram — без нового пароля. Данные не продаются.',
      f8t: 'Конфиденциальность',
      f9d: 'Бэкенд и фронтенд открыты. Можно проверить, что происходит с сообщением.',
      f9t: 'Открытый код',
      f10d: 'Команда /aisave превращает сумбурное сообщение в чёткий заголовок с описанием по пунктам. Бесплатно, пока функция тестируется.',
      f10t: 'Карточки, очищенные ИИ',
      f11d: 'Введите @msgboard_bot и запрос в любом чате Telegram, чтобы найти issue, не открывая приложение.',
      f11t: 'Поиск из любого чата',
      feat_label: 'Всё, что нужно',
      feat_sub: 'Намеренная простота. Каждая функция действительно полезна.',
      feat_title: 'И ничего лишнего',
    },
  },
  props.locale,
)

const docs = (path: string): string =>
  laraueUrl(props.locale, `/blog/documentation/laraue-boards/${path}`)

const features: { description: string; icon: LandingIconName; link: string; title: string }[] = [
  {
    description: t('f1d'),
    icon: 'board',
    link: docs('getting-started/quick-start'),
    title: t('f1t'),
  },
  {
    description: t('f2d'),
    icon: 'mail',
    link: docs('working-alone/telegram-messages'),
    title: t('f2t'),
  },
  {
    description: t('f3d'),
    icon: 'camera',
    link: docs('features/media'),
    title: t('f3t'),
  },
  {
    description: t('f4d'),
    icon: 'edit',
    link: docs('integrations/telegram-save-modes'),
    title: t('f4t'),
  },
  {
    description: t('f5d'),
    icon: 'tag',
    link: docs('features/card-keys'),
    title: t('f5t'),
  },
  {
    description: t('f6d'),
    icon: 'gear',
    link: docs('features/attributes'),
    title: t('f6t'),
  },
  {
    description: t('f7d'),
    icon: 'partners',
    link: docs('concepts/organizations'),
    title: t('f7t'),
  },
  {
    description: t('f8d'),
    icon: 'lock',
    link: docs('getting-started/authorization'),
    title: t('f8t'),
  },
  {
    description: t('f9d'),
    icon: 'code',
    link: githubUrl,
    title: t('f9t'),
  },
  {
    description: t('f10d'),
    icon: 'sparkle',
    link: docs('integrations/telegram-save-modes'),
    title: t('f10t'),
  },
  {
    description: t('f11d'),
    icon: 'search',
    link: docs('features/search'),
    title: t('f11t'),
  },
]
</script>

<style scoped>
.features {
  border-bottom: 1px solid var(--color-divider);
  padding: 88px 60px;
}

.features-inner {
  margin: 0 auto;
  max-width: 1060px;
}

.section-label {
  align-items: center;
  color: var(--color-accent);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  gap: 8px;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--color-accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: 0.5;
}

.section-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}

.section-sub {
  color: var(--color-muted);
  font-size: 17px;
  line-height: 1.7;
  max-width: 560px;
}

.features-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 48px;
}

.feat-cell {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  color: inherit;
  padding: 28px 24px;
  text-decoration: none;
  transition:
    border-color var(--duration-base),
    transform var(--duration-base);
}

.feat-cell:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.feat-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: flex;
  height: 44px;
  justify-content: center;
  margin-bottom: 14px;
  width: 44px;
}

.feat-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.feat-title {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 8px;
}

.feat-desc {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.6;
}

@media (width <= 900px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (width <= 720px) {
  .features {
    padding: 60px 22px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
