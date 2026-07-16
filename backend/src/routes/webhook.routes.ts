/**
 * Stripe Webhook Route
 * Receives payment events (checkout.session.completed, etc.).
 * The raw body must NOT be parsed by express.json() — it's needed for
 * Stripe signature verification. The webhook route therefore registers its
 * own body parser using express.raw() in app.ts.
 */

import { Router, Request, Response } from 'express';
import { stripe } from '../services/stripe.service';
import { env } from '../config/env';
import { Order } from '../models/Order.model';
import { webhookLimiter } from '../middleware/rateLimiter';
import Stripe from 'stripe';

const router = Router();

router.post(
  '/',
  webhookLimiter,
  (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      // Verify webhook authenticity
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.warn('⚠️  Invalid Stripe webhook signature — ignored', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Acknowledge receipt immediately (Stripe expects a fast 200)
    res.status(200).json({ success: true });

    // Process event asynchronously
    handleWebhookEvent(event).catch((err) =>
      console.error('Webhook processing error:', err),
    );
  }
);

async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Payment captured — update order status if not already done via /verify endpoint
      if (session.id) {
        await Order.findOneAndUpdate(
          { stripeSessionId: session.id, paymentStatus: { $ne: 'paid' } },
          {
            paymentStatus:    'paid',
            stripePaymentIntentId: session.payment_intent as string,
            orderStatus:      'confirmed',
            $push: {
              statusHistory: {
                status:    'confirmed',
                message:   'Payment captured via webhook',
                timestamp: new Date(),
              },
            },
          },
        );
      }
      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.id) {
        await Order.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            paymentStatus: 'failed',
            $push: {
              statusHistory: {
                status:    'failed',
                message:   'Payment failed via webhook',
                timestamp: new Date(),
              },
            },
          },
        );
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      console.log('Refund created:', charge.id);
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }
}

export default router;
