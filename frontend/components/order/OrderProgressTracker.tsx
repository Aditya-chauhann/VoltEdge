'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Package, Truck, MapPin, Home, Settings, XCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, getStatusStep } from '@/lib/utils';
import { StatusEvent } from '@/types';

const STEP_ICONS = [Package, CheckCircle, Settings, Truck, MapPin, Home];

interface OrderProgressTrackerProps {
  currentStatus: string;
  statusHistory: StatusEvent[];
  className?: string;
}

export default function OrderProgressTracker({
  currentStatus,
  statusHistory,
  className = '',
}: OrderProgressTrackerProps) {
  const isCancelled = currentStatus === 'cancelled';
  const currentStep = getStatusStep(currentStatus);

  if (isCancelled) {
    return (
      <div className={`glass-card p-6 flex items-center gap-4 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
          <XCircle size={24} className="text-danger" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Order Cancelled</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {statusHistory.find((e) => e.status === 'cancelled')?.message ?? 'This order has been cancelled.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 px-6 h-0.5" style={{ zIndex: 0 }}>
          <div className="relative w-full h-full bg-white dark:bg-base-100">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-primary"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex items-start justify-between" style={{ zIndex: 1 }}>
          {ORDER_STATUS_STEPS.map((status, idx) => {
            const Icon      = STEP_ICONS[idx];
            const isDone    = idx < currentStep;
            const isCurrent = idx === currentStep;
            const label     = ORDER_STATUS_LABELS[status] ?? status;

            return (
              <div key={status} className="flex flex-col items-center gap-2 flex-1">
                {/* Circle */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.6, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${isDone
                      ? 'bg-gradient-primary border-primary-400 shadow-glow-primary'
                      : isCurrent
                        ? 'bg-primary-400/20 border-primary-400 animate-pulse-glow'
                        : 'bg-white dark:bg-base-50 border-gray-600'}`}
                >
                  <Icon size={18} className={isDone || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500'} />
                </motion.div>

                {/* Label */}
                <span
                  className={`text-xs text-center font-medium transition-colors max-w-[70px]
                    ${isCurrent ? 'text-primary-400' : isDone ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status history */}
      {statusHistory.length > 0 && (
        <div className="mt-8 border-t border-primary-400/10 pt-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Status History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {[...statusHistory].reverse().map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">
                    {ORDER_STATUS_LABELS[event.status] ?? event.status}
                  </p>
                  {event.message && <p className="text-gray-500 text-xs">{event.message}</p>}
                  <p className="text-gray-600 text-xs">
                    {new Date(event.timestamp).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
