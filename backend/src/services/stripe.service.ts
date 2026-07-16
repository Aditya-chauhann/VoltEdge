/**
 * Stripe Service
 * Wraps the Stripe SDK for Checkout session creation and payment verification.
 */

import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe: Stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia', // Use the expected API version
});

/**
 * Creates a Stripe Checkout Session.
 */
export async function createStripeCheckoutSession(params: {
  orderId: string;
  orderNumber: string;
  amount: number; // in smallest currency unit (e.g. paise/cents)
  currency: string;
  customerEmail: string;
  successUrl: string;
}): Promise<Stripe.Response<Stripe.Checkout.Session>> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.customerEmail,
    client_reference_id: params.orderId,
    metadata: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
    },
    line_items: [
      {
        price_data: {
          currency: params.currency,
          product_data: {
            name: `Order #${params.orderNumber}`,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.successUrl.replace('/success', ''), // redirects back to checkout if canceled
  });

  return session;
}

/**
 * Retrieves a Stripe Checkout Session to verify payment status.
 */
export async function verifyStripeSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
