/**
 * Premium Hero Section - Reference Design Implementation
 * Features circular carousel of 4 service cards with elegant animations
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ActivePage } from '../types';

interface HeroCard {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  image: string;
  page: ActivePage;
}

interface PremiumHeroProps {
  isDarkMode: boolean;
  onNavigate: (page: ActivePage) => void;
  cards: HeroCard[];
}

export default function PremiumHero({ isDarkMode, onNavigate, cards }: PremiumHeroProps) {
  const [selected, setSelected] = useState(0);
  const motionEase = [0.22, 1, 0.36, 1] as const;

  return (
    <section className={`relative w-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-neutral-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -40, y: -30 }}
          animate={{ opacity: [0.2, 0.35, 0.2], x: [-40, 24, -40], y: [-30, 18, -30] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 top-10 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, x: 40, y: 40 }}
          animate={{ opacity: [0.18, 0.3, 0.18], x: [40, -24, 40], y: [40, -20, 40] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline / Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: motionEase }}
            className="lg:col-span-5"
          >
            <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <Sparkles size={14} className="text-amber-400" />
              <span>One Vision, Four Powerful Solutions</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, ease: motionEase }}
              className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
            >
              MAHDEV
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                ELITE SERVICE SUITE
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.72, ease: motionEase }}
              className={`text-lg sm:text-xl mb-8 max-w-md ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}
            >
              One Vision, Four Powerful Solutions.
              <br />
              AI Driven • Expert Powered • Excellence Delivered.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.72, ease: motionEase }}
              className="flex items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-900 font-bold shadow-md shadow-amber-500/20"
              >
                Discover More
                <ArrowRight size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(cards[0].page)}
                className={`px-5 py-3 rounded-full border-2 font-semibold ${isDarkMode ? 'border-white/20 text-white bg-white/5' : 'border-slate-200 text-neutral-800 bg-white'}`}
              >
                Get In Touch
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Four-panel showcase */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.8, ease: motionEase }}
            className="lg:col-span-7"
          >
            <div className="relative w-full rounded-[2rem] overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.35)] border border-white/10 bg-black/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_35%)]" />
              <div className="flex flex-row w-full h-80 md:h-96">
                {cards.slice(0, 4).map((card, idx) => {
                  const isActive = selected === idx;
                  return (
                    <motion.div
                      key={card.id}
                      className="relative flex-1 min-w-0 overflow-hidden"
                      whileHover={{ scale: 1.03, y: -6, zIndex: 5 }}
                      animate={{
                        scale: isActive ? 1.03 : 1,
                        y: isActive ? -6 : 0,
                        filter: isActive ? 'brightness(1.06)' : 'brightness(0.95)',
                      }}
                      transition={{ duration: 0.28, ease: motionEase }}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />

                      <div className={`absolute inset-0 ${card.bgGradient} mix-blend-multiply`} />
                      <div className="absolute inset-0 bg-black/40" />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0.7 }}
                        transition={{ duration: 0.28, ease: motionEase }}
                        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
                      />

                      <div className="absolute top-6 left-6 text-left">
                        <div className={`text-sm font-semibold tracking-widest uppercase mb-1 ${card.accentColor}`}>{card.subtitle}</div>
                        <h3 className="text-xl sm:text-2xl font-black text-white max-w-[10rem] leading-tight">{card.title}</h3>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive ? 0 : 10,
                          scale: isActive ? 1 : 0.96,
                          pointerEvents: isActive ? 'auto' : 'none'
                        }}
                        transition={{ duration: 0.26, ease: motionEase }}
                        className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-black/70 p-3 backdrop-blur-md"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">Featured Service</p>
                        <p className="mt-1 text-sm font-semibold text-white">{card.title}</p>
                        <p className="mt-1 text-xs text-white/70">Elegant execution, premium support, and tailored delivery.</p>
                        <button
                          onClick={() => onNavigate(card.page)}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                        >
                          View Details
                        </button>
                      </motion.div>

                      {idx < 3 && <div className="absolute top-0 right-0 h-full w-px bg-white/10" />}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom CTA overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="text-white/80 text-sm">Explore our solutions — tap a panel</div>
                <div className="flex gap-3">
                  {cards.slice(0, 4).map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => onNavigate(c.page)}
                      className={`h-3 w-3 rounded-full transition-all ${i === selected ? 'bg-amber-400 scale-125' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
