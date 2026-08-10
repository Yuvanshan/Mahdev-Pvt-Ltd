'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Eye, Target, Award } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const defaultAboutData = {
  heroImage: '/images/sws_robot_decor_1783346269673.jpg',
  title: { en: 'About Mahdev Pvt Ltd', si: 'මහදේව් සමූහය පිළිබඳව', ta: 'மஹ்தேவ் நிறுவனம் பற்றி' },
  tagline: { en: 'Pioneering Synergy Across Physical and Digital Spaces.', si: 'භෞතික සහ ඩිජිටල් අවකාශයන් යා කරන ප්‍රමුඛයා.', ta: 'உயர்தர சேவைகளை இணைக்கும் முன்னோடி.' },
  introHeading: { en: 'Our Story', si: 'අපගේ කථාන්දරය', ta: 'எங்கள் கதை' },
  introText: {
    en: 'Mahdev Pvt Ltd was founded as a multi-disciplinary conglomerate designed to bridge physical luxury experience designs and digital system architectures. Over the years, we have scaled SWS Event decorations, Studio U1 cinematography, cloud POS ERP softwares, and Travels convoys across South Asia.',
    si: 'මහදේව් සමූහ ව්‍යාපාරය ආරම්භ කරන ලද්දේ භෞතික සුඛෝපභෝගී අලංකරණ සහ ඩිජිටල් මෘදුකාංග පද්ධති ඒකාබද්ධ කරමින් පාරිභෝගිකයින්ට ඉහළම ගුණාත්මක සේවාවක් සැලසීමටය. අපි වසර ගණනාවක් පුරා උත්සව කළමනාකරණය, ඡායාරූපකරණය, ව්‍යාපාරික මෘදුකාංග සහ සුඛෝපභෝගී රථ වාහන සේවා සාර්ථකව මෙහෙයවන්නෙමු.',
    ta: 'மஹ்தேவ் நிறுவனம் உயர்தர வடிவமைப்புகள் மற்றும் கணினி உள்கட்டமைப்புகளை இணைக்க நிறுவப்பட்டது. நிகழ்வு மேலாண்மை, நிழற்படம், மென்பொருள் மற்றும் விஐபி வாகனப் பிரிவுகளை வெற்றிகரமாக இயக்கி வருகிறோம்.'
  },
  missionHeading: { en: 'Our Mission', si: 'අපගේ මෙහෙවර', ta: 'எங்கள் நோக்கம்' },
  missionText: {
    en: 'To deliver uncompromised quality, blending standard structural safety protocols with premium aesthetic guidelines across every division.',
    si: 'සෑම අංශයක් පුරාම උසස් ව්‍යුහාත්මක ප්‍රමිතීන් සහ සුඛෝපභෝගී අලංකරණයන් ඒකාබද්ධ කරමින් ඉහළම තත්ත්වයේ සේවාවක් සැපයීම.',
    ta: 'பாதுகாப்பான கட்டமைப்பு மற்றும் அழகியல் தரங்களுடன் சிறந்த சேவைகளை வழங்குவதே எங்களின் நோக்கமாகும்.'
  },
  visionHeading: { en: 'Our Vision', si: 'අපගේ දැක්ම', ta: 'எங்கள் தொலைநோக்கு' },
  visionText: {
    en: 'To be the ultimate international conglomerate benchmarked for engineering innovation, cinematic artistry, and luxury transit experiences.',
    si: 'ඉංජිනේරුමය නවෝත්පාදනය, සිනමාත්මක කලාත්මකභාවය සහ සුඛෝපභෝගී ප්‍රවාහනය සඳහා වන විශිෂ්ටතම ජාත්‍යන්තර ආදර්ශය බවට පත්වීම.',
    ta: 'பொறியியல் கண்டுபிடிப்பு, திரைப்படக் கலை மற்றும் சொகுசு போக்குவரத்துக்கு ஒரு சர்வதேச அளவுகோலாக விளங்குவது.'
  },
  values: [
    {
      title: { en: 'Integrity First', si: 'අවංකභාවය ප්‍රමුඛ කොට සැලකීම', ta: 'நேர்மை முதலிடம்' },
      desc: { en: 'Deploying audit-grade transparent accounting ledgers and secure client databases.', si: 'පැහැදිලි ගිණුම්කරණය සහ අතිශය සුරක්ෂිත පාරිභෝගික දත්ත පද්ධති ක්‍රියාත්මක කිරීම.', ta: 'தணிக்கை தரத்திலான கணக்குகள் மற்றும் பாதுகாப்பான தரவுத்தளங்கள்.' }
    },
    {
      title: { en: 'Handcrafted Precision', si: 'සූක්ෂ්ම සැලසුම්කරණය', ta: 'கைவினைத் துல்லியம்' },
      desc: { en: 'Every backdrop metal welding run and software route path designed by elite directors.', si: 'සෑම පසුබිම් සැලසුමක්ම සහ මෘදුකාංග කේතයක්ම ඉහළම ප්‍රවීණයන් විසින් නිර්මාණය කිරීම.', ta: 'ஒவ்வொரு வடிவமைப்பு மற்றும் மென்பொருளும் சிறந்த நிபுணர்களால் வடிவமைக்கப்படுகின்றன.' }
    }
  ]
};

