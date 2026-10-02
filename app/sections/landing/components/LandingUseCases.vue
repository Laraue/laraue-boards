<template>
  <LandingSection
    :post-title="t('uc_sub')"
    :pre-title="t('uc_label')"
    :title="t('uc_title')"
    type="alt">
    <div class="cards-grid">
      <LandingInfoCard
        :description="t('uc_personal_desc')"
        external
        :items="[t('uc_p1'), t('uc_p2'), t('uc_p3'), t('uc_p4')]"
        :link-href="botUrl"
        :link-text="t('uc_p_cta')"
        :more-href="saveGuideUrl"
        :more-text="t('uc_more_personal')"
        :title="t('uc_personal_title')">
        <template #icon><LandingIcon name="brain" /></template>
      </LandingInfoCard>
      <LandingInfoCard
        :description="t('uc_teams_desc')"
        :items="[t('uc_t1'), t('uc_t2'), t('uc_t3'), t('uc_t4'), t('uc_t5'), t('uc_t6')]"
        :link-href="appUrl"
        :link-text="t('open_app')"
        :more-href="groupGuideUrl"
        :more-text="t('uc_more_teams')"
        :title="t('uc_teams_title')">
        <template #icon><LandingIcon name="partners" /></template>
      </LandingInfoCard>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { docsPath } from '../../docs/docsPaths'
import { appUrl, botUrl } from '../landingLinks'
import LandingIcon from './LandingIcon.vue'
import LandingInfoCard from './LandingInfoCard.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      open_app: 'Open App',
      uc_label: 'Built for two worlds',
      uc_more_personal: 'How to save links and ideas',
      uc_more_teams: 'Turn a group chat into a board',
      uc_p1: 'Forward any message — text, photo, video or album',
      uc_p2: 'Edit the message in Telegram, the card updates',
      uc_p3: 'Search everything by keyword',
      uc_p4: 'Organise into epics and columns when you have time',
      uc_p_cta: 'Start with the Telegram bot',
      uc_personal_desc:
        'Capture thoughts, tasks and links without leaving Telegram. Forward a message to the bot and it lands on your board.',
      uc_personal_title: 'Personal use',
      uc_sub:
        'Laraue Boards adapts to how you work — a solo task manager, or a project tracker for the whole team.',
      uc_t1: 'Organization mode with shared boards',
      uc_t2: 'Invite teammates via Telegram',
      uc_t3: 'Permissions per operation on spaces, epics and issues',
      uc_t4: 'Custom attributes defined by an admin',
      uc_t5: 'One space per client, scoped access for contractors',
      uc_t6: 'AI agents read and update the same board over MCP',
      uc_teams_desc:
        'A lightweight Jira alternative built on Telegram, for teams that find Jira overwhelming — and for agencies juggling several clients at once. Create an organization, invite teammates, track work together.',
      uc_teams_title: 'Small teams & agencies',
      uc_title: 'Personal productivity\nor team coordination',
    },
    ru: {
      open_app: 'Открыть приложение',
      uc_label: 'Для двух сценариев',
      uc_more_personal: 'Как сохранять ссылки и идеи',
      uc_more_teams: 'Групповой чат — в доску задач',
      uc_p1: 'Пересылайте что угодно — текст, фото, видео или альбом',
      uc_p2: 'Отредактировали сообщение в Telegram — карточка обновилась',
      uc_p3: 'Поиск по ключевому слову',
      uc_p4: 'Организуйте по эпикам и статусам, когда найдется время',
      uc_p_cta: 'Начать через Telegram-бота',
      uc_personal_desc:
        'Сохраняйте мысли, задачи и ссылки, не выходя из Telegram. Перешлите сообщение боту — оно окажется на доске.',
      uc_personal_title: 'Личное использование',
      uc_sub:
        'Laraue Boards адаптируется под ваш стиль работы — как таск-менеджер для себя или как трекер задач для всей команды.',
      uc_t1: 'Режим организации с общими досками',
      uc_t2: 'Приглашайте коллег через Telegram',
      uc_t3: 'Права по операциям над спейсами, эпиками и issues',
      uc_t4: 'Кастомные атрибуты, настраиваемые админом',
      uc_t5: 'Отдельный спейс на каждого клиента, права — точечно для подрядчиков',
      uc_t6: 'ИИ-агенты читают и обновляют ту же доску через MCP',
      uc_teams_desc:
        'Лёгкая альтернатива Jira на базе Telegram — для команд, которым Jira кажется избыточной, и для агентств, ведущих сразу несколько клиентов. Создайте организацию, пригласите коллег, работайте над задачами вместе.',
      uc_teams_title: 'Команды и агентства',
      uc_title: 'Личная продуктивность\nили командная работа',
    },
  },
  props.locale,
)

const groupGuideUrl = docsPath(props.locale, ['use-cases', 'telegram-group-chat-task-board'])
const saveGuideUrl = docsPath(props.locale, ['use-cases', 'save-links-and-ideas-from-telegram'])
</script>

<style scoped>
.cards-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;
  margin-top: 48px;
}

@media (width <= 900px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
