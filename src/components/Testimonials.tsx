'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';

const fallbackTestimonials = [
  {
    id: 1,
    name: 'Rajesh Singhania',
    role: {
      en: 'Managing Director, Singhania Jewellers',
      si: 'කළමනාකාර අධ්‍යක්ෂ, සිංහානියා ස්වර්ණාභරණ',
      ta: 'மேலாண்மை இயக்குனர், சிங்கானியா ஜூவல்லர்ஸ்'
    },
    rating: 5,
    comment: {
      en: 'Mahdev Pvt Ltd decorated our daughter’s wedding in Colombo and it looked like a literal palace! The marigold arches and fairy lighting was absolutely breathtaking. Simultaneously, we automated our retail store billing with their POS ERP system. Outstanding multi-skilled team!',
      si: 'මහදේව් සමාගම කොළඹ අපේ දියණියගේ මංගල උත්සවය සරසා තිබූ අතර එය සැබවින්ම රජ මාලිගාවක් බඳු විය! තවද, අපි අපගේ සිල්ලර වෙළඳසැල් ගෙවීම් පද්ධතිය ඔවුන්ගේ ERP පද්ධතිය සමඟ ස්වයංක්‍රීය කළෙමු. විශිෂ්ට කණ්ඩායමක්!',
      ta: 'மஹ்தேவ் நிறுவனம் கொழும்பில் எங்களது மகளின் திருமணத்தை அலங்கரித்தது, அது ஒரு அரண்மனை போல இருந்தது! அதே சமயம், எங்களின் சில்லறை விற்பனை கடை கணக்குகளை அவர்களின் ஈஆர்பி (ERP) மென்பொருள் மூலம் தானியங்குபடுத்தினோம். சிறந்த குழு!'
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 2,
    name: 'Dr. Anjali Mehta',
    role: {
      en: 'Founder, Mehta Eye & Dental Clinics',
      si: 'නිර්මාතෘ, මේතා අක්ෂි සහ දන්ත සායනය',
      ta: 'நிறுவனர், மேத்தா கண் மற்றும் பல் மருத்துவமனை'
    },
    rating: 5,
    comment: {
      en: 'We hired them for website development and UI/UX design. They built an exceptionally responsive client portal. We were so impressed that we integrated their clinic attendance module. Truly professional and reliable.',
      si: 'අපි ඔවුන්ව වෙබ් අඩවි සංවර්ධනය සහ සැලසුම් කිරීම සඳහා බඳවා ගත්තෙමු. ඔවුන් ඉතා වේගවත් පාරිභෝගික ද්වාරයක් නිර්මාණය කළ අතර අපි ඔවුන්ගේ පැමිණීමේ මොඩියුලයද ඒකාබද්ධ කළෙමු. වෘත්තීය සහ විශ්වසනීයයි.',
      ta: 'வலைத்தள மேம்பாடு மற்றும் வடிவமைப்புக்காக நாங்கள் அவர்களை வேலைக்கு அமர்த்தினோம். அவர்கள் மிகவும் பதிலளிக்கக்கூடிய வாடிக்கையாளர் போர்ட்டலை உருவாக்கினர். மிகவும் தொழில்முறை மற்றும் நம்பகமான குழு.'
    },
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 3,
    name: 'Karan Malhotra',
    role: {
      en: 'Executive Chef, Spice Kraft Restaurants',
      si: 'ප්‍රධාන වේලා සූපවේදී, ස්පයිස් ක්‍රාෆ්ට් අවන්හල්',
      ta: 'தலைமை சமையல்காரர், ஸ்பைஸ் கிராஃப்ட் உணவகம்'
    },
    rating: 5,
    comment: {
      en: 'Their Restaurant POS and payroll system saved us over 40 hours of manual bookkeeping each month. We also contracted their photography wing for our culinary shoot. The cinematic lighting is award-winning!',
      si: 'ඔවුන්ගේ අවන්හල් POS සහ වැටුප් ලේඛන ක්‍රමය මඟින් සෑම මසකම පැය 40 කට වඩා වැඩි කාලයක් ඉතිරි කර ගැනීමට හැකි විය. අපි ඔවුන්ගේ ඡායාරූප කණ්ඩායමද අපේ සූපශාස්ත්‍ර ඡායාරූපකරණයට යොදා ගත්තෙමු. විශිෂ්ට සේවාවක්!',
      ta: 'அவர்களின் உணவக பிஓஎஸ் (POS) மற்றும் ஊதிய முறை ஒவ்வொரு மாதமும் 40 மணிநேரத்திற்கும் மேலான கைமுறை கணக்குப்பதிவை மிச்சப்படுத்தியது. எங்களின் சமையல் படப்பிடிப்புக்காக அவர்களின் புகைப்படப் பிரிவையும் ஒப்பந்தம் செய்தோம். சிறந்த ஒளி அமைப்பு!'
    },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=webp&fit=crop&q=60&w=120'
  }
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const [testimonialList, setTestimonialList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
        setTestimonialList(list);
      } else {
        setTestimonialList([]);
      }
    });
    return () => unsub();
  }, []);

  const activeTestimonials = testimonialList.length > 0 ? testimonialList : fallbackTestimonials;

  useEffect(() => {
    if (activeTestimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % activeTestimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeTestimonials]);

  const next = () => {
    if (activeTestimonials.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % activeTestimonials.length);
  };

  const prev = () => {
    if (activeTestimonials.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  if (activeTestimonials.length === 0) return null;

  const currentTestimonial = activeTestimonials[activeIdx] || activeTestimonials[0];

  return (
    <div className="w-full py-20 relative bg-navy-medium/30 overflow-hidden">
      <div className="glow-ball glow-ball-purple w-80 h-80 top-1/2 left-0 opacity-10" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
            {t('CLIENT TESTIMONIALS')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            {t('Trusted by Leaders Across Industries')}
          </h2>
        </div>

        <div className="relative min-h-[320px] sm:min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 flex flex-col gap-6 relative text-left"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-gold-accent/10 pointer-events-none" />

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, currentTestimonial.rating || 5) }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-soft text-gold-soft" />
                ))}
              </div>

              <p className="font-sans text-gray-300 text-base sm:text-lg leading-relaxed italic">
                "{t(currentTestimonial.comment)}"
              </p>

              <div className="flex items-center gap-4 mt-2 border-t border-white/5 pt-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-accent/20 shrink-0">
                  <img 
                    src={currentTestimonial.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&fit=crop&q=60&w=120'} 
                    alt={t(currentTestimonial.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm sm:text-base">
                    {t(currentTestimonial.name)}
                  </h4>
                  <p className="font-sans text-xs text-gray-400">
                    {t(currentTestimonial.role)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={prev}
            className="w-10 h-10 rounded-full glass border border-white/10 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 font-sans">
            {activeTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIdx === idx ? 'w-6 bg-gold-soft' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={next}
            className="w-10 h-10 rounded-full glass border border-white/10 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
