<template>
  <LandingSection
    :post-title="t('feat_sub')"
    :pre-title="t('feat_label')"
    :title="t('feat_title')"
    type="plain">
    <div class="features-grid">
      <NuxtLink
        v-for="feature in features"
        :key="feature.title"
        class="feat-cell"
        :to="feature.link">
        <div class="feat-icon">
          <LandingIcon :name="feature.icon" />
        </div>
        <h3 class="feat-title">{{ feature.title }}</h3>
        <p class="feat-desc">{{ feature.description }}</p>
      </NuxtLink>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { NuxtLink } from '#components'
import { useLocalePath } from '#imports'
import { githubRepositoryUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import type { LandingIconName } from './LandingIcon.vue'
import LandingIcon from './LandingIcon.vue'
import LandingSection from './LandingSection.vue'

const { locale, t } = useI18n({
  en: {
    f1d: 'Drag-and-drop cards across columns. Clean, fast, works on any screen.',
    f1t: 'Visual Kanban Boards',
    f2d: 'Forward a message to the bot or link a whole chat. Save everything automatically, or only the messages you pick with /save. A 👍 confirms it.',
    f2t: 'Telegram message to task',
    f3d: 'Photos, videos and whole albums become one card with all the attachments, in original quality.',
    f3t: 'Media and albums',
    f4d: 'In auto mode, edit a message in Telegram and the card changes with it. In manual mode, run /save again to re-sync.',
    f4t: 'Edits sync back',
    f5d: 'Group epics into spaces per project. Every issue gets a key like WRK-42 you can quote in a chat.',
    f5t: 'Spaces and issue keys',
    f6d: 'An admin defines attributes — task type, due by — and the team fills them in on issues.',
    f6t: 'Custom attributes',
    f7d: 'Shared boards, and permissions set per operation on spaces, epics and issues.',
    f7t: 'Organization & permissions',
    f8d: 'Sign in with Telegram or Google — no new password. Your data is never sold.',
    f8t: 'Privacy first',
    f9d: 'The backend and the frontend are public. Read exactly what happens to your message.',
    f9t: 'Open source',
    f10d: 'Send /aisave and a messy, rambling message becomes a clean title with a bullet-point description. Every user gets a free monthly token allowance.',
    f10t: 'AI-cleaned cards',
    f11d: 'Type @msgboard_bot and a query in any Telegram chat to find an issue — no need to open the app.',
    f11t: 'Search from any chat',
    feat_label: 'Everything you need',
    feat_sub:
      'Deliberately simple and light. Every feature earns its place. Not built for heavy enterprise project management or reporting.',
    feat_title: "Nothing you don't",
  },
  ru: {
    f1d: 'Перетаскивайте карточки между колонками. Удобно на экране любого размера.',
    f1t: 'Канбан-доски',
    f2d: 'Перешлите сообщение боту или привяжите весь чат. Сохраняйте всё подряд или только нужное командой /save. Реакция 👍 означает, что сообщение сохранено.',
    f2t: 'Задача из сообщения Telegram',
    f3d: 'Фото, видео и альбомы целиком попадают в одну карточку со всеми вложениями в исходном качестве.',
    f3t: 'Фото, видео и альбомы',
    f4d: 'В автоматическом режиме изменения сообщения в Telegram переносятся в карточку. В ручном — ответьте /save ещё раз, чтобы обновить её.',
    f4t: 'Изменения переносятся',
    f5d: 'Объединяйте эпики в пространства по проектам. У каждой задачи есть номер вида WRK-42, на него удобно ссылаться в чате.',
    f5t: 'Пространства и номера задач',
    f6d: 'Администратор задаёт атрибуты, например тип задачи или срок, а команда заполняет их в задачах.',
    f6t: 'Свои атрибуты',
    f7d: 'Общие доски и права на каждое действие с пространствами, эпиками и задачами.',
    f7t: 'Организации и права',
    f8d: 'Вход через Telegram или Google, новый пароль не нужен. Данные не продаются.',
    f8t: 'Конфиденциальность',
    f9d: 'Бэкенд и фронтенд открыты: можно проверить, что происходит с сообщением.',
    f9t: 'Открытый код',
    f10d: 'Команда /aisave превращает сумбурное сообщение в задачу с понятным заголовком и описанием по пунктам. На бесплатном тарифе каждый месяц даётся запас токенов.',
    f10t: 'ИИ наводит порядок в карточках',
    f11d: 'Наберите @msgboard_bot и запрос в любом чате Telegram, чтобы найти задачу, не открывая приложение.',
    f11t: 'Поиск из любого чата',
    feat_label: 'Всё, что нужно',
    feat_sub:
      'Намеренно простой инструмент: только то, чем действительно пользуются. Для тяжёлого корпоративного управления проектами и отчётов он не задумывался.',
    feat_title: 'И ничего лишнего',
  },
})

const localePath = useLocalePath()
const docs = (path: string): string =>
  localePath({ name: 'documentation-path', params: { path: path.split('/') } }, locale.value)

const features = computed<
  { description: string; icon: LandingIconName; link: string; title: string }[]
>(() => [
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
    link: githubRepositoryUrl,
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
])
</script>

<style scoped>
/* One sheet split by hairlines, like a board's columns, instead of a pile of separate cards. */
.features-grid {
  background: var(--color-border-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 20px;
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.feat-cell {
  background: var(--color-surface);
  color: inherit;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  text-decoration: none;
  transition: background var(--duration-base);
}

/* Kanban opens the sheet and fills the row the 11 features would otherwise leave half empty. */
.feat-cell:first-child {
  background: var(--color-accent-soft);
  grid-column: span 2;
}

.feat-cell:hover {
  background: var(--color-workspace);
}

.feat-cell:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.feat-icon {
  color: var(--color-accent);
  margin-bottom: 20px;
}

.feat-icon :deep(.landing-icon) {
  height: 26px;
  width: 26px;
}

.feat-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.01em;
  margin-bottom: 8px;
}

.feat-cell:first-child .feat-title {
  font-size: var(--font-size-3xl);
}

.feat-desc {
  color: var(--color-muted);
  font-size: var(--font-size-md);
  line-height: 1.6;
  max-width: 36em;
}

@media (width <= 900px) {
  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 560px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .feat-cell:first-child {
    grid-column: auto;
  }

  .feat-cell {
    padding: 24px 20px;
  }
}
</style>
