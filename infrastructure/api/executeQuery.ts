import type { QueryResult } from './apiResult'
import { tryRequest } from './tryRequest'

type QueryResponse<Data> =
  | { data: Data; response: Response }
  | { error: unknown; response: Response }

export const executeQuery = async <RawData, Data>({
  map,
  request,
}: {
  map: (data: RawData) => Data | undefined
  request: () => Promise<QueryResponse<RawData> | undefined>
}): Promise<QueryResult<Data>> => {
  const response = await tryRequest(request)

  if (response && 'data' in response) {
    const data = map(response.data)
    return data === undefined ? { code: 404, status: 'error' } : { data, status: 'success' }
  }
  return { code: response?.response.status ?? 0, status: 'error' }
}
