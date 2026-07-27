'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  Target, 
  Calendar, 
  Compass, 
  Cpu, 
  Camera, 
  Globe, 
  ChevronRight,
  MessageSquare,
  Mail,
  Phone,
  Send,
  CheckCircle,
  Briefcase,
  MessageCircle,
  X,
  Play,
  Heart,
  Star,
  Users,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';

// Core Components
import Navbar from '@/components/Navbar';
import InteractiveHero from '@/components/InteractiveHero';
import TechCloud from '@/components/TechCloud';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import AIAssistant from '@/components/AIAssistant';
import GlobalSearch from '@/components/GlobalSearch';
import BookingSystem from '@/components/BookingSystem';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [stats, setStats] = useState({ happyClients: 1500, projects: 1200, software: 120, vehicles: 18, experience: 10 });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [posters, setPosters] = useState({ 
    sws: '/images/wedding_decoration_1782729925686.jpg', 
    u1: '/images/u1_robot_camera_1783346286743.jpg', 
    travels: '/images/travels_robot_car_1783346316762.jpg', 
    it: '/images/saas_dashboard.jpg' 
  });

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

    return () => {
      unsubStats();
      unsubPosters();
    };
  }, []);

  // Keyboard shortcut listener for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contact'), {
        ...formData,
        timestamp: serverTimestamp()
      });

      // Dispatch email notification to info.mahdev.lk@gmail.com via backend
      try {
        await fetch('/api/send-email', {
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
      } catch (mailErr) {
        console.error("Failed to forward contact request email:", mailErr);
      }
      
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#dfba73', '#1e40af']
      });
      
      setFormData({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert("Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-navy-dark overflow-x-hidden text-left">
      <Navbar />

      <main className="flex-1 w-full">
        {/* 1. Hero Section (Loads Instantly with staggered fades) */}
        <InteractiveHero />

        {/* 2. About Mahdev Section */}
        <section id="about" className="py-24 bg-navy-dark relative overflow-hidden">
          <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-15" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Visual timeline/story */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                  OUR ESSENCE & STORY
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                  Crafting Infrastructure of Excellence
                </h2>
                <p className="font-sans text-gray-400 text-sm sm:text-base leading-relaxed">
                  Founded in Sri Lanka, Mahdev Pvt Ltd has grown from a specialized technology company to a diversified corporate syndicate. We operate at the intersection of logical software architectures and creative luxury design.
                </p>

                {/* Timeline highlights */}
                <div className="flex flex-col gap-6 mt-4">
                  {[
                    { year: '2016', title: 'Inception', desc: 'Began as a small bespoke web and custom IT solutions team.' },
                    { year: '2019', title: 'Launch of SWS Events & Studio U1', desc: 'Expanded into premium photography & high-end wedding planning.' },
                    { year: '2022', title: 'Mahdev ERP Rollout', desc: 'Released POS terminals, cloud inventory, and omnichannel software suites.' },
                    { year: '2025', title: 'Global Integrations', desc: 'Partnering internationally with cloud-native frameworks and Firebase architectures.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-gold-accent/10 border border-gold-accent/30 text-gold-soft text-xs font-bold font-display flex items-center justify-center group-hover:bg-gold-accent group-hover:text-navy-dark transition-all">
                          {item.year}
                        </div>
                        {idx !== 3 && <div className="w-px h-full bg-white/10 mt-2" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-display font-bold text-white text-sm group-hover:text-gold-soft transition-colors">{item.title}</h4>
                        <p className="font-sans text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Mission, Vision, and Premium Image Card */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Vision/Mission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-premium rounded-3xl p-6 border border-gold-accent/15 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Our Vision</h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed">
                      To be the world’s most versatile conglomerate, setting premium benchmarks in digital system integrations and luxury experience creation.
                    </p>
                  </div>

                  <div className="glass-premium rounded-3xl p-6 border border-gold-accent/15 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Our Mission</h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed">
                      To engineer robust backend architectures for businesses while translating client wedding and travel narratives into lifetime memories.
                    </p>
                  </div>
                </div>

                {/* Main banner block */}
                <div className="relative h-[250px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl">
                  <Image 
                    src="/images/wedding_decoration_1782729925686.jpg" 
                    alt="SWS Wedding Decoration" 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent flex items-end p-8">
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold">Featured Project</span>
                      <h4 className="font-display font-bold text-xl text-white">SWS Weddings Gala, Colombo</h4>
                      <p className="text-xs text-gray-300 font-sans max-w-sm">
                        Curating royal church decorations, fairy light lanes, and floral canopies for premium venues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Why Choose Us Section */}
        <WhyChooseUs />

        {/* 4. SWS Event Management Homepage Section (Occupies ~40% of homepage height) */}
        <section id="sws-homepage-section" className="py-24 bg-gradient-to-b from-navy-dark via-navy-medium to-navy-dark relative overflow-hidden border-t border-white/5">
          <div className="glow-ball glow-ball-purple w-[500px] h-[500px] top-1/4 -right-20 opacity-20" />
          <div className="glow-ball glow-ball-gold w-[350px] h-[350px] bottom-10 left-10 opacity-10" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.2.5em] text-gold-soft flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-accent" /> PRIMARY DIVISION FOCUS
                </span>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-white leading-tight">
                  SWS Event Management
                </h2>
                <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
                  We design and construct breathtaking environments. From grand glasshouse wedding canopy constructs to themed birthdays, corporate stages, and traditional oil lamp mandaps.
                </p>
              </div>
              <Link 
                href="/divisions/sws-events"
                className="px-6 py-3 rounded-xl border border-gold-accent/25 hover:border-gold-accent text-gold-soft hover:text-white text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all self-start lg:self-auto"
              >
                VIEW FULL DESIGN SUITE
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Large Banner Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              
              {/* Left banner: Main Showcase */}
              <div className="lg:col-span-7 h-[420px] rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
                <Image 
                  src={posters.sws} 
                  alt="Mughal Imperial Stage" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass border border-white/10 text-[9px] font-bold uppercase tracking-wider text-gold-accent">
                  Trending Package
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-left flex flex-col gap-2">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white">The Imperial Gold Canopy Setup</h3>
                  <p className="font-sans text-xs text-gray-300 max-w-md">Our signature wedding backdrop featuring a gold arch, cascading wisterias, ambient LED uplighters, and premium floral path runs.</p>
                  <div className="flex gap-4 items-center mt-1">
                    <span className="text-gold-soft font-bold text-sm">Rs. 185,000</span>
                    <button 
                      onClick={() => setBookingOpen(true)}
                      className="px-4 py-2 rounded-lg bg-gold-accent hover:bg-gold-soft text-navy-dark font-sans text-[10px] font-bold tracking-wider transition-all"
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
              </div>

              {/* Right side: Video and Trending Packages List */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                
                {/* Simulated Client Video Card */}
                <div className="h-[200px] rounded-3xl overflow-hidden relative group border border-white/5 shadow-xl">
                  <Image 
                    src="/images/sws_robot_decor_1783346269673.jpg" 
                    alt="Client Wedding Reel" 
                    fill 
                    className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => setActiveVideo('/images/sws_robot_decor_1783346269673.jpg')}
                      className="w-14 h-14 rounded-full bg-gold-accent/90 hover:bg-gold-accent text-navy-dark flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                    >
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">EVENT TEASER VIDEO</span>
                    <h4 className="font-display font-semibold text-sm text-white">Rebecca & Tharindu Wedding Gala</h4>
                  </div>
                </div>

                {/* Trending Packages Grid List */}
                <div className="flex flex-col gap-4">
                  {[
                    { title: 'Royal Stage Set', price: 'Rs. 240,000', label: 'Wedding' },
                    { title: 'Alice in Balloonland', price: 'Rs. 65,000', label: 'Birthdays' },
                    { title: 'Cathedral Floral Sanctuary', price: 'Rs. 95,000', label: 'Church' }
                  ].map((pkg, idx) => (
                    <div 
                      key={idx} 
                      className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:border-gold-accent/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {pkg.label[0]}
                        </div>
                        <div className="text-left">
                          <h4 className="font-display font-semibold text-xs sm:text-sm text-white group-hover:text-gold-soft transition-colors">{pkg.title}</h4>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">{pkg.label} Package</span>
                        </div>
                      </div>
                      <span className="font-display font-bold text-xs sm:text-sm text-gold-soft">{pkg.price}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Popular Themes & Gallery Preview Slider */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Glasshouse Canopy', img: '/images/wedding_decoration_1782729925686.jpg' },
                { title: 'Pastel Ballon Arch', img: '/images/birthday_decor.jpg' },
                { title: 'Cathedral Pew Florals', img: '/images/church_decor.jpg' },
                { title: 'Branded Keynotes', img: '/images/sws_robot_decor_1783346269673.jpg' }
              ].map((theme, idx) => (
                <div 
                  key={idx}
                  className="relative h-44 rounded-2xl overflow-hidden group border border-white/5 shadow-md"
                >
                  <Image 
                    src={theme.img} 
                    alt={theme.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] sm:text-xs font-display font-bold text-white text-left">{theme.title}</span>
                </div>
              ))}
            </div>

            {/* Mini Reviews block */}
            <div className="mt-12 p-6 rounded-3xl glass border border-gold-accent/15 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gold-accent/30 relative shrink-0">
                  <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" alt="Avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex gap-0.5 text-gold-soft">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-xs text-gray-300 font-sans mt-1">"The SWS Events team planned our wedding stage decoration with royal marigolds. It was cinematic!"</p>
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">- Rebecca & Tharindu, Colombo Wedding</span>
                </div>
              </div>
              <button 
                onClick={() => setBookingOpen(true)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-wider hover:brightness-110 shrink-0 transition-all shadow-md shadow-gold-accent/10"
              >
                BOOK EVENT DECORATION
              </button>
            </div>

          </div>
        </section>

        {/* 5. Photography Section (Studio U1) */}
        <section id="photography-homepage-section" className="py-24 bg-navy-dark relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div className="text-left flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">CREATIVE SHOWROOM</span>
                <h2 className="font-display font-black text-4xl text-white">Studio U1 Cinematography</h2>
                <p className="font-sans text-sm text-gray-400 max-w-lg leading-relaxed">Capturing raw emotional moments using high-altitude drone cameras, luxury studio setups, and candid photography.</p>
              </div>
              <Link 
                href="/divisions/u1-studio"
                className="px-6 py-3 rounded-xl border border-cyan-400/30 hover:border-cyan-400 text-cyan-300 text-xs font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                VIEW PORTFOLIO <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { title: 'Wedding Photography', img: posters.u1, desc: 'Pre-wedding candid portraits' },
                { title: 'Drone Aerial Reels', img: '/images/drone_photography.jpg', desc: 'High definition landscape runs' },
                { title: 'Newborn Milestones', img: '/images/newborn_shoot.jpg', desc: 'Comfortable climate-controlled studio' }
              ].map((item, idx) => (
                <div key={idx} className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-cyan-500/30 transition-all duration-300 flex flex-col hover:translate-y-[-4px] shadow-xl">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                  </div>
                  <div className="p-5 text-left flex flex-col gap-1.5">
                    <h3 className="font-display font-bold text-base text-white">{item.title}</h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. IT Solutions Section */}
        <section id="it-homepage-section" className="py-24 bg-navy-medium/30 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div className="text-left flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-400 font-sans">ENTERPRISE CORE</span>
                <h2 className="font-display font-black text-4xl text-white">IT & Cloud Solutions</h2>
                <p className="font-sans text-sm text-gray-400 max-w-lg leading-relaxed">Deploying double-entry ERP accounting software, real-time checkout POS registers, and robust cloud configurations.</p>
              </div>
              <Link 
                href="/divisions/it-solutions"
                className="px-6 py-3 rounded-xl border border-blue-400/30 hover:border-blue-400 text-blue-300 text-xs font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                REQUEST AUDIT <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1: Cloud ERP */}
              <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-400/25 transition-all flex flex-col sm:flex-row gap-6 items-center text-left">
                <div className="relative w-full sm:w-1/3 h-36 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <Image src={posters.it} alt="ERP Cloud" fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-bold text-blue-400">Software Suite</span>
                  <h3 className="font-display font-bold text-lg text-white">Double-Entry ERP System</h3>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">Integrated ledgers, inventory stock counts, and financial summaries for hotels and merchants.</p>
                </div>
              </div>

              {/* Card 2: Cloud POS */}
              <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-400/25 transition-all flex flex-col sm:flex-row gap-6 items-center text-left">
                <div className="relative w-full sm:w-1/3 h-36 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <Image src="/images/it_robot_developer_1783346302442.jpg" alt="POS Software" fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-bold text-blue-400">Checkout Terminal</span>
                  <h3 className="font-display font-bold text-lg text-white">Real-Time POS Systems</h3>
                  <p className="font-sans text-xs text-gray-400 leading-relaxed">Offline-first receipt printing, barcode scans, and WhatsApp checkout notifications.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Travels Section */}
        <section id="travels-homepage-section" className="py-24 bg-navy-dark relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div className="text-left flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-green-400 font-sans">TOURISM & TRANSIT</span>
                <h2 className="font-display font-black text-4xl text-white">Mahdev Travels</h2>
                <p className="font-sans text-sm text-gray-400 max-w-lg leading-relaxed">Airport BIA dispatch, luxury wedding Mercedes rentals, and customized vacation packages across Sri Lanka.</p>
              </div>
              <Link 
                href="/divisions/travels"
                className="px-6 py-3 rounded-xl border border-green-400/30 hover:border-green-400 text-green-300 text-xs font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all"
              >
                BOOK TRANSIT <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Airport BIA Transfers', img: posters.travels, desc: 'On-time pickup in luxury vans' },
                { title: 'Wedding VIP Mercedes', img: '/images/wedding_decoration_1782729925686.jpg', desc: 'Polished white luxury cars' },
                { title: 'Ella Greenery Escape', img: '/images/van_tour.jpg', desc: 'Curated 3-day island package' }
              ].map((item, idx) => (
                <div key={idx} className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-green-500/30 transition-all duration-300 flex flex-col hover:translate-y-[-4px] shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                  </div>
                  <div className="p-5 text-left flex flex-col gap-1">
                    <h3 className="font-display font-bold text-base text-white">{item.title}</h3>
                    <p className="font-sans text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Global Statistics Counters Section */}
        <section className="py-24 bg-navy-dark relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
              {[
                { label: 'Happy Clients', count: stats.happyClients, suffix: '+' },
                { label: 'Events Handled', count: stats.projects, suffix: '+' },
                { label: 'Software Bundles', count: stats.software, suffix: '+' },
                { label: 'Active Fleet', count: stats.vehicles, suffix: '' },
                { label: 'Years Active', count: stats.experience, suffix: '+' }
              ].map((stat, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-2 p-5 rounded-2xl glass border border-white/5">
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">
                    {stat.count}{stat.suffix}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-sans">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TechCloud />

        {/* 9. Testimonials Section */}
        <Testimonials />

        {/* 10. Instagram Gallery & Partners */}
        <section className="py-24 bg-navy-dark relative border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Instagram Section */}
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">SOCIAL DIARY</span>
              <h2 className="font-display font-black text-3xl text-white">Instagram Gallery</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-md mx-auto">Follow our live setups and project deployments on social handles.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-20">
              {[
                '/images/wedding_decoration_1782729925686.jpg',
                '/images/sws_robot_decor_1783346269673.jpg',
                '/images/birthday_decor.jpg',
                '/images/church_decor.jpg',
                '/images/drone_photography.jpg',
                '/images/portrait_shoot.jpg'
              ].map((img, idx) => (
                <div key={idx} className="relative h-32 rounded-xl overflow-hidden group border border-white/10 shadow-sm cursor-pointer">
                  <Image src={img} alt="Instagram Post" fill className="object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90 group-hover:brightness-100" />
                  <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="text-[10px] font-bold font-sans">VIEW POST</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Corporate Partners Section */}
            <div className="border-t border-white/5 pt-16 text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-500 font-sans block mb-8">ENDORSED BY LEADING CORPORATES</span>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-55">
                {['Royal Palms Resort', 'Hilton Colombo', 'BIA Air Transports', 'Vastra Silks', 'Ceylon Cloud Engine'].map((partner, idx) => (
                  <span key={idx} className="font-display font-bold text-sm sm:text-lg text-white hover:text-gold-accent cursor-pointer transition-colors tracking-widest">{partner.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 11. Global Booking CTA and Direct Contact Section */}
        <section id="contact" className="py-24 bg-gradient-to-b from-navy-dark to-navy-medium relative overflow-hidden border-t border-white/5">
          <div className="glow-ball glow-ball-purple w-96 h-96 -top-20 right-0 opacity-15" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Left Column - Contact Details */}
              <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                    PARTNER WITH US
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                    Let's Build Something Exceptional
                  </h2>
                  <p className="font-sans text-gray-400 text-sm leading-relaxed max-w-sm">
                    Connect with our directors and engineering heads. Set up a consultation to design your bespoke solution.
                  </p>
                </div>

                <div className="flex flex-col gap-6 font-sans text-sm mt-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Call Office</span>
                      <span className="text-white font-medium hover:text-gold-soft transition-colors">076 898 8970 / 075 092 8078</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email Inbox</span>
                      <span className="text-white font-medium hover:text-gold-soft transition-colors">info.mahdev.lk@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Direct WhatsApp</span>
                      <a 
                        href="https://wa.me/94768988970?text=Hi%20Mahdev" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 font-semibold hover:underline"
                      >
                        Launch chat stream
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:col-span-7">
                <div className="glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 shadow-2xl relative">
                  <h3 className="font-display font-bold text-xl text-white mb-6">Send a Message</h3>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                          placeholder="+94 7X XXX XXXX"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Division Interested</label>
                        <select 
                          value={formData.division}
                          onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                        >
                          <option>General Inquiry</option>
                          <option>SWS Event Management</option>
                          <option>Studio U1 Photography</option>
                          <option>Mahdev ERP Systems</option>
                          <option>IT & Cloud Solutions</option>
                          <option>Mahdev Travels</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Your Message</label>
                      <textarea 
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all resize-none"
                        placeholder="Detail your requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans font-bold text-sm tracking-wider rounded-xl transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gold-accent/15"
                    >
                      {loading ? 'SENDING INQUIRY...' : 'SEND INQUIRY'}
                      <Send className="w-4 h-4" />
                    </button>

                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex items-center gap-3 p-4 bg-gold-accent/10 border border-gold-accent/30 rounded-2xl mt-4"
                      >
                        <CheckCircle className="w-5 h-5 text-gold-soft shrink-0" />
                        <span className="text-sm text-gold-soft font-sans font-semibold">
                          Your message has been logged directly with our executive office. We will call/email you within 4 business hours.
                        </span>
                      </motion.div>
                    )}
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <Footer />

      {/* Global Interactive Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating AI Assistant Chat Support */}
      <AIAssistant onOpenBooking={() => setBookingOpen(true)} />

      {/* Global Booking System Modal Overlay */}
      <AnimatePresence>
        {bookingOpen && (
          <div className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-3xl relative">
              <button
                onClick={() => setBookingOpen(false)}
                className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <BookingSystem initialDivision="sws-events" onSuccess={() => setTimeout(() => setBookingOpen(false), 2000)} />
            </div>
          </div>
        )}
      </AnimatePresence>

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
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white z-10 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <Image src={activeVideo} alt="Play Video" fill className="object-cover opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
                <span className="text-[10px] text-gold-accent font-bold uppercase tracking-wider mb-2">CINEMATIC TEASER REEL</span>
                <h3 className="font-display font-black text-2xl text-white mb-4">Wedding Teaser Streaming Simulation</h3>
                <p className="text-gray-400 text-xs font-sans max-w-md">Our high-altitude drone shots and stabilizer cameras are capturing this event. Complete production logs are available in the Studio U1 division page.</p>
                <div className="w-12 h-1 bg-gold-accent mt-4 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
