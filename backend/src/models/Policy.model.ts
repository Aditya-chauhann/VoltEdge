import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
  type: 'refund_shipping' | 'privacy' | 'terms';
  content: string;
  updatedAt: Date;
}

const PolicySchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['refund_shipping', 'privacy', 'terms'],
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
      default: function(this: any) {
        if (this.type === 'terms') {
          return '<h2>Terms of Service</h2><p>Welcome to VoltEdge. By accessing our platform, you agree to these terms.</p><h3>1. General Conditions</h3><p>We reserve the right to refuse service to anyone for any reason at any time.</p><h3>2. Products and Services</h3><p>Certain products may be available exclusively online. These products may have limited quantities and are subject to our return policy.</p>';
        } else if (this.type === 'privacy') {
          return '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy outlines how we handle your personal information.</p><h3>Data Collection</h3><p>We collect information you provide directly to us when you make a purchase or create an account.</p>';
        } else {
          return `
            <h2>Strict Return Rules</h2>
            <p>As a B2B wholesale platform dealing in large volumes, we operate under strict return conditions to maintain our low prices and bulk discounts. We do <strong>not</strong> offer "no questions asked" returns or refunds for buyer's remorse.</p>
            <p>Returns are <strong>only</strong> accepted if the reason is genuine and the fault is demonstrably from our side. This includes:</p>
            <ul>
              <li>Manufacturing defects on a significant portion of the batch.</li>
              <li>Incorrect items delivered (wrong SKU, incorrect specifications).</li>
              <li>Severe transit damage rendering products unsellable.</li>
            </ul>

            <h2>Return Process</h2>
            <p>To initiate a return request, follow these steps:</p>
            <ol>
              <li>Ensure the order status is marked as <strong>Delivered</strong> in your dashboard.</li>
              <li>Go to your Order Details page and click <strong>Report Issue</strong>.</li>
              <li>Select "Return bulk order" as the subject.</li>
              <li>Provide your contact phone number, email, and a detailed reason for the return.</li>
              <li>Our wholesale support team will review your request within 2-3 business days.</li>
            </ol>
            <p><strong>Important:</strong> You must retain all original packaging. If a return is authorized, items must be sent back in their original condition. Partial returns may be subject to restocking fees.</p>

            <h2>Refund Timeline</h2>
            <p>If your return request is approved and the goods are successfully received at our warehouse, they will undergo a quality inspection.</p>
            <p>Once approved by our inspection team, refunds will be processed to the original payment method within <strong>5-7 business days</strong>. In some cases of wholesale orders, we may offer store credit for future bulk purchases instead of a direct refund.</p>
          `;
        }
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Policy || mongoose.model<IPolicy>('Policy', PolicySchema);
