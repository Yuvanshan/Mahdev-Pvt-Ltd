'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Cpu, Globe, Server, Database, Code, BookOpen, Shield, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const terminalLogs = [
  'Initializing Mahdev IT Cloud Server Deployment...',
  'Syncing global edge CDNs via AWS Cloudfront...',
  'Connecting PostgreSQL master clusters on RDS...',
  'Booting POS double-entry stock modules...',
  '✓ Edge API gateway online at node-lk-1.mahdev.net',
  'Ready for enterprise transaction stream processing.'
];

export default function ItSolutions() {
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20 relative overflow-hidden">
        {/* Mouse reactive cyber canvas grid background */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-40" />

        {/* Hero banner */}
        <section className="relative h-[65vh] flex items-center justify-center overflow-hidden z-10">
          <Image 
            src="/images/it_robot_developer_1783346302442.jpg" 
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
            <button 
              onClick={() => setShowBooking(true)}
              className="mt-4 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest"
            >
              BOOK IT CONSULTATION
            </button>
          </div>
        </section>

        {/* IT Services Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">TECHNICAL CAPABILITIES</span>
            <h2 className="font-display font-black text-3xl text-white">Full-Stack Enterprise Offerings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Cpu, title: 'Custom ERPs', desc: 'Accounting ledgers, stock registers, hotel bookings, and student database management tools.' },
              { icon: Globe, title: 'React / Next.js Web', desc: 'Vibrant web portals with high-fidelity glassmorphism, SEO setup, and fast server load times.' },
              { icon: Server, title: 'Server Deployments', desc: 'AWS node clusters, docker containers, load balancers, and PostgreSQL redundancy configurations.' },
              { icon: Shield, title: 'System Security Audit', desc: 'Penetration tests, firewalls configuration, database encryption, and cloud vulnerability scans.' }
            ].map((serv, idx) => {
              const Icon = serv.icon;
              return (
                <div key={idx} className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-gold-accent">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-base">{serv.title}</h4>
                    <p className="font-sans text-xs text-gray-400 mt-2 leading-relaxed">{serv.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Code Console Terminal & POS Dashboard */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Terminal */}
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
    </>
  );
}
