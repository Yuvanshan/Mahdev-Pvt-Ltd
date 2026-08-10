'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Sparkles, Eye, Target, Cpu, 
  Camera, Globe, ChevronRight, MessageSquare, Mail, Phone, Send, 
  CheckCircle, Play, User, Award, 
  ChevronDown, ArrowUp, Laptop, Compass, X
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';
import { getMediaType, getYouTubeId } from '@/lib/media';
import { useLanguage } from '@/context/LanguageContext';

// Core Custom Components (Statically loaded)
import Navbar from '@/components/Navbar';
import InteractiveHero from '@/components/InteractiveHero';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

// Dynamic / Lazy Loaded Components
const TechCloud = dynamic(() => import('@/components/TechCloud'), { ssr: false });
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), { ssr: false });
const GlobalSearch = dynamic(() => import('@/components/GlobalSearch'), { ssr: false });
const BookingSystem = dynamic(() => import('@/components/BookingSystem'), { ssr: false });

// Premium Features (Lazy loaded)
const BeforeAfterSlider = dynamic(() => import('@/components/PremiumFeatures').then(m => m.BeforeAfterSlider), { ssr: false });
const Venue360Viewer = dynamic(() => import('@/components/PremiumFeatures').then(m => m.Venue360Viewer), { ssr: false });
const InteractiveTimeline = dynamic(() => import('@/components/PremiumFeatures').then(m => m.InteractiveTimeline), { ssr: false });
const ClientLoginPortal = dynamic(() => import('@/components/PremiumFeatures').then(m => m.ClientLoginPortal), { ssr: false });
const ProjectInquiryWizard = dynamic(() => import('@/components/PremiumFeatures').then(m => m.ProjectInquiryWizard), { ssr: false });

// Number counter animation component
function CounterNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <span ref={ref} className="font-numbers font-black text-white">{count}{suffix}</span>;
}

