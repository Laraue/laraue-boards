<template>
  <div
    aria-label="Loading issue"
    class="issue-skeleton"
    role="status">
    <div
      aria-hidden="true"
      class="skeleton-header">
      <span class="skeleton skeleton-back" />
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
          <div class="skeleton-attachments">
            <strong class="section-label skeleton skeleton-copy">Attachments</strong>
            <div class="skeleton-attachment-actions">
              <span class="secondary small skeleton skeleton-control">
                <ImagePlus />
                Choose images
              </span>
              <span class="muted skeleton skeleton-copy skeleton-attachment-hint">
                or paste PNG/JPG with Ctrl+V
              </span>
            </div>
          </div>
          <div class="skeleton-comments">
            <strong class="section-label skeleton skeleton-copy">Comments</strong>
            <span class="skeleton skeleton-comment-field" />
          </div>
        </div>
        <div class="skeleton-side">
          <template
            v-for="label in ['Space', 'Board', 'Status', 'Assignee']"
            :key="label">
            <span class="skeleton skeleton-copy skeleton-label">{{ label }}</span>
            <span class="skeleton skeleton-field" />
          </template>
          <span class="skeleton skeleton-copy skeleton-label">Owner</span>
          <div class="skeleton-person">
            <span class="skeleton skeleton-avatar" />
            <span class="skeleton skeleton-copy skeleton-name">win7user10</span>
          </div>
          <span class="skeleton skeleton-copy skeleton-label">Created</span>
          <span class="skeleton skeleton-copy skeleton-date">Jun 2, 2026, 7:26 AM</span>
          <span class="skeleton skeleton-copy skeleton-label">Updated</span>
          <span class="skeleton skeleton-copy skeleton-date">Jun 2, 2026, 7:26 AM</span>
        </div>
      </div>
      <div class="skeleton-actions">
        <span class="primary skeleton skeleton-control">Save changes</span>
        <span class="secondary danger skeleton skeleton-control">Delete issue</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImagePlus } from '@lucide/vue'
</script>

<style scoped>
.issue-skeleton {
  align-self: start;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
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

.skeleton-copy,
.skeleton-control {
  color: transparent;
  user-select: none;
}

.skeleton-copy {
  justify-self: start;
  width: max-content;
}

.skeleton-control {
  border-color: transparent;
  display: inline-flex;
  pointer-events: none;
}

.skeleton-control .lucide {
  visibility: hidden;
}

.skeleton-header {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.skeleton-back {
  height: var(--icon-btn-size);
  width: var(--icon-btn-size);
}

.skeleton-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
}

.skeleton-link {
  border-radius: var(--radius-pill);
  height: var(--icon-size);
  width: var(--icon-size);
}

.skeleton-form {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  margin-top: var(--space-5);
  min-height: 0;
  row-gap: var(--space-6);
}

.skeleton-content {
  align-items: start;
  column-gap: var(--space-6);
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
  grid-template-rows: fit-content(100%);
  min-height: 0;
  overflow: hidden;
  padding-bottom: var(--space-1);
}

.skeleton-main {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.skeleton-main > * {
  flex-shrink: 0;
}

.skeleton-description {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--space-3);
  min-height: 200px;
  padding: var(--space-3);
}

.skeleton-description-title {
  height: 20px;
  width: 42%;
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

.skeleton-attachments,
.skeleton-comments {
  display: grid;
  gap: var(--space-3);
}

.skeleton-attachment-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.skeleton-attachment-hint {
  font-size: var(--font-size-small);
}

.skeleton-comment-field {
  height: var(--control-height);
}

.skeleton-side {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-auto-rows: minmax(var(--control-height), auto);
  grid-template-columns: max-content minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  place-self: start stretch;
}

.skeleton-label {
  border-radius: var(--radius-small);
  font-weight: var(--font-weight-semibold);
}

.skeleton-field {
  height: var(--control-height);
}

.skeleton-person {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.skeleton-avatar {
  border-radius: var(--radius-pill);
  height: 28px;
  width: 28px;
}

.skeleton-name {
  white-space: nowrap;
}

.skeleton-date {
  white-space: nowrap;
}

.skeleton-actions {
  display: flex;
  gap: var(--space-3);
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
    row-gap: var(--space-5);
  }

  .skeleton-main,
  .skeleton-side {
    overflow: visible;
  }

  .skeleton-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
