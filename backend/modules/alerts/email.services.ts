import { env } from '../../config/env.js'

const EMAIL_TIMEOUT_MS = 10_000

export const isEmailConfigured = () =>
  Boolean(env.BREVO_API_KEY && env.ALERT_EMAIL_FROM && env.ALERT_EMAIL_TO)

// Returns true only if Brevo accepted the email.
// Never log the API key or the raw error, which can contain request details
export const sendEmail = async (subject: string, text: string) => {
  if (!env.BREVO_API_KEY || !env.ALERT_EMAIL_FROM || !env.ALERT_EMAIL_TO) return false

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.ALERT_EMAIL_FROM_NAME, email: env.ALERT_EMAIL_FROM },
        to: env.ALERT_EMAIL_TO.map((email) => ({ email })),
        subject,
        textContent: text,
      }),
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error(`[ALERT] Brevo rejected the email (HTTP ${response.status})`)
      return false
    }

    return true
  } catch (error) {
    console.error('[ALERT] Email request failed:', error instanceof Error ? error.name : 'unknown error')
    return false
  }
}