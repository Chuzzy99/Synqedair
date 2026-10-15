"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DuffelAncillaries } from "@duffel/components";
import { Loader2, ArrowLeft, AlertCircle, PlaneTakeoff, Clock } from "lucide-react";
import Nav from "@/components/Nav";
import PassengerForm from "@/components/PassengerForm";
import { getStoredLocation, getUserLocation, getPaystackCurrency } from "@/lib/currency";
import { useFlightOffer } from "@/features/client/flights/flights.hook";
import { formatDuration, formatMoney, getSliceMinutes } from "@/features/client/flights/flights.utils";
import type { FlightSlice } from "@/features/client/flights/flights.type";
import {
  getTravelDates,
  validateCheckoutForm,
  type ContactFormValues,
  type PassengerFormValues,
} from "@/features/client/flights/passengers.validation";
import { createInitialPassengers, toBookingPassengers } from "@/features/client/flights/passengers.utils";

const timeOf = (iso: string) => iso.slice(11, 16);

const formatDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

function SliceSummary({ slice, label }: { slice: FlightSlice; label?: string }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];
  if (!first || !last) return null;

  const minutes = getSliceMinutes(slice);
  const flightNumbers = slice.segments.map((seg) => seg.flightNumber).join(" · ");
  const layovers = slice.segments.slice(0, -1).map((seg) => seg.destination.code ?? seg.destination.name);
  const stopsText = slice.stops === 0 ? "Direct" : `${slice.stops} stop${slice.stops > 1 ? "s" : ""} · ${layovers.join(", ")}`;

  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="text-[11px] text-mist font-semibold uppercase tracking-wider mb-2">
        {label ? `${label} · ` : ""}{formatDay(first.departingAt)} · {flightNumbers}
      </div>
      <div className="flex items-center gap-3">
        <div>
          <div className="font-semibold text-ink">{timeOf(first.departingAt)}</div>
          <div className="font-mono text-[11px] text-mist">{first.origin.code ?? first.origin.city}</div>
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-mist text-center mb-1">
            {stopsText}{minutes ? ` · ${formatDuration(minutes)}` : ""}
          </div>
          <div className="h-px bg-line" />
        </div>
        <div className="text-right">
          <div className="font-semibold text-ink">{timeOf(last.arrivingAt)}</div>
          <div className="font-mono text-[11px] text-mist">{last.destination.code ?? last.destination.city}</div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = (params.offerId as string | undefined) ?? null;

  const { offer, isLoading, isError, isExpired, errorMessage, refetch } = useFlightOffer(offerId);

  const [clientKey, setClientKey] = useState<string | null>(null);
  const [localCurrency, setLocalCurrency] = useState<string>("USD");

  const [contact, setContact] = useState<ContactFormValues>({ email: "", phone: "" });
  const [passengers, setPassengers] = useState<PassengerFormValues[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [ancillariesPayload, setAncillariesPayload] = useState<any>(null);

  const expiresAt = offer?.expiresAt ?? null;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const refetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!offerId) return;

    const loadClientKey = async () => {
      try {
        const keyRes = await fetch("/api/client-key", { method: "POST", body: JSON.stringify({ offerId }) });
        if (!keyRes.ok) return setClientKey("");
        const keyData = await keyRes.json();
        setClientKey(keyData.client_key || "");
      } catch (keyError) {
        console.error("Client key fetch failed:", keyError);
        setClientKey("");
      }
    };

    loadClientKey();
  }, [offerId]);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const stored = getStoredLocation();
        if (stored) return setLocalCurrency(stored.currency);
        const location = await getUserLocation();
        setLocalCurrency(location.currency);
      } catch (currencyError) {
        console.error("Currency fetch failed:", currencyError);
      }
    };

    loadCurrency();
  }, []);

  const loadedOfferId = offer?.id;

  useEffect(() => {
    if (!offer) return;
    setPassengers(createInitialPassengers(offer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedOfferId]);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => setSecondsLeft(Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (secondsLeft !== 0 || !expiresAt || refetchedFor.current === expiresAt) return;
    refetchedFor.current = expiresAt;
    refetch();
  }, [secondsLeft, expiresAt, refetch]);

  const errors = useMemo(
    () => (offer ? validateCheckoutForm(contact, passengers, offer) : {}),
    [contact, passengers, offer]
  );

  const updatePassenger = (index: number, patch: Partial<PassengerFormValues>) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  if (isLoading || (!offer && !isError)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite">
        <Loader2 className="w-10 h-10 animate-spin text-indigo mb-4" />
        <p className="text-mist font-medium">Checking this fare is still available…</p>
      </div>
    );
  }

  if (isError || !offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          {isExpired ? <PlaneTakeoff className="w-8 h-8 text-red-400" /> : <AlertCircle className="w-8 h-8 text-red-400" />}
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">
          {isExpired ? "This fare is no longer available" : "We couldn't load this fare"}
        </h1>
        <p className="text-mist text-sm max-w-sm mb-6 leading-relaxed">
          {isExpired ? "Prices and seats change quickly. Go back to your results or search again to see current fares." : errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {!isExpired && (
            <button
              onClick={() => refetch()}
              className="bg-[#0A1128] text-white font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#16224A] transition-colors"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 bg-[#E8FBFF] text-[#1C9BB8] font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#D0F4FD] transition-colors border border-[#C9F1FC]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to results
          </button>
        </div>
      </div>
    );
  }

  const money = (amount: string | number) => formatMoney(amount, offer.totalCurrency);

  const ancillariesPrice = ancillariesPayload?.services
    ? ancillariesPayload.services.reduce((acc: number, s: any) => acc + parseFloat(s.total_amount), 0)
    : 0;
  const totalPrice = Number(offer.totalAmount) + ancillariesPrice;
  const isRoundTrip = offer.slices.length > 1;
  const travelers = offer.passengers.length;
  const dates = getTravelDates(offer);
  const formReady = passengers.length === offer.passengers.length;
  const fareClosed = secondsLeft === 0;
  const fareRunningOut = secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 180;

  const handlePaymentInit = async () => {
    setPayError(null);

    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsPaying(true);

    try {
      const callbackUrl = `${window.location.origin}/success`;
      const services = ancillariesPayload?.services || [];
      const chargeCurrency = getPaystackCurrency(localCurrency);
      const bookingPassengers = toBookingPassengers(passengers, contact, offer.identityDocumentsRequired);

      const res = await fetch("/api/bookings/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          passengerName: `${bookingPassengers[0].first_name} ${bookingPassengers[0].last_name}`,
          passengerEmail: bookingPassengers[0].email,
          passengerPhone: bookingPassengers[0].phone_number,
          amount: totalPrice,
          currency: offer.totalCurrency,
          chargeCurrency,
          callbackUrl,
          passengers: bookingPassengers,
          services,
        }),
      });

      const data = await res.json();

      if (data.paymentAuthorizationUrl) {
        window.location.href = data.paymentAuthorizationUrl;
        return;
      }

      setPayError(data.paystackError || data.error || "We could not start your payment. Please try again.");
    } catch (e) {
      console.error(e);
      setPayError("Something went wrong starting your payment. Please try again.");
    }

    setIsPaying(false);
  };

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
        <div className="flex-1 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line">
            <div className="flex items-center gap-2 mb-2">
              {offer.airline.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={offer.airline.logo} alt="" className="w-6 h-6 object-contain" />
              )}
              <h2 className="text-xl font-bold">
                {offer.slices[0]?.origin.city} → {offer.slices[0]?.destination.city}
              </h2>
            </div>
            <p className="text-xs text-mist mb-2">
              {offer.airline.name}{isRoundTrip ? " · Round trip" : " · One way"} · {travelers} traveler{travelers > 1 ? "s" : ""}
            </p>
            <div>
              {offer.slices.map((slice, index) => (
                <SliceSummary
                  key={slice.id}
                  slice={slice}
                  label={isRoundTrip ? (index === 0 ? "Outbound" : "Return") : undefined}
                />
              ))}
            </div>
          </div>

          <PassengerForm
            contact={contact}
            onContactChange={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
            passengers={passengers}
            onPassengerChange={updatePassenger}
            identityRequired={offer.identityDocumentsRequired}
            dates={dates}
            errors={errors}
            showAll={showErrors}
          />

          {clientKey && (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line">
              <h2 className="text-xl font-bold mb-6">Customize Your Trip</h2>
              <div className="min-h-[300px]">
                <DuffelAncillaries
                  offer_id={offer.id}
                  services={offer.availableServices as any}
                  passengers={offer.passengers as any}
                  client_key={clientKey}
                  onPayloadReady={(payload: any) => {
                    setAncillariesPayload(payload);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-[380px]">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-line sticky top-6">
            <h2 className="text-lg font-bold mb-4">Summary</h2>

            {secondsLeft !== null && (
              <div
                className={`flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 mb-4 ${
                  fareRunningOut || fareClosed ? "bg-amber-50 text-amber-700" : "bg-[#E8FBFF] text-[#1C9BB8]"
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                {fareClosed ? "Confirming this fare is still available…" : `This fare is held for ${formatCountdown(secondsLeft)}`}
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-mist">Fare</span>
              <span className="font-semibold">{money(offer.baseAmount)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-mist">Taxes</span>
              <span className="font-semibold">{offer.taxAmount ? money(offer.taxAmount) : "Included"}</span>
            </div>

            {ancillariesPrice > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-line">
                <span className="text-mist">Extras (Seats/Bags)</span>
                <span className="font-semibold">{money(ancillariesPrice)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-5 text-xl font-bold">
              <span>Total</span>
              <span className="text-indigo">{money(totalPrice)}</span>
            </div>

            {showErrors && Object.keys(errors).length > 0 && (
              <p className="text-xs text-red-500 mb-4 text-center bg-red-50 p-2 rounded-xl">
                Please fix the highlighted fields before paying.
              </p>
            )}

            {payError && <p className="text-xs text-red-500 mb-4 text-center bg-red-50 p-2 rounded-xl">{payError}</p>}

            <button
              onClick={handlePaymentInit}
              disabled={isPaying || fareClosed || !formReady}
              className="w-full rounded-2xl bg-indigo text-white font-semibold text-lg py-4 hover:bg-indigo2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isPaying && <Loader2 className="w-5 h-5 animate-spin" />}
              {isPaying ? "Redirecting to payment…" : "Pay Now"}
            </button>

            <p className="text-[10px] text-mist text-center mt-4">Payments processed securely by Paystack. All prices include taxes and fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}