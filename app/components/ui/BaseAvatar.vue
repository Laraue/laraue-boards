<!-- Initials on a color: a circle for people, a rounded square for organizations and other
     entities. The initials scale with the size, so no caller sets a font size. -->
<template>
  <span
    class="base-avatar"
    :class="[size, shape]"
    :style="{ background: color }">
    {{ initials }}
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string
    initials: string
    shape?: 'circle' | 'square'
    // sm 20px next to a name in a row, md 32px for people and organizations in menus and lists.
    size?: 'md' | 'sm'
  }>(),
  { color: 'var(--color-muted)', shape: 'circle', size: 'md' },
)
</script>

<style scoped>
.base-avatar {
  --avatar-size: var(--control-height);

  border-radius: var(--radius-full);
  color: var(--color-on-action);
  display: inline-grid;
  flex: none;
  font-size: calc(var(--avatar-size) * 0.45);
  font-weight: var(--font-weight-medium);
  height: var(--avatar-size);
  line-height: 1;
  place-items: center;
  text-transform: uppercase;
  user-select: none;
  width: var(--avatar-size);
}

.base-avatar.sm {
  --avatar-size: 1.25rem;
}

.base-avatar.square {
  border-radius: var(--radius-control);
}
</style>
