/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ArrowUp } from 'lucide-react';
import { COMPANY_CONTACT } from '../data';

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="floating-actions-container" className="fixed bottom-6 right-6 flex flex-col items-center space-y-4 z-40">
      
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="back-to-top-btn"
            initial={{ opacity: 0, scale: 0.5, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="p-3.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-lg hover:scale-110 active:scale-95"
            title="Scroll to Top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <motion.a
        id="floating-whatsapp-btn"
        href={COMPANY_CONTACT.whatsapp}
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative p-4 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group"
        title="Chat on WhatsApp"
      >
        {/* Pulsing glow outline */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
        
        <MessageSquare size={22} className="relative z-10" />
        
        {/* Hover Label */}
        <span className="absolute right-14 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md border border-slate-800">
          Chat on WhatsApp
        </span>
      </motion.a>

    </div>
  );
}
