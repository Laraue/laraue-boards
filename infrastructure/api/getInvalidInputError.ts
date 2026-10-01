const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

type InvalidInputError = {
  // Empty when the backend sent no messages; the UI shows its own localized text then.
  message: string
  type: 'InvalidInput'
}

export const getInvalidInputError = (value: unknown): InvalidInputError => {
  const messages =
    isRecord(value) && isRecord(value.errors)
      ? Object.values(value.errors).flatMap((errors) =>
          Array.isArray(errors)
            ? errors.filter((error): error is string => typeof error === 'string')
            : [],
        )
      : []

  return { message: messages.join('\n'), type: 'InvalidInput' }
}

// The `message` of an error body ({ message, errors? }); empty when the backend sent none.
export const getResponseMessage = (value: unknown): string =>
  isRecord(value) && typeof value.message === 'string' ? value.message : ''
