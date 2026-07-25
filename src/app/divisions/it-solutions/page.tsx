'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, Globe, Sparkles, Shield, ChevronRight, X, Layers, Network, Database, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

interface ConsoleLine {
  text: string;
  type: 'info' | 'success' | 'warn';
}

export default function ItSolutions() {
  const [showBooking, setShowBooking] = useState(false);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([
    { text: 'SYSTEM BOOT: Loading Mahdev Cloud Modules...', type: 'info' }
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Simulation of active developer terminal logging
  useEffect(() => {
    const logs = [
      { text: 'INIT: Connecting to Firestore database clusters...', type: 'info' },
      { text: 'DB: Handshake successful. Status: ONLINE', type: 'success' },
      { text: 'AWS: Syncing primary ECS Docker containers...', type: 'info' },
      { text: 'POS: Thermal printing queues listening on port 9100', type: 'info' },
      { text: 'SEC: Cloudflare firewall active. 0 threat activities.', type: 'success' },
      { text: 'ERP: Multi-warehouse ledgers calculations completed.', type: 'success' },
      { text: 'AI: Tensor core prediction layers warmed (0.12ms)', type: 'info' },
      { text: 'SYS: CPU load at 4.2%. RAM at 32%. Memory heap clean.', type: 'info' },
      { text: 'WARN: Local printer cache close to threshold. Auto-purged.', type: 'warn' }
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setConsoleLines(prev => {
        const next = [...prev, logs[currentLog] as ConsoleLine];
        if (next.length > 8) next.shift(); // keep it compact
        return next;
      });
      currentLog = (currentLog + 1) % logs.length;
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // 2. Animated node connection canvas grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 300);

    const nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const maxNodes = 45;

    for (let i = 0; i < maxNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(5, 11, 22, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw digital background grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 30;
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

      // Draw node nodes and coordinate lines
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      for (let i = 0; i < maxNodes; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < maxNodes; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, 1 - dist / 75) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = 300;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/it_robot_developer_1783346302442.jpg" 
            alt="IT Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-blue-500/35 text-blue-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV IT SOLUTIONS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              Engineering <span className="text-gradient-purple-blue">Dynamic Abstractions</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              We design and coordinate high-availability cloud frameworks, double-entry inventory ERP systems, and custom client mobile applications.
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest shadow-lg shadow-gold-accent/15"
            >
              BOOK TECHNICAL CONSULTATION
            </button>
          </div>
        </section>

        {/* Console & Tech Grid Display */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Console Panel */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">REALTIME SYSTEM GRID</span>
              <h2 className="font-display font-black text-3xl text-white">Active Server Infrastructure</h2>
              <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">We orchestrate our software suites using decoupled Docker containers, serverless endpoints, and Google Cloud security layers. Check out our simulated runtime server node connections below:</p>

              {/* Dynamic canvas grid node node drawer */}
              <div className="w-full h-[300px] rounded-3xl overflow-hidden glass border border-blue-500/20 relative shadow-2xl bg-navy-dark">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </div>

            {/* Right Shell Output */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <div className="w-full rounded-2xl bg-[#030712] border border-white/10 p-5 font-mono text-[10px] sm:text-xs text-gray-400 flex flex-col gap-2.5 shadow-2xl h-[380px] overflow-hidden justify-end">
                <div className="flex items-center gap-2 text-gray-600 border-b border-white/5 pb-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-gray-500 ml-4 font-sans">mahdev-root@colombo-node-1:~</span>
                </div>
                {consoleLines.map((line, lIdx) => (
                  <div key={lIdx} className="flex gap-2">
                    <span className="text-blue-400 select-none">➜</span>
                    <span className={
                      line.type === 'success' ? 'text-green-400 font-semibold' :
                      line.type === 'warn' ? 'text-amber-400 font-semibold' : 'text-gray-300'
                    }>
                      {line.text}
                    </span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2 items-center">
                  <span className="text-blue-400 animate-pulse">➜</span>
                  <span className="text-white animate-pulse font-bold">|</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive IT Capabilities Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              DEVELOPER CAPABILITIES
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Enterprise Software Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'ERP Systems', desc: 'Double-entry bookkeeping, multi-warehouse inventory, and dynamic cash flow summaries.' },
              { icon: Terminal, title: 'POS Terminals', desc: 'SaaS cloud syncing registries with local thermal printing and transaction logs.' },
              { icon: Globe, title: 'Web Development', desc: 'High-fidelity SEO React layouts, Next.js setups, and Vercel CDN routing.' },
              { icon: Sparkles, title: 'AI Solutions', desc: 'Keyword natural-language engines, recomendation systems, and predictive algorithms.' },
              { icon: Shield, title: 'CCTV & Firewalls', desc: 'IP security camera network matrices and custom hardware firewalls configurations.' },
              { icon: Layers, title: 'Mobile Applications', desc: 'Cross-platform Flutter / React Native packages designed for premium client touchpoints.' }
            ].map((serv, idx) => {
              const Icon = serv.icon;
              return (
                <div 
                  key={idx}
                  className="glass p-8 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-blue-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{serv.title}</h3>
                    <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{serv.desc}</p>
                  </div>
                </div>
              );
            })}
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
    </>
  );
}
