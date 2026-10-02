import { getInvalidInputError, getResponseMessage } from './getInvalidInputError'
import type { ApiResponse } from './tryRequest'

/** A request the API did not fulfil. `status` is 0 when no response came back; `reason` is the
 * backend's own text for the user (validation errors, payment required), empty otherwise. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly reason = '',
  ) {
    super(`API request failed with status ${status}`)
  }
}

export const isApiError = (error: unknown, status?: number): error is ApiError =>
  error instanceof ApiError && (status === undefined || error.status === status)

/** The data of an openapi-fetch call, or an `ApiError`: `await request(client.GET('/api/spaces'))`.
 * An aborted request still throws its `AbortError`, so a superseded load is not a failure. */
export const request = async <Response extends ApiResponse<unknown>>(
  call: Promise<Response>,
): Promise<NonNullable<Response['data']>> => {
  let response: Response
  try {
    response = await call
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }
    throw new ApiError(0)
  }

  const { data, error } = response
  // A failed response with an empty body (a bare 401 or 404) comes back without an `error`, so the
  // HTTP status decides.
  if (error === undefined && response.response.ok) {
    return data as NonNullable<Response['data']>
  }
  const { status } = response.response
  if (status === 400) {
    throw new ApiError(status, getInvalidInputError(error).message)
  }
  // Payment required carries the reason (no AI credits, plan limit) - show it instead of a generic failure.
  throw new ApiError(status, status === 402 ? getResponseMessage(error) : '')
}
