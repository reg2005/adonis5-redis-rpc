import { createError } from '@poppinss/utils'

export const E_REQUEST_TIMEOUT = createError<[string]>(
  'Cannot call "%s" method.',
  'E_REQUEST_TIMEOUT',
  500
)
