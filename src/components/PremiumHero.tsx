import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
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
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(244,63,94,0.3)]',
      borderStyle: 'border-pink-500/20 group-hover:border-pink-500/60',
      tagColor: 'text-pink-400 group-hover:text-pink-300'
    },
    {
      id: 'u1',
      title: 'U1',
      subtitle: 'STUDIO',
      image: u1Image,
      page: ActivePage.Photography,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(139,92,246,0.3)]',
      borderStyle: 'border-violet-500/20 group-hover:border-violet-500/60',
      tagColor: 'text-violet-400 group-hover:text-violet-300'
    },
    {
      id: 'it',
      title: 'MAHDEV',
      subtitle: 'IT & SOLUTIONS',
      image: itImage,
      page: ActivePage.ItSolutions,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]',
      borderStyle: 'border-cyan-500/20 group-hover:border-cyan-500/60',
      tagColor: 'text-cyan-400 group-hover:text-cyan-300'
    },
    {
      id: 'travels',
      title: 'MAHDEV',
      subtitle: 'TRAVELS',
      image: travelsImage,
      page: ActivePage.Travels,
      glowColor: 'group-hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]',
      borderStyle: 'border-amber-500/20 group-hover:border-amber-500/60',
      tagColor: 'text-amber-400 group-hover:text-amber-300'
    }
  ];

  return (
    <section className="relative w-full bg-[#0b0c10] overflow-hidden py-20 lg:py-28 min-h-[95vh] flex items-center">
      {/* Circuit lines backdrop overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Background radial ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          
          {/* Left Text Block */}
          <div className="w-full lg:w-[35%] flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white font-sans uppercase leading-none">
                  MAHDEV
                </h1>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase leading-none mt-1">
                  ELITE SERVICE SUITE
                </h2>
              </div>
              
              {/* Short solid gold divider line */}
              <div className="h-[3px] w-14 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              
              <div className="space-y-3">
                <p className="text-lg md:text-xl font-semibold text-slate-200 leading-normal tracking-wide">
                  One Vision, Four Powerful Solutions.
                </p>
                <div className="flex items-center gap-2 text-sm md:text-base text-slate-400 font-medium flex-wrap">
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

          {/* Right Arches Section */}
          <div className="w-full lg:w-[65%] relative">
            
            {/* Curved canopy ring projection */}
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[115%] h-[120px] bg-gradient-to-b from-indigo-950/20 via-indigo-900/5 to-transparent rounded-[100%] border-b border-indigo-500/15 shadow-[0_12px_24px_rgba(99,102,241,0.05)] pointer-events-none z-20" />
            
            {/* Metallic stage base reflection */}
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[110%] h-[70px] bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent rounded-[100%] border-t border-indigo-500/10 shadow-[0_-8px_20px_rgba(99,102,241,0.03)] pointer-events-none z-20" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 h-[480px] md:h-[540px] relative z-10">
              {columns.map((col, index) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => onNavigate(col.page)}
                  className={`group relative h-full rounded-2xl overflow-hidden border bg-slate-950/40 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between cursor-pointer ${col.borderStyle} ${col.glowColor}`}
                >
                  {/* Column Image */}
                  <img
                    src={col.image}
                    alt={`${col.title} ${col.subtitle}`}
                    className="absolute inset-0 w-full h-full object-cover transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Shading overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30 opacity-90 group-hover:opacity-75 transition-opacity duration-300" />
                  
                  {/* Glowing header indicators matching the sector theme */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/30" />

                  {/* Header text container (Sector names overlay at top) */}
                  <div className="relative p-5 text-center z-10 w-full pt-6 select-none">
                    <h3 className={`text-xl md:text-2xl font-black tracking-tighter transition-all duration-300 ${col.tagColor}`}>
                      {col.title}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-bold tracking-widest text-slate-300 uppercase mt-0.5 leading-none">
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Footer call-to-action */}
                  <div className="relative p-5 z-10 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pb-6">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-widest text-white uppercase border border-white/10">
                      Explore
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}