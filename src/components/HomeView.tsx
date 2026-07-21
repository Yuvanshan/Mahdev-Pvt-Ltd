import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, 
  Sparkles, Star, TrendingUp, ShieldCheck, Zap, Server, Globe, Cpu, Award,
  Timer, Building2, Heart, Briefcase, ExternalLink
} from 'lucide-react';
import { ActivePage, ServiceCard, Leader, ThemeSettings, CompanyStatistic, CountdownSettings, TrustableClient, CompletedProject } from '../types';
import { SERVICES_LIST, COMPANY_CONTACT } from '../data';
import PremiumHero from './PremiumHero';

// Generated 3D Image References
import swsRobotImgAsset from '../assets/images/sws_robot_decor_1783346269673.jpg';
import u1RobotImgAsset from '../assets/images/u1_robot_camera_1783346286743.jpg';
import itRobotImgAsset from '../assets/images/it_robot_developer_1783346302442.jpg';
import travelsRobotImgAsset from '../assets/images/travels_robot_car_1783346316762.jpg';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  isDarkMode: boolean;
  servicesList?: ServiceCard[];
  leadersList?: Leader[];
  themeSettings?: ThemeSettings;
  statistics?: CompanyStatistic[];
  countdownSettings?: CountdownSettings;
  clients?: TrustableClient[];
  completedProjects?: CompletedProject[];
}

