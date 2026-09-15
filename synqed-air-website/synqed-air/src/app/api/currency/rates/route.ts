import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Exchange rates API endpoint
export async function GET() {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!apiKey) {
      // Return fallback rates if no API key is configured
      return NextResponse.json({
        rates: {
          NGN: 1550,
          GHS: 12.5,
          KES: 130,
          ZAR: 18.5,
          ETB: 57,
          XOF: 620,
          XAF: 620,
          TZS: 2500,
          UGX: 3800,
          RWF: 1300,
          GBP: 0.79,
          EUR: 0.92,
          CAD: 1.36,
          AED: 3.67,
          SAR: 3.75,
          QAR: 3.64,
        },
        source: "fallback",
        lastUpdated: new Date().toISOString(),
      });
    }

    // Fetch real-time rates from ExchangeRate-API
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.conversion_rates) {
      throw new Error("Invalid response from exchange rate API");
    }

    // Extract only the currencies we need
    const rates = {
      NGN: data.conversion_rates.NGN,
      GHS: data.conversion_rates.GHS,
      KES: data.conversion_rates.KES,
      ZAR: data.conversion_rates.ZAR,
      ETB: data.conversion_rates.ETB,
      XOF: data.conversion_rates.XOF,
      XAF: data.conversion_rates.XAF,
      TZS: data.conversion_rates.TZS,
      UGX: data.conversion_rates.UGX,
      RWF: data.conversion_rates.RWF,
      GBP: data.conversion_rates.GBP,
      EUR: data.conversion_rates.EUR,
      CAD: data.conversion_rates.CAD,
      AED: data.conversion_rates.AED,
      SAR: data.conversion_rates.SAR,
      QAR: data.conversion_rates.QAR,
    };

    return NextResponse.json({
      rates,
      source: "api",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    
    // Return fallback rates on error
    return NextResponse.json({
      rates: {
        NGN: 1550,
        GHS: 12.5,
        KES: 130,
        ZAR: 18.5,
        ETB: 57,
        XOF: 620,
        XAF: 620,
        TZS: 2500,
        UGX: 3800,
        RWF: 1300,
        GBP: 0.79,
        EUR: 0.92,
        CAD: 1.36,
        AED: 3.67,
        SAR: 3.75,
        QAR: 3.64,
      },
      source: "fallback",
      lastUpdated: new Date().toISOString(),
      error: "Failed to fetch live rates, using fallback",
    });
  }
}