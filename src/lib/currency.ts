// Currency conversion utilities for Synqed Air

export interface ExchangeRates {
  [currency: string]: number;
}

// Fallback exchange rates (USD base)
const FALLBACK_RATES: ExchangeRates = {
  NGN: 1550,   // Nigerian Naira
  GHS: 12.5,   // Ghanaian Cedi
  KES: 130,    // Kenyan Shilling
  ZAR: 18.5,   // South African Rand
  ETB: 57,     // Ethiopian Birr
  XOF: 620,    // West African CFA Franc
  XAF: 620,    // Central African CFA Franc
  TZS: 2500,   // Tanzanian Shilling
  UGX: 3800,   // Ugandan Shilling
  RWF: 1300,   // Rwandan Franc
  GBP: 0.79,   // British Pound
  EUR: 0.92,   // Euro
  CAD: 1.35,   // Canadian Dollar
  AED: 3.67,   // UAE Dirham
  SAR: 3.75,   // Saudi Riyal
  QAR: 3.64,   // Qatari Riyal
  USD: 1,      // US Dollar
};

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  ET: "ETB",
  SN: "XOF",
  CM: "XAF",
  TZ: "TZS",
  UG: "UGX",
  RW: "RWF",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  NL: "EUR",
};

// Paystack supported currencies
export const PAYSTACK_SUPPORTED_CURRENCIES = ["NGN", "USD", "GHS", "ZAR", "KES"];

let cachedRates: ExchangeRates | null = null;
let ratesCacheTime: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Get user's location and currency from IP
 */
export async function getUserLocation(): Promise<{ country: string; currency: string }> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    const country = data.country_code || "US";
    const currency = COUNTRY_CURRENCY_MAP[country] || "USD";

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("synqed_country_code", country);
      localStorage.setItem("synqed_currency", currency);
      localStorage.setItem("synqed_last_location", Date.now().toString());
    }

    return { country, currency };
  } catch (error) {
    console.error("Failed to get user location:", error);
    return { country: "US", currency: "USD" };
  }
}

/**
 * Get stored location/currency from localStorage
 */
export function getStoredLocation(): { country: string; currency: string } | null {
  if (typeof window === "undefined") return null;

  const country = localStorage.getItem("synqed_country_code");
  const currency = localStorage.getItem("synqed_currency");
  const lastLocation = localStorage.getItem("synqed_last_location");

  if (country && currency && lastLocation) {
    const cacheAge = Date.now() - parseInt(lastLocation);
    // Cache location for 24 hours
    if (cacheAge < 24 * 60 * 60 * 1000) {
      return { country, currency };
    }
  }

  return null;
}

/**
 * Fetch exchange rates from API or use fallback
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();

  // Return cached rates if still valid
  if (cachedRates && ratesCacheTime && (now - ratesCacheTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      : `https://api.exchangerate-api.com/v4/latest/USD`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.rates) {
      cachedRates = data.rates as ExchangeRates;
      ratesCacheTime = now;
      return cachedRates;
    }
  } catch (error) {
    console.error("Failed to fetch exchange rates, using fallback:", error);
  }

  // Use fallback rates if API fails
  return FALLBACK_RATES;
}

/**
 * Convert USD amount to target currency
 */
export async function convertUSDToCurrency(
  amountUSD: number,
  targetCurrency: string
): Promise<number> {
  if (targetCurrency === "USD") return amountUSD;

  const rates = await getExchangeRates();
  const rate = rates[targetCurrency] || FALLBACK_RATES[targetCurrency] || 1;

  return amountUSD * rate;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(0)}`;
  }
}

/**
 * Get Paystack-supported currency for payment
 * Falls back to USD if local currency not supported
 */
export function getPaystackCurrency(localCurrency: string): string {
  if (PAYSTACK_SUPPORTED_CURRENCIES.includes(localCurrency)) {
    return localCurrency;
  }
  return "USD";
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    NGN: "₦",
    GHS: "GH₵",
    KES: "KSh",
    ZAR: "R",
    ETB: "Br",
    XOF: "CFA",
    XAF: "CFA",
    TZS: "TSh",
    UGX: "USh",
    RWF: "RF",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AED: "د.إ",
    SAR: "﷼",
    QAR: "﷼",
  };

  return symbols[currency] || currency;
}
