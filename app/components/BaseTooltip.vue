<template>
  <!-- Each tooltip has its own provider so it works anywhere, a test mount included. -->
  <TooltipProvider :delay-duration="600">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <!-- Not portaled: a popup outside an open <dialog> would be under it and inert. -->
      <!-- Above by default; where there is no room (the header), Reka turns it below. -->
      <TooltipContent
        class="base-tooltip"
        side="top"
        :side-offset="4">
        {{ text }}
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'

defineProps<{ text: string }>()
</script>

<style>
/* Unscoped: the content is rendered by Reka, outside this component's root. */
.base-tooltip {
  background: var(--color-tooltip);
  border-radius: var(--radius-small);
  color: var(--color-tooltip-text);
  font-size: var(--font-size-small);
  max-width: 240px;
  padding: var(--space-1) var(--space-2);
  z-index: 60;
}
</style>
