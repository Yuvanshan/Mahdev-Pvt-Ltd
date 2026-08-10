'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'EN' | 'SI' | 'TA';
export type Theme = 'dark' | 'light';

const uiTranslations: Record<string, Record<string, string>> = {
  divisions: { en: 'Divisions', si: 'අංශ', ta: 'பிரிவுகள்' },
  get_quote: { en: 'Get a Quote', si: 'මිල ගණන් ලබා ගන්න', ta: 'மதிப்பீடு பெறுக' },
  home: { en: 'Home', si: 'මුල් පිටුව', ta: 'முகப்பு' },
  portfolio: { en: 'Portfolio', si: 'කලා එකතුව', ta: 'தொகுப்பு' },
  blog: { en: 'Blog', si: 'බ්ලොග්', ta: 'வலைப்பதிவு' },
  careers: { en: 'Careers', si: 'වෘත්තීය', ta: 'வேலைவாய்ப்பு' },
  contact: { en: 'Contact', si: 'සම්බන්ධතා', ta: 'තொடர்பු' },
  search: { en: 'Search', si: 'සොයන්න', ta: 'தேடுக' },
  navigation: { en: 'Navigation', si: 'සංචාලනය', ta: 'வழிசெலுத்தல்' },
  conglomerate_divisions: { en: 'Conglomerate Divisions', si: 'සමූහ ව්‍යාපාර අංශ', ta: 'கூட்டு நிறுவனப் பிரிவுகள்' },
  whatsapp_direct: { en: 'WhatsApp Direct', si: 'වට්ස්ඇප් සෘජු', ta: 'வாட்ஸ்அப் நேரடி' },
  explore_our_work: { en: 'Explore Our Work', si: 'අපගේ කාර්යයන්', ta: 'எங்கள் வேலைகள்' },
  focus_sectors: { en: 'Focus Sectors:', si: 'ප්‍රධාන අංශ:', ta: 'முக்கிய பிரிவுகள்:' },
  one_premium_company: { en: 'ONE PREMIUM COMPANY', si: 'ප්‍රමුඛතම සමාගම', ta: 'ஒரு பிரீமியம் நிறுவனம்' },
  scroll: { en: 'SCROLL', si: 'පහළට යන්න', ta: 'சுருள்' },
  enter_div: { en: 'ENTER DIV', si: 'ඇතුල් වන්න', ta: 'நுழைக' },
  view_post: { en: 'VIEW POST', si: 'පෝස්ට් එක බලන්න', ta: 'பதிவைப் பார்' },
  read_case_study: { en: 'READ CASE STUDY', si: 'විස්තර කියවන්න', ta: 'ஆராய்வு வாசி' },
  frequently_asked: { en: 'Frequently Asked', si: 'නිතර අසන ප්‍රශ්න', ta: 'அடிக்கடி கேட்கப்படும்' },
  have_questions: { en: 'HAVE QUESTIONS?', si: 'ප්‍රශ්න තිබේද?', ta: 'கேள்விகள் உள்ளதா?' },
  partner_with_us: { en: 'PARTNER WITH US', si: 'අප සමඟ එක්වන්න', ta: 'எங்களுடன் இணையுங்கள்' },
  call_office: { en: 'Call Office', si: 'කාර්යාලය අමතන්න', ta: 'அலுவலகம்' },
  email_inbox: { en: 'Email Inbox', si: 'විද්‍යුත් තැපෑල', ta: 'மின்னஞ்சல்' },
  direct_whatsapp: { en: 'Direct WhatsApp', si: 'සෘජු වට්ස්ඇප්', ta: 'நேரடி வட்ஸ்அப்' },
  working_hours: { en: 'Working Hours', si: 'වැඩ කරන වේලාවන්', ta: 'வேலை நேரம்' },
  send_inquiry: { en: 'SEND INQUIRY', si: 'විමසීම යවන්න', ta: 'விசாரணை அனுப்பு' },
  happy_clients: { en: 'Happy Clients', si: 'සතුටුදායක පාරිභෝගිකයින්', ta: 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' },
  events_completed: { en: 'Events Completed', si: 'නිම කළ ඉසව්', ta: 'நிறைவுற்ற நிகழ்வுகள்' },
  software_projects: { en: 'Software Projects', si: 'මෘදුකාංග ව්‍යාපෘති', ta: 'மென்பொருள் திட்டங்கள்' },
  vehicles_in_fleet: { en: 'Vehicles In Fleet', si: 'වාහන සංඛ්‍යාව', ta: 'வாகனங்கள்' },
  years_experience: { en: 'Years Experience', si: 'වසරක පළපුරුද්ද', ta: 'வருட அனுபவம்' },
  packages_pricing: { en: 'Packages & Pricing', si: 'පැකේජ සහ මිල ගණන්', ta: 'தொகுப்புகள் மற்றும் விலைகள்' },
  our_fleet: { en: 'Our Vehicle Fleet', si: 'අපගේ වාහන එකතුව', ta: 'எங்கள் வாகனக் குழு' },
  book_consultation: { en: 'BOOK CONSULTATION', si: 'වේලාවක් වෙන් කරගන්න', ta: 'ஆலோசனை பதிவு செய்' },
  operational_suite: { en: 'OPERATIONAL SUITE', si: 'සේවා අංශ සහ හැකියාවන්', ta: 'சேவை பிரிவுகள்' },
  dynamic_services: { en: 'Dynamic Services & Capabilities', si: 'අංශයේ සේවාවන් සහ හැකියාවන්', ta: 'சேவைகள் மற்றும் திறன்கள்' },
  learn_more: { en: 'Learn More', si: 'වැඩිදුර විස්තර', ta: 'மேலும் அறிக' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (field: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync language
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['EN', 'SI', 'TA'].includes(savedLang)) {
      setLanguageState(savedLang);
    }

    // Sync theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const initialTheme = prefersLight ? 'light' : 'dark';
      setThemeState(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Translation helper: handles localized dictionaries and returns string value
  const t = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') {
      const l = language.toLowerCase();
      // Check if it's a known UI translation key
      if (uiTranslations[field] && uiTranslations[field][l]) {
        return uiTranslations[field][l];
      }
      return field;
    }
    
    // If field is an object, check the active language
    const langKey = language.toLowerCase();
    if (field[langKey] && typeof field[langKey] === 'string') {
      return field[langKey];
    }
    
    // Fallback to English
    if (field['en'] && typeof field['en'] === 'string') {
      return field['en'];
    }
    
    // Fallback to first available string property in the object
    const keys = Object.keys(field);
    for (const key of keys) {
      if (typeof field[key] === 'string' && field[key]) {
        return field[key];
      }
    }
    
    return '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme, toggleTheme, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
