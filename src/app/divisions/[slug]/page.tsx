'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Sparkles, Calendar, CheckCircle, ArrowLeft, Heart, 
  Church, Gift, Briefcase, Flower, Sun, Camera, Film, 
  Compass, User, Palette, Cpu, Terminal, Globe, Shield, 
  Layers, X, Check, MapPin, Users, Car
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

const BookingSystem = dynamic(() => import('@/components/BookingSystem'), { ssr: false });

const iconMap: Record<string, any> = {
  Heart, Church, Gift, Briefcase, Flower, Sun, Camera, Film, Compass, User, Palette, Cpu, Terminal, Globe, Shield, Layers, Sparkles
};

// Fallback data for testing & initial load if Firestore isn't seeded
const fallbackDivisions: Record<string, any> = {
  'erp': {
    name: { en: 'Mahdev ERP Systems', si: 'මහදේව් ඊආර්පී (ERP) පද්ධති', ta: 'மஹ்தேவ் ஈஆர்பி (ERP) அமைப்புகள்' },
    tagline: { en: 'Streamlining Omnichannel Enterprises', si: 'ව්‍යාපාරික ක්‍රියාවලි ස්වයංක්‍රීයකරණය', ta: 'வணிக செயல்பாடுகளை ஒழுங்குபடுத்துதல்' },
    description: {
      en: 'Double-entry bookkeeping, cloud-synchronized inventory ledgers, and specialized billing systems tailored for schools, hotels, and restaurants.',
      si: 'ද්විත්ව සටහන් පොත් තැබීම, වලාකුළු සමමුහුර්ත බඩු තොග ලෙජර සහ පාසල්, හෝටල් සහ ආපනශාලා සඳහා විශේෂිත බිල්පත් ක්‍රම.',
      ta: 'இரட்டைப் பதிவு கணக்குப்பதிவு, மேகக்கணி ஒத்திசைக்கப்பட்ட இருப்புப் பதிவேடுகள் மற்றும் பள்ளிகள், ஹோட்டல்கள் மற்றும் உணவகங்களுக்கான சிறப்பு பில்லிங் அமைப்புகள்.'
    },
    gradient: 'from-amber-500/20 to-orange-500/20',
    accentColor: '#f59e0b',
    bgImage: '/images/saas_dashboard.jpg',
    services: [
      { title: { en: 'Ledger Bookkeeping', si: 'ලෙජර් ගිණුම්කරණය', ta: 'கணக்கு புத்தக பராமரிப்பு' }, description: { en: 'Real-time double-entry corporate accounting logs.', si: 'තත්‍ය කාලීන ද්විත්ව සටහන් ආයතනික ගිණුම්කරණය.', ta: 'நிகழ்நேர இரட்டைப் பதிவு கணக்கியல்.' }, iconName: 'Layers' },
      { title: { en: 'Multi-Warehouse Inventory', si: 'බහු ගබඩා ඉන්වෙන්ටරි', ta: 'பல கிடங்கு சரக்கு' }, description: { en: 'Synchronized stock counts across multiple physical outlets.', si: 'භෞතික අලෙවිසැල් කිහිපයක් පුරා සමමුහුර්ත කළ තොග ගණන්.', ta: 'பல விற்பனை நிலையங்களில் ஒத்திசைக்கப்பட்ட இருப்பு அளவுகள்.' }, iconName: 'Cpu' },
      { title: { en: 'POS Thermal Checkouts', si: 'POS තාප මුද්‍රණ අයකැමි', ta: 'பிஓஎஸ் பில்லிங் முனையங்கள்' }, description: { en: 'Offline-first cash register checkpoints with printer sync.', si: 'මුද්‍රණ යන්ත්‍ර සමමුහුර්තකරණය සහිත නොබැඳි POS පද්ධති.', ta: 'அச்சுப்பொறி ஒத்திசைவுடன் கூடிய பில்லிங் முனையங்கள்.' }, iconName: 'Terminal' }
    ],
    packages: [
      {
        title: { en: 'Standard POS', si: 'ස්ටෑන්ඩර්ඩ් POS', ta: 'நிலையான பிஓஎஸ்' },
        price: { en: '$49/mo', si: 'රු. 15,000/මසකට', ta: 'මසකට $49' },
        features: [
          { en: '1 Register Connection', si: '1 ලේඛනයක් සම්බන්ධ කිරීම', ta: '1 கணினி இணைப்பு' },
          { en: 'Basic Inventory Management', si: 'මූලික ඉන්වෙන්ටරි කළමනාකරණය', ta: 'அடிப்படை இருப்பு மேலாண்மை' },
          { en: 'Email & WhatsApp Support', si: 'විද්‍යුත් තැපෑල සහ වට්ස්ඇප් සහය', ta: 'மின்னஞ்சல் & வாட்ஸ்அப் ஆதரவு' }
        ]
      },
      {
        title: { en: 'Enterprise ERP Suite', si: 'එන්ටර්ප්‍රයිස් ඊආර්පී', ta: 'நிறுவன ஈஆர்பி தொகுப்பு' },
        price: { en: 'Custom Pricing', si: 'විශේෂිත මිල ගණන්', ta: 'தனிப்பயன் விலை' },
        features: [
          { en: 'Unlimited Outlets', si: 'සීමා රහිත ශාඛා', ta: 'வரம்பற்ற கிளைகள்' },
          { en: 'Full Double-entry Accounting', si: 'සම්පූර්ණ ද්විත්ව සටහන් ගිණුම්කරණය', ta: 'முழு இரட்டைப் பதிவு கணக்கியல்' },
          { en: 'Dedicated Cloud Database Server', si: 'කැපවූ වලාකුළු දත්ත සේවාදායකය', ta: 'பிரத்யேக மேகக்கணி தரவுத்தளம்' },
          { en: '24/7 Phone Support Helpline', si: '24/7 දුරකථන සහය', ta: '24/7 தொலைபேசி ஆதரவு' }
        ]
      }
    ]
  },
  'sws-events': {
    name: { en: 'SWS Events', si: 'SWS ඉසව් කළමනාකරණය', ta: 'SWS நிகழ்வு மேலாண்மை' },
    tagline: { en: 'Choreographing Breath-Taking Celebrations', si: 'සිත් ඇදගන්නාසුළු මංගල සහ ආයතනික ඉසව්', ta: 'மூச்சடைக்கக்கூடிய நிகழ்வுகள் மற்றும் கொண்டாட்டங்கள்' },
    description: {
      en: 'Curating royal backdrops, glasshouse wedding canopies, traditional oil lamps, and floral altar layouts that live in memory forever.',
      si: 'රාජකීය මංගල පසුබිම්, වීදුරු මංගල වියන්, සාම්ප්‍රදායික පොල්තෙල් පහන් සහ මල් අලංකරණයන් අලංකාර ලෙස නිර්මාණය කිරීම.',
      ta: 'சொகுசு திருமண மேடைகள், பாரம்பரிய விளக்குகள் மற்றும் மலர் அலங்காரங்களை வடிவமைத்தல்.'
    },
    gradient: 'from-purple-500/20 to-pink-500/20',
    accentColor: '#c084fc',
    bgImage: '/images/wedding_decoration_1782729925686.jpg',
    services: [
      { title: { en: 'Royal Canopy Builds', si: 'රාජකීය වියන් ඉදිකිරීම්', ta: 'ராஜகோபுர பந்தல் அமைப்புகள்' }, description: { en: 'Imported glasshouse layouts & heavy trusses.', si: 'ආනයනික වීදුරු වියන් සහ ශක්තිමත් ව්‍යුහයන්.', ta: 'இறக்குமதி செய்யப்பட்ட கண்ணாடி பந்தல் அமைப்புகள்.' }, iconName: 'Church' },
      { title: { en: 'Floral Altar Artistry', si: 'මල් සැරසිලි කලාත්මකභාවය', ta: 'மலர் பலிபீட கலைத்திறன்' }, description: { en: 'Fresh South Asian roses, lilies, and custom arches.', si: 'නැවුම් මල් වර්ග සහ විශේෂිත මල් ආරුක්කු.', ta: 'புதிய ரோஜாக்கள், அல்லிகள் மற்றும் மலர் வளைவுகள்.' }, iconName: 'Flower' },
      { title: { en: 'Theme Lighting Designs', si: 'තේමා ආලෝකකරණ සැලසුම්', ta: 'வண்ணமயமான ஒளி அமைப்புகள்' }, description: { en: 'DMX ambient color changes & uplighters.', si: 'පසුබිම් වර්ණ වෙනස් වන විදුලි ආලෝකකරණය.', ta: 'பின்னணி வண்ணங்களை மாற்றும் ஒளி அமைப்புகள்.' }, iconName: 'Sparkles' }
    ],
    packages: [
      {
        title: { en: 'Silver Wedding Decor', si: 'සිල්වර් මංගල සැරසිලි', ta: 'வெள்ளி திருமண அலங்காரம்' },
        price: { en: 'Contact for Quote', si: 'මිල ගණන් සඳහා විමසන්න', ta: 'மதிப்பீட்டிற்கு தொடர்பு கொள்க' },
        features: [
          { en: 'Standard Altar Floral Backdrop', si: 'ප්‍රමිතිගත මල් සැරසිලි පසුබිම', ta: 'தரமான மலர் பின்னணி' },
          { en: 'Traditional Poruwa & Oil Lamp Decor', si: 'සාම්ප්‍රදායික පෝරුව සහ පහන් සැරසිලි', ta: 'பாரம்பரிய போருவா & விளக்கு அலங்காரம்' },
          { en: 'Entrance Archway & Pathway Lighting', si: 'ප්‍රවේශ ද්වාරය සහ මඟ දෙපස ආලෝකකරණය', ta: 'நுழைவு வளைவு & பாதை விளக்குகள்' }
        ]
      },
      {
        title: { en: 'Imperial Glasshouse Package', si: 'රාජකීය වීදුරු වියන් පැකේජය', ta: 'இம்பீரியல் கண்ணாடி பந்தல் தொகுப்பு' },
        price: { en: 'Premium Booking Only', si: 'විශේෂ වෙන්කිරීම් පමණි', ta: 'பிரீமியம் முன்பதிவு மட்டும்' },
        features: [
          { en: 'Full Glasshouse Structure Canopy', si: 'සම්පූර්ණ වීදුරු වියන් ව්‍යුහය', ta: 'முழு கண்ணாடி பந்தல் அமைப்பு' },
          { en: 'Custom Mughal or Parisian Floral Theme', si: 'ප්‍රංශ හෝ මෝගල් මල් තේමාවක්', ta: 'தனிப்பயன் மலர் அலங்கார கருப்பொருள்' },
          { en: 'Interactive DMX Controlled Uplighting', si: 'DMX පරිගණකගත ආලෝක පද්ධතිය', ta: 'கணினிமயமாக்கப்பட்ட ஒளி அமைப்புகள்' }
        ]
      }
    ]
  },
  'u1-studio': {
    name: { en: 'U1 Studio', si: 'U1 ස්ටුඩියෝ', ta: 'U1 ஸ்டுடியோ' },
    tagline: { en: 'Cinematography & Pre-Wedding Portraits', si: 'චිත්‍රපටකරණය සහ පූර්ව මංගල ඡායාරූපකරණය', ta: 'திரைப்படக் கலை & முன் திருமண புகைப்படங்கள்' },
    description: {
      en: 'Capturing pre-wedding couple portraits, high-altitude stabilizing drone flights, and color-graded cinematic video edits that capture raw emotion.',
      si: 'පූර්ව මංගල ජෝඩු ඡායාරූපකරණය, ඉහළ ගුවන් ඩ්‍රෝන දර්ශන සහ උසස් වර්ණ සංකලනය සහිත වීඩියෝ සංස්කරණය.',
      ta: 'முன் திருமண ஜோடி படங்கள், வான்வழி ட்ரோன் காட்சிகள் மற்றும் உயர்தர வண்ணங்களுடன் கூடிய வீடியோ தொகுப்புகள்.'
    },
    gradient: 'from-cyan-500/20 to-blue-500/20',
    accentColor: '#22d3ee',
    bgImage: '/images/u1_robot_camera_1783346286743.jpg',
    services: [
      { title: { en: 'Stabilized Drone Flys', si: 'නියමුව සහිත ඩ්‍රෝන කැමරා', ta: 'ட்ரோன் வான்வழி காட்சிகள்' }, description: { en: '4K ultra-stabilized overhead reels.', si: '4K අධි-ස්ථාවර ගුවන් වීඩියෝ දර්ශන.', ta: '4K மிகத் தெளிவான வான்வழி காட்சிகள்.' }, iconName: 'Compass' },
      { title: { en: 'Cinematic Film Edits', si: 'සිනමාපට සංස්කරණ', ta: 'திரைப்பட வீடியோ தொகுப்புகள்' }, description: { en: 'Professional color grading & audio synthesis.', si: 'වෘත්තීය මට්ටමේ වර්ණ සහ ශබ්ද සංකලනය.', ta: 'தொழில்முறை வண்ண ஒருங்கிணைப்பு & ஆடியோ.' }, iconName: 'Film' },
      { title: { en: 'Golden Hour Union', si: 'ගෝල්ඩන් අවර් යුනියන්', ta: 'பொன் மாலை பொழுது நிழற்படம்' }, description: { en: 'Outdoor sunrise/sunset portrait layouts.', si: 'එළිමහන් හිරු උදාව/බැසීම තේමා කරගත් ඡායාරූප.', ta: 'வெளிப்புற சூரிய உதயம்/மறைவு பின்னணி படங்கள்.' }, iconName: 'Camera' }
    ]
  },
  'travels': {
    name: { en: 'Mahdev Travels', si: 'මහදේව් ට්‍රැවල්ස් සේවාව', ta: 'மஹ்தேவ் டிராவல்ஸ்' },
    tagline: { en: 'Luxury Fleet & Airport Logistics Convoy', si: 'සුඛෝපභෝගී වාහන සහ ගුවන්තොටුපළ ප්‍රවාහනය', ta: 'சொகுசு வாகனங்கள் & விமான நிலைய போக்குவரத்து' },
    description: {
      en: 'Dispatch luxury wedding Mercedes convoys, corporate KDH tour vans, airport BIA pickups, and customized vacation routes in Sri Lanka.',
      si: 'මංගල උත්සව සඳහා සුඛෝපභෝගී Mercedes රථ, ආයතනික KDH වෑන් රථ, ගුවන්තොටුපළ ප්‍රවාහන සහ සංචාරක සේවාවන්.',
      ta: 'திருமண மெர்சிடிஸ் கார்கள், நிறுவன வேன்கள், விமான நிலைய போக்குவரத்து மற்றும் சுற்றுலா சேவைகள்.'
    },
    gradient: 'from-emerald-500/20 to-green-500/20',
    accentColor: '#34d399',
    bgImage: '/images/travels_robot_car_1783346316762.jpg',
    services: [
      { title: { en: 'Airport BIA Transfers', si: 'ගුවන්තොටුපළ (BIA) ප්‍රවාහනය', ta: 'விமான நிலைய போக்குவரத்து' }, description: { en: '24/7 dispatch tracking to airport terminals.', si: 'පැය 24 පුරා ගුවන්තොටුපළ පර්යන්ත වෙත ප්‍රවාහනය.', ta: 'விமான நிலைய முனையங்களுக்கு 24/7 போக்குவரத்து.' }, iconName: 'Compass' },
      { title: { en: 'Wedding Mercedes Convoy', si: 'මංගල Mercedes රථ පෙළ', ta: 'திருமண மெர்சிடிஸ் வாகன குழு' }, description: { en: 'Chauffeur-driven white luxury Benz cars.', si: 'රියදුරන් සහිත සුදු පැහැති සුඛෝපභෝගී මෝටර් රථ.', ta: 'சிறந்த ஓட்டுநர்களுடன் கூடிய வெள்ளை நிற சொகுசு கார்கள்.' }, iconName: 'Sparkles' },
      { title: { en: 'Tour KDH Vans', si: 'KDH සංචාරක වෑන් රථ', ta: 'சொகுசு கேடிஎச் (KDH) வேன்கள்' }, description: { en: 'Dual AC comfort layouts for Ella & scenic spots.', si: 'ඇල්ල සහ අනෙකුත් සංචාරක ස්ථාන සඳහා වායුසමීකරණය කළ වෑන්.', ta: 'வாசி வசதியுடன் கூடிய சுற்றுலா வேன்கள்.' }, iconName: 'Briefcase' }
    ],
    fleet: [
      {
        name: { en: 'Mercedes Benz E-Class', si: 'මර්සිඩීස් බෙන්ස් E-Class', ta: 'மெர்சிடிஸ் பென்ஸ் இ-கிளாஸ்' },
        type: { en: 'Luxury Sedan', si: 'සුඛෝපභෝගී මෝටර් රථය', ta: 'சொகுசு கார்' },
        capacity: '4 Passengers',
        desc: { en: 'The ultimate white bridal convoy vehicle. Features premium leather seats, climate control, and soft ambient light.', si: 'මනාලියන් සඳහාම වෙන්වූ සුදු පැහැති රථය. සුඛෝපභෝගී අසුන් සහ ආලෝකකරණයෙන් යුක්තයි.', ta: 'திருமணத்திற்கான வெள்ளை நிற சொகுசு கார். சிறந்த இருக்கை வசதிகள் கொண்டது.' },
        price: { en: 'Contact for Quote', si: 'විමසීම් කරන්න', ta: 'தொடர்பு கொள்க' },
        img: '/images/travels_robot_car_1783346316762.jpg'
      },
      {
        name: { en: 'Toyota Hiace KDH Grand Cabin', si: 'ටොයෝටා හයිඒස් KDH ග්‍රෑන්ඩ්', ta: 'டொயோட்டா ஹையேஸ் கேடிஎச்' },
        type: { en: 'VIP Passenger Van', si: 'ප්‍රභූ වෑන් රථය', ta: 'விஐபி வேன்' },
        capacity: '14 Passengers',
        desc: { en: 'Perfect for corporate delegations, family wedding transfers, and scenic round tours in Sri Lanka.', si: 'ආයතනික කණ්ඩායම්, පවුලේ සංචාර සහ මංගල උත්සව ප්‍රවාහන කටයුතු සඳහා කදිම වෑන් රථයකි.', ta: 'நிறுவன குழுக்கள் மற்றும் குடும்ப சுற்றுப்பயணங்களுக்கு ஏற்றது.' },
        price: { en: 'Flexible Daily Rates', si: 'නම්‍යශීලී දෛනික මිල ගණන්', ta: 'நெகிழ்வான தினசரி கட்டணம்' },
        img: '/images/van_tour.jpg'
      }
    ]
  },
  'it-solutions': {
    name: { en: 'IT Solutions', si: 'තොරතුරු තාක්ෂණ විසඳුම්', ta: 'தகவல் தொழில்நுட்ப தீர்வுகள்' },
    tagline: { en: 'Architecting Custom Cloud Infrastructure', si: 'ආයතනික වලාකුළු යටිතල පහසුකම්', ta: 'தனிப்பயன் மேகக்கணி உள்கட்டமைப்பு' },
    description: {
      en: 'Deploying robust cloud-native systems, API portals, enterprise security encryptions, and custom booking schedules to scale business efficiency.',
      si: 'ව්‍යාපාරික කාර්යක්ෂමතාව ඉහළ නැංවීමට ශක්තිමත් වලාකුළු පද්ධති, API ද්වාර, දත්ත සංකේතනය සහ ස්වයංක්‍රීය කාලසටහන් ක්‍රියාත්මක කිරීම.',
      ta: 'வணிக செயல்திறனை அதிகரிக்க வலுவான மேகக்கணி அமைப்புகள், ஏபிஐ (API) போர்ட்டல்கள் மற்றும் தரவு குறியாக்கங்களை செயல்படுத்துதல்.'
    },
    gradient: 'from-blue-600/20 to-indigo-600/20',
    accentColor: '#3b82f6',
    bgImage: '/images/it_robot_developer_1783346302442.jpg',
    services: [
      { title: { en: 'Cloud System Architecture', si: 'වලාකුළු පද්ධති සැකසුම්', ta: 'மேகக்கணி உள்கட்டமைப்பு வடிவமைப்பு' }, description: { en: 'Highly scalable servers on Google Cloud & AWS.', si: 'ගූගල් ක්ලවුඩ් සහ AWS මත ක්‍රියාත්මක වන සේවාදායක.', ta: 'கூகுள் கிளவுட் மற்றும் ஏடபிள்யூஎஸ் (AWS) சேவையகங்கள்.' }, iconName: 'Globe' },
      { title: { en: 'API Integrations', si: 'ඒපීඅයි (API) ඒකාබද්ධතාව', ta: 'ஏபிஐ (API) ஒருங்கிணைப்பு' }, description: { en: 'Connecting POS logs and clinic databases securely.', si: 'POS සහ වෛද්‍ය දත්ත පද්ධති ආරක්ෂිතව සම්බන්ධ කිරීම.', ta: 'பில்லிங் மற்றும் மருத்துவ தரவுத்தளங்களை இணைத்தல்.' }, iconName: 'Terminal' },
      { title: { en: 'Network Security Audit', si: 'ජාල ආරක්ෂණ විගණනය', ta: 'பிணைய பாதுகாப்பு தணிக்கை' }, description: { en: 'Restricting client profiles and auditing vulnerabilities.', si: 'පද්ධති ආරක්ෂාව පරීක්ෂා කිරීම සහ දත්ත ආරක්ෂා කිරීම.', ta: 'பாதுகாப்பு துளைகளை கண்டறிந்து தரவை பாதுகாத்தல்.' }, iconName: 'Shield' }
    ]
  }
};

