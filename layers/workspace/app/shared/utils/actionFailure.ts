// A failure with the backend's own text (validation, payment required) belongs to the form;
// anything else is a notification with the text for its status.
export const actionFailure = (
  status: number,
  reason: string | undefined,
  errorMessage: (status: number) => string,
) =>
  reason || status === 400
    ? { message: reason || errorMessage(400), target: 'form' as const }
    : { message: errorMessage(status), target: 'notification' as const }
