/**
 * Razorpay Webhook Route
 * Receives payment events (payment.captured, payment.failed, refund.created).
 * The raw body must NOT be parsed by express.json() — it's needed for
 * HMAC signature verification. The webhook route therefore registers its
 * own body parser using express.raw().
 */

import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../services/razorpay.service';
import { Order } from '../models/Order.model';
import { webhookLimiter } from '../middleware/rateLimiter';

const router = Router();

// Use raw body so we can verify the HMAC signature
router.post(
  '/',
  webhookLimiter,
  (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string;

    // Verify webhook authenticity
    if (!verifyWebhookSignature(req.body as Buffer, signature)) {
      console.warn('⚠️  Invalid Razorpay webhook signature — ignored');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    let event: { event: string; payload: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
    try {
      event = JSON.parse((req.body as Buffer).toString());
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }

    // Acknowledge receipt immediately (Razorpay expects a fast 200)
    res.status(200).json({ success: true });

    // Process event asynchronously
    handleWebhookEvent(event).catch((err) =>
      console.error('Webhook processing error:', err),
    );
  },
);

async function handleWebhookEvent(event: {
  event: string;
  payload: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
}): Promise<void> {
  const entity = event.payload?.payment?.entity;

  switch (event.event) {
    case 'payment.captured': {
      // Payment captured — update order status if not already done via /verify endpoint
      if (entity?.order_id) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: entity.order_id, paymentStatus: { $ne: 'paid' } },
          {
            paymentStatus:    'paid',
            razorpayPaymentId: entity.id,
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

    case 'payment.failed': {
      if (entity?.order_id) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: entity.order_id },
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

    case 'refund.created': {
      console.log('Refund created:', entity?.id);
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${event.event}`);
  }
}

export default router;
