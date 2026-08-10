'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const defaultTerms = {
  title: { en: 'Terms & Conditions', si: 'නියමයන් සහ කොන්දේසි', ta: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்' },
  lastUpdated: { en: 'Last Updated: August 10, 2026', si: 'අවසන් වරට යාවත්කාලීන කලේ: 2026 අගෝස්තු 10', ta: 'கடைசியாக புதுப்பிக்கப்பட்டது: ஆகஸ்ட் 10, 2026' },
  sections: [
    {
      title: { en: '1. Dynamic Service Agreements', si: '1. සේවා ගිවිසුම් නියමයන්', ta: '1. சேவை ஒப்பந்தங்கள்' },
      body: {
        en: 'By engaging Mahdev Pvt Ltd for SWS wedding decor planning, Travels luxury vehicle leasing, or custom cloud POS ERP system developments, you agree to comply with standard payment milestones and BIA airport travel transit schedules.\n\nAll services will require written approval prior to delivery.',
        si: 'මහදේව් සමූහ ව්‍යාපාරයේ උත්සව සැලසුම්කරණ, සුඛෝපභෝගී වාහන කුලී හෝ මෘදුකාංග සේවාවන් ලබා ගැනීමෙන් ඔබ ගෙවීම් කොන්දේසි සහ ගමනාගමන කාලසටහන් වලට එකඟ වේ.\n\nසෑම සේවාවක් සඳහාම ක්‍රියාත්මක කිරීමට පෙර ලිඛිත අනුමැතිය අවශ්‍ය වේ.',
        ta: 'மஹ்தேவ் நிறுவனத்தின் சேவைகளைப் பயன்படுத்துவதன் மூலம் நீங்கள் கட்டண விதிமுறைகள் மற்றும் போக்குவரத்து கால அட்டவணைகளுக்கு ஒப்புக்கொள்கிறீர்கள்.'
      }
    },
    {
      title: { en: '2. Database Sync & Operations', si: '2. දත්ත සමමුහුර්තකරණය සහ ක්‍රියාකාරිත්වය', ta: '2. தரவு ஒத்திசைவு மற்றும் செயல்பாடுகள்' },
      body: {
        en: 'Clinic registrations, checkout transaction registries, and invoice blueprints synced to client portals are subject to regional laws. We implement strict Firebase credentials configurations to guard data security.',
        si: 'අපගේ මෘදුකාංග පද්ධති වෙත ඇතුළත් කරනු ලබන ව්‍යාපාරික දත්ත සහ ගනුදෙනු වාර්තා කලාපීය නීතිරීතිවලට යටත් වේ. දත්ත ආරක්ෂාව තහවුරු කිරීම සඳහා අපි Firebase ආරක්ෂක ක්‍රමවේද ක්‍රියාත්මක කරමු.',
        ta: 'எங்கள் மென்பொருள் அமைப்புகளில் உள்ள தரவுகள் பிராந்திய சட்டங்களுக்கு உட்பட்டவை. நாங்கள் ஃபயர்பேஸ் பாதுகாப்பு நெறிமுறைகளைப் பயன்படுத்துகிறோம்.'
      }
    }
  ]
};

export default function Terms() {
  const { t } = useLanguage();
  const [termsData, setTermsData] = useState<any>(defaultTerms);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'legal'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.terms) {
          setTermsData(d.terms);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-left font-sans">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="border-b border-white/5 pb-6 mb-10 flex flex-col gap-2">
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
              {t(termsData.title)}
            </h1>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {t(termsData.lastUpdated)}
            </span>
          </div>

          {/* Render Sections */}
          <div className="flex flex-col gap-8 text-gray-300 text-sm sm:text-base leading-relaxed">
            {termsData.sections?.map((sec: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="flex flex-col gap-3"
              >
                <h3 className="font-display font-bold text-white text-lg sm:text-xl">
                  {t(sec.title)}
                </h3>
                <p className="whitespace-pre-line text-[#BFC8E6]/85">
                  {t(sec.body)}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
