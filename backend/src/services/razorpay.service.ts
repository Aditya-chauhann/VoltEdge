/**
 * Razorpay Service
 * Wraps the Razorpay SDK for order creation and payment verification.
 * All amounts are in paise (1 INR = 100 paise).
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';

const razorpay = new Razorpay({
  key_id:     env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order.
 * @param amountINR  Amount in INR (will be converted to paise internally)
 * @param receipt    Unique receipt string (e.g. our order number)
 */
export async function createRazorpayOrder(
  amountINR:   number,
  receipt:     string,
  notes:       Record<string, string> = {},
): Promise<{ id: string; amount: number; currency: string }> {
  const order = await razorpay.orders.create({
    amount:   Math.round(amountINR * 100), // paise
    currency: 'INR',
    receipt,
    notes,
  });

  return {
    id:       order.id,
    amount:   order.amount as number,
    currency: order.currency,
  };
}

/**
 * Verifies Razorpay payment signature.
 * Call this after the user completes payment on the frontend.
 *
 * @returns true if the signature is valid
 */
export function verifyRazorpaySignature(params: {
  razorpayOrderId:   string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === params.razorpaySignature;
}

/**
 * Verifies the HMAC signature on incoming Razorpay webhooks.
 *
 * @param rawBody   The raw request body as a Buffer
 * @param signature The X-Razorpay-Signature header value
 */
export function verifyWebhookSignature(
  rawBody:   Buffer,
  signature: string,
): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}

/**
 * Fetches payment details from Razorpay by payment ID.
 */
export async function fetchPayment(paymentId: string) {
  return razorpay.payments.fetch(paymentId);
}

/**
 * Initiates a full refund for a payment.
 */
export async function refundPayment(
  paymentId: string,
  amountINR?: number,
): Promise<{ id: string }> {
  const params: { amount?: number } = {};
  if (amountINR) params.amount = Math.round(amountINR * 100);
  const refund = await razorpay.payments.refund(paymentId, params);
  return { id: refund.id };
}
