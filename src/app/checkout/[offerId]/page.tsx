"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DuffelAncillaries } from "@duffel/components";
import { Loader2, ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import { getUserLocation, getStoredLocation, convertUSDToCurrency, getPaystackCurrency, formatCurrency, getCurrencySymbol } from "@/lib/currency";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.offerId as string;

  const [offer, setOffer] = useState<any>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Currency State
  const [localCurrency, setLocalCurrency] = useState<string>("USD");
  const [localTotalPrice, setLocalTotalPrice] = useState<number | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<string>("USD");

  // Form State
  const [passengersData, setPassengersData] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [ancillariesPayload, setAncillariesPayload] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        // Fetch Offer
        const offerRes = await fetch(`/api/flights/offer?id=${offerId}`);
        const offerData = await offerRes.json();
        if (offerData.error) throw new Error("Offer failed");
        setOffer(offerData);

        // Fetch Client Key
        const keyRes = await fetch("/api/client-key", { method: "POST", body: JSON.stringify({ offerId }) });
        const keyData = await keyRes.json();
        if (keyData.client_key) {
          setClientKey(keyData.client_key);
        }

        // Initialize passenger form state
        if (offerData.passengers) {
          setPassengersData(
            offerData.passengers.map((p: any) => ({
              id: p.id,
              type: p.type,
              title: "mr",
              first_name: "",
              last_name: "",
              born_on: "",
              gender: "m",
            }))
          );
        }

        // Get user location and currency
        const stored = getStoredLocation();
        if (stored) {
          setLocalCurrency(stored.currency);
          const paystackCurrency = getPaystackCurrency(stored.currency);
          setPaymentCurrency(paystackCurrency);
        } else {
          const location = await getUserLocation();
          setLocalCurrency(location.currency);
          const paystackCurrency = getPaystackCurrency(location.currency);
          setPaymentCurrency(paystackCurrency);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [offerId]);

  // Update local price when prices change
  useEffect(() => {
    async function updateLocalPrice() {
      if (totalPrice > 0 && localCurrency !== "USD") {
        const converted = await convertUSDToCurrency(totalPrice, localCurrency);
        setLocalTotalPrice(converted);
      } else {
        setLocalTotalPrice(totalPrice);
      }
    }
    updateLocalPrice();
  }, [totalPrice, localCurrency]);

  const updatePassenger = (index: number, field: string, value: string) => {
    const newData = [...passengersData];
    newData[index] = { ...newData[index], [field]: value };
    setPassengersData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <Loader2 className="w-10 h-10 animate-spin text-indigo" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite flex-col">
        <h1 className="text-2xl font-bold text-ink mb-4">Failed to load offer</h1>
        <button onClick={() => router.back()} className="text-indigo underline">Go back</button>
      </div>
    );
  }

  // Calculate prices
  const basePrice = parseFloat(offer.total_amount);
  const ancillariesPrice = ancillariesPayload?.services
    ? ancillariesPayload.services.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount), 0)
    : 0;
  const bookingFee = 20; // $20 USD booking fee
  const totalPrice = basePrice + ancillariesPrice + bookingFee;


  const handlePaystackSuccessAction = async (reference: any) => {
    try {
      // 1. Submit order to our backend
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          passengers: passengersData.map((p) => ({
            ...p,
            phone_number: phoneNumber,
            email: email,
          })),
          services: ancillariesPayload?.services || [],
          payments: [
            {
              type: "balance",
              currency: offer.total_currency,
              amount: offer.total_amount, // The Duffel booking uses balance for the base + services amount
            }
          ],
          paystackRef: reference.reference,
          totalAmount: totalPrice,
          currency: offer.total_currency,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Booking successful! Ref: " + data.orderId);
        // router.push(`/success/${data.orderId}`);
      } else {
        alert("Booking failed on our end. Please contact support.");
      }
    } catch (e) {
      console.error(e);
      alert("Error confirming booking.");
    }
  };

  const handlePaymentInit = async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const callbackUrl = `${window.location.origin}/success`;

      // Use local price for payment if currency is supported, otherwise use USD
      const paymentAmount = localTotalPrice || totalPrice;
      const finalCurrency = paymentCurrency;

      // Call backend to initialize payment
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          passengerName: passengersData[0]?.first_name + " " + passengersData[0]?.last_name,
          passengerEmail: email,
          passengerPhone: phoneNumber,
          amount: paymentAmount,
          currency: finalCurrency,
          callbackUrl,
        }),
      });

      const data = await res.json();

      if (data.paymentAuthorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.paymentAuthorizationUrl;
      } else {
        alert("Failed to initialize payment");
      }
    } catch (e) {
      console.error(e);
      alert("Error initializing payment");
    }
  };

  const handlePaystackCloseAction = () => {
    console.log("Payment closed.");
  };

  // Determine if form is fully filled out
  const isFormValid = email && phoneNumber && passengersData.every(p => p.first_name && p.last_name && p.born_on);

  return (
    <div className="bg-[#f7f9fb] min-h-screen text-ink pb-12">
      <div className="bg-[#0A1128] text-white pb-6 shadow-sm">
        <Nav />
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Complete your booking</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 md:px-10 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Forms & Ancillaries) */}
        <div className="flex-1 space-y-8">
          
          {/* Passengers Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line">
            <h2 className="text-xl font-bold mb-6">Passenger Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Contact Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} 
                    className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all"
                    placeholder="+1 234 567 8900" />
                </div>
              </div>
              
              <div className="h-px bg-line w-full my-6"></div>

              {passengersData.map((p, idx) => (
                <div key={p.id} className="space-y-4">
                  <h3 className="font-semibold text-indigo">Passenger {idx + 1} ({p.type})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Title</label>
                      <select value={p.title} onChange={(e) => updatePassenger(idx, "title", e.target.value)}
                        className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all">
                        <option value="mr">Mr</option>
                        <option value="mrs">Mrs</option>
                        <option value="ms">Ms</option>
                        <option value="miss">Miss</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">First Name</label>
                      <input type="text" value={p.first_name} onChange={(e) => updatePassenger(idx, "first_name", e.target.value)}
                        className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Last Name</label>
                      <input type="text" value={p.last_name} onChange={(e) => updatePassenger(idx, "last_name", e.target.value)}
                        className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Date of Birth</label>
                      <input type="date" value={p.born_on} onChange={(e) => updatePassenger(idx, "born_on", e.target.value)}
                        className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">Gender</label>
                      <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)}
                        className="w-full bg-offwhite border border-line rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo transition-all">
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duffel Ancillaries (Seats, Bags) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line">
            <h2 className="text-xl font-bold mb-6">Customize Your Trip</h2>
            <div className="min-h-[300px]">
              {clientKey ? (
                <DuffelAncillaries
                  offer_id={offer.id}
                  services={offer.available_services || []}
                  passengers={offer.passengers}
                  client_key={clientKey}
                  onPayloadReady={(payload: any) => {
                    setAncillariesPayload(payload);
                  }}
                />
              ) : (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-mist" /></div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Summary & Payment) */}
        <div className="lg:w-[380px]">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-line sticky top-6">
            <h2 className="text-lg font-bold mb-4">Summary</h2>
            
            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-mist">Flight Base</span>
              <span className="font-semibold">{offer.total_currency} {basePrice.toFixed(2)}</span>
            </div>

            {ancillariesPrice > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-line">
                <span className="text-mist">Extras (Seats/Bags)</span>
                <span className="font-semibold">{offer.total_currency} {ancillariesPrice.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-mist">Booking Fee</span>
              <span className="font-semibold">{offer.total_currency} {bookingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-5 text-xl font-bold">
              <span>Total</span>
              <span className="text-indigo">{offer.total_currency} {totalPrice.toFixed(2)}</span>
            </div>

            {localTotalPrice !== null && localCurrency !== "USD" && (
              <div className="bg-[#E8FBFF] p-3 rounded-xl mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1C9BB8] font-medium">Payable in {localCurrency}</span>
                  <span className="text-lg font-bold text-[#1C9BB8]">{getCurrencySymbol(localCurrency)}{localTotalPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                </div>
                {paymentCurrency !== localCurrency && (
                  <p className="text-xs text-[#1C9BB8] mt-1">
                    Processed in {paymentCurrency} via Paystack
                  </p>
                )}
              </div>
            )}

            {!isFormValid && (
              <p className="text-xs text-red-500 mb-4 text-center bg-red-50 p-2 rounded-xl">Please fill out all passenger details before paying.</p>
            )}

            <button
              onClick={handlePaymentInit}
              disabled={!isFormValid}
              className="w-full rounded-2xl bg-indigo text-white font-semibold text-lg py-4 hover:bg-indigo2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Now
            </button>
            
            <p className="text-[10px] text-mist text-center mt-4">Payments processed securely by Paystack. All prices include taxes and fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
