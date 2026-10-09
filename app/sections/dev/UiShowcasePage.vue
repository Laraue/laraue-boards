<!-- Every shared component in its variants and states, to check design changes in one place.
     Switch the theme in the header to see both. -->
<template>
  <div class="showcase">
    <h1>UI</h1>

    <section>
      <h2>Palette</h2>
      <div
        v-for="ramp in ramps"
        :key="ramp.name"
        class="ramp">
        <code>{{ ramp.name }}</code>
        <span
          v-for="step in ramp.steps"
          :key="step"
          class="ramp-step"
          :style="{ background: `var(--${ramp.name}-${step})` }"
          :title="`--${ramp.name}-${step}`">
          {{ step }}
        </span>
      </div>
    </section>

    <section>
      <h2>Semantic colors</h2>
      <div class="swatches">
        <div
          v-for="color in colors"
          :key="color"
          class="swatch">
          <span
            class="swatch-sample"
            :style="{ background: `var(${color})` }" />
          <code>{{ color }}</code>
        </div>
      </div>
    </section>

    <section>
      <h2>Typography</h2>
      <BaseCard class="stack">
        <p :style="{ fontSize: 'var(--font-size-title)', fontWeight: 600 }">Title 24 / 600</p>
        <p :style="{ fontWeight: 500 }">Body 14 / 500 — buttons, row and card titles</p>
        <p>Body 14 / 400 — text, menu rows, options</p>
        <p class="muted">Muted 14 / 400 — secondary context</p>
        <p :style="{ fontSize: 'var(--font-size-small)' }">Small 12 — metadata</p>
        <p :style="{ fontSize: 'var(--font-size-caption)' }">Caption 11 — annotations</p>
        <code>Mono — DEF-42</code>
      </BaseCard>
    </section>

    <section>
      <h2>Radius and spacing</h2>
      <div class="row">
        <div
          v-for="radius in radii"
          :key="radius"
          class="radius-sample"
          :style="{ borderRadius: `var(${radius})` }">
          <code>{{ radius }}</code>
        </div>
      </div>
      <div class="row">
        <div
          v-for="space in spaces"
          :key="space"
          class="space-sample">
          <span :style="{ width: `var(${space})` }" />
          <code>{{ space }}</code>
        </div>
      </div>
    </section>

    <section>
      <h2>BaseButton</h2>
      <div
        v-for="variant in buttonVariants"
        :key="variant"
        class="row">
        <BaseButton :variant="variant">{{ variant }}</BaseButton>
        <BaseButton :variant="variant">
          <IconPlus />
          With icon
        </BaseButton>
        <BaseButton
          size="small"
          :variant="variant">
          Small
        </BaseButton>
        <BaseButton
          loading
          :variant="variant">
          Loading
        </BaseButton>
        <BaseButton
          disabled
          :variant="variant">
          Disabled
        </BaseButton>
      </div>
    </section>

    <section>
      <h2>IconButton</h2>
      <div class="row">
        <IconButton label="Ghost"><IconDots /></IconButton>
        <IconButton
          label="Primary"
          variant="primary">
          <IconPlus />
        </IconButton>
        <IconButton
          label="Danger"
          variant="danger">
          <IconTrash />
        </IconButton>
        <IconButton
          label="Loading"
          loading>
          <IconDots />
        </IconButton>
        <IconButton
          disabled
          label="Disabled">
          <IconDots />
        </IconButton>
      </div>
    </section>

    <section>
      <h2>BaseInput</h2>
      <div class="grid">
        <BaseInput
          v-model="text"
          placeholder="Default" />
        <BaseInput
          v-model="empty"
          placeholder="Placeholder" />
        <BaseInput
          v-model="text"
          variant="inline" />
        <BaseInput
          v-model="text"
          disabled />
      </div>
    </section>

    <section>
      <h2>BaseSelect</h2>
      <div class="grid">
        <BaseSelect
          v-model="option"
          :options="options" />
        <BaseSelect
          v-model="empty"
          :options="options"
          placeholder="Placeholder" />
        <BaseSelect
          v-model="option"
          :options="options"
          variant="inline" />
        <BaseSelect
          v-model="option"
          disabled
          :options="options" />
      </div>
    </section>

    <section>
      <h2>BaseCheckbox</h2>
      <div class="row">
        <BaseCheckbox v-model="checked">Checked</BaseCheckbox>
        <BaseCheckbox v-model="unchecked">Unchecked</BaseCheckbox>
        <BaseCheckbox
          v-model="checked"
          disabled>
          Disabled
        </BaseCheckbox>
      </div>
    </section>

    <section>
      <h2>BaseTabs</h2>
      <BaseTabs
        v-model="tab"
        :items="tabs"
        label="Tabs" />
    </section>

    <section>
      <h2>Popover, menu, tooltip and toast</h2>
      <div class="row">
        <AppPopover>
          <template #trigger="{ open, toggle }">
            <BaseButton
              :aria-expanded="open"
              @click="toggle">
              Open menu
            </BaseButton>
          </template>
          <div class="showcase-menu">
            <BaseButton
              data-active="true"
              menu>
              <IconCheck />
              Active row
            </BaseButton>
            <BaseButton menu>
              <IconArrowsLeftRight />
              Menu row
            </BaseButton>
            <BaseButton
              menu
              variant="danger">
              <IconTrash />
              Danger row
            </BaseButton>
          </div>
        </AppPopover>
        <BaseTooltip text="Tooltip text">
          <BaseButton>Hover for tooltip</BaseButton>
        </BaseTooltip>
        <BaseButton @click="showToast('Saved', 'success')">Success toast</BaseButton>
        <BaseButton @click="showToast('Something went wrong')">Error toast</BaseButton>
      </div>
    </section>

    <section>
      <h2>AppColorPicker</h2>
      <div class="row">
        <AppColorPicker v-model="color" />
        <AppColorPicker
          v-model="color"
          compact />
      </div>
    </section>

    <section>
      <h2>BaseCard and AppEmptyState</h2>
      <BaseCard>
        <AppEmptyState
          hint="A hint below the title."
          title="Nothing here yet" />
      </BaseCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IconArrowsLeftRight, IconCheck, IconDots, IconPlus, IconTrash } from '@tabler/icons-vue'

