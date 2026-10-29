<!-- A coding agent acting for a person: a robot instead of the person's initials, so its comments and changes don't
     read as the person's own. -->
<template>
  <BaseAvatar
    color="var(--color-accent)"
    initials=""
    size="sm">
    <IconRobot aria-hidden="true" />
  </BaseAvatar>
</template>

<script setup lang="ts">
import { IconRobot } from '@tabler/icons-vue'

import BaseAvatar from '#layers/core/app/ui/components/BaseAvatar.vue'
</script>
