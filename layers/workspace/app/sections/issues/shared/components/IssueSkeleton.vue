<template>
  <div
    :aria-label="t('loadingIssue')"
    class="issue-skeleton"
    :class="{ 'has-header': inDialog && !hideHeader }"
    role="status">
    <div
      v-if="inDialog && !hideHeader"
      aria-hidden="true"
      class="skeleton-header">
      <span class="skeleton skeleton-copy skeleton-title">DEF-00</span>
      <span class="skeleton skeleton-link" />
    </div>
    <div
      aria-hidden="true"
      class="skeleton-form"
      :class="{ 'has-footer': inDialog }">
      <div class="skeleton-content">
        <div class="skeleton-main">
          <!-- The title, then the description as the editor's three empty lines and its buttons. -->
          <div class="skeleton-head">
            <span class="skeleton skeleton-description-title" />
            <div class="skeleton-description">
              <div class="skeleton-description-lines">
                <span class="skeleton skeleton-description-line" />
                <span class="skeleton skeleton-description-line skeleton-description-line--short" />
                <span
                  class="skeleton skeleton-description-line skeleton-description-line--medium" />
              </div>
              <div class="skeleton-description-actions">
                <span class="skeleton skeleton-icon" />
                <span class="skeleton skeleton-icon" />
                <span class="skeleton skeleton-ai" />
              </div>
            </div>
          </div>
          <div class="skeleton-comments">
            <!-- The kit's tabs: a track with an icon and a label per tab. -->
            <div class="skeleton skeleton-tabs">
              <span class="skeleton-tab">{{ t('comments') }}</span>
              <span class="skeleton-tab">{{ t('history') }}</span>
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
      <div
        v-if="inDialog"
        class="skeleton-footer">
        <span class="skeleton skeleton-footer-menu" />
        <span class="skeleton skeleton-footer-save">
          <span class="skeleton-footer-icon" />
          <span class="skeleton-save-label">{{ t('saveChanges') }}</span>
          <span class="skeleton-save-label-mobile">{{ t('save') }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#layers/core/app/i18n/useI18n'

defineProps<{ hideHeader?: boolean; inDialog?: boolean }>()

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
    save: 'Save',
    saveChanges: 'Save changes',
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
    save: 'Сохранить',
    saveChanges: 'Сохранить изменения',
    space: 'Пространство',
    status: 'Статус',
    updated: 'Изменена',
  },
})
</script>

<style scoped>
.issue-skeleton {
  display: grid;
  flex: 1;
  grid-template-rows: minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
  width: 100%;
}

.issue-skeleton.has-header {
  grid-template-rows: auto minmax(0, 1fr);
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
  justify-self: start;
  user-select: none;
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
}

.skeleton-link {
  border-radius: var(--radius-full);
  height: var(--icon-size);
  width: var(--icon-size);
}

.skeleton-form {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  row-gap: var(--space-2);
}

.skeleton-form.has-footer {
  grid-template-rows: minmax(0, 1fr) auto;
}

.skeleton-footer {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.skeleton-footer-menu {
  height: var(--control-height);
  width: var(--control-height);
}

.skeleton-footer-save {
  align-items: center;
  border: 1px solid transparent;
  color: transparent;
  display: flex;
  gap: var(--space-2);
  height: var(--control-height);
  padding-inline: var(--space-3);
}

.skeleton-footer-icon {
  width: var(--icon-size);
}

.skeleton-save-label-mobile {
  display: none;
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

/* As .issue-head and .issue-description. */
.skeleton-head {
  display: grid;
  gap: var(--space-4);
}

.skeleton-description {
  display: grid;
  gap: var(--space-5);
}

.skeleton-description-title {
  /* The title's line: 24px at the heading line height. */
  height: calc(var(--font-size-title) * var(--line-height-heading));
  width: 76%;
}

/* The editor's empty minimum: three lines of body text. */
.skeleton-description-lines {
  align-items: center;
  display: grid;
  grid-auto-rows: 1.6em;
}

.skeleton-description-line {
  border-radius: var(--radius-small);
  height: 12px;
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

/* As .base-tabs-list and .base-tabs-tab. */
.skeleton-tabs {
  border-radius: calc(var(--radius-control) + 3px);
  display: flex;
  gap: 2px;
  height: var(--control-height);
  justify-self: start;
  padding: 3px;
  width: max-content;
}

.skeleton-tab {
  align-items: center;
  border: 1px solid transparent;
  color: transparent;
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  user-select: none;
}

.skeleton-tab::before {
  content: '';
  width: var(--icon-size);
}

.skeleton-comment-field {
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  height: 88px;
}

.skeleton-side {
  display: grid;
  font-size: var(--font-size-body);
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
  gap: var(--space-1) var(--space-3);
  grid-auto-rows: var(--control-height-small);
  grid-template-columns: 88px minmax(0, 1fr);
}

.skeleton-properties-title {
  font-weight: var(--font-weight-semibold);
}

.skeleton-properties {
  grid-auto-rows: var(--control-height);
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
  min-height: var(--control-height);
  padding: 0 var(--space-3);
}

.skeleton-avatar {
  border-radius: var(--radius-full);
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

/* As the issue: up to 1023px the properties go under it. */
@media (max-width: 1023px) {
  .skeleton-content {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
    overflow: auto;
    row-gap: var(--space-8);
  }

  .skeleton-main,
  .skeleton-side {
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 767px) {
  .skeleton-save-label {
    display: none;
  }

  .skeleton-save-label-mobile {
    display: inline;
  }
}
</style>
