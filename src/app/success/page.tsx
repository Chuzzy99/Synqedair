"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Nav from "@/components/Nav";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [duffelOrderId, setDuffelOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function completeBooking() {
      if (!reference) {
        setStatus("error");
        return;
      }

      try {
        // Call the backend API to complete the booking
        // This would typically be done via a webhook, but for now we'll call it directly
        const res = await fetch("/api/bookings/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        
        if (data.success) {
          setOrderId(data.orderId);
          setDuffelOrderId(data.duffelOrderId);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    }

    completeBooking();
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink">Completing your booking...</h2>
            <p className="text-mist mt-2">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ink mb-2">Booking Failed</h2>
            <p className="text-mist mb-6">
              We couldn't complete your booking. Please contact support or try again.
            </p>
            <button
              onClick={() => router.push("/")}
              className="rounded-2xl bg-indigo text-white font-semibold px-8 py-3 hover:bg-indigo2 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink mb-2">Booking Confirmed!</h2>
          <p className="text-mist mb-6">
            Your flight has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          
          {orderId && (
            <div className="bg-white p-4 rounded-xl border border-line mb-6">
              <p className="text-xs text-mist uppercase tracking-wider mb-1">Booking Reference</p>
              <p className="font-mono font-semibold text-ink">{orderId}</p>
            </div>
          )}
          
          {duffelOrderId && (
            <div className="bg-white p-4 rounded-xl border border-line mb-6">
              <p className="text-xs text-mist uppercase tracking-wider mb-1">Airline Reference</p>
              <p className="font-mono font-semibold text-ink">{duffelOrderId}</p>
            </div>
          )}
          
          <button
            onClick={() => router.push("/")}
            className="rounded-2xl bg-indigo text-white font-semibold px-8 py-3 hover:bg-indigo2 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
