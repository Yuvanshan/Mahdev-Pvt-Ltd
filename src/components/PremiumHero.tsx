import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ActivePage, ThemeSettings } from '../types';
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
  themeSettings?: ThemeSettings;
}

export default function PremiumHero({ isDarkMode, onNavigate, cards, themeSettings }: PremiumHeroProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
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
          <div className="w-full lg:w-[35%] flex flex-col justify-center text-left relative">
            {/* Background text glow to highlight content on both themes */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-purple-500/10 to-indigo-500/5 blur-3xl rounded-full opacity-60 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              className="space-y-6 relative z-10"
            >
              {/* Premium Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <Sparkles size={11} className="text-amber-400" />
                <span>Conglomerate Group</span>
              </div>

              <div className="space-y-2">
                <h1 className={`text-4xl md:text-5xl font-black tracking-tight font-sans uppercase leading-tight ${
                  isDarkMode ? 'text-white' : 'text-[#3b118b]'
                }`}>
                  {themeSettings?.heroTitle1 || 'MAHDEV'}
                </h1>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase leading-snug">
                  {themeSettings?.heroTitle2 || 'ELITE SERVICE SUITE'}
                </h2>
              </div>
              
              {/* Short solid gold divider line */}
              <div className="h-[3px] w-14 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              
              <div className="space-y-4">
                <p className={`text-base md:text-lg font-medium leading-relaxed tracking-wide ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {themeSettings?.heroDescription || 'One Vision, Four Powerful Solutions.'}
                </p>
                <div className={`flex items-center gap-2 text-xs md:text-sm font-semibold flex-wrap ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="hover:text-purple-400 transition-colors">AI Driven</span>
                  <span className="text-amber-500/60">•</span>
                  <span className="hover:text-purple-400 transition-colors">Expert Powered</span>
                  <span className="text-amber-500/60">•</span>
                  <span className="hover:text-purple-400 transition-colors">Excellence Delivered</span>
                </div>
              </div>

              <button
                onClick={handleConsultation}
                className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 flex items-center gap-2 cursor-pointer border-none transform active:scale-[0.98]"
              >
                <span>Discover More</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Right Section with Stage Accordion (Desktop) & Landscape Grid (Mobile) */}
          <div className="w-full lg:w-[65%] relative flex items-center">
            
            {/* Stage Canopy Projection */}
            <div className={`absolute top-[-30px] left-1/2 -translate-x-1/2 w-[110%] h-[90px] rounded-[100%] border-b shadow-[0_12px_24px_rgba(99,102,241,0.03)] pointer-events-none z-20 hidden md:block ${
              isDarkMode 
                ? 'from-indigo-950/20 via-indigo-900/5 to-transparent border-indigo-500/10' 
                : 'from-purple-200/40 via-purple-100/10 to-transparent border-purple-500/5'
            }`} />
            
            {/* Stage Base Reflection */}
            <div className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[105%] h-[60px] rounded-[100%] border-t shadow-[0_-8px_20px_rgba(99,102,241,0.02)] pointer-events-none z-20 hidden md:block ${
              isDarkMode 
                ? 'from-slate-950 via-slate-900/10 to-transparent border-indigo-500/5' 
                : 'from-slate-200 via-slate-100/5 to-transparent border-purple-500/5'
            }`} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-4 md:gap-4 h-auto md:h-[460px] lg:h-[500px] relative z-10 w-full">
              {columns.map((col, index) => {
                const activeId = hoveredCardId !== null ? hoveredCardId : (isMobile ? null : 'sws');
                const isExpanded = isMobile || activeId === col.id;

                // Staggered parallax translation on scroll (only active on desktop)
                const speeds = [-0.06, -0.10, -0.04, -0.08];
                const yParallax = useTransform(scrollY, [0, 800], [0, speeds[index] * 140]);

                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 85, damping: 16, delay: index * 0.07 }}
                    style={{ y: isMobile ? 0 : yParallax }}
                    onMouseEnter={() => !isMobile && setHoveredCardId(col.id)}
                    onMouseLeave={() => !isMobile && setHoveredCardId(null)}
                    onClick={() => onNavigate(col.page)}
                    className={`relative w-full h-[220px] sm:h-[240px] md:h-full rounded-[24px] overflow-hidden border transition-all duration-500 ease-out cursor-pointer group flex flex-col justify-between ${
                      isExpanded 
                        ? 'md:flex-[2.4] md:shadow-xl md:shadow-purple-500/5' 
                        : 'md:flex-[0.6]'
                    } ${col.borderStyle} ${col.glowColor}`}
                  >
                    {/* Background image - fully visible cover in wide cards */}
                    <img
                      src={col.image}
                      alt={`${col.title} ${col.subtitle}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                        isExpanded ? 'scale-102' : 'group-hover:scale-105'
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Dark gradient overlay for modern legible layout */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/15 transition-opacity duration-300 ${
                      isExpanded ? 'opacity-85' : 'opacity-70 group-hover:opacity-55'
                    }`} />
                    
                    {/* Glowing highlight indicator */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20" />

                    {/* EXPANDED CONTENT INTERFACE */}
                    <div className={`relative p-5 md:p-6 w-full h-full flex flex-col justify-between z-10 text-left transition-all duration-500 ${
                      isExpanded ? 'opacity-100 pointer-events-auto' : 'md:opacity-0 md:pointer-events-none'
                    }`}>
                      {/* Subtitle tag & Title */}
                      <div className="space-y-1 pt-2 md:pt-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold font-mono uppercase tracking-wider ${col.badgeColor}`}>
                          {col.subtitle}
                        </span>
                        <h3 className={`text-xl md:text-2xl font-black tracking-tight text-white mt-1.5`}>
                          {col.title}
                        </h3>
                      </div>

                      {/* Bullet Lists of Services - Clean and Professional */}
                      <ul className="space-y-1.5 md:space-y-2 mt-4 hidden md:block select-none">
                        {col.services.map((svc, i) => (
                          <li key={i} className="flex items-center gap-2 text-left">
                            <CheckCircle2 size={12} className="text-purple-400 shrink-0" />
                            <span className="text-[10px] md:text-[11px] leading-tight font-medium text-slate-200 tracking-wide">
                              {svc}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Footer metric & explore trigger */}
                      <div className="space-y-2.5 pt-2">
                        <div className={`text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-widest py-1 px-2.5 rounded-lg inline-block ${
                          isDarkMode ? 'text-purple-300 bg-purple-950/40 border border-purple-500/10' : 'text-purple-700 bg-purple-100/80 border border-purple-200/50'
                        }`}>
                          {col.metric}
                        </div>
                        <span className="explore-btn w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-bold uppercase tracking-wider text-white transition-colors shadow-md">
                          <span>Explore Segment</span>
                          <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>

                    {/* COLLAPSED CONTENT INTERFACE (Rotated title preview) */}
                    <div className={`absolute inset-0 p-4 w-full h-full flex flex-col items-center justify-center z-10 select-none transition-all duration-500 ${
                      isExpanded ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
                    }`}>
                      {/* Vertical Title (reads top-to-bottom on desktop columns) */}
                      <div className="hidden md:flex flex-col items-center justify-center h-full rotate-180" style={{ writingMode: 'vertical-lr' }}>
                        <h3 className={`text-lg font-black tracking-widest text-center uppercase leading-none ${col.tagColor}`}>
                          {col.title}
                        </h3>
                        <p className="text-[8px] font-extrabold text-slate-300 tracking-widest uppercase mt-3 select-none leading-none">
                          {col.subtitle.split(' ')[0]}
                        </p>
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