// Scroll-triggered Motion Container Component
function RevealSection({ children, className = '', delay = 0, yOffset = 30 }: { children: React.ReactNode; className?: string; delay?: number; yOffset?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomeView({ 
  setActivePage, 
  isDarkMode, 
  themeSettings,
  statistics = [],
  countdownSettings,
  clients = [],
  completedProjects = []
}: HomeViewProps) {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!countdownSettings?.enabled || !countdownSettings?.targetDate) return;
    const update = () => {
      const diff = new Date(countdownSettings.targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [countdownSettings]);

  // Icon resolver for statistics
  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={28} />;
      case 'Globe': return <Globe size={28} />;
      case 'Briefcase': return <Briefcase size={28} />;
      case 'Heart': return <Heart size={28} />;
      case 'Award': return <Award size={28} />;
      case 'Zap': return <Zap size={28} />;
      case 'Building2': return <Building2 size={28} />;
      default: return <Star size={28} />;
    }
  };

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoClick = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const swsRobotImgDynamic = themeSettings?.decorationBanner || swsRobotImgAsset;
  const u1RobotImgDynamic = themeSettings?.photographyBanner || u1RobotImgAsset;
  const itRobotImgDynamic = themeSettings?.itBanner || itRobotImgAsset;
  const travelsRobotImgDynamic = themeSettings?.travelsBanner || travelsRobotImgAsset;

  const heroCards = [
    {
      id: 1,
      title: 'SWS Event Management',
      subtitle: 'Celebrations & Styling',
      color: 'from-pink-600 to-rose-600',
      borderColor: 'border-pink-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-pink-400',
      image: swsRobotImgDynamic,
      page: ActivePage.Decoration
    },
    {
      id: 2,
      title: 'Studio U1',
      subtitle: 'Photography & Cinematography',
      color: 'from-purple-600 to-indigo-600',
      borderColor: 'border-purple-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-purple-400',
      image: u1RobotImgDynamic,
      page: ActivePage.Photography
    },
    {
      id: 3,
      title: 'Mahdev IT & Solutions',
      subtitle: 'ERP & Digital Transformation',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-blue-400',
      image: itRobotImgDynamic,
      page: ActivePage.ItSolutions
    },
    {
      id: 4,
      title: 'Mahdev Travels',
      subtitle: 'Luxury Tours & Fleet Services',
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-amber-400',
      image: travelsRobotImgDynamic,
      page: ActivePage.Travels
    }
  ];

  // 4 Solutions Data
  const solutions = [
    {
      id: 'erp',
      title: 'Mahdev ERP',
      description: 'Smart, scalable and powerful business management.',
      image: itRobotImgDynamic,
      page: ActivePage.ItSolutions,
      gradient: 'from-purple-900/60 to-indigo-950/80 border-purple-500/30 group-hover:border-purple-500/70',
      tagColor: 'text-purple-400'
    },
    {
      id: 'u1',
      title: 'Studio U1 Photography',
      description: 'Capturing moments, creating memories that last forever.',
      image: u1RobotImgDynamic,
      page: ActivePage.Photography,
      gradient: 'from-amber-900/60 to-yellow-950/80 border-amber-500/30 group-hover:border-amber-500/70',
      tagColor: 'text-amber-400'
    },
    {
      id: 'sws',
      title: 'SWS Event Management',
      description: 'Flawless planning, breath-taking events, exceptional execution.',
      image: swsRobotImgDynamic,
      page: ActivePage.Decoration,
      gradient: 'from-pink-900/60 to-rose-950/80 border-pink-500/30 group-hover:border-pink-500/70',
      tagColor: 'text-pink-400'
    },
    {
      id: 'travels',
      title: 'Mahdev Travels',
      description: 'Travel made easy, comfortable and memorable.',
      image: travelsRobotImgDynamic,
      page: ActivePage.Travels,
      gradient: 'from-cyan-900/60 to-blue-950/80 border-cyan-500/30 group-hover:border-cyan-500/70',
      tagColor: 'text-cyan-400'
    }
  ];

  // Journey Timeline Steps
  const journeyMilestones = [
    { year: '2019', title: 'The Beginning', desc: 'Mahdev Pvt Ltd was founded.', icon: '🚀' },
    { year: '2021', title: 'First Solution', desc: 'Launched our first digital product.', icon: '💡' },
    { year: '2022', title: 'ERP Launch', desc: 'Mahdev ERP officially launched.', icon: '⚙️' },
    { year: '2023', title: 'Expanding', desc: 'Served 100+ happy clients.', icon: '📈' },
    { year: '2024', title: 'New Horizons', desc: 'Studio U1 & Event Management.', icon: '🌐' },
    { year: '2025', title: 'Global Vision', desc: 'Building solutions for the world.', icon: '👑' },
  ];

  // Why Choose Mahdev Features
  const features = [
    { title: 'Innovation', desc: 'We create smart innovative solutions.', icon: <Zap className="text-purple-400" size={20} /> },
    { title: 'Reliability', desc: 'You can count on us, always.', icon: <ShieldCheck className="text-purple-400" size={20} /> },
    { title: 'Security', desc: 'Enterprise grade security.', icon: <Server className="text-purple-400" size={20} /> },
    { title: '24/7 Support', desc: "We're here for you anytime.", icon: <Globe className="text-purple-400" size={20} /> },
    { title: 'Scalability', desc: 'Solutions that grow with your business.', icon: <Cpu className="text-purple-400" size={20} /> },
    { title: 'Results', desc: 'Focused on delivering real impact.', icon: <Award className="text-purple-400" size={20} /> },
  ];

  // Client Testimonials
  const testimonials = [
    {
      name: 'Ramesh Perera',
      role: 'CEO, Abans',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=150&h=150',
      comment: 'Mahdev ERP has completely transformed the way we manage our business. The automated invoicing and real-time reports save us over 20 hours every week!'
    },
    {
      name: 'Thilini Jayawardena',
      role: 'Marketing Head, Softlogic',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=150&h=150',
      comment: 'Professional, reliable and result-driven service. From SWS decor for our corporate gala to cinematic videography by Studio U1, highly recommended!'
    },
    {
      name: 'Nimal Fernando',
      role: 'Owner, Retail Store',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150',
      comment: 'The support team is amazing! Always there when we need them. The ERP system works seamlessly across all our retail branches.'
    }
  ];

  // Partners Logo List
  const partners = [
    'Abans', 'softlogic', 'Daraz', 'Keells', 'SINGER', 'Coca-Cola', 'Dialog'
  ];

  return (
    <div className={`relative w-full overflow-hidden font-sans ${
      isDarkMode ? 'bg-[#06070a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. HERO SECTION */}
      <PremiumHero 
        isDarkMode={isDarkMode} 
        onNavigate={handleNavClick}
        cards={heroCards}
        themeSettings={themeSettings}
      />

      {/* 2. OUR SOLUTIONS SECTION */}
      <section id="solutions-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <RevealSection className="text-left mb-12">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
            OUR SOLUTIONS
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Four Powerful <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">Solutions</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Innovative products and services designed to drive your business forward.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-purple-500/40 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2.5 rounded-full border border-purple-500/40 bg-purple-600 text-white hover:bg-purple-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </RevealSection>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((sol, idx) => (
            <RevealSection key={sol.id} delay={idx * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleNavClick(sol.page)}
                className={`relative rounded-3xl border p-4 bg-gradient-to-b ${sol.gradient} backdrop-blur-xl shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between h-[360px] overflow-hidden`}
              >
                {/* 3D Robot Image Frame */}
                <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
                  <img 
                    src={sol.image} 
                    alt={sol.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="p-2 text-left space-y-2 relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                    {sol.title}
                  </h3>
                  <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                    {sol.description}
                  </p>
                </div>

                {/* Arrow Icon Button */}
                <div className="flex justify-end p-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* 3. SMARTER BUSINESS MANAGEMENT SECTION (INTELLIGENT ERP PLATFORM) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* DASHBOARD MOCKUP PREVIEW (LEFT SIDE) */}
          <RevealSection className="lg:col-span-7">
            <div className="relative rounded-3xl border border-purple-500/30 p-5 bg-slate-950/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(124,58,237,0.2)] overflow-hidden text-left">
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                    M
                  </div>
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                    Dashboard
                  </span>
                </div>
                <div className="w-24 h-6 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-center">
                  Search...
                </div>
              </div>

              {/* Stats Widgets Row */}
              <div className="grid grid-cols-3 gap-3 py-4">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Total Revenue</span>
                  <div className="text-sm sm:text-base font-extrabold text-white mt-1">Rs. 1,45,000</div>
                  <span className="text-[9px] text-emerald-400 font-semibold">+12.5%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Total Orders</span>
                  <div className="text-sm sm:text-base font-extrabold text-white mt-1">320</div>
                  <span className="text-[9px] text-emerald-400 font-semibold">+8.2%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Total Customers</span>
                  <div className="text-sm sm:text-base font-extrabold text-white mt-1">1,245</div>
                  <span className="text-[9px] text-emerald-400 font-semibold">+15.3%</span>
                </div>
              </div>

              {/* Chart Visualizations Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 h-40 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Sales Overview</span>
                    <TrendingUp size={14} className="text-purple-400" />
                  </div>
                  <div className="w-full h-24 bg-gradient-to-t from-purple-600/30 to-transparent rounded-xl border-b-2 border-purple-500 flex items-end justify-between px-2 pb-1 text-[8px] font-mono text-purple-300">
                    <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 h-40 flex flex-col justify-between">
                  <span className="text-xs text-slate-400">Top Categories</span>
                  <div className="flex items-center justify-center my-auto">
                    <div className="w-20 h-20 rounded-full border-8 border-purple-500 border-t-pink-500 border-r-amber-400 animate-spin" style={{ animationDuration: '25s' }} />
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* FEATURE DESCRIPTION (RIGHT SIDE) */}
          <RevealSection className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
              SMARTER BUSINESS MANAGEMENT
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              All Your Business.<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                One Intelligent Platform.
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Mahdev ERP helps you manage every aspect of your business in one place - from sales and stock to customers and reports.
            </p>

            <div className="space-y-3 pt-1">
              {[
                'Sales & Inventory Management',
                'Customer Relationship Management',
                'Reports & Analytics',
                'Multiple Branch Support'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleNavClick(ActivePage.ItSolutions)}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer border-none"
            >
              <span>Explore ERP</span>
              <ArrowRight size={14} />
            </button>
          </RevealSection>

        </div>
      </section>

      {/* 4. OUR JOURNEY SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <RevealSection className="text-center mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
            OUR JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            A Journey of <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">Innovation</span>
          </h2>
        </RevealSection>

        {/* TIMELINE STEPPER GRID */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
          {journeyMilestones.map((m, idx) => (
            <RevealSection key={m.year} delay={idx * 0.1}>
              <div className="relative text-center p-4 rounded-2xl border border-purple-500/20 bg-slate-950/60 backdrop-blur-xl hover:border-purple-500/60 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center text-lg mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <div className="text-xs font-mono font-bold text-purple-400">{m.year}</div>
                <h4 className="text-xs font-bold text-white mt-1">{m.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{m.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE MAHDEV SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <RevealSection className="text-center mb-16">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
            WHY CHOOSE MAHDEV
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            We Combine Technology, Creativity & <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Expertise</span>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {features.map((feat, idx) => (
            <RevealSection key={feat.title} delay={idx * 0.08}>
              <div className="p-5 rounded-2xl border border-purple-500/20 bg-slate-950/60 backdrop-blur-xl text-center hover:border-purple-500/60 hover:-translate-y-1 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{feat.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <RevealSection className="text-left mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              Trusted by Amazing <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Clients</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTestimonialIdx((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
              className="p-2.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setActiveTestimonialIdx((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
              className="p-2.5 rounded-full border border-purple-500/40 bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <RevealSection key={t.name} delay={idx * 0.1}>
              <div className="p-6 rounded-3xl border border-purple-500/20 bg-slate-950/70 backdrop-blur-xl text-left space-y-4 hover:border-purple-500/50 transition-all flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-purple-500/40" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* 7. CTA BANNER SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <RevealSection>
          <div className="relative rounded-3xl border border-purple-500/40 p-8 sm:p-12 bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-purple-900/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(124,58,237,0.3)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-purple-400 shadow-xl hidden sm:block">
                <img src={itRobotImgAsset} alt="Robot Call" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Let's build something amazing together.
                </p>
              </div>
            </div>

            <button
              onClick={handleDemoClick}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer border-none shrink-0"
            >
              <span>Get A Free Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </RevealSection>
      </section>

      {/* 8. CLIENTS & PARTNERS LOGO BAR */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60 relative z-10">
        <RevealSection className="text-center space-y-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            OUR CLIENTS & PARTNERS
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70">
            {partners.map((p) => (
              <span key={p} className="text-base sm:text-lg font-black tracking-wider text-slate-400 hover:text-white transition-colors uppercase font-mono">
                {p}
              </span>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ─── COMPANY STATISTICS SECTION ─── */}
      {statistics.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <RevealSection className="text-center mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-3">By The Numbers</span>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Our Impact in Numbers
              </h2>
            </RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...statistics].sort((a, b) => (a.order || 0) - (b.order || 0)).map((stat, i) => (
                <RevealSection key={stat.id} delay={i * 0.1}>
                  <div className={`rounded-2xl border p-6 text-center group transition-all hover:scale-[1.03] ${
                    isDarkMode 
                      ? 'bg-gradient-to-b from-purple-500/5 to-transparent border-purple-500/15 hover:border-purple-500/40 hover:bg-purple-500/10' 
                      : 'bg-white border-slate-100 shadow-md hover:shadow-xl'
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400 ${
                      isDarkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'
                    }`}>
                      {getStatIcon(stat.icon)}
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tabular-nums">
                      {stat.value}<span className="text-purple-400">{stat.suffix}</span>
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stat.label}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── COUNTDOWN BANNER ─── */}
      {countdownSettings?.enabled && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-b border-amber-500/15">
          {countdownSettings.backgroundImage && (
            <div className="absolute inset-0">
              <img src={countdownSettings.backgroundImage} alt="" className="w-full h-full object-cover opacity-15" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950" />
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer size={18} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 font-mono">Limited Time Offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{countdownSettings.title}</h2>
            <p className="text-sm text-slate-300 mb-8">{countdownSettings.description}</p>
            
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
              {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours }, { label: 'Mins', value: timeLeft.minutes }, { label: 'Secs', value: timeLeft.seconds }].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/5 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white tabular-nums shadow-lg">
                    {String(value).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-2">{label}</span>
                </div>
              ))}
            </div>

            {countdownSettings.buttonLabel && (
              <a
                href={countdownSettings.buttonLink || '#contact'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
              >
                {countdownSettings.buttonLabel}
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── COMPLETED PROJECTS ─── */}
      {completedProjects.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <RevealSection className="text-center mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-3">Portfolio</span>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Completed Projects
              </h2>
              <p className={`text-sm mt-2 max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                A curated showcase of our finest work across all four divisions.
              </p>
            </RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {completedProjects.map((project, i) => (
                <RevealSection key={project.id} delay={i * 0.08}>
                  <div className={`group rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] ${
                    isDarkMode ? 'border-purple-500/10 hover:border-purple-500/30' : 'border-slate-100 shadow-md hover:shadow-xl'
                  }`}>
                    <div className="h-48 overflow-hidden bg-slate-800 relative">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                        project.category.includes('SWS') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        project.category.includes('IT') ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        project.category.includes('Photo') ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>{project.category}</span>
                    </div>
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-900/60' : 'bg-white'}`}>
                      <h3 className={`text-sm font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{project.title}</h3>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{project.description}</p>
                      {project.completionDate && (
                        <span className="text-[10px] text-slate-500 font-mono mt-2 block">{project.completionDate}</span>
                      )}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUSTABLE CLIENTS ─── */}
      {clients.length > 0 && (
        <section className={`py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t ${
          isDarkMode ? 'border-slate-800/60' : 'border-slate-100'
        }`}>
          <div className="max-w-7xl mx-auto">
            <RevealSection className="text-center mb-12">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-3">Trusted By</span>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Our Trustable Clients
              </h2>
            </RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {clients.map((client, i) => (
                <RevealSection key={client.id} delay={i * 0.08}>
                  <div className={`rounded-2xl border p-5 h-full flex flex-col gap-3 ${
                    isDarkMode 
                      ? 'bg-white/3 border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5' 
                      : 'bg-white border-slate-100 shadow-md hover:shadow-lg'
                  } transition-all group`}>
                    <div className="flex items-center gap-3">
                      {client.logo ? (
                        <img src={client.logo} alt={client.companyName} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-white/10" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                          isDarkMode ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {client.companyName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{client.companyName}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{client.industry}</div>
                      </div>
                    </div>
                    {client.review && (
                      <p className={`text-xs leading-relaxed italic flex-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        "{client.review}"
                      </p>
                    )}
                    <div className={`text-[10px] font-bold pt-2 border-t ${isDarkMode ? 'border-white/8 text-purple-400' : 'border-slate-100 text-purple-600'}`}>
                      {client.projectsCompleted} project{parseInt(client.projectsCompleted) !== 1 ? 's' : ''} completed
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
