export type QueryResult<Data> =
  | { code: number; status: 'error' }
  | { data: Data; status: 'success' }

export type ActionResult<Data> =
  | { code: number; status: 'error' }
  | { data: Data; status: 'success' }
  | { message: string; status: 'validation-error' }
