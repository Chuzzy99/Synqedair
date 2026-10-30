// What a provider tells us after we ask it to refund a payment
export type RefundResult =
  | { ok: true; refundId: string; status: string }
  // definite: the provider refused, so no money moved and it is safe to try again later.
  // not definite: we don't know what happened, so the money may already be on its way back
  | { ok: false; definite: boolean; message: string }