<template>
  <LandingSection
    :post-title="t('struct_sub')"
    :pre-title="t('struct_label')"
    :title="t('struct_title')"
    type="alt">
    <!-- Each level sits inside the one above it, the way the tracker actually nests them. -->
    <div class="nest level-org">
      <div class="nest-label">
        <span class="nest-kind">{{ t('struct_org') }}</span>
        <span class="nest-name">{{ t('struct_org_ex') }}</span>
      </div>
      <div class="nest level-space">
        <div class="nest-label">
          <span class="nest-kind">{{ t('struct_space') }}</span>
          <span class="nest-name">{{ t('struct_space_ex') }}</span>
        </div>
        <div class="nest level-board">
          <div class="nest-label">
            <span class="nest-kind">{{ t('struct_board') }}</span>
            <span class="nest-name">{{ t('struct_board_ex') }}</span>
          </div>
          <div class="nest level-issue">
            <span class="nest-kind">{{ t('struct_issue') }}</span>
            <span class="nest-name">{{ t('struct_issue_ex') }}</span>
          </div>
        </div>
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
.nest {
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
}

.level-org {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
}

.level-space {
  background: var(--color-workspace);
  border: 1px solid var(--color-border-surface);
  border-radius: 18px;
  margin-left: clamp(0px, 6vw, 96px);
}

.level-board {
  background: var(--color-soft);
  border-radius: 14px;
  margin-left: clamp(0px, 6vw, 96px);
}

.level-issue {
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  flex-flow: row wrap;
  gap: 4px 16px;
  margin-left: clamp(0px, 6vw, 96px);
  padding: 16px 18px;
}

.nest-label {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.nest-kind {
  color: var(--color-muted);
  font-size: var(--font-size-md);
  min-width: 7em;
}

.level-issue .nest-kind {
  color: var(--color-accent);
}

.nest-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
}

@media (width <= 560px) {
  .nest {
    padding: 14px;
  }

  .level-space,
  .level-board,
  .level-issue {
    margin-left: 0;
  }

  .nest-label,
  .level-issue {
    flex-direction: column;
  }
}
</style>
