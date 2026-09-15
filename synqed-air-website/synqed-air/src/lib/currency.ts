// Currency conversion utilities for African diaspora travelers

export interface ExchangeRates {
  [currency: string]: number; // e.g., { "NGN": 1550, "GHS": 12.5, "KES": 130 }
}

// Dynamic booking fee configuration based on user location/currency
export interface BookingFeeConfig {
  baseFeeUSD: number; // Base fee in USD
  currency: string;  // The currency to charge in
  adjustedFee: number; // Final fee in local currency
}

// African country code to currency mapping
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: "NGN", // Nigeria
  GH: "GHS", // Ghana
  KE: "KES", // Kenya
  ET: "ETB", // Ethiopia
  ZA: "ZAR", // South Africa
  SN: "XOF", // Senegal (West African CFA franc)
  CM: "XAF", // Cameroon (Central African CFA franc)
  TZ: "TZS", // Tanzania
  UG: "UGX", // Uganda
  RW: "RWF", // Rwanda
  // Diaspora countries
  GB: "GBP", // United Kingdom
  US: "USD", // United States
  CA: "CAD", // Canada
  AE: "AED", // United Arab Emirates
  DE: "EUR", // Germany
  FR: "EUR", // France
  NL: "EUR", // Netherlands
  IT: "EUR", // Italy
  SA: "SAR", // Saudi Arabia
  QA: "QAR", // Qatar
};

// Paystack supported currencies
export const PAYSTACK_SUPPORTED_CURRENCIES = ["NGN", "USD", "GHS", "ZAR", "KES"] as const;

// Fallback exchange rates (should be updated from real API)
const FALLBACK_RATES: ExchangeRates = {
  NGN: 1550, // Nigerian Naira
  GHS: 12.5, // Ghanaian Cedi
  KES: 130, // Kenyan Shilling
  ZAR: 18.5, // South African Rand
  ETB: 57, // Ethiopian Birr
  XOF: 620, // West African CFA Franc
  XAF: 620, // Central African CFA Franc
  TZS: 2500, // Tanzanian Shilling
  UGX: 3800, // Ugandan Shilling
  RWF: 1300, // Rwandan Franc
  GBP: 0.79, // British Pound
  EUR: 0.92, // Euro
  CAD: 1.36, // Canadian Dollar
  AED: 3.67, // UAE Dirham
  SAR: 3.75, // Saudi Riyal
  QAR: 3.64, // Qatari Riyal
};

let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch real-time exchange rates from our API
 * Falls back to hardcoded rates if API fails
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Fetch from our internal API route
    const response = await fetch("/api/currency/rates");
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.rates) {
        cachedRates = data.rates;
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch exchange rates, using fallback:", error);
  }

  // Fallback to hardcoded rates
  cachedRates = FALLBACK_RATES;
  lastFetchTime = now;
  return cachedRates;
}

/**
 * Convert amount from USD to target currency
 */
export async function convertFromUSD(
  amountUSD: number,
  targetCurrency: string
): Promise<number> {
  const rates = await fetchExchangeRates();
  const rate = rates[targetCurrency] || 1;
  return amountUSD * rate;
}

/**
 * Convert amount from source currency to target currency
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await fetchExchangeRates();
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
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

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if currency not supported by Intl
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Get user's currency based on country code
 */
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode] || "USD";
}

/**
 * Check if currency is supported by Paystack
 */
export function isPaystackSupported(currency: string): boolean {
  return PAYSTACK_SUPPORTED_CURRENCIES.includes(currency as any);
}

/**
 * Get Paystack-compatible currency (fallback to USD if not supported)
 */
export function getPaystackCurrency(currency: string): string {
  return isPaystackSupported(currency) ? currency : "USD";
}

/**
 * Calculate dynamic booking fee based on user's location/currency
 * Base fee is $20 USD, converted to local currency for payment
 */
export function calculateDynamicBookingFee(
  userCurrency: string,
  exchangeRates: ExchangeRates
): BookingFeeConfig {
  const baseFeeUSD = 20; // Flat $20 booking fee in USD
  
  // Convert to user's currency
  const rate = exchangeRates[userCurrency] || 1;
  const feeInLocalCurrency = baseFeeUSD * rate;
  
  // Use Paystack-supported currency, or USD if not supported
  const paymentCurrency = getPaystackCurrency(userCurrency);
  const paymentRate = exchangeRates[paymentCurrency] || 1;
  const feeInPaymentCurrency = (baseFeeUSD * paymentRate);
  
  return {
    baseFeeUSD: baseFeeUSD,
    currency: paymentCurrency,
    adjustedFee: feeInPaymentCurrency,
  };
}