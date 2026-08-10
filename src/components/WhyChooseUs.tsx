'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, HeartHandshake, Milestone, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';

const iconMap: Record<string, any> = {
  Award, ShieldCheck, Zap, Milestone, HeartHandshake, Clock
};

const defaultReasons = [
  {
    iconName: 'Award',
    title: { en: 'Certified Excellence', si: 'සහතික කළ විශිෂ්ටත්වය', ta: 'சான்றளிக்கப்பட்ட சிறப்பு' },
    desc: { en: 'Award-winning software implementations and premium wedding planner associations across South Asia.', si: 'දකුණු ආසියාව පුරා සම්මානලාභී මෘදුකාංග සහ ඉහළ පෙළේ මංගල සැලසුම් සේවා.', ta: 'தெற்காசியா முழுவதும் விருது பெற்ற மென்பொருள் மற்றும் திருமண திட்டமிடல் சேவைகள்.' },
    color: 'text-yellow-400',
    border: 'border-yellow-500/10'
  },
  {
    iconName: 'ShieldCheck',
    title: { en: 'Bank-Grade Security', si: 'බැංකු මට්ටමේ ආරක්ෂාව', ta: 'வங்கி தர பாதுகாப்பு' },
    desc: { en: 'Our ERP systems implement end-to-end data encryption and strict Firestore rules to secure transaction ledgers.', si: 'අපගේ ඊආර්පී (ERP) පද්ධති ආරක්ෂිත දත්ත සංකේතනය සහ දැඩි ගනුදෙනු ලේඛන සපයයි.', ta: 'எங்கள் ஈஆர்பி (ERP) அமைப்புகள் பாதுகாப்பான தரவு குறியாக்கத்தையும் பரிவர்த்தனை பதிவுகளையும் வழங்குகின்றன.' },
    color: 'text-cyan-400',
    border: 'border-cyan-500/10'
  },
  {
    iconName: 'Zap',
    title: { en: 'Hyper-Performance', si: 'අතිශය වේගවත් ක්‍රියාකාරිත්වය', ta: 'அதிவேக செயல்திறன்' },
    desc: { en: 'Using cutting-edge stacks like Next.js and Firebase Client SDK to deliver page loads under 1 second.', si: 'තත්පර 1 කට අඩු කාලයකදී පිටු පූරණය කිරීමට Next.js සහ Firebase වැනි නවීන තාක්ෂණයන් භාවිතා කිරීම.', ta: '1 வினாடிக்கும் குறைவான நேரத்தில் பக்கங்களை ஏற்ற Next.js மற்றும் Firebase போன்ற நவீன தொழில்நுட்பங்களை பயன்படுத்துகிறோம்.' },
    color: 'text-purple-400',
    border: 'border-purple-500/10'
  },
  {
    iconName: 'Milestone',
    title: { en: 'Proven Track Record', si: 'ප්‍රත්‍යක්ෂ අත්දැකීම්', ta: 'நிரூபிக்கப்பட்ட வரலாறு' },
    desc: { en: 'Successfully delivered over 1,200 projects, from custom inventory warehouses to large cinematic movies.', si: 'භාණ්ඩ ගබඩා කළමනාකරණ මෘදුකාංග වල සිට දැවැන්ත චිත්‍රපට නිෂ්පාදන දක්වා ව්‍යාපෘති 1,200 කට වඩා සාර්ථකව අවසන් කර ඇත.', ta: 'பொருட்களஞ்சிய மென்பொருள் முதல் பெரிய திரைப்பட தயாரிப்புகள் வரை 1,200 க்கும் மேற்பட்ட திட்டங்களை வெற்றிகரமாக முடித்துள்ளோம்.' },
    color: 'text-blue-400',
    border: 'border-blue-500/10'
  },
  {
    iconName: 'HeartHandshake',
    title: { en: 'Dedicated Account Managers', si: 'කැපවූ වගකිවයුතු නිලධාරීන්', ta: 'அர்ப்பணிக்கப்பட்ட கணக்கு மேலாளர்கள்' },
    desc: { en: 'Direct consultation pipelines for SWS wedding couples, Travels clients, and IT project stakeholders alike.', si: 'මංගල ජෝඩු, සංචාරක සේවා ගනුදෙනුකරුවන් සහ තොරතුරු තාක්ෂණ ව්‍යාපෘති කොටස්කරුවන් සඳහා සෘජු උපදේශන සේවාවන්.', ta: 'திருமண தம்பதியினர், சுற்றுலா வாடிக்கையாளர்கள் மற்றும் தகவல் தொழில்நுட்ப திட்ட பங்காளர்களின் நேரடி ஆலோசனை சேவைகள்.' },
    color: 'text-green-400',
    border: 'border-green-500/10'
  },
  {
    iconName: 'Clock',
    title: { en: '24/7 Engineering Support', si: '24/7 තාක්ෂණික සහය', ta: '24/7 பொறியியல் ஆதரவு' },
    desc: { en: 'Proactive server monitoring, automated daily cloud database backups, and instant WhatsApp support pipelines.', si: 'ක්‍රියාකාරී සේවාදායක නිරීක්ෂණය, දිනපතා ස්වයංක්‍රීය දත්ත උපස්ථ සහ ක්ෂණික වට්ස්ඇප් සහය සේවාවන්.', ta: 'செயலில் உள்ள சேவையக கண்காணிப்பு, தினசரி தானியங்கி தரவு காப்புப்பிரதிகள் மற்றும் உடனடி வாட்ஸ்அப் ஆதரவு சேவைகள்.' },
    color: 'text-red-400',
    border: 'border-red-500/10'
  }
];

