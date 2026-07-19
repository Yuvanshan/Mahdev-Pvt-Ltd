import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
}

interface PremiumHeroProps {
  isDarkMode: boolean;
  onNavigate: (page: ActivePage) => void;
  cards: HeroCard[];
}

export default function PremiumHero({ isDarkMode, onNavigate, cards }: PremiumHeroProps) {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = (colId: string, e: React.MouseEvent, page: ActivePage) => {
    // Check if the user is clicking the CTA button specifically
    const target = e.target as HTMLElement;
    if (target.closest('.explore-btn') || hoveredCardId === colId || flippedCardId === colId) {
      // If already flipped or clicking CTA, navigate
      onNavigate(page);
      e.stopPropagation();
      return;
    }
    
    // Otherwise toggle flip
    setFlippedCardId(prev => prev === colId ? null : colId);
    e.stopPropagation();
  };

  // Find dynamic images from cards or fallback
  const swsImage = cards.find(c => c.page === ActivePage.Decoration)?.image || '';
  const u1Image = cards.find(c => c.page === ActivePage.Photography)?.image || '';
  const itImage = cards.find(c => c.page === ActivePage.ItSolutions)?.image || '';
  const travelsImage = cards.find(c => c.page === ActivePage.Travels)?.image || '';

  const columns = [
    {
      id: 'sws',
      title: 'SWS',
      subtitle: 'EVENT MANAGEMENT',
      image: swsImage,
      page: ActivePage.Decoration,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(244,63,94,0.4)]',
      borderStyle: 'border-pink-500/20 group-hover:border-pink-500/60',
      tagColor: 'text-pink-500 dark:text-pink-400 group-hover:text-pink-600 dark:group-hover:text-pink-300',
      accent: 'pink',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      services: [
        "Luxury Weddings & Stages",
        "Themed Entrance Walkways",
        "Church Floral Arrangements",
        "Corporate VIP Banquets"
      ],
      metric: "500+ Completed Events"
    },
    {
      id: 'u1',
      title: 'U1',
      subtitle: 'STUDIO',
      image: u1Image,
      page: ActivePage.Photography,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]',
      borderStyle: 'border-violet-500/20 group-hover:border-violet-500/60',
      tagColor: 'text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300',
      accent: 'violet',
      badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      services: [
        "Cinematic Videography",
        "Pro Drone Cinematography",
        "Intimate Portrait Shoots",
        "Luxury Wedding Albums"
      ],
      metric: "4K Cinema Precision"
    },
    {
      id: 'it',
      title: 'MAHDEV',
      subtitle: 'IT & SOLUTIONS',
      image: itImage,
      page: ActivePage.ItSolutions,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(6,182,212,0.4)]',
      borderStyle: 'border-cyan-500/20 group-hover:border-cyan-500/60',
      tagColor: 'text-cyan-500 dark:text-cyan-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300',
      accent: 'cyan',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      services: [
        "Custom ERP Ecosystems",
        "Fullstack App Development",
        "Cloud Native Engineering",
        "UI/UX Branding & Strategy"
      ],
      metric: "99.9% Uptime SLA"
    },
    {
      id: 'travels',
      title: 'MAHDEV',
      subtitle: 'TRAVELS',
      image: travelsImage,
      page: ActivePage.Travels,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]',
      borderStyle: 'border-amber-500/20 group-hover:border-amber-500/60',
      tagColor: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300',
      accent: 'amber',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      services: [
        "Luxury Chauffeur Vans",
        "Royal Wedding Fleet",
        "Custom Vacation Packages",
        "Island-wide Coordination"
      ],
      metric: "24/7 Roadside Assist"
    }
  ];

  const { scrollY } = useScroll();

  return (
    <section className={`relative w-full overflow-hidden py-20 lg:py-28 min-h-[95vh] flex items-center transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0b0c10]' : 'bg-[#f4f3f8]'
    }`}>
      {/* CSS 3D Card Flip helper rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 {
          perspective: 1200px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      ` }} />

      {/* Circuit lines backdrop overlay */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] ${
        isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.06] invert'
      }`} />
      
      {/* Background radial ambient glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full blur-[160px] pointer-events-none ${
        isDarkMode ? 'bg-indigo-950/15' : 'bg-indigo-300/10'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          
          {/* Left Text Block */}
          <div className="w-full lg:w-[35%] flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight font-sans uppercase leading-none ${
                  isDarkMode ? 'text-white' : 'text-[#3b118b]'
                }`}>
                  MAHDEV
                </h1>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase leading-none mt-1">
                  ELITE SERVICE SUITE
                </h2>
              </div>
              
              {/* Short solid gold divider line */}
              <div className="h-[3px] w-14 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              
              <div className="space-y-3">
                <p className={`text-lg md:text-xl font-semibold leading-normal tracking-wide ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  One Vision, Four Powerful Solutions.
                </p>
                <div className={`flex items-center gap-2 text-sm md:text-base font-medium flex-wrap ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span>AI Driven</span>
                  <span className="text-amber-500/60">•</span>
                  <span>Expert Powered</span>
                  <span className="text-amber-500/60">•</span>
                  <span>Excellence Delivered.</span>
                </div>
              </div>

              <button
                onClick={handleConsultation}
                className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 flex items-center gap-2 cursor-pointer border-none transform active:scale-[0.98]"
              >
                <span>Discover More</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Right Arches Section with 3D Card Flips & Parallax Scroll */}
          <div className="w-full lg:w-[65%] relative">
            
            {/* Curved canopy ring projection */}
            <div className={`absolute top-[-40px] left-1/2 -translate-x-1/2 w-[115%] h-[120px] rounded-[100%] border-b shadow-[0_12px_24px_rgba(99,102,241,0.05)] pointer-events-none z-20 ${
              isDarkMode 
                ? 'from-indigo-950/20 via-indigo-900/5 to-transparent border-indigo-500/15' 
                : 'from-purple-200/40 via-purple-100/10 to-transparent border-purple-500/10'
            }`} />
            
            {/* Metallic stage base reflection */}
            <div className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[110%] h-[70px] rounded-[100%] border-t shadow-[0_-8px_20px_rgba(99,102,241,0.03)] pointer-events-none z-20 ${
              isDarkMode 
                ? 'from-slate-950 via-slate-900/10 to-transparent border-indigo-500/10' 
                : 'from-slate-200 via-slate-100/5 to-transparent border-purple-500/10'
            }`} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 h-[480px] md:h-[540px] relative z-10 perspective-1000">
              {columns.map((col, index) => {
                // Generate a custom scroll translation offset per card (creating a staggered float on scroll)
                const speeds = [-0.07, -0.11, -0.04, -0.09]; // Staggered speed factors
                const yParallax = useTransform(scrollY, [0, 800], [0, speeds[index] * 180]);
                const rotateXScroll = useTransform(scrollY, [0, 800], [0, (index % 2 === 0 ? 1 : -1) * 6]);

                const isFlipped = hoveredCardId === col.id || flippedCardId === col.id;

                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: index * 0.08 }}
                    style={{ y: yParallax, rotateX: rotateXScroll }}
                    onMouseEnter={() => setHoveredCardId(col.id)}
                    onMouseLeave={() => {
                      setHoveredCardId(null);
                      setFlippedCardId(null);
                    }}
                    onClick={(e) => handleCardClick(col.id, e, col.page)}
                    className="relative w-full h-full group"
                  >
                    <div 
                      className="w-full h-full relative transform-style-3d transition-transform duration-700"
                      style={{
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      
                      {/* CARD FRONT FACE */}
                      <div className={`absolute inset-0 backface-hidden rounded-t-[85px] rounded-b-[20px] md:rounded-t-[100px] md:rounded-b-[24px] overflow-hidden border bg-slate-950/40 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between cursor-pointer ${col.borderStyle} ${col.glowColor}`}>
                        
                        {/* Column Image - Clearly showing via soft opacity shading */}
                        <img
                          src={col.image}
                          alt={`${col.title} ${col.subtitle}`}
                          className="absolute inset-0 w-full h-full object-cover transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Soft shading overlay so the image details are clearly showing */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-65 group-hover:opacity-50 transition-opacity duration-300" />
                        
                        {/* Glowing header indicators matching the sector theme */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/30" />

                        {/* Header text container (Sector names overlay at top) */}
                        <div className="relative p-4 text-center z-10 w-full pt-8 md:pt-10 select-none">
                          <h3 className={`text-2xl md:text-3xl font-black tracking-tighter transition-all duration-300 ${col.tagColor}`}>
                            {col.title}
                          </h3>
                          <p className="text-[9px] md:text-[10px] font-extrabold tracking-widest text-slate-100 uppercase mt-1 leading-tight max-w-[85%] mx-auto">
                            {col.subtitle}
                          </p>
                        </div>

                        {/* Footer call-to-action */}
                        <div className="relative p-5 z-10 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-6">
                          <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-widest text-white uppercase border border-white/10">
                            Explore
                          </span>
                        </div>
                      </div>

                      {/* CARD BACK FACE */}
                      <div
                        className={`absolute inset-0 backface-hidden rotate-y-180 rounded-t-[85px] rounded-b-[20px] md:rounded-t-[100px] md:rounded-b-[24px] overflow-hidden border p-5 md:p-6 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-[#0e0f14] border-purple-500/25 hover:border-purple-400' 
                            : 'bg-white border-purple-500/30 hover:border-purple-500 shadow-xl'
                        }`}
                      >
                        {/* Decorative grid pattern backdrop */}
                        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] ${
                          isDarkMode ? '' : 'invert'
                        }`} />

                        {/* Header metadata */}
                        <div className="relative space-y-1 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${col.badgeColor}`}>
                            {col.subtitle}
                          </span>
                          <h4 className={`text-xl font-bold tracking-tight mt-1.5 ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {col.title}
                          </h4>
                          <div className="h-[2px] w-8 bg-purple-500/40 mx-auto rounded-full mt-2" />
                        </div>

                        {/* Middle Bullet Lists */}
                        <ul className="relative space-y-2.5 my-auto">
                          {col.services.map((svc, i) => (
                            <li key={i} className="flex items-start gap-2 text-left">
                              <CheckCircle2 size={13} className="text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                              <span className={`text-[10px] md:text-[11px] leading-tight font-medium tracking-wide ${
                                isDarkMode ? 'text-slate-300' : 'text-slate-700'
                              }`}>
                                {svc}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Footer call-to-action */}
                        <div className="relative space-y-2 text-center pt-2">
                          <div className={`text-[9px] font-mono font-bold uppercase tracking-widest py-1 rounded-lg ${
                            isDarkMode ? 'text-purple-300/80 bg-purple-950/40' : 'text-purple-700 bg-purple-100/80'
                          }`}>
                            {col.metric}
                          </div>
                          <span className="explore-btn w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-bold uppercase tracking-wider text-white transition-colors">
                            <span>Explore Page</span>
                            <ArrowRight size={10} />
                          </span>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}