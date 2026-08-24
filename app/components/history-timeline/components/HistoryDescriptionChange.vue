<template>
  <IssueDescriptionDiff
    :diff="change.diff"
    :label="change.label" />
</template>

<script setup lang="ts">
import IssueDescriptionDiff from '~/sections/issues/issue/components/IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.vue'

import type { HistoryDescriptionChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryDescriptionChangeViewModel }>()
</script>
