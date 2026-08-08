<template>
  <section
    v-if="visible"
    class="checklist">
    <button
      aria-label="Hide the setup checklist"
      class="icon-btn small checklist-close"
      type="button"
      @click="dismiss">
      <X />
    </button>
    <!-- eslint-disable-next-line vue/no-v-html -- static markup from ~/constants/mascot -->
    <div
      class="checklist-mascot"
      v-html="mascotSvg" />
    <strong>Get set up</strong>
    <p class="muted checklist-progress">{{ completedCount }} of {{ items.length }} done</p>
    <ul>
      <li
        v-for="item in items"
        :key="item.label">
        <NuxtLink
          :class="{ done: item.done }"
          :to="item.to">
          <component
            :is="item.done ? CircleCheck : Circle"
            class="checklist-icon" />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { Circle, CircleCheck, X } from '@lucide/vue'

import { mascotSvg } from '~/constants/mascot'
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'

const props = defineProps<{ viewModel: AppLayoutData }>()
const routes = useOrganizationRoutes()
const { completed, dismiss, dismissed } = useOnboardingTasks(() => routes.organizationKey.value)

const firstSpace = computed(() => props.viewModel.spaces[0])

const items = computed(() => [
  ...(props.viewModel.organization.canCreateSpaces
    ? [
        {
          done: props.viewModel.spaces.length > 0,
          label: 'Create a space',
          to: routes.newSpace(),
        },
      ]
    : []),
  {
    done: completed.value.includes('board'),
    label: 'Add a board',
    to: firstSpace.value ? routes.newBoard(firstSpace.value.key) : routes.newSpace(),
  },
  {
    done: completed.value.includes('issue'),
    label: 'Create an issue',
    to: routes.newIssue(),
  },
  {
    done: completed.value.includes('move'),
    label: 'Move an issue',
    to: firstSpace.value ? routes.space(firstSpace.value.key) : routes.newSpace(),
  },
  ...(props.viewModel.organization.canManage
    ? [
        {
          done: completed.value.includes('invite'),
          label: 'Invite your team',
          to: routes.permissions(),
        },
      ]
    : []),
])
const completedCount = computed(() => items.value.filter((item) => item.done).length)
const visible = computed(() => !dismissed.value && completedCount.value < items.value.length)
</script>

<style scoped>
.checklist {
  background: var(--color-soft);
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  position: relative;
}

.checklist-close {
  background: transparent;
  border-color: transparent;
  color: var(--color-muted);
  position: absolute;
  right: var(--space-2);
  top: var(--space-2);
}

.checklist-mascot {
  height: 32px;
  width: 32px;
}

.checklist-mascot :deep(svg) {
  height: 100%;
  width: 100%;
}

.checklist strong {
  display: block;
  margin-top: var(--space-2);
}

.checklist-progress {
  font-size: var(--font-size-small);
  margin-bottom: var(--space-2);
}

.checklist ul {
  display: grid;
  gap: 2px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.checklist a {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  text-decoration: none;
  transition: var(--transition-press);
}

.checklist a:hover {
  background: var(--color-hover);
}

.checklist a:active {
  translate: 0 var(--press-offset);
}

.checklist a.done {
  color: var(--color-muted);
  text-decoration: line-through;
}

.checklist-icon {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 14px;
  width: 14px;
}

.checklist a.done .checklist-icon {
  color: var(--color-success);
}
</style>
