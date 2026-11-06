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

// The organization's storage was full (a 402 from an upload): what is used, what the plan gives and what the
// files needed, sent as `errors.storageQuota` = [used, quota, required] so the UI can word it itself.
export type StorageQuotaError = {
  quotaBytes: number
  requiredBytes: number
  usedBytes: number
}

export const getStorageQuotaError = (value: unknown): StorageQuotaError | undefined => {
  const values =
    isRecord(value) && isRecord(value.errors) && Array.isArray(value.errors.storageQuota)
      ? value.errors.storageQuota.map(Number)
      : []
  const [usedBytes, quotaBytes, requiredBytes] = values
  return values.length === 3 && values.every(Number.isFinite)
    ? { quotaBytes: quotaBytes!, requiredBytes: requiredBytes!, usedBytes: usedBytes! }
    : undefined
}

// The `message` of an error body ({ message, errors? }); empty when the backend sent none.
export const getResponseMessage = (value: unknown): string =>
  isRecord(value) && typeof value.message === 'string' ? value.message : ''
