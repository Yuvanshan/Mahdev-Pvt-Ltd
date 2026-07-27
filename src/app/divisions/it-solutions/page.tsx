'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Cpu, Globe, Server, Database, Code, BookOpen, Shield, Check, X, ArrowUpRight, MessageSquare, Play, Layers, Laptop } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';
import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';

const terminalLogs = [
  'Initializing Mahdev IT Cloud Server Deployment...',
  'Syncing global edge CDNs via AWS Cloudfront...',
  'Connecting PostgreSQL master clusters on RDS...',
  'Booting POS double-entry stock modules...',
  '✓ Edge API gateway online at node-lk-1.mahdev.net',
  'Ready for enterprise transaction stream processing.'
];

const itProjects = [
  {
    id: 'erp',
    title: 'Mahdev Enterprise ERP',
    img: '/images/saas_dashboard.jpg',
    desc: 'Bespoke double-entry ledger bookkeeping and multi-warehouse inventory tracker suited for large retail & hotels.',
    features: ['Double-Entry Ledger accounting', 'Multi-Warehouse real-time stock registers', 'Dynamic tax reports generation (VAT/GST)'],
    tech: ['Next.js', 'PostgreSQL', 'Docker', 'AWS RDS'],
    demo: 'https://demo-erp.mahdev.lk'
  },
  {
    id: 'pos',
    title: 'Cloud POS Registers',
    img: '/images/it_robot_developer_1783346302442.jpg',
    desc: 'Offline-first cash register system with thermal slip receipt printing and automatic main branch inventory synchronization.',
    features: ['Offline-first checkout billing', 'Bluetooth thermal printers integration', 'Automatic background register syncs'],
    tech: ['React Native', 'SQLite', 'Node.js', 'Socket.io'],
    demo: 'https://demo-pos.mahdev.lk'
  },
  {
    id: 'webdev',
    title: 'High-Fidelity Next.js Platforms',
    img: '/images/wedding_decoration_1782729925686.jpg',
    desc: 'Vibrant custom web portals featuring high-fidelity glassmorphism, fluid animations, and optimal Core Web Vitals scores.',
    features: ['Fluid responsive layout templates', '100% Core Web Vitals audit targets', 'Structured SEO schema graph injections'],
    tech: ['Next.js', 'Framer Motion', 'Tailwind v4', 'Vercel Edge'],
    demo: 'https://mahdev.lk'
  },
  {
    id: 'mobile',
    title: 'Native iOS & Android Apps',
    img: '/images/u1_robot_camera_1783346286743.jpg',
    desc: 'Secure cross-platform corporate apps with real-time syncs, offline caching, and native biometric face/touch authentication.',
    features: ['Biometric secure login flow', 'Push notification alerts dispatcher', 'Interactive map tracking features'],
    tech: ['Flutter', 'Dart', 'Firebase Auth', 'Firestore'],
    demo: 'https://apps.apple.com/mahdev'
  },
  {
    id: 'cloud',
    title: 'AWS & Azure Cloud Orchestration',
    img: '/images/saas_dashboard.jpg',
    desc: 'Elastic load balanced server clusters, secure VPC networks, and continuous integration deployments.',
    features: ['Kubernetes cluster management (EKS)', 'Github Actions CD/CI automation pipelines', 'Automated security patching rules'],
    tech: ['Terraform', 'Kubernetes', 'Docker', 'AWS IAM'],
    demo: 'https://infrastructure.mahdev.lk'
  },
  {
    id: 'hosting',
    title: 'Managed Secure Cloud Hosting',
    img: '/images/it_robot_developer_1783346302442.jpg',
    desc: '99.99% guaranteed uptime hosting with DDoS protection, auto-renewing SSL certificates, and daily encrypted database backups.',
    features: ['Free automated Let\'s Encrypt SSL', 'Daily encrypted database snapshots backup', 'Cloudflare Proxy DDoS protection shield'],
    tech: ['Ubuntu Server', 'Nginx Reverse Proxy', 'Cloudflare CDN'],
    demo: 'https://hosting.mahdev.lk'
  },
  {
    id: 'automation',
    title: 'Business Workflow Automation',
    img: '/images/saas_dashboard.jpg',
    desc: 'System triggers to dispatch automated invoices to emails, customer alerts to WhatsApp, and trigger transactional newsletters.',
    features: ['WhatsApp Twilio API integrations', 'Automated PDF Invoice generating engine', 'Real-time transactional email funnels'],
    tech: ['Python', 'Celery Queue', 'Redis Cache', 'SendGrid API'],
    demo: 'https://automation.mahdev.lk'
  }
];

