/**
 * Premium Hero Section — Editorial Spotlight
 * A large featured service panel paired with a vertical, self-timing rail.
 * Signature element: each rail item fills a thin progress bar over the
 * auto-rotate interval, so the interface visibly "counts down" to the
 * next feature — turning the rotation into legible information rather
 * than a background animation.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Camera, Plane, Code, Lightbulb } from 'lucide-react';
import { ActivePage } from '../types';
import { COMPANY_CONTACT } from '../data';

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
  description?: string;
  icon?: React.ReactNode;
}

interface PremiumHeroProps {
  isDarkMode: boolean;
  onNavigate: (page: ActivePage) => void;
  cards: HeroCard[];
}

const ROTATE_MS = 5500;

export default function PremiumHero({ isDarkMode, onNavigate, cards }: PremiumHeroProps) {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const serviceMeta: Partial<Record<ActivePage, { title: string; desc: string; icon: React.ReactNode; tag: string }>> = {
    [ActivePage.Photography]: {
      title: 'Photography & Cinema',
      desc: 'Cinematic storytelling for weddings, corporate events, and brand narratives — shot to be kept, not just posted.',
      icon: <Camera className="w-5 h-5" />,
      tag: 'Craft 01 · Visual',
    },
    [ActivePage.Decoration]: {
      title: 'Event & Decoration',
      desc: 'Stunning event design with premium balloon installations and decor, built around your room and your run of show.',
      icon: <Lightbulb className="w-5 h-5" />,
      tag: 'Craft 02 · Space',
    },
    [ActivePage.ItSolutions]: {
      title: 'IT Solutions',
      desc: 'Custom web apps, cloud infrastructure, and digital transformation for teams who need it to just work.',
      icon: <Code className="w-5 h-5" />,
      tag: 'Craft 03 · Systems',
    },
    [ActivePage.Travels]: {
      title: 'Travel & Logistics',
      desc: 'A luxury vehicle fleet and curated tour packages worldwide, planned door to door.',
      icon: <Plane className="w-5 h-5" />,
      tag: 'Craft 04 · Journey',
    },
  };

  const visibleCards = cards.slice(0, 4);

  useEffect(() => {
    if (paused || visibleCards.length <= 1) return;
    const timer = window.setInterval(() => {
      setSelected((prev) => (prev + 1) % visibleCards.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [visibleCards.length, paused]);

  const stats = [
    { label: 'Projects delivered', value: '120+' },
    { label: 'Client satisfaction', value: '95%' },
    { label: 'Years in practice', value: '10+' },
    { label: 'Support coverage', value: '24/7' },
  ];

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const active = visibleCards[selected];
  const activeMeta = active
    ? serviceMeta[active.page] ?? {
        title: active.title,
        desc: active.description ?? 'Explore this service.',
        icon: active.icon,
        tag: 'Featured',
      }
    : null;

  const ink = isDarkMode ? 'text-white' : 'text-slate-900';
  const inkMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <section
      id="services-overview"
      className={`relative w-full overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0B0D12]' : 'bg-[#FAF8F4]'
      }`}
    >
      {/* Ambient field — quiet, not a light show */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl ${
            isDarkMode ? 'bg-amber-500/[0.06]' : 'bg-amber-400/[0.12]'
          }`}
        />
        <div
          className={`absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full blur-3xl ${
            isDarkMode ? 'bg-amber-300/[0.04]' : 'bg-amber-300/[0.10]'
          }`}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-amber-500/60" />
            <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${isDarkMode ? 'text-amber-400/90' : 'text-amber-700'}`}>
              Four Crafts, One Studio
            </span>
          </div>

          <h1
            className={`text-4xl md:text-5xl lg:text-[3.4rem] font-normal mb-5 leading-[1.08] tracking-tight ${ink}`}
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            Mahdev's premium services,
            <br className="hidden md:block" />
            <span className="italic text-amber-500">made to last.</span>
          </h1>

          <p className={`text-base md:text-lg leading-relaxed ${inkMuted}`}>
            Photography, event design, technology, and travel — four disciplines run by
            people who treat each one as their main craft, not a side offer.
          </p>
        </motion.div>

        {/* Spotlight: featured panel + rail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-16">
          {/* Featured panel */}
          <div className="lg:col-span-3">
            <div
              className={`relative h-[420px] md:h-[480px] rounded-2xl overflow-hidden border ${
                isDarkMode ? 'border-white/10' : 'border-slate-900/10'
              }`}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <AnimatePresence mode="wait">
                {active && activeMeta && (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={active.image}
                      alt={active.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

                    <div className="relative h-full flex flex-col justify-end p-7 md:p-10">
                      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-3">
                        {activeMeta.tag}
                      </span>
                      <h3
                        className="text-3xl md:text-4xl text-white mb-3 leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {activeMeta.title}
                      </h3>
                      <p className="text-white/75 text-sm md:text-base max-w-md mb-6 leading-relaxed">
                        {activeMeta.desc}
                      </p>
                      <button
                        onClick={() => onNavigate(active.page)}
                        className="group inline-flex w-fit items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm transition-all duration-300 hover:bg-amber-400"
                      >
                        <span>View {activeMeta.title.split(' ')[0]}</span>
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Rail */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {visibleCards.map((card, idx) => {
              const meta = serviceMeta[card.page] ?? {
                title: card.title,
                desc: card.description ?? '',
                icon: card.icon,
                tag: '',
              };
              const isActive = idx === selected;

              return (
                <button
                  key={card.id}
                  onClick={() => setSelected(idx)}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  className={`relative text-left rounded-xl px-5 py-4 border transition-colors duration-300 overflow-hidden ${
                    isActive
                      ? isDarkMode
                        ? 'border-amber-500/40 bg-white/[0.04]'
                        : 'border-amber-500/40 bg-amber-500/[0.05]'
                      : isDarkMode
                        ? 'border-white/5 hover:border-white/15'
                        : 'border-slate-900/5 hover:border-slate-900/15'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors duration-300 ${
                        isActive ? 'bg-amber-500 text-slate-900' : isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-900/5 text-slate-500'
                      }`}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-semibold text-sm mb-1 ${isActive ? ink : inkMuted}`}>{meta.title}</div>
                      {isActive && (
                        <p className={`text-xs leading-relaxed line-clamp-2 ${inkMuted}`}>{meta.desc}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress fill — restarts on select via key */}
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-900/5'}`}>
                    {isActive && !paused && (
                      <motion.div
                        key={`${card.id}-${selected}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                        className="h-full bg-amber-500"
                      />
                    )}
                    {isActive && paused && <div className="h-full w-full bg-amber-500/40" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats — a line, not a grid of cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className={`flex flex-wrap divide-x rounded-xl border overflow-hidden mb-14 ${
            isDarkMode ? 'divide-white/10 border-white/10' : 'divide-slate-900/10 border-slate-900/10'
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex-1 min-w-[140px] px-6 py-5">
              <div
                className={`text-2xl md:text-3xl font-normal mb-1 ${ink}`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </div>
              <div className={`text-xs uppercase tracking-wide ${inkMuted}`}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleConsultation}
            className="group px-7 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-base transition-colors duration-300 inline-flex items-center gap-2"
          >
            <span>Get a free consultation</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
            className={`px-7 py-3.5 rounded-lg font-semibold text-base border transition-colors duration-300 ${
              isDarkMode
                ? 'border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/5'
                : 'border-slate-900/15 text-slate-700 hover:border-slate-900/30 hover:bg-slate-900/5'
            }`}
          >
            See how it works
          </button>
        </motion.div>
      </div>
    </section>
  );
}