export default function About() {
  const { t } = useLanguage();
  const [aboutData, setAboutData] = useState<any>(defaultAboutData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'about'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAboutData((prev: any) => ({
          ...prev,
          ...d
        }));
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-left">
        {/* Background mesh glows */}
        <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-10" />
        <div className="glow-ball glow-ball-gold w-96 h-96 bottom-20 -right-10 opacity-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Hero Section */}
          <div className="relative w-full h-[350px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl mb-16">
            <Image 
              src={aboutData.heroImage || '/images/sws_robot_decor_1783346269673.jpg'} 
              alt="About Mahdev" 
              fill 
              priority
              className="object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent" />
            <div className="absolute bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-left flex flex-col gap-3">
              <span className="px-3 py-1 rounded-full bg-gold-accent/25 border border-gold-accent/35 text-[10px] text-gold-soft font-bold uppercase tracking-widest max-w-fit">
                {t('ONE PREMIUM COMPANY')}
              </span>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white">
                {t(aboutData.title)}
              </h1>
              <p className="font-sans text-gray-300 text-sm sm:text-base max-w-2xl font-light">
                {t(aboutData.tagline)}
              </p>
            </div>
          </div>

          {/* Intro Story Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
            <div className="lg:col-span-5 text-left flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent font-sans">
                {t('OUR HERITAGE')}
              </span>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                {t(aboutData.introHeading)}
              </h2>
            </div>
            <div className="lg:col-span-7 font-sans text-gray-300 text-sm sm:text-base leading-relaxed pl-0 lg:pl-6">
              <p className="whitespace-pre-line">{t(aboutData.introText)}</p>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Mission */}
            <div className="glass-premium p-8 rounded-3xl border border-white/5 flex flex-col gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gold-accent/10 border border-gold-accent/20 text-gold-soft flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mt-1">
                {t(aboutData.missionHeading)}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t(aboutData.missionText)}
              </p>
            </div>

            {/* Vision */}
            <div className="glass-premium p-8 rounded-3xl border border-white/5 flex flex-col gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mt-1">
                {t(aboutData.visionHeading)}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t(aboutData.visionText)}
              </p>
            </div>
          </section>

          {/* Strategic Values */}
          <section className="flex flex-col gap-8">
            <div className="text-left flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent font-sans">
                {t('OUR PRINCIPLES')}
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {t('Strategic Pillars & Values')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aboutData.values?.map((val: any, idx: number) => (
                <div key={idx} className="glass p-6.5 rounded-2xl border border-white/5 flex gap-5 items-start text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-gold-soft shrink-0 mt-1">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-2 font-sans">
                    <h4 className="font-display font-bold text-white text-base">
                      {t(val.title)}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t(val.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
