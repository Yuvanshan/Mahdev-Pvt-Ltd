'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const defaultPrivacy = {
  title: { en: 'Privacy Policy', si: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය', ta: 'தனியுரிமைக் கொள்கை' },
  lastUpdated: { en: 'Last Updated: August 10, 2026', si: 'අවසන් වරට යාවත්කාලීන කලේ: 2026 අගෝස්තු 10', ta: 'கடைசியாக புதுப்பிக்கப்பட்டது: ஆகஸ்ட் 10, 2026' },
  sections: [
    {
      title: { en: '1. What Information We Log', si: '1. අප රැස් කරන තොරතුරු', ta: '1. நாங்கள் சேகரிக்கும் தகவல்கள்' },
      body: {
        en: 'We collect name, email, phone numbers, and operational message parameters when you submit the booking scheduler or contact wizards. We do not store transaction card details in our database registries.',
        si: 'ඔබ අපගේ වෙන්කිරීම් පද්ධති හෝ විමසීම් පත්‍රිකා පිරවීමේදී නම, විද්‍යුත් තැපෑල සහ දුරකථන අංක රැස් කරනු ලැබේ. අපි කිසිදු ගෙවීම් කාඩ්පත් තොරතුරු ගබඩා නොකරමු.',
        ta: 'எங்கள் படிவங்களை நீங்கள் நிரப்பும்போது பெயர், மின்னஞ்சல் மற்றும் தொலைபேசி எண்களை சேகரிக்கிறோம். நாங்கள் வங்கி அட்டை தகவல்களை சேமிப்பதில்லை.'
      }
    },
    {
      title: { en: '2. Data Protection Rules', si: '2. දත්ත ආරක්ෂණ ක්‍රමවේද', ta: '2. தரவு பாதுகாப்பு முறைகள்' },
      body: {
        en: 'We encrypt data pathways and implement rules blocking public queries of private contact form listings. Only authorized directors of Mahdev Pvt Ltd can access your details.',
        si: 'අපි සියලු දත්ත සන්නිවේදන මාර්ග සංකේතනය කර ආරක්ෂිත ක්‍රමවේද ක්‍රියාත්මක කරමු. ඔබගේ තොරතුරු ලබා ගත හැක්කේ බලයලත් නිලධාරීන්ට පමණි.',
        ta: 'தரவு பரிமாற்றங்களை குறியாக்கம் செய்து சிறந்த பாதுகாப்பு முறைகளைப் பயன்படுத்துகிறோம்.'
      }
    }
  ]
};

export default function Privacy() {
  const { t } = useLanguage();
  const [privacyData, setPrivacyData] = useState<any>(defaultPrivacy);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'legal'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.privacy) {
          setPrivacyData(d.privacy);
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
              {t(privacyData.title)}
            </h1>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {t(privacyData.lastUpdated)}
            </span>
          </div>

          {/* Render Sections */}
          <div className="flex flex-col gap-8 text-gray-300 text-sm sm:text-base leading-relaxed">
            {privacyData.sections?.map((sec: any, idx: number) => (
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
