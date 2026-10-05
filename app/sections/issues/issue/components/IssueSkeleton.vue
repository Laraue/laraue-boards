<template>
  <div
    :aria-label="t('loadingIssue')"
    class="issue-skeleton"
    role="status">
    <div
      v-if="inDialog"
      aria-hidden="true"
      class="skeleton-header">
      <span class="skeleton skeleton-copy skeleton-title">DEF-00</span>
      <span class="skeleton skeleton-link" />
    </div>
    <div
      aria-hidden="true"
      class="skeleton-form">
      <div class="skeleton-content">
        <div class="skeleton-main">
          <div class="skeleton-description">
            <span class="skeleton skeleton-description-title" />
            <span class="skeleton skeleton-description-line" />
            <span class="skeleton skeleton-description-line skeleton-description-line--short" />
            <span class="skeleton skeleton-description-line skeleton-description-line--medium" />
          </div>
          <div class="skeleton-description-actions">
            <span class="skeleton skeleton-icon" />
            <span class="skeleton skeleton-icon" />
            <span class="skeleton skeleton-ai" />
          </div>
          <div class="skeleton-comments">
            <div class="skeleton-tabs">
              <span class="skeleton skeleton-copy skeleton-tab">{{ t('comments') }}</span>
              <span class="skeleton skeleton-copy skeleton-tab">{{ t('history') }}</span>
            </div>
            <span class="skeleton skeleton-comment-field" />
          </div>
        </div>
        <div class="skeleton-side">
          <span class="skeleton skeleton-copy skeleton-properties-title">
            {{ t('properties') }}
          </span>
          <div class="skeleton-properties">
            <template
              v-for="label in [t('space'), t('board'), t('status'), t('assignee')]"
              :key="label">
              <span class="skeleton skeleton-copy skeleton-label">{{ label }}</span>
              <span class="skeleton skeleton-field" />
            </template>
            <span class="skeleton skeleton-copy skeleton-label">{{ t('owner') }}</span>
            <div class="skeleton-person">
              <span class="skeleton skeleton-avatar" />
              <span class="skeleton skeleton-copy skeleton-name">win7user10</span>
            </div>
          </div>
          <div class="skeleton-dates">
            <span class="skeleton skeleton-copy skeleton-label">{{ t('created') }}</span>
            <span class="skeleton skeleton-copy skeleton-date">Jun 2, 2026, 7:26 AM</span>
            <span class="skeleton skeleton-copy skeleton-label">{{ t('updated') }}</span>
            <span class="skeleton skeleton-copy skeleton-date">Jun 2, 2026, 7:26 AM</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ inDialog?: boolean }>()

const { t } = useI18n({
  en: {
    assignee: 'Assignee',
    board: 'Board',
    comments: 'Comments',
    created: 'Created',
    history: 'History',
    loadingIssue: 'Loading issue',
    owner: 'Owner',
    properties: 'Properties',
    space: 'Space',
    status: 'Status',
    updated: 'Updated',
  },
  ru: {
    assignee: 'Исполнитель',
    board: 'Доска',
    comments: 'Комментарии',
    created: 'Создана',
    history: 'История',
    loadingIssue: 'Загрузка задачи',
    owner: 'Владелец',
    properties: 'Свойства',
    space: 'Раздел',
    status: 'Статус',
    updated: 'Изменена',
  },
})
</script>

<style scoped>
.issue-skeleton {
  align-self: start;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
  width: 100%;
}

.skeleton {
  animation: issue-skeleton-shimmer 1.4s linear infinite;
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--color-border) 38%, transparent) 35%,
    color-mix(in srgb, var(--color-border) 65%, transparent) 50%,
    color-mix(in srgb, var(--color-border) 38%, transparent) 65%
  );
  background-size: 220% 100%;
  border-radius: var(--radius-control);
  display: block;
}

.skeleton-copy {
  color: transparent;
  user-select: none;
}

.skeleton-copy {
  justify-self: start;
  width: max-content;
}

.skeleton-header {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-height: var(--icon-btn-size);
}

.skeleton-title {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
}

.skeleton-link {
  border-radius: var(--radius-pill);
  height: var(--icon-size);
  width: var(--icon-size);
}

.skeleton-form {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  row-gap: var(--space-4);
}

.skeleton-content {
  align-items: start;
  column-gap: var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  grid-template-rows: fit-content(100%);
  min-height: 0;
  overflow: hidden;
}

.skeleton-main {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 var(--space-3) var(--space-4) 0;
}

.skeleton-main > * {
  flex-shrink: 0;
}

.skeleton-description {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-description-title {
  height: 32px;
  width: 76%;
}

.skeleton-description-line {
  border-radius: var(--radius-small);
  height: 16px;
  width: 92%;
}

.skeleton-description-line--short {
  width: 58%;
}

.skeleton-description-line--medium {
  width: 76%;
}

.skeleton-comments {
  display: grid;
  gap: var(--space-4);
}

.skeleton-description-actions {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  height: var(--icon-btn-size);
}

.skeleton-icon {
  height: var(--icon-size);
  width: var(--icon-size);
}

.skeleton-ai {
  height: var(--icon-size);
  width: 104px;
}

.skeleton-tabs {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: var(--space-5);
  height: 40px;
  padding: 0 var(--space-2);
}

.skeleton-tab {
  font-size: var(--font-size-body);
}

.skeleton-comment-field {
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  height: 88px;
}

.skeleton-side {
  display: grid;
  font-size: 13px;
  gap: var(--space-4);
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  place-self: start stretch;
}

.skeleton-properties,
.skeleton-dates {
  align-items: center;
  display: grid;
  gap: var(--space-2) var(--space-3);
  grid-auto-rows: var(--control-height-small);
  grid-template-columns: 88px minmax(0, 1fr);
}

.skeleton-properties-title {
  font-weight: var(--font-weight-semibold);
}

.skeleton-label {
  border-radius: var(--radius-small);
}

.skeleton-field {
  height: var(--icon-size);
  margin-inline: var(--space-3);
  width: 65%;
}

.skeleton-person {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height-small);
  padding: 0 var(--space-3);
}

.skeleton-avatar {
  border-radius: var(--radius-pill);
  height: 20px;
  width: 20px;
}

.skeleton-name {
  white-space: nowrap;
}

.skeleton-dates {
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-4);
}

.skeleton-date {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

@keyframes issue-skeleton-shimmer {
  to {
    background-position-x: -220%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}

@media (max-width: 767px) {
  .skeleton-content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
    overflow: auto;
    row-gap: var(--space-8);
  }

  .skeleton-main,
  .skeleton-side {
    overflow: visible;
  }

  .skeleton-description-title {
    height: 30px;
  }
}
</style>
