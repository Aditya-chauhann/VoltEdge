import { ShieldAlert, Package, HelpCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | VoltEdge Wholesale',
  description: 'Strict B2B Return and Refund Policy for VoltEdge Wholesale orders.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            B2B Return Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read our strict wholesale return guidelines carefully before placing an order.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Section 1 */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strict Return Rules</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-300 space-y-4 text-sm md:text-base leading-relaxed">
              <p>
                As a B2B wholesale platform dealing in large volumes, we operate under strict return conditions to maintain our low prices and bulk discounts. We do <strong>not</strong> offer "no questions asked" returns or refunds for buyer's remorse.
              </p>
              <p>
                Returns are <strong>only</strong> accepted if the reason is genuine and the fault is demonstrably from our side. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Manufacturing defects on a significant portion of the batch.</li>
                <li>Incorrect items delivered (wrong SKU, incorrect specifications).</li>
                <li>Severe transit damage rendering products unsellable.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-400/10 text-primary-400 flex items-center justify-center">
                <Package size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Return Process</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-300 space-y-4 text-sm md:text-base leading-relaxed">
              <p>
                To initiate a return request, follow these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Ensure the order status is marked as <strong>Delivered</strong> in your dashboard.</li>
                <li>Go to your Order Details page and click <strong>Report Issue</strong>.</li>
                <li>Select "Return bulk order" as the subject.</li>
                <li>Provide your contact phone number, email, and a detailed reason for the return.</li>
                <li>Our wholesale support team will review your request within 2-3 business days.</li>
              </ol>
              <div className="bg-danger/10 text-danger p-4 rounded-lg mt-4 border border-danger/20 text-sm">
                <strong>Important:</strong> You must retain all original packaging. If a return is authorized, items must be sent back in their original condition. Partial returns may be subject to restocking fees.
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Refund Timeline</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-300 space-y-4 text-sm md:text-base leading-relaxed">
              <p>
                If your return request is approved and the goods are successfully received at our warehouse, they will undergo a quality inspection. 
              </p>
              <p>
                Once approved by our inspection team, refunds will be processed to the original payment method within <strong>5-7 business days</strong>. In some cases of wholesale orders, we may offer store credit for future bulk purchases instead of a direct refund.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