export default function DynamicDivision() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [division, setDivision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchDivision = async () => {
      try {
        const q = query(collection(db, 'divisions'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setDivision(snap.docs[0].data());
        } else {
          // Fallback static check for testing / local development
          if (fallbackDivisions[slug]) {
            setDivision(fallbackDivisions[slug]);
          }
        }
      } catch (err) {
        console.error("Failed to query dynamic division", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivision();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Querying division architecture...</span>
      </div>
    );
  }

  if (!division) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-6 text-white px-6">
        <h3 className="font-display font-black text-2xl text-red-500 uppercase tracking-wider">Division Not Found</h3>
        <p className="text-xs text-gray-400 font-sans max-w-sm text-center">The business division `{slug}` is not registered in our cloud registry or configuration files.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-sans font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO HOMEPAGE
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        
        {/* Banner with custom themed glows */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={division.bgImage || '/images/sws_robot_decor_1783346269673.jpg'} 
            alt={t(division.name)} 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass text-xs font-bold uppercase tracking-wider" style={{ color: division.accentColor || '#c5a880', borderColor: `${division.accentColor || '#c5a880'}40` }}>
              {t(division.name).toUpperCase()}
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              {t(division.tagline)}
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              {t(division.description)}
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-2 px-8 py-4 rounded-full font-sans text-xs font-bold tracking-widest text-navy-dark shadow-lg cursor-pointer"
              style={{ backgroundColor: division.accentColor || '#c5a880' }}
            >
              {t('book_consultation')}
            </button>
          </div>
        </section>

        {/* Dynamic Services List */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: division.accentColor || '#c5a880' }}>
              {t('operational_suite')}
            </span>
            <h2 className="font-display font-black text-3xl text-white">
              {t('dynamic_services')}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto font-sans">{t('Learn about the capabilities configured for this division sector.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {division.services?.map((serv: any, idx: number) => {
              const Icon = iconMap[serv.iconName] || Sparkles;
              return (
                <div 
                  key={idx}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0" style={{ color: division.accentColor || '#c5a880' }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{t(serv.title)}</h3>
                    <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{t(serv.description)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dynamic Packages Pricing Section (If configured) */}
        {division.packages && division.packages.length > 0 && (
          <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: division.accentColor || '#c5a880' }}>
                {t('pricing_plans')}
              </span>
              <h2 className="font-display font-black text-3xl text-white">
                {t('packages_pricing')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {division.packages.map((pkg: any, idx: number) => (
                <div key={idx} className="glass-premium p-8 rounded-3xl border border-white/8 hover:border-gold-accent/25 flex flex-col justify-between gap-6 shadow-xl relative group">
                  <div className="flex flex-col gap-4">
                    <h3 className="font-display font-bold text-xl text-white">{t(pkg.title)}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-numbers" style={{ color: division.accentColor || '#c5a880' }}>
                        {t(pkg.price)}
                      </span>
                      {pkg.duration && <span className="text-xs text-gray-400">/ {t(pkg.duration)}</span>}
                    </div>
                    <ul className="flex flex-col gap-3 font-sans text-xs sm:text-sm text-[#BFC8E6]/85 border-t border-white/5 pt-4 mt-2">
                      {pkg.features?.map((feat: any, fIdx: number) => (
                        <li key={fIdx} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{t(feat)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowBooking(true)}
                    className="w-full py-3 rounded-xl border border-white/8 text-white font-sans text-xs font-bold tracking-wider hover:bg-white/5 uppercase transition-all cursor-pointer"
                  >
                    {t('Select Package')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Travels Fleet Section (If configured) */}
        {division.fleet && division.fleet.length > 0 && (
          <section className="py-24 max-w-7xl mx-auto px-6 border-b border-white/5">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: division.accentColor || '#c5a880' }}>
                {t('VIP FLEET')}
              </span>
              <h2 className="font-display font-black text-3xl text-white">
                {t('our_fleet')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {division.fleet.map((flt: any, idx: number) => (
                <div key={idx} className="glass-premium rounded-3xl border border-white/8 overflow-hidden shadow-xl flex flex-col">
                  <div className="relative h-60 w-full">
                    <img 
                      src={flt.img || '/images/travels_robot_car_1783346316762.jpg'} 
                      alt={t(flt.name)} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gold-accent font-bold">
                          {t(flt.type)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>{flt.capacity}</span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-xl text-white">{t(flt.name)}</h3>
                      <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">{t(flt.desc)}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold">{t('Estimated Rate')}</span>
                        <span className="text-white font-bold text-sm" style={{ color: division.accentColor || '#c5a880' }}>{t(flt.price)}</span>
                      </div>
                      <button
                        onClick={() => setShowBooking(true)}
                        className="px-5 py-2.5 rounded-xl text-navy-dark text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                        style={{ backgroundColor: division.accentColor || '#c5a880' }}
                      >
                        <Car className="w-4 h-4" />
                        {t('Book Vehicle')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Global Booking System Modal Overlay */}
        <AnimatePresence>
          {showBooking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(false)}
              className="fixed inset-0 bg-black/80 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-3xl relative mobile-bottom-sheet"
              >
                <button
                  onClick={() => setShowBooking(false)}
                  className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-gray-400 hover:text-white z-50 animate-pulse"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision={slug} onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
