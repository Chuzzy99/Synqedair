const DISMISS_KEY = "synqed_signin_prompt_dismissed_at";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export const isSnoozed = (): boolean => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SNOOZE_MS;
  } catch {
    return false;
  }
};

export const snooze = () => {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage unavailable, the prompt may show again next visit
  }
};