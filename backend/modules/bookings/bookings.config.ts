import { env } from '../../config/env.js'
import { AppError } from '../../utils/appError.js'

// Where the payment provider sends the customer back to. Comes from env, never from the request.
// The first CLIENT_URL entry is used, so put your main site first
export const getFrontendUrl = () => {
  const url = env.CLIENT_URL[0]

  if (!url) {
    console.error('CLIENT_URL has no usable value')
    throw new AppError('Payments are not available right now. Please try again later.', 503)
  }

  return url
}