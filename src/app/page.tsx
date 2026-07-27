'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Sparkles, ArrowUpRight, Eye, Target, Calendar, Calculator, Compass, Cpu, 
  Camera, Globe, ChevronRight, MessageSquare, Mail, Phone, Send, 
  CheckCircle, Briefcase, X, Play, Heart, Star, User, Users, Award, 
  Layers, ArrowRight, ChevronDown, HelpCircle, ArrowUp, Laptop, Moon, Sun
} from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaArrowUp } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';

// Core Custom Components
import Navbar from '@/components/Navbar';
import InteractiveHero from '@/components/InteractiveHero';
import TechCloud from '@/components/TechCloud';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import AIAssistant from '@/components/AIAssistant';
import GlobalSearch from '@/components/GlobalSearch';
import BookingSystem from '@/components/BookingSystem';

// Premium Features Component
import { 
  BeforeAfterSlider, 
  EventCostEstimator, 
  Venue360Viewer, 
  InteractiveTimeline, 
  ClientLoginPortal, 
  ProjectInquiryWizard 
} from '@/components/PremiumFeatures';

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
  const isInView = useInView(ref, { once: true, margin: "-150px" });

  return (
    <div
      ref={ref}
      id={id}
      style={{
        transform: isInView ? "none" : "translateY(50px)",
        opacity: isInView ? 1 : 0,
        filter: isInView ? "blur(0px)" : "blur(4px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  
  // Real-time states
  const [stats, setStats] = useState({ happyClients: 1500, projects: 1200, software: 120, vehicles: 18, experience: 10 });
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
      await addDoc(collection(db, 'contact'), {
        ...formData,
        timestamp: serverTimestamp()
      });

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
        colors: ['#D4AF37', '#FFD978', '#A5B4FC']
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

  // Gallery Masonry dataset
  const galleryItems = [
    { id: 1, title: 'Mughal Imperial Canopy', category: 'Wedding', img: '/images/wedding_decoration_1782729925686.jpg' },
    { id: 2, title: 'Studio U1 Drone Footage', category: 'Cinema', img: '/images/drone_photography.jpg' },
    { id: 3, title: 'VIP Wedding Mercedes', category: 'Travel', img: '/images/wedding_decoration_1782729925686.jpg' },
    { id: 4, title: 'Hilton Keynote Backdrop', category: 'Corporate', img: '/images/sws_robot_decor_1783346269673.jpg' },
    { id: 5, title: 'Fairy Light Arch Lanes', category: 'Lighting', img: '/images/sws_robot_decor_1783346269673.jpg' },
    { id: 6, title: 'Ella Greenery Escape Van', category: 'Travel', img: '/images/van_tour.jpg' },
    { id: 7, title: 'Church Canopy Pew Flowers', category: 'Wedding', img: '/images/church_decor.jpg' },
    { id: 8, title: 'Cinematic Newborn Shoot', category: 'Cinema', img: '/images/newborn_shoot.jpg' }
  ];

  const filteredGallery = activeFilter === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'What services are included in SWS Event backdrops?', a: 'SWS Event Planning specializes in custom structural builds including grand glasshouse canopies, traditional oil lamps (mandaps), imported pastel balloon arches, and ambient church floral setups.' },
    { q: 'Can I request a custom API checkout inventory module for the POS system?', a: 'Yes. Our IT & Cloud Solutions division customizes POS cash registers, double-entry ERP software layers, stock count logs, and custom payment terminals for hotels and restaurants.' },
    { q: 'How early should I book the Travels VIP luxury Mercedes convoys?', a: 'For wedding Mercedes hires, VIP Colombo transfers, or customized Ella greenery escape runs, we suggest placing bookings at least 3 weeks in advance to lock the fleet allocation.' },
    { q: 'Is there direct database integration for checking event progress?', a: 'Yes. Authorized clients receive credentials to access the secure Client Portal to review real-time blueprints, invoice payouts, and design drafts.' }
  ];

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#BFC8E6] font-sans overflow-x-hidden text-left pb-10">
      
      {/* Scroll indicator overlay */}
      <Navbar />

      <main className="flex-1 w-full relative z-10">
        
        {/* 1. Hero Section */}
        <InteractiveHero />

        {/* 2. Trusted Companies Marquee (Pause on hover, Grayscale to color) */}
        <FadeUpSection>
          <section className="py-12 bg-[#050816] border-b border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-500 block mb-8">
                ENDORSED BY SOUTH ASIA'S ELITE BRANDS
              </span>
              <div className="marquee-container">
                <div className="marquee-content flex gap-12 sm:gap-20 items-center">
                  {['Royal Palms Resort', 'Hilton Colombo', 'BIA Air Transports', 'Vastra Silks', 'Ceylon Cloud Engine'].map((partner, idx) => (
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
                  {['Royal Palms Resort', 'Hilton Colombo', 'BIA Air Transports', 'Vastra Silks', 'Ceylon Cloud Engine'].map((partner, idx) => (
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

        {/* 3. Featured Services (Upgraded luxury glass cards with 32px padding, glow borders) */}
        <FadeUpSection id="divisions">
          <section className="section-premium-padding bg-[#050816] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="flex flex-col gap-3.5 mb-16 text-center max-w-xl mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                  OUR CONGLOMERATE STRUCTURE
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                  Premium Services
                </h2>
                <p className="text-sm text-[#BFC8E6]/80 leading-relaxed font-sans">
                  We bridge physical luxury experience designs and digital system architectures to deliver uncompromised quality.
                </p>
              </div>

              {/* Service Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'SWS Event Planning', desc: 'Curating royal backdrops, glasshouse wedding canopies, traditional oil lamps, and floral altar layouts.', href: '/divisions/sws-events', icon: Sparkles, color: 'text-purple-400', border: 'hover:border-purple-500/30' },
                  { title: 'Studio U1 Cinematography', desc: 'Capturing candidates pre-wedding portraits and high-altitude drone clips with custom color-graded edits.', href: '/divisions/u1-studio', icon: Camera, color: 'text-cyan-400', border: 'hover:border-cyan-500/30' },
                  { title: 'Mahdev ERP Systems', desc: 'Deploying double-entry cloud accounting ledgers, receipt printer POS checkouts, and stock counting modules.', href: '/divisions/erp', icon: Cpu, color: 'text-yellow-400', border: 'hover:border-yellow-500/30' },
                  { title: 'IT & Cloud Solutions', desc: 'Building secure client databases, custom software developments, and real-time Firebase syncing infrastructures.', href: '/divisions/it-solutions', icon: Globe, color: 'text-blue-400', border: 'hover:border-blue-500/30' },
                  { title: 'Mahdev Travels', desc: 'Providing VIP Mercedes wedding rentals, BIA airport transfer dispatches, and Ella greenery escapes.', href: '/divisions/travels', icon: Compass, color: 'text-green-400', border: 'hover:border-green-500/30' }
                ].map((serv, sIdx) => {
                  const Icon = serv.icon;
                  return (
                    <Link
                      key={sIdx}
                      href={serv.href}
                      className={`glass p-8 sm:p-9.5 rounded-[24px] border border-white/5 hover:border-gold-accent/30 hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between group shadow-lg ${serv.border}`}
                    >
                      <div className="flex flex-col gap-6 text-left">
                        {/* Icon rotates on card hover */}
                        <div className="w-13 h-13 rounded-2xl bg-white/3 flex items-center justify-center border border-white/5 group-hover:border-gold-accent/20 group-hover:bg-white/5 transition-all duration-300 shrink-0">
                          <Icon className={`w-6.5 h-6.5 ${serv.color} group-hover:rotate-12 transition-transform duration-500`} />
                        </div>
                        <div className="flex flex-col gap-3">
                          <h3 className="font-display font-black text-xl text-white group-hover:text-gold-soft transition-colors duration-300">
                            {serv.title}
                          </h3>
                          <p className="text-xs text-[#BFC8E6]/80 leading-relaxed font-sans">
                            {serv.desc}
                          </p>
                        </div>
                      </div>
                      
                      {/* Arrow moves on hover */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gold-soft uppercase tracking-wider mt-6 group-hover:text-white transition-colors duration-300">
                        Learn More 
                        <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 4. Why Choose Mahdev (WhyChooseUs component) */}
        <FadeUpSection>
          <WhyChooseUs />
        </FadeUpSection>

        {/* 5. Featured Projects & Video Showcase (Netflix style featured layout) */}
        <FadeUpSection id="featured-projects">
          <section className="section-premium-padding bg-[#0B1023] relative overflow-hidden border-t border-b border-white/5">
            <div className="glow-ball glow-ball-gold w-96 h-96 top-20 -left-10 opacity-10" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              
              <div className="flex flex-col gap-3.5 mb-14 text-left">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-soft flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold-accent" /> CINEMATIC ARCHIVES
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
                  Featured Event Showcase
                </h2>
              </div>

              {/* Large Netflix Style Featured Backdrop Banner */}
              <div className="relative w-full h-[400px] sm:h-[500px] rounded-[32px] overflow-hidden border border-white/8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] group mb-12">
                <Image 
                  src="/images/wedding_decoration_1782729925686.jpg" 
                  alt="Featured Mughal Wedding Backdrop" 
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-1000 brightness-75"
                />
                
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/30 to-transparent" />

                {/* Banner details */}
                <div className="absolute bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-left">
                  <div className="flex flex-col gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-gold-accent/25 border border-gold-accent/35 text-[9px] text-gold-soft font-bold uppercase tracking-widest max-w-fit">
                      ROYAL WEDDING CATEGORY
                    </span>
                    <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
                      The Mughal Imperial Stage Setup
                    </h3>
                    <p className="text-xs text-[#BFC8E6]/85 max-w-lg font-sans leading-relaxed">
                      Custom 60-foot luxury wedding backdrop featuring real gold drapes, cascading hand-picked wisterias, stabilizer drone cinematography, and BIA transport coordinates.
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-4 shrink-0 select-none">
                    <button
                      onClick={() => setActiveVideo('https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4')}
                      className="px-6.5 py-4 rounded-2xl bg-white text-navy-dark text-xs font-black tracking-wider uppercase flex items-center gap-2 hover:bg-gold-soft transition-colors duration-300"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Video
                    </button>
                    <button 
                      onClick={() => setBookingOpen(true)}
                      className="px-6.5 py-4 rounded-2xl glass border border-white/10 hover:border-gold-accent text-white hover:text-gold-soft text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      View Gallery
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Gallery */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 text-left">
                  MORE CINEMATIC WORK SAMPLES
                </span>
                
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x select-none">
                  {[
                    { title: 'Hilton Keynotes Convoy', desc: 'Corporate Stage Decor', img: '/images/sws_robot_decor_1783346269673.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
                    { title: 'Pre-Wedding Candle Path', desc: 'Candlelight Canopies', img: '/images/wedding_decoration_1782729925686.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' },
                    { title: 'Church Floral Altar', desc: 'Cathedral Arch Decor', img: '/images/church_decor.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-wedding-venue-decorations-40003-large.mp4' },
                    { title: 'Ella Greenery Tour conv', desc: 'Mercedes Travels fleet', img: '/images/van_tour.jpg', video: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4' }
                  ].map((proj, pIdx) => (
                    <div 
                      key={pIdx}
                      onClick={() => setActiveVideo(proj.video)}
                      className="w-[260px] sm:w-[320px] h-48 rounded-2xl overflow-hidden relative shrink-0 border border-white/5 cursor-pointer group snap-start shadow-md"
                    >
                      <Image 
                        src={proj.img} 
                        alt={proj.title} 
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
                        <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold">{proj.desc}</span>
                        <h4 className="font-display font-bold text-sm text-white">{proj.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 6. Premium Event Gallery (Pinterest Masonry with category filter & overlay zooms) */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#050816] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex flex-col gap-3.5 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">PREMIUM EVENT PORTFOLIO</span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-white">Event Gallery</h2>
                </div>

                {/* Filters */}
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
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinterest Masonry layout */}
              <div className="pinterest-masonry">
                {filteredGallery.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedGalleryImage(item.img)}
                    className="pinterest-item relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-lg"
                  >
                    <Image 
                      src={item.img} 
                      alt={item.title} 
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-[#050816]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-left">
                      <span className="text-[8px] uppercase tracking-wider text-gold-soft font-bold mb-1 font-sans">{item.category}</span>
                      <h4 className="font-display font-bold text-base text-white">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 mt-2 font-sans flex items-center gap-1 hover:underline">
                        View Image &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* Custom Premium Features: Before/After Slider & 360° Venue Viewer */}
        <FadeUpSection>
          <section className="py-12 bg-[#0B1023] border-t border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16">
              <BeforeAfterSlider />
              <Venue360Viewer />
            </div>
          </section>
        </FadeUpSection>

        {/* 7. Software Solutions & Travel Experiences Section */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#050816] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Panel: Cloud Software solutions */}
                <div className="glass-premium rounded-[32px] p-8 border border-white/10 text-left flex flex-col gap-6.5 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 font-sans">ENTERPRISE SYSTEM INFRASTRUCTURE</span>
                    <h3 className="font-display font-black text-2xl text-white">Dual-Entry ERP Softwares</h3>
                    <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed">
                      Deploy omnichannel POS terminals, ledger accounts integration, checkouts receipts printing, and cloud inventory audits from a single administrative console dashboard.
                    </p>
                  </div>
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-white/8 shadow-inner">
                    <Image src={posters.it} alt="ERP Softwares" fill className="object-cover" />
                  </div>
                  <Link 
                    href="/divisions/it-solutions" 
                    className="px-6 py-4 rounded-xl border border-white/8 hover:border-gold-accent hover:text-gold-soft text-white text-xs font-bold tracking-wider uppercase text-center transition-all"
                  >
                    Request Software Audit
                  </Link>
                </div>

                {/* Right Panel: Travels Fleet */}
                <div className="glass-premium rounded-[32px] p-8 border border-white/10 text-left flex flex-col gap-6.5 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 font-sans">VIP TRANSIT FLEETS</span>
                    <h3 className="font-display font-black text-2xl text-white">Mahdev travels & tours</h3>
                    <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed">
                      Dispatch luxury wedding Mercedes hires, comfortable VIP vans, airport BIA pickups, and customized vacation travel routes across scenic tourist sites in Sri Lanka.
                    </p>
                  </div>
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-white/8 shadow-inner">
                    <Image src={posters.travels} alt="Travel Fleet" fill className="object-cover" />
                  </div>
                  <Link 
                    href="/divisions/travels" 
                    className="px-6 py-4 rounded-xl border border-white/8 hover:border-gold-accent hover:text-gold-soft text-white text-xs font-bold tracking-wider uppercase text-center transition-all"
                  >
                    Request Fleet Booking
                  </Link>
                </div>

              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 8. Interactive Case Studies */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#0B1023] border-t border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="flex flex-col gap-3.5 mb-14 text-center max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">CASE ARCHIVES</span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white">Success Stories</h2>
                <p className="text-xs text-[#BFC8E6]/80 font-sans">How we solved custom problems for elite organizations across Sri Lanka.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { client: 'Hilton Ballroom Setup', metric: '60ft Stage Construct', desc: 'Designed custom metal backdrops, importing pastel silk lilies and installing 120 uplighters in 14 hours.' },
                  { client: 'Singhania Ledger System', metric: '100% Audit Integrity', desc: 'Integrated custom dual-entry ERP accounts, sync POS checkout receipt logs with Firebase backends.' },
                  { client: 'Ceylon Travels Dispatch', metric: 'BIA Transit Logistics', desc: 'Managed wedding transfers using a convoy of 4 Mercedes cars and luxury KDH tour vans.' }
                ].map((caseItem, idx) => (
                  <div key={idx} className="glass p-6 rounded-3xl border border-white/5 hover:border-gold-accent/25 transition-all text-left flex flex-col justify-between min-h-[220px]">
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] uppercase font-black text-gold-soft tracking-widest font-sans">{caseItem.metric}</span>
                      <h4 className="font-display font-bold text-lg text-white">{caseItem.client}</h4>
                      <p className="text-xs text-[#BFC8E6]/80 font-sans leading-relaxed">{caseItem.desc}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold font-sans uppercase mt-4">READ CASE STUDY &rarr;</span>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 9. Awards & Achievements */}
        <FadeUpSection>
          <section className="py-20 bg-[#050816]">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="flex flex-col gap-3.5 mb-12 text-center max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">OFFICIAL ENDORSEMENTS</span>
                <h2 className="font-display font-black text-3xl text-white">Awards & Achievements</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { title: 'Best Decor Syndicate', year: '2024', body: 'South Asia Bridal Awards' },
                  { title: 'ERP Software Laurels', year: '2025', body: 'Ceylon Cloud Congress' },
                  { title: '5-Star Travels Fleet', year: '2023', body: 'Tourism Association LK' },
                  { title: 'Elite IT Integrators', year: '2026', body: 'conglomerate systems audit' }
                ].map((aw, idx) => (
                  <div key={idx} className="glass p-6.5 rounded-3xl border border-white/5 flex flex-col gap-2 shadow-md hover:border-gold-accent/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-gold-soft flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-white leading-tight">{aw.title}</h4>
                    <span className="text-[10px] font-bold text-gold-accent uppercase font-sans mt-1">{aw.year} &bull; {aw.body}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 10. Client Testimonials (Infinite scroll list or carousel) */}
        <FadeUpSection>
          <Testimonials />
        </FadeUpSection>

        {/* 11. Instagram Feed Grid (Simulated live feed) */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#050816] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 text-center">
              
              <div className="flex flex-col gap-3.5 mb-14">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">SOCIAL DIARY</span>
                <h2 className="font-display font-black text-3xl text-white">Instagram Feed</h2>
                <p className="text-xs text-[#BFC8E6]/80 max-w-sm mx-auto font-sans">Follow our live decoration setups and software deployment runs on social media handles.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  '/images/wedding_decoration_1782729925686.jpg',
                  '/images/sws_robot_decor_1783346269673.jpg',
                  '/images/birthday_decor.jpg',
                  '/images/church_decor.jpg',
                  '/images/drone_photography.jpg',
                  '/images/portrait_shoot.jpg'
                ].map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedGalleryImage(img)}
                    className="relative h-36 rounded-2xl overflow-hidden border border-white/10 shadow-sm cursor-pointer group"
                  >
                    <Image 
                      src={img} 
                      alt="Instagram Post" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100" 
                    />
                    <div className="absolute inset-0 bg-gold-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                      <span className="text-[9px] font-black font-sans uppercase tracking-wider bg-[#050816]/80 px-2.5 py-1.5 rounded-xl border border-white/10">VIEW POST</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* 12. Statistics (Animated number counters) */}
        <FadeUpSection>
          <section className="py-20 bg-[#0B1023] border-t border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center select-none">
                {[
                  { label: 'Happy Clients', count: stats.happyClients, suffix: '+' },
                  { label: 'Events Completed', count: stats.projects, suffix: '+' },
                  { label: 'Software Projects', count: stats.software, suffix: '+' },
                  { label: 'Vehicles In Fleet', count: stats.vehicles, suffix: '' },
                  { label: 'Years Experience', count: stats.experience, suffix: '+' }
                ].map((st, idx) => (
                  <div key={idx} className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-2.5 shadow-md hover:border-gold-accent/25 hover:-translate-y-1.5 transition-all duration-300">
                    <span className="text-3xl sm:text-4xl font-display font-black leading-none">
                      <CounterNumber value={st.count} suffix={st.suffix} />
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeUpSection>

        {/* Interactive Group History Timeline */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#050816]">
            <div className="max-w-7xl mx-auto px-6">
              <InteractiveTimeline />
            </div>
          </section>
        </FadeUpSection>

        {/* 13. FAQ Accordion (Modern glass accordion) */}
        <FadeUpSection>
          <section className="section-premium-padding bg-[#050816] relative overflow-hidden border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6">
              
              <div className="flex flex-col gap-3.5 mb-14 text-center max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">HAVE QUESTIONS?</span>
                <h2 className="font-display font-black text-3xl text-white">Frequently Asked</h2>
              </div>

              <div className="flex flex-col gap-4 text-left select-none">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer text-white font-display font-bold text-sm"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-gold-accent transition-transform duration-300 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-6 text-xs text-[#BFC8E6]/85 font-sans leading-relaxed border-t border-white/3 pt-4">
                            {faq.a}
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
          <section className="section-premium-padding bg-[#0B1023] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* Left Column: Contact Details */}
                <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
                  <div className="flex flex-col gap-3.5 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                      PARTNER WITH US
                    </span>
                    <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                      Let's Build Something Amazing.
                    </h2>
                    <p className="text-xs text-[#BFC8E6]/80 font-sans leading-relaxed max-w-sm">
                      Connect with our engineering leads and directors to sketch out your requirements. Get a personalized quote.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 text-xs font-sans text-left mt-2">
                    {[
                      { icon: Phone, title: 'Call Office', desc: '076 898 8970 / 075 092 8078', action: 'tel:0768988970' },
                      { icon: Mail, title: 'Email Inbox', desc: 'info.mahdev.lk@gmail.com', action: 'mailto:info.mahdev.lk@gmail.com' },
                      { icon: MessageSquare, title: 'Direct WhatsApp', desc: 'Launch chat stream', action: 'https://wa.me/94768988970?text=Hi%20Mahdev' }
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
                            <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold">{det.title}</span>
                            <span className="text-white font-semibold group-hover:text-gold-soft transition-colors">{det.desc}</span>
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

      {/* Custom cost estimator calculator embedded modal trigger */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2.5 items-start pointer-events-auto">
        <button
          onClick={() => setLoginOpen(true)}
          className="p-3.5 rounded-full bg-gold-accent hover:bg-gold-soft text-navy-dark shadow-[0_4px_25px_rgba(212,175,55,0.45)] hover:scale-105 transition-all select-none border border-gold-accent cursor-pointer flex items-center justify-center"
          title="Client Login Portal"
        >
          <User className="w-5 h-5 font-black" />
        </button>
      </div>

      {/* WhatsApp Floating Sticky Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 items-end pointer-events-auto">
        {/* Cost Estimator Drawer */}
        <button
          onClick={() => {
            const contactSec = document.getElementById('contact');
            if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-3.5 rounded-full bg-navy-light text-gold-soft shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gold-accent/25 hover:border-gold-accent hover:scale-105 transition-all select-none cursor-pointer flex items-center justify-center"
          title="Open Cost Estimator"
        >
          <Calculator className="w-5 h-5" />
        </button>

        {/* WhatsApp Icon */}
        <a
          href="https://wa.me/94768988970?text=Hi%20Mahdev"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:scale-105 transition-all select-none cursor-pointer flex items-center justify-center"
          title="Direct WhatsApp Helpline"
        >
          <FaWhatsapp className="w-5.5 h-5.5" />
        </a>
      </div>

      {/* Back to Top scroll progress circle button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-3.5 rounded-full bg-navy-light border border-white/10 hover:border-gold-accent/40 text-gold-soft hover:text-white shadow-xl z-40 cursor-pointer flex items-center justify-center"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global Interactive Search Modal overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating AI Chat Assistant Support widget */}
      <AIAssistant onOpenBooking={() => setBookingOpen(true)} />

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
              <video 
                src={activeVideo} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
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

    </div>
  );
}
