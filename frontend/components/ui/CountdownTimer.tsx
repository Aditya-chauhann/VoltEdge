'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  endsAt: Date;
  className?: string;
}

export default function CountdownTimer({ endsAt, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {(['h', 'm', 's'] as const).map((unit, idx) => (
        <div key={unit} className="flex items-center gap-2">
          <div className="w-12 h-12 bg-base-50 border border-primary-400/20 rounded-xl flex flex-col
                          items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft[unit]}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display font-bold text-lg text-white absolute"
              >
                {String(timeLeft[unit]).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-xs text-gray-400 uppercase">{unit}</span>
          {idx < 2 && <span className="text-primary-400 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}