export default function WhyChooseUs() {
  const { t } = useLanguage();
  const [whyChooseUsData, setWhyChooseUsData] = useState<any>({
    title: { en: 'Why Elite Companies Choose Mahdev', si: 'ප්‍රභූ සමාගම් මහදේව් තෝරා ගන්නේ ඇයි', ta: 'ஏன் உயரடுக்கு நிறுவனங்கள் மஹ்தேவை தேர்வு செய்கின்றன' },
    subtitle: { en: 'We merge standard architectural precision with luxury design guidelines to create products that scale and spaces that inspire.', si: 'අපි ව්‍යුහාත්මක නිරවද්‍යතාවය සහ සුඛෝපභෝගී සැලසුම් එක් කරමින් ඉහළම ප්‍රමිතියේ නිපැයුම් සකස් කරමු.', ta: 'உயர்தர வடிவமைப்பு மற்றும் துல்லியமான கட்டமைப்புடன் தயாரிப்புகளை உருவாக்குகிறோம்.' },
    reasons: defaultReasons
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'why_choose_us'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setWhyChooseUsData((prev: any) => ({
          ...prev,
          ...d
        }));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full py-10 relative bg-navy-dark overflow-hidden">
      {/* Background glow */}
      <div className="glow-ball glow-ball-blue w-96 h-96 top-10 right-0 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-8 flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
            {t('OUR UNIQUE ADVANTAGE')}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {t(whyChooseUsData.title)}
          </h2>
          <p className="font-sans text-gray-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            {t(whyChooseUsData.subtitle)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUsData.reasons.map((reason: any, idx: number) => {
            const Icon = iconMap[reason.iconName] || Award;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`glass p-5 rounded-2xl border ${reason.border || 'border-white/5'} hover:border-gold-accent/30 transition-all duration-300 group flex flex-col gap-3.5 hover:translate-y-[-4px]`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-gold-accent/20 transition-colors">
                  <Icon className={`w-5.5 h-5.5 ${reason.color || 'text-gold-accent'} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <h3 className="font-display font-bold text-base text-white group-hover:text-gold-soft transition-colors">
                    {t(reason.title)}
                  </h3>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">
                    {t(reason.desc)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