// Fade-up section animation wrapper
function FadeUpSection({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      id={id}
      style={{
        transform: isInView ? "none" : "translateY(35px)",
        opacity: isInView ? 1 : 0,
        filter: isInView ? "blur(0px)" : "blur(2px)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  
  // Real-time states
  const [stats, setStats] = useState({ happyClients: 1500, projects: 1200, software: 120, vehicles: 18, experience: 10 });
  const [widgetsEnabled, setWidgetsEnabled] = useState({
    hero: true,
    divisions: true,
    brands: true,
    featured: true,
    portfolio: true,
    stats: true,
    instagram: true,
    facebook: true,
    aiConcierge: true
  });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  
  // Contact section form data
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Gallery categorization states
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const [posters, setPosters] = useState({ 
    sws: '/images/wedding_decoration_1782729925686.jpg', 
    u1: '/images/u1_robot_camera_1783346286743.jpg', 
    travels: '/images/travels_robot_car_1783346316762.jpg', 
    it: '/images/saas_dashboard.jpg' 
  });

  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [faqList, setFaqList] = useState<any[]>([]);
  const [divisionsList, setDivisionsList] = useState<any[]>([]);

  // Dynamic homepage panel texts
  const [homepageContent, setHomepageContent] = useState<any>({
    introHeading: { en: 'Premium Services', si: 'ප්‍රමුඛතම සේවාවන්', ta: 'பிரீமியம் சேவைகள்' },
    introDesc: { en: 'We bridge physical luxury experience designs and digital system architectures to deliver uncompromised quality.', si: 'අපි භෞතික සුඛෝපභෝගී අත්දැකීම් සහ ඩිජිටල් පද්ධති ඒකාබද්ධ කරමින් ඉහළම ගුණාත්මක සේවාවන් සපයන්නෙමු.', ta: 'உயர்தர டிஜிட்டல் கட்டமைப்புகள் மற்றும் வடிவமைப்புடன் தயாரிப்புகளை வழங்குகிறோம்.' },
    introTag: { en: 'OUR CONGLOMERATE STRUCTURE', si: 'අපගේ සමූහ ව්‍යාපාර ව්‍යුහය', ta: 'எங்கள் கூட்டு நிறுவன அமைப்பு' },
    softwareTag: { en: 'ENTERPRISE SYSTEM INFRASTRUCTURE', si: 'ව්‍යවසාය පද්ධති යටිතල පහසුකම්', ta: 'நிறுவன கணினி உள்கட்டமைப்பு' },
    softwareTitle: { en: 'Dual-Entry ERP Softwares', si: 'ද්විත්ව සටහන් ඊආර්පී (ERP) මෘදුකාංග', ta: 'இரட்டைப் பதிவு ஈஆர்பி (ERP) மென்பொருள்' },
    softwareDesc: { en: 'Deploy omnichannel POS terminals, ledger accounts integration, checkouts receipts printing, and cloud inventory audits from a single administrative console dashboard.', si: 'එක් පරිපාලන කොන්සෝලයකින් POS පර්යන්ත, ගිණුම්කරණය, රිසිට්පත් මුද්‍රණය සහ ගබඩා විගණන සිදු කරන්න.', ta: 'ஒருங்கிணைந்த கணக்குகள், ரசீது அச்சிடுதல் மற்றும் களஞ்சிய கணக்கெடுப்புகளை ஒரே கட்டுப்பாட்டுப் பலகத்தில் நிர்வகிக்கவும்.' },
    travelsTag: { en: 'VIP TRANSIT FLEETS', si: 'ප්‍රභූ ප්‍රවාහන සේවා', ta: 'விஐபி போக்குவரத்து பிரிவுகள்' },
    travelsTitle: { en: 'Mahdev travels & tours', si: 'මහදේව් ට්‍රැවල්ස් ඇන්ඩ් ටුවර්ස්', ta: 'மஹ்தேவ் டிராவல்ஸ் அண்ட் டூர்ஸ்' },
    travelsDesc: { en: 'Dispatch luxury wedding Mercedes hires, comfortable VIP vans, airport BIA pickups, and customized vacation travel routes across scenic tourist sites in Sri Lanka.', si: 'මනාලියන් සඳහා සුඛෝපභෝගී මෝටර් රථ, සුවපහසු වෑන් රථ, ගුවන්තොටුපළ ප්‍රවාහන සහ සංචාරක සේවාවන් සපයන්නෙමු.', ta: 'திருமணம் சொகுசு கார் வாடகை, விமான நிலைய போக்குவரத்து மற்றும் சுற்றுலா பயணங்களை வழங்குகிறோம்.' }
  });

  // Dynamic Case Studies list
  const [caseStudiesList, setCaseStudiesList] = useState<any[]>([
    {
      client: { en: 'Hilton Ballroom Setup', si: 'හිල්ටන් උත්සව ශාලාව', ta: 'ஹில்டன் மாநாட்டு அரங்கம்' },
      metric: { en: '60ft Stage Construct', si: 'අඩි 60 වේදිකා ඉදිකිරීම්', ta: '60 அடி மேடை அமைப்பு' },
      desc: { en: 'Designed custom metal backdrops, importing pastel silk lilies and installing 120 uplighters in 14 hours.', si: 'පැය 14 ක් ඇතුළත අඩි 60ක සුවිශේෂී පසුබිම් නිර්මාණ සහ ආලෝකකරණ කටයුතු අවසන් කරන ලදී.', ta: '14 மணி நேரத்தில் 120 விளக்குகளை நிறுவி பிரத்யேக பின்னணியை அமைத்தல்.' }
    },
    {
      client: { en: 'Singhania Ledger System', si: 'සිංහානියා ලෙජර් පද්ධතිය', ta: 'சிங்கானியா கணக்கு முறை' },
      metric: { en: '100% Audit Integrity', si: '100% විගණන අඛණ්ඩතාව', ta: '100% தணிக்கை நேர்மை' },
      desc: { en: 'Integrated custom dual-entry ERP accounts, sync POS checkout receipt logs with Firebase backends.', si: 'ද්විත්ව සටහන් ඊආර්පී ගිණුම් ඒකාබද්ධ කර POS ගෙවීම් වාර්තා Firebase හරහා ස්වයංක්‍රීයව සමමුහුර්ත කරන ලදී.', ta: 'ஈஆர்பி கணக்குகள் மற்றும் விற்பனை முனைய தரவுகளை ஃபயர்பேஸ் தரவுத்தளத்தில் இணைத்தல்.' }
    },
    {
      client: { en: 'Ceylon Travels Dispatch', si: 'සෙලෝන් ට්‍රැවල්ස් සේවාව', ta: 'சிலோன் டிராவல்ஸ் போக்குவரத்து' },
      metric: { en: 'BIA Transit Logistics', si: 'ගුවන්තොටුපළ ප්‍රවාහන සේවා', ta: 'விமான நிலைய தளவாடங்கள்' },
      desc: { en: 'Managed wedding transfers using a convoy of 4 Mercedes cars and luxury KDH tour vans.', si: 'සුඛෝපභෝගී මෝටර් රථ සහ වෑන් රථ 4ක කණ්ඩායමක් යොදා ගනිමින් විවාහ මංගල ප්‍රවාහන කටයුතු මෙහෙයවීම.', ta: '4 மெர்சிடிஸ் கார்கள் மற்றும் சொகுசு வேன்களைப் பயன்படுத்தி திருமண போக்குவரத்து மேலாண்மை.' }
    }
  ]);

  // Dynamic Awards list
  const [awardsList, setAwardsList] = useState<any[]>([
    { title: { en: 'Best Decor Syndicate', si: 'හොඳම මෝස්තර කණ්ඩායම', ta: 'சிறந்த அலங்கார குழு' }, year: '2024', body: { en: 'South Asia Bridal Awards', si: 'දකුණු ආසියානු මංගල සම්මාන', ta: 'தெற்காசிய திருமண விருதுகள்' } },
    { title: { en: 'ERP Software Laurels', si: 'ඊආර්පී මෘදුකාංග සම්මානය', ta: 'சிறந்த ஈஆர்பி மென்பொருள்' }, year: '2025', body: { en: 'Ceylon Cloud Congress', si: 'ලංකා ක්ලවුඩ් සම්මේලනය', ta: 'இலங்கை மேகக்கணி மாநாடு' } },
    { title: { en: '5-Star Travels Fleet', si: 'තරු 5 සංචාරක සේවාව', ta: '5 நட்சத்திர வாகன குழு' }, year: '2023', body: { en: 'Tourism Association LK', si: 'ශ්‍රී ලංකා සංචාරක සංගමය', ta: 'இலங்கை சுற்றுலா சங்கம்' } },
    { title: { en: 'Elite IT Integrators', si: 'ප්‍රමුඛ තොරතුරු තාක්ෂණ සේවාව', ta: 'சிறந்த தகவல் தொழில்நுட்ப சேவை' }, year: '2026', body: { en: 'conglomerate systems audit', si: 'සමූහ පද්ධති විගණනය', ta: 'கூட்டு கணினி தணிக்கை' } }
  ]);

  // Dynamic hardcoded section states
  const [featuredData, setFeaturedData] = useState<any>({
    bannerImg: '/images/wedding_decoration_1782729925686.jpg',
    title: 'Featured Event Showcase',
    bannerCategory: 'ROYAL WEDDING CATEGORY',
    bannerTitle: 'The Mughal Imperial Stage Setup',
    bannerDesc: 'Custom 60-foot luxury wedding backdrop featuring real gold drapes, cascading hand-picked wisterias, stabilizer drone cinematography, and BIA transport coordinates.',
    bannerVideo: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4',
    samples: [
      { title: 'Hilton Keynotes Convoy', desc: 'Corporate Stage Decor', img: '/images/sws_robot_decor_1783346269673.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
      { title: 'Pre-Wedding Candle Path', desc: 'Candlelight Canopies', img: '/images/wedding_decoration_1782729925686.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' },
      { title: 'Church Floral Altar', desc: 'Cathedral Arch Decor', img: '/images/church_decor.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
      { title: 'Ella Greenery Tour conv', desc: 'Mercedes Travels fleet', img: '/images/van_tour.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' }
    ]
  });

  const [instagramFeed, setInstagramFeed] = useState([
    '/images/wedding_decoration_1782729925686.jpg',
    '/images/sws_robot_decor_1783346269673.jpg',
    '/images/birthday_decor.jpg',
    '/images/church_decor.jpg',
    '/images/drone_photography.jpg',
    '/images/portrait_shoot.jpg'
  ]);

  const [portfolioTab, setPortfolioTab] = useState<'gallery' | 'facebook'>('gallery');
  const [brands, setBrands] = useState<string[]>(['Royal Palms Resort', 'Hilton Colombo', 'BIA Air Transports', 'Vastra Silks', 'Ceylon Cloud Engine']);
  const [facebookFeed, setFacebookFeed] = useState<any[]>([]);

  // Fetch stats and posters from Firestore in real-time
  useEffect(() => {
    const unsubStats = onSnapshot(collection(db, 'stats'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setStats({
          happyClients: data.happyClients || 1500,
          projects: data.eventsCompleted || 1200,
          software: data.softwareProjects || 120,
          vehicles: data.vehiclesInFleet || 18,
          experience: data.yearsExperience || 10
        });
      }
    });

    const unsubPosters = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPosters({
          sws: d.sws || '/images/wedding_decoration_1782729925686.jpg',
          u1: d.u1 || '/images/u1_robot_camera_1783346286743.jpg',
          travels: d.travels || '/images/travels_robot_car_1783346316762.jpg',
          it: d.it || '/images/saas_dashboard.jpg'
        });
      }
    });

    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
        setGalleryList(list);
      } else {
        setGalleryList([]);
      }
    });

    const unsubFaq = onSnapshot(doc(db, 'settings', 'faqs'), (snap) => {
      if (snap.exists()) {
        setFaqList(snap.data().items || []);
      } else {
        setFaqList([]);
      }
    });

    const unsubDivs = onSnapshot(collection(db, 'divisions'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
        setDivisionsList(list);
      }
    });

    const unsubHomepageSections = onSnapshot(doc(db, 'settings', 'homepage_sections'), (snap) => {
      if (snap.exists()) {
        setHomepageContent(snap.data());
      }
    });

    const unsubCaseStudies = onSnapshot(doc(db, 'settings', 'case_studies'), (snap) => {
      if (snap.exists()) {
        setCaseStudiesList(snap.data().items || []);
      }
    });

    const unsubAwards = onSnapshot(doc(db, 'settings', 'awards'), (snap) => {
      if (snap.exists()) {
        setAwardsList(snap.data().items || []);
      }
    });

    const unsubFeatured = onSnapshot(doc(db, 'settings', 'featured'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setFeaturedData({
          bannerImg: d.bannerImg || '/images/wedding_decoration_1782729925686.jpg',
          title: d.title || 'Featured Event Showcase',
          bannerCategory: d.bannerCategory || 'ROYAL WEDDING CATEGORY',
          bannerTitle: d.bannerTitle || 'The Mughal Imperial Stage Setup',
          bannerDesc: d.bannerDesc || 'Custom 60-foot luxury wedding backdrop featuring real gold drapes, cascading hand-picked wisterias, stabilizer drone cinematography, and BIA transport coordinates.',
          bannerVideo: d.bannerVideo || 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4',
          samples: d.samples || [
            { title: 'Hilton Keynotes Convoy', desc: 'Corporate Stage Decor', img: '/images/sws_robot_decor_1783346269673.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
            { title: 'Pre-Wedding Candle Path', desc: 'Candlelight Canopies', img: '/images/wedding_decoration_1782729925686.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' },
            { title: 'Church Floral Altar', desc: 'Cathedral Arch Decor', img: '/images/church_decor.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
            { title: 'Ella Greenery Tour conv', desc: 'Mercedes Travels fleet', img: '/images/van_tour.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' }
          ]
        });
      }
    });

    const unsubInstagram = onSnapshot(doc(db, 'settings', 'instagram'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.items && d.items.length === 6) {
          setInstagramFeed(d.items);
        }
      }
    });

    const unsubBrands = onSnapshot(doc(db, 'settings', 'brands'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.items && Array.isArray(d.items)) {
          setBrands(d.items);
        }
      }
    });

    const unsubFacebook = onSnapshot(doc(db, 'settings', 'facebook'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.items && Array.isArray(d.items)) {
          setFacebookFeed(d.items);
        }
      }
    });

    const unsubWidgets = onSnapshot(doc(db, 'settings', 'widgets'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setWidgetsEnabled({
          hero: d.hero !== false,
          divisions: d.divisions !== false,
          brands: d.brands !== false,
          featured: d.featured !== false,
          portfolio: d.portfolio !== false,
          stats: d.stats !== false,
          instagram: d.instagram !== false,
          facebook: d.facebook !== false,
          aiConcierge: d.aiConcierge !== false
        });
      }
    });

    return () => {
      unsubStats();
      unsubPosters();
      unsubGallery();
      unsubFaq();
      unsubDivs();
      unsubHomepageSections();
      unsubCaseStudies();
      unsubAwards();
      unsubFeatured();
      unsubInstagram();
      unsubBrands();
      unsubFacebook();
      unsubWidgets();
    };
  }, []);

  // Dynamic portfolio section tab selector behavior based on switchboard
  useEffect(() => {
    if (!widgetsEnabled.portfolio && widgetsEnabled.facebook) {
      setPortfolioTab('facebook');
    } else if (widgetsEnabled.portfolio && !widgetsEnabled.facebook) {
      setPortfolioTab('gallery');
    }
  }, [widgetsEnabled.portfolio, widgetsEnabled.facebook]);

  // Back to Top scroll listener
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Try to log to Firestore database, handle permission blocks gracefully
      try {
        await addDoc(collection(db, 'contact'), {
          ...formData,
          timestamp: serverTimestamp()
        });
      } catch (dbErr) {
        console.warn("Firestore contact write blocked by Security Rules:", dbErr);
      }

      // 2. Dispatch the real email using the Next.js API route handler
      const mailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          division: formData.division,
          message: formData.message
        })
      });
      
      if (!mailRes.ok) {
        const errData = await mailRes.json();
        throw new Error(errData.error || 'Failed to dispatch email');
      }
      
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#FFD978', '#A5B4FC']
      });
      
      setFormData({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert("Failed to send message: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Gallery Masonry dataset
  const activeGalleryItems = galleryList;

  const filteredGallery = activeFilter === 'All' 
    ? activeGalleryItems 
    : activeGalleryItems.filter(item => item.category === activeFilter);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const fallbackFaqs = [
    { q: 'What services are included in SWS Event backdrops?', a: 'SWS Event Planning specializes in custom structural builds including grand glasshouse canopies, traditional oil lamps (mandaps), imported pastel balloon arches, and ambient church floral setups.' },
    { q: 'Can I request a custom API checkout inventory module for the POS system?', a: 'Yes. Our IT & Cloud Solutions division customizes POS cash registers, double-entry ERP software layers, stock count logs, and custom payment terminals for hotels and restaurants.' },
    { q: 'How early should I book the Travels VIP luxury Mercedes convoys?', a: 'For wedding Mercedes hires, VIP Colombo transfers, or customized Ella greenery escape runs, we suggest placing bookings at least 3 weeks in advance to lock the fleet allocation.' },
    { q: 'Is there direct database integration for checking event progress?', a: 'Yes. Authorized clients receive credentials to access the secure Client Portal to review real-time blueprints, invoice payouts, and design drafts.' }
  ];

  const activeFaqs = faqList.length > 0 ? faqList : fallbackFaqs;

  return (
    <>
      <div className="relative min-h-screen bg-navy-dark text-[#BFC8E6] font-sans overflow-x-hidden text-left pb-10">
        
        {/* Navigation bar */}
        <Navbar />

        <main className="flex-1 w-full relative z-10">
          
          {/* 1. Hero Section */}
          {widgetsEnabled.hero && <InteractiveHero />}

          {/* 2. Trusted Companies Marquee */}
          {widgetsEnabled.brands && (
            <FadeUpSection>
              <section className="py-12 bg-navy-dark border-b border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-500 block mb-8">
                    {t('ENDORSED BY SOUTH ASIA\'S ELITE BRANDS')}
                  </span>
                  <div className="marquee-container">
                    <div className="marquee-content flex gap-12 sm:gap-20 items-center">
                      {brands.map((partner, idx) => (
                        <span 
                          key={idx} 
                          className="font-display font-black text-base sm:text-xl text-white tracking-widest cursor-pointer grayscale-hover"
                        >
                          {partner.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {/* Duplicate content for seamless loop */}
                    <div className="marquee-content flex gap-12 sm:gap-20 items-center" aria-hidden="true">
                      {brands.map((partner, idx) => (
                        <span 
                          key={idx} 
                          className="font-display font-black text-base sm:text-xl text-white tracking-widest cursor-pointer grayscale-hover"
                        >
                          {partner.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </FadeUpSection>
          )}

          {/* 3. Featured Services (Dynamic conglomerate structure from Firestore) */}
          {widgetsEnabled.divisions && (
            <FadeUpSection id="divisions">
              <section className="section-premium-padding bg-navy-dark relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                  
                  <div className="flex flex-col gap-2.5 mb-10 text-center max-w-xl mx-auto">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent font-sans">
                      {t(homepageContent.introTag)}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
                      {t(homepageContent.introHeading)}
                    </h2>
                    <p className="text-xs text-[#BFC8E6]/80 leading-relaxed font-sans">
                      {t(homepageContent.introDesc)}
                    </p>
                  </div>

                  {/* Dynamic Service Cards Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {divisionsList.map((div) => {
                      // Dynamically choose icons & coloring
                      const Icon = div.type === 'events' ? Sparkles : div.type === 'photography' ? Camera : div.type === 'it' ? Cpu : Compass;
                      const color = div.type === 'events' ? 'text-purple-400' : div.type === 'photography' ? 'text-cyan-400' : div.type === 'it' ? 'text-blue-400' : 'text-green-400';
                      const border = div.type === 'events' ? 'hover:border-purple-500/30' : div.type === 'photography' ? 'hover:border-cyan-500/30' : div.type === 'it' ? 'hover:border-blue-500/30' : 'hover:border-green-500/30';
                      const href = div.slug === 'erp' ? '/divisions/erp' : `/divisions/${div.slug}`;
                      
                      return (
                        <Link
                          key={div.id}
                          href={href}
                          className={`glass p-6 sm:p-7 rounded-xl border border-white/5 hover:border-gold-accent/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between group shadow-lg ${border}`}
                        >
                          <div className="flex flex-col gap-4 text-left">
                            <div className="w-11 h-11 rounded-xl bg-white/3 flex items-center justify-center border border-white/5 group-hover:border-gold-accent/20 group-hover:bg-white/5 transition-all duration-300 shrink-0">
                              <Icon className={`w-5.5 h-5.5 ${color} group-hover:rotate-12 transition-transform duration-500`} />
                            </div>
                            <div className="flex flex-col gap-2">
                              <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors duration-300">
                                {t(div.name)}
                              </h3>
                              <p className="text-xs text-[#BFC8E6]/80 leading-relaxed font-sans line-clamp-3">
                                {t(div.description)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gold-soft uppercase tracking-wider mt-5 group-hover:text-white transition-colors duration-300">
                            {t('Learn More')} 
                            <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                </div>
              </section>
            </FadeUpSection>
          )}

          {/* 4. Why Choose Mahdev */}
          <FadeUpSection>
            <WhyChooseUs />
          </FadeUpSection>

          {/* 5. Featured Projects & Video Showcase (Dynamic from settings/featured) */}
          {widgetsEnabled.featured && (
            <FadeUpSection id="featured-projects">
              <section className="section-premium-padding bg-navy-medium relative overflow-hidden border-t border-b border-white/5">
                <div className="glow-ball glow-ball-gold w-96 h-96 top-20 -left-10 opacity-10" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  
                  <div className="flex flex-col gap-3.5 mb-14 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-soft flex items-center gap-1.5 font-sans">
                      <Award className="w-4 h-4 text-gold-accent" /> {t('CINEMATIC ARCHIVES')}
                    </span>
                    <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
                      {t(featuredData.title)}
                    </h2>
                  </div>

                  {/* Large Netflix Style Featured Backdrop Banner */}
                  <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border border-white/8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] group mb-12">
                    <Image 
                      src={featuredData.bannerImg} 
                      alt="Featured Showcase Backdrop" 
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-1000 brightness-75"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/30 to-transparent" />

                    {/* Banner details */}
                    <div className="absolute bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-left">
                      <div className="flex flex-col gap-3">
                        <span className="px-3.5 py-1 rounded-full bg-gold-accent/25 border border-gold-accent/35 text-[9px] text-gold-soft font-bold uppercase tracking-widest max-w-fit">
                          {t(featuredData.bannerCategory)}
                        </span>
                        <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
                          {t(featuredData.bannerTitle)}
                        </h3>
                        <p className="text-xs text-[#BFC8E6]/85 max-w-lg font-sans leading-relaxed">
                          {t(featuredData.bannerDesc)}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-4 shrink-0 select-none">
                        <button
                          onClick={() => setActiveVideo(featuredData.bannerVideo)}
                          className="px-6.5 py-4 rounded-2xl bg-white text-navy-dark text-xs font-black tracking-wider uppercase flex items-center gap-2 hover:bg-gold-soft transition-colors duration-300 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          {t('Play Video')}
                        </button>
                        <button 
                          onClick={() => setBookingOpen(true)}
                          className="px-6.5 py-4 rounded-2xl glass border border-white/10 hover:border-gold-accent text-white hover:text-gold-soft text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          {t('View Gallery')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Gallery */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 text-left font-sans">
                      {t('MORE CINEMATIC WORK SAMPLES')}
                    </span>
                    
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x select-none">
                      {featuredData.samples.map((proj: any, pIdx: number) => (
                        <div 
                          key={pIdx}
                          onClick={() => setActiveVideo(proj.video)}
                          className="w-[260px] sm:w-[320px] h-48 rounded-2xl overflow-hidden relative shrink-0 border border-white/5 cursor-pointer group snap-start shadow-md"
                        >
                          <Image 
                            src={proj.img} 
                            alt={t(proj.title)} 
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/30 to-transparent" />
                          
                          {/* Play indicator */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-3 rounded-full bg-gold-accent/90 text-navy-dark shadow-lg">
                              <Play className="w-4 h-4 fill-current translate-x-0.5" />
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-4 text-left">
                            <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold">{t(proj.desc)}</span>
                            <h4 className="font-display font-bold text-sm text-white">{t(proj.title)}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            </FadeUpSection>
          )}

          {/* 6. Premium Event Gallery (Dynamic from Firestore) */}
          {(widgetsEnabled.portfolio || widgetsEnabled.facebook) && (
            <FadeUpSection>
              <section className="section-premium-padding bg-navy-dark relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex flex-col gap-3.5 text-left">
                      {widgetsEnabled.portfolio && widgetsEnabled.facebook && (
                        <div className="flex gap-4 mb-4 select-none">
                          <button
                            onClick={() => setPortfolioTab('gallery')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                              portfolioTab === 'gallery'
                                ? 'bg-gold-accent text-navy-dark shadow-md'
                                : 'glass text-[#BFC8E6]/60 hover:text-white'
                            }`}
                          >
                            {t('Event Portfolio')}
                          </button>
                          <button
                            onClick={() => setPortfolioTab('facebook')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer ${
                              portfolioTab === 'facebook'
                                ? 'bg-[#1877F2] text-white shadow-md'
                                : 'glass text-[#BFC8E6]/60 hover:text-white'
                            }`}
                          >
                            <FaFacebook className="w-4 h-4" /> {t('Facebook Feed')}
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">{t('PREMIUM EVENT PORTFOLIO')}</span>
                      <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                        {portfolioTab === 'gallery' ? t('Event Gallery') : t('Facebook Page Stream')}
                      </h2>
                    </div>
     
                    {/* Filters */}
                    {portfolioTab === 'gallery' && widgetsEnabled.portfolio && (
                      <div className="flex flex-wrap gap-2 select-none">
                        {['All', 'Wedding', 'Corporate', 'Cinema', 'Travel', 'Lighting'].map((filt) => (
                          <button
                            key={filt}
                            onClick={() => setActiveFilter(filt)}
                            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                              activeFilter === filt
                                ? 'bg-gold-accent/15 border-gold-accent text-gold-soft'
                                : 'bg-white/2 border-white/5 text-white/60 hover:text-white'
                            }`}
                          >
                            {t(filt)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
     
                  {portfolioTab === 'gallery' && widgetsEnabled.portfolio ? (
                    /* Pinterest Masonry layout */
                    <div className="pinterest-masonry">
                      {filteredGallery.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-gray-500 text-xs font-sans uppercase font-bold tracking-widest">
                          {t('No works uploaded in the portfolio database.')}
                        </div>
                      ) : (
                        filteredGallery.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedGalleryImage(item.img)}
                            className="pinterest-item relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-lg"
                          >
                            <img 
                              src={item.img} 
                              alt={t(item.title)} 
                              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-left">
                              <span className="text-[8px] uppercase tracking-wider text-gold-soft font-bold mb-1 font-sans">{t(item.category)}</span>
                              <h4 className="font-display font-bold text-base text-white">{t(item.title)}</h4>
                              <span className="text-[10px] text-gray-400 mt-2 mt-2 font-sans flex items-center gap-1 hover:underline">
                                {t('View Image')} &rarr;
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : portfolioTab === 'facebook' && widgetsEnabled.facebook ? (
                    /* Facebook Stream layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      {facebookFeed.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-gray-500 text-xs font-sans uppercase font-bold tracking-widest">
                          {t('No Facebook posts synchronized yet. Connect Facebook in Admin Settings to load.')}
                        </div>
                      ) : (
                        facebookFeed.map((post: any, idx: number) => (
                          <div key={idx} className="glass rounded-3xl p-5 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-[#1877F2]/40 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                                <FaFacebook className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="block font-display font-bold text-xs text-white">Mahdev Pvt Ltd</span>
                                <span className="block text-[8px] text-gray-500 font-sans">{post.date || 'Just now'}</span>
                              </div>
                            </div>
                            {post.message && (
                              <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed line-clamp-3">
                                {post.message}
                              </p>
                            )}
                            {post.image && (
                              <div className="relative h-48 rounded-2xl overflow-hidden border border-white/5">
                                <img src={post.image} alt="Facebook Post Media" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-sans text-gray-500 mt-2 border-t border-white/5 pt-3">
                              <span>👍 {post.likes || 0} {t('Likes')}</span>
                              <a 
                                href={post.link || 'https://facebook.com/mahdev'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#1877F2] font-bold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t('View on Facebook')} →
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
     
                </div>
              </section>
            </FadeUpSection>
          )}

          {/* Custom Premium Features: Before/After Slider & 360° Venue Viewer */}
          <FadeUpSection>
            <section className="py-12 bg-navy-medium border-t border-b border-white/5">
              <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16">
                <BeforeAfterSlider />
                <Venue360Viewer />
              </div>
            </section>
          </FadeUpSection>

          {/* 7. Software Solutions & Travel Experiences Section (Dynamic settings/homepage_sections) */}
          <FadeUpSection>
            <section className="section-premium-padding bg-navy-dark relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Left Panel: Cloud Software solutions */}
                  <div className="glass-premium rounded-xl p-8 border border-white/10 text-left flex flex-col gap-6.5 shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 font-sans">{t(homepageContent.softwareTag)}</span>
                      <h3 className="font-display font-black text-2xl text-white">{t(homepageContent.softwareTitle)}</h3>
                      <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed">
                        {t(homepageContent.softwareDesc)}
                      </p>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-white/8 shadow-inner">
                      <Image src={posters.it} alt="ERP Softwares" fill className="object-cover" />
                    </div>
                    <Link 
                      href="/divisions/it-solutions" 
                      className="px-6 py-4 rounded-xl border border-white/8 hover:border-gold-accent hover:text-gold-soft text-white text-xs font-bold tracking-wider uppercase text-center transition-all"
                    >
                      {t('Request Software Audit')}
                    </Link>
                  </div>

                  {/* Right Panel: Travels Fleet */}
                  <div className="glass-premium rounded-xl p-8 border border-white/10 text-left flex flex-col gap-6.5 shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 font-sans">{t(homepageContent.travelsTag)}</span>
                      <h3 className="font-display font-black text-2xl text-white">{t(homepageContent.travelsTitle)}</h3>
                      <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed">
                        {t(homepageContent.travelsDesc)}
                      </p>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-white/8 shadow-inner">
                      <Image src={posters.travels} alt="Travel Fleet" fill className="object-cover" />
                    </div>
                    <Link 
                      href="/divisions/travels" 
                      className="px-6 py-4 rounded-xl border border-white/8 hover:border-gold-accent hover:text-gold-soft text-white text-xs font-bold tracking-wider uppercase text-center transition-all"
                    >
                      {t('Request Fleet Booking')}
                    </Link>
                  </div>

                </div>

              </div>
            </section>
          </FadeUpSection>

          {/* 8. Dynamic Interactive Case Studies (Firestore settings/case_studies) */}
          <FadeUpSection>
            <section className="section-premium-padding bg-navy-medium border-t border-b border-white/5 relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                
                <div className="flex flex-col gap-3.5 mb-14 text-center max-w-lg mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">{t('CASE ARCHIVES')}</span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-white">{t('Success Stories')}</h2>
                  <p className="text-xs text-[#BFC8E6]/80 font-sans">{t('How we solved custom problems for elite organizations across Sri Lanka.')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {caseStudiesList.map((caseItem: any, idx: number) => (
                    <div key={idx} className="glass p-6 rounded-xl border border-white/5 hover:border-gold-accent/25 transition-all text-left flex flex-col justify-between min-h-[220px]">
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] uppercase font-black text-gold-soft tracking-widest font-sans">{t(caseItem.metric)}</span>
                        <h4 className="font-display font-bold text-lg text-white">{t(caseItem.client)}</h4>
                        <p className="text-xs text-[#BFC8E6]/80 font-sans leading-relaxed">{t(caseItem.desc)}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold font-sans uppercase mt-4">{t('read_case_study')}</span>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          </FadeUpSection>

          {/* 9. Awards & Achievements (Dynamic settings/awards) */}
          <FadeUpSection>
            <section className="py-20 bg-navy-dark">
              <div className="max-w-7xl mx-auto px-6">
                
                <div className="flex flex-col gap-3.5 mb-12 text-center max-w-sm mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">{t('OFFICIAL ENDORSEMENTS')}</span>
                  <h2 className="font-display font-black text-3xl text-white">{t('Awards & Achievements')}</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {awardsList.map((aw: any, idx: number) => (
                    <div key={idx} className="glass p-6.5 rounded-xl border border-white/5 flex flex-col gap-2 shadow-md hover:border-gold-accent/20 transition-all">
                      <div className="w-10 h-10 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-gold-soft flex items-center justify-center mx-auto mb-2">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-sm text-white leading-tight">{t(aw.title)}</h4>
                      <span className="text-[10px] font-bold text-gold-accent uppercase font-sans mt-1">{aw.year} &bull; {t(aw.body)}</span>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          </FadeUpSection>

          {/* 10. Client Testimonials */}
          <FadeUpSection>
            <Testimonials />
          </FadeUpSection>

          {/* 11. Instagram Feed Grid */}
          {widgetsEnabled.instagram && (
            <FadeUpSection>
              <section className="section-premium-padding bg-navy-dark relative overflow-hidden border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                  
                  <div className="flex flex-col gap-3.5 mb-14">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">{t('SOCIAL DIARY')}</span>
                    <h2 className="font-display font-black text-3xl text-white">{t('Instagram Feed')}</h2>
                    <p className="text-xs text-[#BFC8E6]/80 max-w-sm mx-auto font-sans">{t('Follow our live decoration setups and software deployment runs on social media handles.')}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {instagramFeed.map((img: any, idx: number) => {
                      const imageUrl = typeof img === 'string' ? img : (img.url || img.media_url || '');
                      const postLink = typeof img === 'string' ? 'https://instagram.com/mahdev_pvt_ltd' : (img.link || img.permalink || 'https://instagram.com/mahdev_pvt_ltd');
                      return (
                        <a 
                          key={idx} 
                          href={postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative h-36 rounded-2xl overflow-hidden border border-white/10 shadow-sm cursor-pointer group block"
                        >
                          <Image 
                            src={imageUrl} 
                            alt="Instagram Post" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100" 
                          />
                          <div className="absolute inset-0 bg-gold-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <span className="text-[9px] font-black font-sans uppercase tracking-wider bg-navy-dark/80 px-2.5 py-1.5 rounded-xl border border-white/10">{t('view_post')}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>

                </div>
              </section>
            </FadeUpSection>
          )}

          {/* 12. Statistics (Animated number counters) */}
          {widgetsEnabled.stats && (
            <FadeUpSection>
              <section className="py-20 bg-navy-medium border-t border-b border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center select-none">
                    {[
                      { label: 'happy_clients', count: stats.happyClients, suffix: '+' },
                      { label: 'events_completed', count: stats.projects, suffix: '+' },
                      { label: 'software_projects', count: stats.software, suffix: '+' },
                      { label: 'vehicles_in_fleet', count: stats.vehicles, suffix: '' },
                      { label: 'years_experience', count: stats.experience, suffix: '+' }
                    ].map((st, idx) => (
                      <div key={idx} className="glass p-6 rounded-xl border border-white/5 flex flex-col gap-2.5 shadow-md hover:border-gold-accent/25 hover:-translate-y-1.5 transition-all duration-300">
                        <span className="text-3xl sm:text-4xl font-display font-black leading-none">
                          <CounterNumber value={st.count} suffix={st.suffix} />
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                          {t(st.label)}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </section>
            </FadeUpSection>
          )}

          {/* Interactive Group History Timeline / Grouped Content Section */}
          <FadeUpSection>
            <section className="section-premium-padding bg-navy-dark">
              <div className="max-w-7xl mx-auto px-6">
                <InteractiveTimeline />
              </div>
            </section>
          </FadeUpSection>

          {/* 13. FAQ Accordion */}
          <FadeUpSection>
            <section className="section-premium-padding bg-navy-dark relative overflow-hidden border-t border-white/5">
              <div className="max-w-4xl mx-auto px-6">
                
                <div className="flex flex-col gap-3.5 mb-14 text-center max-w-sm mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">{t('have_questions')}</span>
                  <h2 className="font-display font-black text-3xl text-white">{t('frequently_asked')}</h2>
                </div>

                <div className="flex flex-col gap-4 text-left select-none">
                  {activeFaqs.map((faq, idx) => (
                    <div 
                      key={idx}
                      className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer text-white font-display font-bold text-sm"
                      >
                        <span>{t(faq.q)}</span>
                        <ChevronDown className={`w-4 h-4 text-gold-accent transition-transform duration-300 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {activeFaq === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                          >
                            <div className="px-6 pb-6 text-xs text-[#BFC8E6]/85 font-sans leading-relaxed border-t border-white/3 pt-4">
                              {t(faq.a)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          </FadeUpSection>

          {/* 14. Contact Split Layout with Multi-Step Inquiry Wizard Form */}
          <FadeUpSection id="contact">
            <section className="section-premium-padding bg-navy-medium relative overflow-hidden border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  
                  {/* Left Column: Contact Details */}
                  <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
                    <div className="flex flex-col gap-3.5 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent font-sans">
                        {t('partner_with_us')}
                      </span>
                      <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                        {t("Let's Build Something Amazing.")}
                      </h2>
                      <p className="text-xs text-[#BFC8E6]/80 font-sans leading-relaxed max-w-sm">
                        {t("Connect with our engineering leads and directors to sketch out your requirements. Get a personalized quote.")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-6 text-xs font-sans text-left mt-2">
                      {[
                        { icon: Phone, title: 'call_office', desc: '076 898 8970 / 075 092 8078', action: 'tel:0768988970' },
                        { icon: Mail, title: 'email_inbox', desc: 'info.mahdev.lk@gmail.com', action: 'mailto:info.mahdev.lk@gmail.com' },
                        { icon: MessageSquare, title: 'direct_whatsapp', desc: 'Launch chat stream', action: 'https://wa.me/94768988970?text=Hi%20Mahdev' }
                      ].map((det, idx) => {
                        const Icon = det.icon;
                        return (
                          <a 
                            key={idx}
                            href={det.action}
                            target={det.icon === MessageSquare ? "_blank" : undefined}
                            rel={det.icon === MessageSquare ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-4 group"
                          >
                            <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 group-hover:text-white transition-all shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">{t(det.title)}</span>
                              <span className="text-white font-semibold group-hover:text-gold-soft transition-colors">{t(det.desc)}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {/* Office Map Preview */}
                    <div className="h-32 rounded-2xl overflow-hidden border border-white/8 relative group shadow-md mt-2 select-none">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5905187788484!2d79.86047717498674!3d6.939466593060667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b4f62cae1%3A0xc0fb198eeaa07897!2sPickerings%20Rd%2C%20Colombo!5e0!3m2!1sen!2slk!4v1719650000000!5m2!1sen!2slk"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(80%)' }} 
                        loading="lazy"
                        title="Mahdev Office Map"
                      />
                      <div className="absolute inset-0 bg-navy-dark/10 pointer-events-none group-hover:bg-transparent transition-all duration-300" />
                    </div>
                  </div>

                  {/* Right Column: Multi-Step Project Inquiry Wizard */}
                  <div className="lg:col-span-7">
                    <ProjectInquiryWizard />
                  </div>

                </div>

              </div>
            </section>
          </FadeUpSection>

        </main>

        {/* 15. Footer */}
        <Footer />

        {/* Client Login Portal Button */}
        <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2.5 items-start pointer-events-auto">
          <button
            onClick={() => setLoginOpen(true)}
            className="p-3.5 rounded-full bg-gold-accent hover:bg-gold-soft text-navy-dark shadow-[0_4px_25px_rgba(212,175,55,0.45)] hover:scale-105 transition-all select-none border border-gold-accent cursor-pointer flex items-center justify-center"
            title={t('Client Login Portal')}
          >
            <User className="w-5 h-5 font-black" />
          </button>
        </div>

        {/* WhatsApp Floating Sticky Button */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 items-end pointer-events-auto">
          <a
            href="https://wa.me/94768988970?text=Hi%20Mahdev"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:scale-105 transition-all select-none cursor-pointer flex items-center justify-center"
            title={t('Direct WhatsApp Helpline')}
          >
            <FaWhatsapp className="w-5.5 h-5.5" />
          </a>
        </div>

        {/* Back to Top scroll circle button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onClick={scrollToTop}
              className="fixed bottom-24 right-6 p-3.5 rounded-full bg-navy-light border border-white/10 hover:border-gold-accent/40 text-gold-soft hover:text-white shadow-xl z-40 cursor-pointer flex items-center justify-center"
              title={t('Back to Top')}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Global Interactive Search Modal overlay */}
        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Floating AI Chat Assistant Support widget */}
        {widgetsEnabled.aiConcierge && (
          <AIAssistant onOpenBooking={() => setBookingOpen(true)} />
        )}

        {/* Client Portal login panel slide-over */}
        <ClientLoginPortal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

        {/* Lightbox / Video Player Modal */}
        <AnimatePresence>
          {activeVideo && (
            <div 
              onClick={() => setActiveVideo(null)}
              className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md"
            >
              <div className="w-full max-w-4xl h-[60vh] relative border border-white/10 rounded-3xl overflow-hidden bg-black" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white z-10 border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                {(() => {
                  const mediaType = getMediaType(activeVideo);
                  if (mediaType === 'youtube') {
                    const ytId = getYouTubeId(activeVideo);
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />
                    );
                  } else {
                    return (
                      <video 
                        src={activeVideo} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                      />
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Gallery Image Lightbox */}
        <AnimatePresence>
          {selectedGalleryImage && (
            <div 
              onClick={() => setSelectedGalleryImage(null)}
              className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md"
            >
              <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedGalleryImage(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white z-10 border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <Image 
                  src={selectedGalleryImage} 
                  alt="Enlarged Gallery" 
                  width={1200}
                  height={800}
                  className="object-contain max-h-[85vh] w-auto h-auto"
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Booking System Modal Overlay */}
        <AnimatePresence>
          {bookingOpen && (
            <div className="fixed inset-0 bg-black/80 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-3xl relative mobile-bottom-sheet">
                <button
                  onClick={() => setBookingOpen(false)}
                  className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-gray-400 hover:text-white z-50"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision="sws-events" onSuccess={() => setTimeout(() => setBookingOpen(false), 2000)} />
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
