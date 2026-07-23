<template>
  <section class="form-page">
    <div class="page-heading">
      <AppBackLink
        label="Back to space"
        :to="organizationRoutes.space(spaceKey)" />
      <div class="page-heading-text">
        <h1>Create board</h1>
      </div>
    </div>
    <form @submit.prevent="submit({ color: form.color, name: form.name, spaceKey })">
      <label for="create-board-name">Name</label>
      <input
        id="create-board-name"
        v-model="form.name"
        required />
      <label>Color</label>
      <AppColorPicker v-model="form.color" />
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="form-actions">
        <button
          class="primary"
          :disabled="pending">
          {{ pending ? 'Creating…' : 'Create board' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import type { CreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPage.deps'

const props = defineProps<{
  deps: CreateBoardPageDeps
  onCreated: (boardId: string) => Promise<void> | void
  spaceKey: string
}>()

const organizationRoutes = useOrganizationRoutes()

const form = reactive({
  color: DEFAULT_COLOR,
  name: '',
})

useHead({ title: 'Create board' })

const {
  execute: submit,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: (board) => props.onCreated(board.boardId),
})
</script>
