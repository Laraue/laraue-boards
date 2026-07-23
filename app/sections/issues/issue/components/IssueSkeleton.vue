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
    <div class="skeleton-content">
      <div class="skeleton-main">
        <span class="skeleton skeleton-text" />
        <div class="skeleton-attachments">
          <span class="skeleton skeleton-attachment-button" />
          <span class="skeleton skeleton-attachment-hint" />
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
</template>

<style scoped>
.issue-skeleton {
  align-self: start;
  animation: issue-skeleton-pulse 1.4s ease-in-out infinite;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
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
  height: var(--control-height-compact);
  width: var(--control-height-compact);
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

.skeleton-content {
  column-gap: var(--space-6);
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
  margin-top: var(--space-5);
  min-height: 0;
  overflow: hidden;
}

.skeleton-main {
  display: grid;
  grid-template-rows: minmax(376px, 1fr) auto;
  min-height: 0;
}

.skeleton-text {
  height: 100%;
}

.skeleton-attachments {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.skeleton-attachment-button {
  height: var(--control-height);
  width: 148px;
}

.skeleton-attachment-hint {
  height: 14px;
  width: 200px;
}

.skeleton-side {
  align-content: start;
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-auto-rows: minmax(var(--control-height), auto);
  grid-template-columns: max-content minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
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
  margin-top: var(--space-4);
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
  }

  .skeleton-side {
    display: none;
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
