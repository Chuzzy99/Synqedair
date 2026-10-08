export type GreetingPeriod = "morning" | "afternoon" | "evening" | "night";

// Uses the visitor's local time (the browser's clock)
export const getGreetingPeriod = (date: Date = new Date()): GreetingPeriod => {
  const hour = date.getHours();

  if (hour < 12) return "morning"; // 12:00 AM - 11:59 AM
  if (hour < 16) return "afternoon"; // 12:00 PM - 3:59 PM
  if (hour < 23) return "evening"; // 4:00 PM - 10:59 PM
  return "night"; // 11:00 PM - 11:59 PM
};

const GREETINGS: Record<GreetingPeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Welcome back",
};

export const getGreeting = (date: Date = new Date()): string =>
  GREETINGS[getGreetingPeriod(date)];

export const getFirstName = (user: { name: string | null; email: string }) =>
  user.name?.trim().split(" ")[0] || user.email.split("@")[0] || "there";