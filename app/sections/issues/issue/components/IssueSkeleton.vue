<template>
  <div
    aria-label="Loading issue"
    class="issue-skeleton"
    role="status">
    <div class="skeleton-header">
      <span class="skeleton skeleton-back" />
      <span class="skeleton skeleton-title" />
      <span class="skeleton skeleton-link" />
    </div>
    <div class="skeleton-form">
      <div class="skeleton-content">
        <div class="skeleton-main">
          <span class="skeleton skeleton-text" />
          <div class="skeleton-attachments">
            <span class="skeleton skeleton-section-label" />
            <div class="skeleton-attachment-actions">
              <span class="skeleton skeleton-attachment-button" />
              <span class="skeleton skeleton-attachment-hint" />
            </div>
          </div>
          <div class="skeleton-comments">
            <span class="skeleton skeleton-section-label" />
            <span class="skeleton skeleton-comment-field" />
          </div>
        </div>
        <div class="skeleton-side">
          <template
            v-for="field in 4"
            :key="field">
            <span class="skeleton skeleton-label" />
            <span class="skeleton skeleton-field" />
          </template>
          <span class="skeleton skeleton-label" />
          <div class="skeleton-person">
            <span class="skeleton skeleton-avatar" />
            <span class="skeleton skeleton-name" />
          </div>
          <span class="skeleton skeleton-label" />
          <span class="skeleton skeleton-date" />
          <span class="skeleton skeleton-label" />
          <span class="skeleton skeleton-date" />
        </div>
      </div>
      <div class="skeleton-actions">
        <span class="skeleton skeleton-button skeleton-button--primary" />
        <span class="skeleton skeleton-button" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-skeleton {
  align-self: start;
  animation: issue-skeleton-pulse 1.4s ease-in-out infinite;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  max-height: 100%;
  min-height: 0;
}

.skeleton {
  background: color-mix(in srgb, var(--color-border) 40%, transparent);
  border-radius: var(--radius-control);
  display: block;
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
  height: 28px;
  width: 104px;
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

.skeleton-text {
  flex-grow: 1;
  min-height: 200px;
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

.skeleton-section-label {
  border-radius: var(--radius-small);
  height: 14px;
  width: 88px;
}

.skeleton-attachment-button {
  height: var(--control-height);
  width: 148px;
}

.skeleton-attachment-hint {
  height: 14px;
  width: 200px;
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
  height: 14px;
  width: 72px;
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
  height: 14px;
  width: 104px;
}

.skeleton-date {
  height: 14px;
  width: 140px;
}

.skeleton-actions {
  display: flex;
  gap: var(--space-3);
}

.skeleton-button {
  height: var(--control-height);
  width: 116px;
}

.skeleton-button--primary {
  width: 140px;
}

@keyframes issue-skeleton-pulse {
  50% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .issue-skeleton {
    animation: none;
  }
}

@media (max-width: 760px) {
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

  .skeleton-button,
  .skeleton-button--primary {
    width: auto;
  }
}
</style>
