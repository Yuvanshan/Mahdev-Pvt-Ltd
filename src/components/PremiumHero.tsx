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

  return (
    <section className={`relative w-full transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-neutral-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline / Copy */}
          <div className="lg:col-span-5">
            <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/6 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase">
              <Sparkles size={14} className="text-amber-400" />
              <span>One Vision, Four Powerful Solutions</span>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              MAHDEV
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                ELITE SERVICE SUITE
              </span>
            </h1>

            <p className={`text-lg sm:text-xl mb-8 max-w-md ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
              One Vision, Four Powerful Solutions.
              <br />
              AI Driven • Expert Powered • Excellence Delivered.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-900 font-bold shadow-md shadow-amber-500/20 hover:scale-[1.01] transition-transform"
              >
                Discover More
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onNavigate(cards[0].page)}
                className={`px-5 py-3 rounded-full border-2 font-semibold ${isDarkMode ? 'border-white/20 text-white bg-white/3' : 'border-slate-200 text-neutral-800 bg-white'}`}
              >
                Get In Touch
              </button>
            </div>
          </div>

          {/* Right: Four-panel showcase */}
          <div className="lg:col-span-7">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex flex-row w-full h-80 md:h-96">
                {cards.slice(0, 4).map((card, idx) => (
                  <div key={card.id} className="relative flex-1 min-w-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                    />

                    {/* Vertical color panel */}
                    <div className={`absolute inset-0 ${card.bgGradient} mix-blend-multiply`} />

                    {/* Dark glass overlay for depth */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Title block */}
                    <div className="absolute top-6 left-6 text-left">
                      <div className={`text-sm font-semibold tracking-widest uppercase mb-1 ${card.accentColor}`}>{card.subtitle}</div>
                      <h3 className="text-xl sm:text-2xl font-black text-white max-w-[10rem] leading-tight">{card.title}</h3>
                    </div>

                    {/* Accent right divider */}
                    {idx < 3 && <div className="absolute top-0 right-0 h-full w-px bg-white/10" />}
                  </div>
                ))}
              </div>

              {/* Bottom CTA overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="text-white/80 text-sm">Explore our solutions — tap a panel</div>
                <div className="flex gap-3">
                  {cards.slice(0, 4).map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => onNavigate(c.page)}
                      className={`w-3 h-3 rounded-full ${i === selected ? 'bg-amber-400' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
