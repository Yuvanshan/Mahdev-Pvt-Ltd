/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer, Sparkles, ArrowRight } from 'lucide-react';
import { CountdownSettings } from '../types';

interface CountdownOverlayProps {
  settings: CountdownSettings;
  onFinished: () => void;
}

export default function CountdownOverlay({ settings, onFinished }: CountdownOverlayProps) {
  const calculateTime = React.useCallback(() => {
    const targetTime = new Date(settings.targetDate).getTime();
    const difference = targetTime - Date.now();

    if (isNaN(targetTime) || difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false
    };
  }, [settings.targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => {
    const initial = calculateTime();
    return { days: initial.days, hours: initial.hours, minutes: initial.minutes, seconds: initial.seconds };
  });

  useEffect(() => {
    const checkExpiration = () => {
      const state = calculateTime();
      if (state.expired) {
        onFinished();
        return false;
      }
      setTimeLeft({ days: state.days, hours: state.hours, minutes: state.minutes, seconds: state.seconds });
      return true;
    };

    const active = checkExpiration();
    if (!active) return;

    const timer = setInterval(() => {
      const ongoing = checkExpiration();
      if (!ongoing) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTime, onFinished]);

  // Generate 25 stars with random properties for background parallax drift
  const stars = React.useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * -20,
  })), []);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-[9999] bg-[#030307] flex flex-col justify-center items-center overflow-hidden px-4 select-none"
    >
      {/* ── BACKGROUND STAR ENGINE ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ y: '105vh', x: `${star.x}vw` }}
            animate={{ y: '-5vh' }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: star.delay,
            }}
            className="absolute rounded-full bg-white opacity-40"
            style={{
              width: star.size,
              height: star.size,
              boxShadow: star.size > 2 ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
            }}
          />
        ))}
      </div>

      {/* ── GLOWING AURORAS ── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* ── CARD WRAPPER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl w-full text-center py-12 px-6 sm:px-12 rounded-[32px] border border-purple-500/15 bg-neutral-900/40 backdrop-blur-xl shadow-[0_0_80px_rgba(124,58,237,0.12)] overflow-hidden"
      >
        {/* Background accent image if configured */}
        {settings.backgroundImage && (
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none select-none">
            <img src={settings.backgroundImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="relative z-10 space-y-8">
          {/* Header pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
            <Timer size={14} className="text-purple-400 animate-pulse" />
            <span className="text-[10px] font-bold font-mono tracking-[0.2em] text-purple-300 uppercase">
              Exclusive Launch Timer
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {settings.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              {settings.description}
            </p>
          </div>

          {/* ── TIME TILES GRID ── */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto pt-4">
            {timeBlocks.map((block, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl border border-purple-500/20 bg-neutral-950/80 shadow-2xl flex items-center justify-center overflow-hidden group">
                  {/* Subtle hover accent light */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <span className="text-2xl sm:text-4.5xl font-black text-white font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(168,85,247,0.3)]">
                    {String(block.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-[0.15em] text-slate-500 mt-2.5">
                  {block.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── CTA ACTION BUTTON ── */}
          {settings.buttonLabel && (
            <div className="pt-6">
              <a
                href={settings.buttonLink || '#contact'}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.03] transition-all duration-300"
              >
                <span>{settings.buttonLabel}</span>
                <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