import { COLOR_PALETTE } from '~/constants/colors'

const colors = [
  '--color-background',
  '--color-workspace',
  '--color-surface',
  '--color-soft',
  '--color-hover',
  '--color-divider',
  '--color-border',
  '--color-text-subtle',
  '--color-muted',
  '--color-text',
  '--color-border-strong',
  '--color-accent',
  '--color-accent-soft',
  '--color-action',
  '--color-on-action',
  '--color-focus',
  '--color-danger',
  '--color-danger-soft',
  '--color-success',
  '--color-success-soft',
  '--color-warning',
  '--color-warning-soft',
]
const twelve = Array.from({ length: 12 }, (_, index) => index + 1)
const ramps = [
  { name: 'gray', steps: twelve },
  { name: 'blue', steps: twelve },
  { name: 'red', steps: [3, 11] },
  { name: 'green', steps: [3, 11] },
  { name: 'amber', steps: [3, 11] },
]
const radii = ['--radius-small', '--radius-control', '--radius-card', '--radius-dialog']
const spaces = [
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-8',
]
const buttonVariants = ['neutral', 'primary', 'danger', 'ghost'] as const
const options = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'progress' },
  { disabled: true, label: 'Disabled option', value: 'disabled' },
]
const tabs = [
  { count: 3, label: 'Comments', value: 'comments' },
  { label: 'History', value: 'history' },
]

const { show: showToast } = useToast()

const text = ref('Text value')
const empty = ref('')
const option = ref('todo')
const checked = ref(true)
const unchecked = ref(false)
const tab = ref('comments')
const color = ref(COLOR_PALETTE[0]?.value ?? '')
</script>

<style scoped>
.showcase {
  display: grid;
  gap: var(--space-8);
  margin: 0 auto;
  max-width: 960px;
  padding: var(--space-6) var(--space-4);
}

section {
  display: grid;
  gap: var(--space-3);
}

h2 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

p {
  margin: 0;
}

.muted {
  color: var(--color-muted);
}

.stack {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
}

.row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.ramp {
  align-items: center;
  display: grid;
  gap: var(--space-1);
  grid-template-columns: 56px repeat(12, minmax(0, 1fr));
}

.ramp-step {
  align-items: flex-end;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-caption);
  height: 40px;
  padding: 2px var(--space-1);
}

.swatches {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.swatch {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.swatch-sample {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  flex: none;
  height: 32px;
  width: 32px;
}

code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-small);
}

.radius-sample {
  align-items: flex-end;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  height: 64px;
  padding: var(--space-2);
  width: 140px;
}

.space-sample {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.space-sample > span {
  background: var(--color-accent);
  height: 16px;
}

.showcase-menu {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-1);
  width: 220px;
}
</style>
