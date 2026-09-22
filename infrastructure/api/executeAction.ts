import type { ActionResult } from './apiResult'
import { getInvalidInputError } from './getInvalidInputError'
import { isErrorResponse, tryRequest, type ApiResponse } from './tryRequest'

type ActionResponse<Data> = ApiResponse<Data>

export const executeAction = async <RawData, Data>({
  map,
  request,
}: {
  map: (data: RawData) => Data | undefined
  request: () => Promise<ActionResponse<RawData> | undefined>
}): Promise<ActionResult<Data>> => {
  const response = await tryRequest(request)

  if (!response) {
    return { code: 0, status: 'error' }
  }
  if (isErrorResponse(response) && response.response.status === 400) {
    return { message: getInvalidInputError(response.error).message, status: 'validation-error' }
  }
  if (isErrorResponse(response)) {
    return { code: response.response.status, status: 'error' }
  }
  const data = map(response.data)
  return data === undefined ? { code: 0, status: 'error' } : { data, status: 'success' }
}
