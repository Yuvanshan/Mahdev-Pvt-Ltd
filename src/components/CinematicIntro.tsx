'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant, rapid fade out after 1.2 seconds of logo representation
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-[#12101A] flex flex-col justify-center items-center select-none"
        >
          <div className="text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="font-display font-black text-5xl sm:text-7xl text-gradient-gold tracking-[0.25em] uppercase bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                MAHDEV
              </h1>
              <p className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.4em] text-[#B5AEC5] uppercase mt-2 opacity-80">
                Creating Moments • Capturing Memories • Delivering Innovation
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