export default function ItSolutions() {
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [coverImg, setCoverImg] = useState('/images/it_robot_developer_1783346302442.jpg');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.it) setCoverImg(d.it);
      }
    });
    return () => unsub();
  }, []);

  // Terminal logging simulator
  useEffect(() => {
    if (terminalIndex >= terminalLogs.length) return;
    const interval = setTimeout(() => {
      setLogs(prev => [...prev, terminalLogs[terminalIndex]]);
      setTerminalIndex(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(interval);
  }, [terminalIndex]);

  // Interactive mouse-reactive neural grid canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const maxNodes = 65;

    for (let i = 0; i < maxNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Render grid coordinate lines (Cyber grid)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw interactive connections
      for (let i = 0; i < maxNodes; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes close to each other
        for (let j = i + 1; j < maxNodes; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 - dist / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Connect nodes close to mouse cursor
        const mDist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (mDist < 150) {
          ctx.strokeStyle = `rgba(223, 186, 115, ${0.35 - mDist / 150})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-navy-dark text-left">
      <Navbar />

      <main className="min-h-screen pt-20 relative overflow-hidden">
        {/* Cyber canvas background */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-40" />

        {/* Hero banner */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden z-10">
          <Image 
            src={coverImg} 
            alt="IT Solutions Banner" 
            fill
            priority
            className="object-cover brightness-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-blue-500/35 text-blue-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV IT SOLUTIONS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              Delivering <span className="text-gradient-purple-blue">Cloud-Scale Tech</span>
            </h1>
            <p className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              We design double-entry inventory ERP systems, real-time POS checkouts, high-load cloud integrations, and bespoke corporate web platforms.
            </p>
          </div>
        </section>

        {/* Software Showcase Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-accent">SOFTWARE STACK</span>
            <h2 className="font-display font-black text-3xl text-white">Bespoke Software Showcase</h2>
            <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-md mx-auto">Explore pre-engineered products ready for deployment or request a customized software scope.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {itProjects.map((proj) => (
              <div 
                key={proj.id}
                className="glass rounded-3xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 flex flex-col hover:translate-y-[-4px] shadow-xl text-left"
              >
                {/* Visual Screenshot container */}
                <div className="relative h-56 w-full overflow-hidden group">
                  <Image 
                    src={proj.img} 
                    alt={proj.title} 
                    fill 
                    className="object-cover group-hover:scale-102 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/10 to-transparent" />
                  <a 
                    href={proj.demo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 px-3 py-1 rounded bg-black/60 hover:bg-gold-accent hover:text-navy-dark text-[10px] font-bold text-gold-soft uppercase tracking-wider border border-white/10 flex items-center gap-1 transition-all"
                  >
                    LIVE DEMO <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-6 sm:p-8 flex flex-col flex-1 gap-5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-blue-400 font-mono">Division Package</span>
                    <h3 className="font-display font-bold text-xl text-white mt-1">{proj.title}</h3>
                    <p className="font-sans text-xs text-gray-400 mt-2 leading-relaxed">{proj.desc}</p>
                  </div>

                  {/* Bullet features */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Key Features:</h4>
                    <ul className="flex flex-col gap-2 font-sans text-xs text-gray-300">
                      {proj.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technology stack */}
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                    <h4 className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Technology Stack:</h4>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {proj.tech.map((t, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white font-mono">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Booking actions */}
                  <div className="flex gap-3 mt-2">
                    <button 
                      onClick={() => setShowBooking(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest rounded-xl hover:brightness-110 cursor-pointer"
                    >
                      REQUEST QUOTE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive bash terminal */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Terminal explanation */}
            <div className="lg:col-span-6 flex flex-col gap-4 text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">SYSTEM CONSOLE LOG</span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Cloud Deployment Server Console</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-sans leading-relaxed">Observe real-time operations of our server deployment engine through the simulated web terminal stream on the right.</p>
              
              <div className="p-4 rounded-xl bg-navy-medium/30 border border-white/5 flex flex-col gap-2.5 font-sans text-xs mt-4">
                <div className="flex justify-between text-gray-400">
                  <span>API Response Speed</span>
                  <span className="text-green-400 font-bold">14ms average</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>SSL Handshake status</span>
                  <span className="text-green-400 font-bold">SHA-256 Verified</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Cloud Uptime</span>
                  <span className="text-green-400 font-bold">99.99% Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Right side: Interactive Shell */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-black border border-white/10 shadow-2xl overflow-hidden font-mono text-[11px] sm:text-xs text-left">
                <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5 text-gold-accent" /> bash shell console
                  </span>
                </div>

                <div className="p-6 flex flex-col gap-3 min-h-[190px] text-green-400">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 leading-relaxed">
                      <span className="text-gray-500 shrink-0">$</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {terminalIndex < terminalLogs.length && (
                    <div className="flex gap-1 items-center">
                      <span className="text-gray-500">$</span>
                      <span className="w-2 h-4 bg-green-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Global Booking System Modal Overlay */}
        <AnimatePresence>
          {showBooking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(false)}
              className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-3xl relative"
              >
                <button
                  onClick={() => setShowBooking(false)}
                  className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision="it-solutions" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
