<template>
  <div class="structure">
    <div class="structure-copy">
      <p class="structure-label">{{ t('struct_label') }}</p>
      <h3 class="structure-title">{{ t('struct_title') }}</h3>
      <p class="structure-sub">{{ t('struct_sub') }}</p>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'


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
.structure {
  align-items: center;
  background: var(--color-surface);
  display: grid;
  gap: 40px 56px;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  padding: 40px;
}

.structure-label {
  color: var(--color-accent);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  margin-bottom: 10px;
}

.structure-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.015em;
  line-height: var(--line-height-heading);
  margin-bottom: 14px;
  text-wrap: balance;
}

.structure-sub {
  color: var(--color-muted);
  font-size: var(--font-size-lg);
  line-height: 1.6;
}

.nest {
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

.level-org {
  background: var(--color-workspace);
  border: 1px solid var(--color-border-surface);
}

.level-space {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 16px;
  margin-left: 32px;
}

.level-board {
  background: var(--color-soft);
  border-radius: 12px;
  margin-left: 32px;
}

.level-issue {
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 10px;
  flex-flow: row wrap;
  gap: 4px 16px;
  margin-left: 32px;
  padding: 14px 16px;
}

.nest-label {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.nest-kind {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  min-width: 7em;
}

.level-issue .nest-kind {
  color: var(--color-accent);
}

.nest-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

@media (width <= 900px) {
  .structure {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 560px) {
  .structure {
    padding: 22px;
  }

  .nest {
    padding: 12px;
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
