<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :description="t('description')"
    :title="t('title')"
    @submit="send">
    <BaseFieldGroup>
      <BaseField :label="t('type')">
        <template #default="{ labelId }">
          <div
            :aria-labelledby="labelId"
            class="base-tabs-list"
            role="group">
            <button
              v-for="type in types"
              :key="type"
              :aria-pressed="state.type === type"
              class="base-tabs-tab"
              :disabled="sending"
              type="button"
              @click="state.type = type">
              {{ t(type) }}
            </button>
          </div>
        </template>
      </BaseField>
      <BaseField
        :hint="t('hint')"
        :label="t('message')">
        <template #default="{ describedby, id }">
          <textarea
            :id="id"
            v-model="state.message"
            :aria-describedby="describedby"
            class="feedback-message"
            :disabled="sending"
            :maxlength="MAX_MESSAGE_LENGTH"
            :placeholder="t(`${state.type}Placeholder`)"
            required
            rows="6" />
        </template>
      </BaseField>
    </BaseFieldGroup>
    <p
      v-if="message"
      class="form-error">
      {{ message }}
    </p>
    <template #actions>
      <BaseButton
        :disabled="sending"
        @click="dialog?.close()">
        {{ t('cancel') }}
      </BaseButton>
      <BaseButton
        :disabled="!state.message.trim()"
        :loading="sending"
        type="submit"
        variant="primary">
        {{ sending ? t('sending') : t('send') }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import type { FeedbackDialogDeps } from './FeedbackDialog.deps'
import type { FeedbackType } from './FeedbackDialog.types'

// The feedback service keeps at most this many characters of a message.
const MAX_MESSAGE_LENGTH = 3000

const types: FeedbackType[] = ['bug', 'idea', 'question']

const props = defineProps<{ deps: FeedbackDialogDeps }>()

const { locale, t } = useI18n({
  en: {
    bug: 'Bug',
    bugPlaceholder: 'What happened, and what did you expect?',
    cancel: 'Cancel',
    close: 'Close',
    description: 'The team reads every message.',
    hint: 'The address of this page is sent with it.',
    idea: 'Idea',
    ideaPlaceholder: 'What would make Boards better for you?',
    message: 'Message',
    question: 'Question',
    questionPlaceholder: 'What would you like to know?',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Thank you! Your feedback has been sent.',
    title: 'Send feedback',
    type: 'Type',
  },
  ru: {
    bug: 'Ошибка',
    bugPlaceholder: 'Что произошло и что вы ожидали увидеть?',
    cancel: 'Отмена',
    close: 'Закрыть',
    description: 'Команда читает каждое сообщение.',
    hint: 'Вместе с ним отправится адрес этой страницы.',
    idea: 'Идея',
    ideaPlaceholder: 'Что сделало бы Boards удобнее для вас?',
    message: 'Сообщение',
    question: 'Вопрос',
    questionPlaceholder: 'Что вы хотели бы узнать?',
    send: 'Отправить',
    sending: 'Отправка…',
    sent: 'Спасибо! Ваш отзыв отправлен.',
    title: 'Обратная связь',
    type: 'Тип',
  },
})

const toast = useToast()

const dialog = useTemplateRef('dialog')

const state = reactive({
  message: '',
  type: 'bug' as FeedbackType,
})

const { execute, message, pending: sending } = useApiAction(props.deps.send)

const open = () => {
  message.value = undefined
  dialog.value?.open()
}

const send = async (): Promise<void> => {
  if (!state.message.trim() || sending.value) {
    return
  }
  const sent = await execute({
    browser: navigator.userAgent,
    locale: locale.value,
    message: state.message,
    page: location.href,
    type: state.type,
  })
  if (sent) {
    Object.assign(state, { message: '', type: 'bug' })
    dialog.value?.close()
    toast.show(t('sent'), 'success')
  }
}

watch(
  () => [state.type, state.message],
  () => {
    message.value = undefined
  },
)

defineExpose({ open })
</script>

<style scoped>
.feedback-message {
  resize: vertical;
  width: 100%;
}
</style>
