<template>
  <LandingSection
    :post-title="t('struct_sub')"
    :pre-title="t('struct_label')"
    :title="t('struct_title')"
    type="plain">
    <div class="hierarchy">
      <div class="hierarchy-box">
        <div class="hierarchy-box-label">{{ t('struct_org') }}</div>
        <div class="hierarchy-box-ex">{{ t('struct_org_ex') }}</div>
      </div>
      <div class="hierarchy-arrow">&#8594;</div>
      <div class="hierarchy-box">
        <div class="hierarchy-box-label">{{ t('struct_space') }}</div>
        <div class="hierarchy-box-ex">{{ t('struct_space_ex') }}</div>
      </div>
      <div class="hierarchy-arrow">&#8594;</div>
      <div class="hierarchy-box">
        <div class="hierarchy-box-label">{{ t('struct_board') }}</div>
        <div class="hierarchy-box-ex">{{ t('struct_board_ex') }}</div>
      </div>
      <div class="hierarchy-arrow">&#8594;</div>
      <div class="hierarchy-box highlight">
        <div class="hierarchy-box-label">{{ t('struct_issue') }}</div>
        <div class="hierarchy-box-ex">{{ t('struct_issue_ex') }}</div>
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import LandingSection from './LandingSection.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      struct_board: 'Board',
      struct_board_ex: 'Website Redesign',
      struct_issue: 'Issue',
      struct_issue_ex: 'WRK-42 — Fix nav bug',
      struct_label: "How it's organized",
      struct_org: 'Organization',
      struct_org_ex: 'Acme Studio',
      struct_space: 'Space',
      struct_space_ex: 'Client: Redsight',
      struct_sub:
        'One hierarchy that works for a single board or twenty client spaces. Start in your personal organization and move a whole space to a team one later.',
      struct_title: 'Structured like a real tracker,\nnot a chat log',
    },
    ru: {
      struct_board: 'Доска',
      struct_board_ex: 'Редизайн сайта',
      struct_issue: 'Issue',
      struct_issue_ex: 'WRK-42 — Починить навигацию',
      struct_label: 'Как всё устроено',
      struct_org: 'Организация',
      struct_org_ex: 'Acme Studio',
      struct_space: 'Спейс',
      struct_space_ex: 'Клиент: Redsight',
      struct_sub:
        'Одна иерархия — подходит и для одной доски, и для двадцати клиентских спейсов. Начните в личной организации и позже перенесите весь спейс в командную.',
      struct_title: 'Структура как в настоящем трекере,\nа не в переписке',
    },
  },
  props.locale,
)
</script>

<style scoped>
.hierarchy-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  flex: 1;
  min-width: 140px;
  padding: 16px 20px;
}

.hierarchy {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 48px;
}

.hierarchy-box.highlight {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.hierarchy-box-label {
  color: var(--color-accent);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.hierarchy-box-ex {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.hierarchy-arrow {
  color: var(--color-muted);
  flex-shrink: 0;
  font-size: 18px;
}

@media (width <= 720px) {
  .hierarchy {
    align-items: stretch;
    flex-direction: column;
  }

  .hierarchy-arrow {
    text-align: center;
    transform: rotate(90deg);
  }
}
</style>
