'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, DollarSign, Calculator, Camera, Cpu, Compass, Eye, Clock, ShieldCheck, 
  User, Lock, CheckCircle, ArrowRight, ArrowLeft, ArrowUpRight, 
  Map, Star, Award, Video, FileText, ChevronRight, HelpCircle, X
} from 'lucide-react';
import * as THREE from 'three';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';

// ----------------------------------------------------------------------
// 1. Before/After Image Slider
// ----------------------------------------------------------------------
export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left w-full max-w-4xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-gold-accent">PRE-SETUP VS FINAL DECOR</span>
        <h3 className="font-display font-bold text-2xl text-white">Visual Venue Transformation</h3>
        <p className="text-xs text-[#BFC8E6]/80 font-sans max-w-md">Drag the divider to compare the empty hall before setup and our custom floral fairy-light canopy setup.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border border-white/8 select-none cursor-ew-resize"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* BEFORE IMAGE (Full size) */}
        <div className="absolute inset-0 w-full h-full bg-navy-light">
          <Image 
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000" 
            alt="Venue Before Decor" 
            fill
            className="object-cover pointer-events-none filter brightness-50"
          />
          <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-xl glass text-[10px] text-white/70 font-semibold tracking-wider font-sans">
            BEFORE (EMPTY HALL)
          </div>
        </div>

        {/* AFTER IMAGE (Clipped based on slider position) */}
        <div 
          className="absolute inset-0 w-full h-full bg-navy-medium overflow-hidden transition-all duration-75"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <Image 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000" 
            alt="Venue After Decor" 
            fill
            className="object-cover pointer-events-none"
          />
          <div className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-gold-accent/20 border border-gold-accent/40 text-[10px] text-gold-soft font-bold tracking-wider font-sans">
            AFTER (SWS DECOR)
          </div>
        </div>

        {/* SLIDER DIVIDER DRAG LINE */}
        <div 
          className="slider-handle"
          style={{ left: `${sliderPos}%` }}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Event Cost Estimator / Calculator
// ----------------------------------------------------------------------
export function EventCostEstimator() {
  const [guests, setGuests] = useState(150);
  const [tier, setTier] = useState<'standard' | 'premium' | 'royal'>('premium');
  const [duration, setDuration] = useState(1); // 1 Day, 2 Days, 3 Days
  const [addons, setAddons] = useState({
    photography: true,
    transport: false,
    erpSoftware: false,
  });

  const getTierRate = () => {
    if (tier === 'standard') return 1200; // rate per guest
    if (tier === 'premium') return 2500;
    return 4800;
  };

  const getAddonsTotal = () => {
    let sum = 0;
    if (addons.photography) sum += 95000;
    if (addons.transport) sum += 65000;
    if (addons.erpSoftware) sum += 150000;
    return sum;
  };

  const calculateEstimate = () => {
    const baseCost = guests * getTierRate();
    const addonCost = getAddonsTotal();
    const total = (baseCost * duration) + addonCost;
    return total;
  };

  const formatLKR = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 text-left grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
      
      {/* Inputs Column */}
      <div className="md:col-span-7 flex flex-col gap-6.5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-[0.2em] text-gold-accent flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> BUDGET PLANNER
          </span>
          <h3 className="font-display font-bold text-2xl text-white">Service Cost Estimator</h3>
          <p className="text-xs text-[#BFC8E6]/80 font-sans">Slide numbers and toggle items to calculate the estimated LKR budget dynamically.</p>
        </div>

        {/* Guest Count Slider */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl glass border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#BFC8E6]">Expected Guests Count</span>
            <span className="font-numbers font-black text-gold-soft text-sm">{guests} Guests</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="1200" 
            step="10"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full accent-gold-accent bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-semibold font-sans">
            <span>Min: 50</span>
            <span>Max: 1200+</span>
          </div>
        </div>

        {/* Tier Select */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-[#BFC8E6]">Service Quality Tier</span>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'standard', title: 'Elite Standard', desc: 'Elegant basics' },
              { id: 'premium', title: 'Luxury Signature', desc: 'Fairy lights & florals' },
              { id: 'royal', title: 'Royal Sovereign', desc: 'Bespoke glasshouse construct' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTier(t.id as any)}
                className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                  tier === t.id 
                    ? 'bg-gold-accent/15 border-gold-accent text-white shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                    : 'bg-white/2 border-white/5 text-[#BFC8E6] hover:bg-white/5'
                }`}
              >
                <span className="block text-xs font-bold font-display">{t.title}</span>
                <span className="block text-[9px] text-[#BFC8E6]/60 mt-1 font-sans">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Service Add-ons */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-[#BFC8E6]">Conglomerate Division Add-ons</span>
          <div className="flex flex-col gap-2.5">
            {[
              { key: 'photography', title: 'Studio U1 Cinema Crew', desc: 'Pre-shoot + 3 candidate DSLR cams & drone feeds', price: 95000 },
              { key: 'transport', title: 'Mahdev VIP Travels Dispatch', desc: 'Toyota KDH Luxury van & Mercedes Wedding car hire', price: 65000 },
              { key: 'erpSoftware', title: 'Mahdev Cloud ERP / Checkouts', desc: 'POS receipt hardware, database ledgers & checkouts setup', price: 150000 },
            ].map((addon) => (
              <label 
                key={addon.key}
                className={`p-4.5 rounded-2xl border flex items-center justify-between cursor-pointer select-none transition-all duration-300 ${
                  (addons as any)[addon.key] 
                    ? 'bg-gold-accent/8 border-gold-accent/30 text-white' 
                    : 'bg-white/2 border-white/5 text-[#BFC8E6]/80 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={(addons as any)[addon.key]}
                    onChange={(e) => setAddons({ ...addons, [addon.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 text-gold-accent focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
                  />
                  <div className="text-left font-sans">
                    <span className="block text-xs font-bold">{addon.title}</span>
                    <span className="block text-[9px] text-[#BFC8E6]/50 mt-0.5">{addon.desc}</span>
                  </div>
                </div>
                <span className="font-numbers text-xs font-bold text-gold-soft">+{formatLKR(addon.price)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Output Panel Column */}
      <div className="md:col-span-5 w-full glass-premium rounded-[32px] p-6 border border-gold-accent/20 flex flex-col gap-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-gold-soft border-b border-white/5 pb-3">Budget Breakdowns</h4>
        
        <div className="flex flex-col gap-4 font-sans text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Base Guest Setup ({guests} x {formatLKR(getTierRate())})</span>
            <span className="text-white font-numbers font-semibold">{formatLKR(guests * getTierRate())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Selected Add-ons</span>
            <span className="text-white font-numbers font-semibold">{formatLKR(getAddonsTotal())}</span>
          </div>
          {duration > 1 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Duration Multiplier ({duration} Days)</span>
              <span className="text-white font-numbers font-semibold">x{duration}</span>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-5 mt-2 flex flex-col gap-2.5">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-sans">ESTIMATED TOTAL LKR BUDGET</span>
          <span className="font-numbers font-black text-white text-3xl sm:text-4xl text-gradient-gold">
            {formatLKR(calculateEstimate())}
          </span>
          <p className="text-[9px] text-gray-500 leading-normal font-sans">Note: This is an automated algorithmic approximation. Operational quotes may vary based on flower seasonality, destination fuel runs, and custom structural drawings.</p>
        </div>

        <Link
          href="#contact"
          className="mt-2 w-full py-4 text-center rounded-2xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark text-xs font-black tracking-widest uppercase hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
        >
          Book Complete Setup
        </Link>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Three.js 360° Venue Viewer
// ----------------------------------------------------------------------
export function Venue360Viewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Create a sphere geometry for panorama skybox
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // Invert sphere inside-out
    geometry.scale(-1, 1, 1);

    // Load static luxury hall panorama texture (using a high-quality interior ballroom stock URL)
    const loader = new THREE.TextureLoader();
    loader.load(
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200', // Beautiful luxury ballroom decor image
      (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        setLoading(false);
      },
      undefined,
      (err) => {
        // Fallback color texture if unsplash load is blocked/fails
        const material = new THREE.MeshBasicMaterial({ color: 0x0c1023, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        setLoading(false);
      }
    );

    // Manual Drag variables to pan around the sphere
    let isUserInteracting = false;
    let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
    let onPointerDownLon = 0, onPointerDownLat = 0;
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;

    const handlePointerDown = (event: PointerEvent) => {
      isUserInteracting = true;
      onPointerDownMouseX = event.clientX;
      onPointerDownMouseY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isUserInteracting) {
        lon = (onPointerDownMouseX - event.clientX) * 0.15 + onPointerDownLon;
        lat = (event.clientY - onPointerDownMouseY) * 0.15 + onPointerDownLat;
        lat = Math.max(-85, Math.min(85, lat)); // clamp latitude
      }
    };

    const handlePointerUp = () => {
      isUserInteracting = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let reqId: number;

    const animate = () => {
      // Auto pan slightly if user is idle
      if (!isUserInteracting) {
        lon += 0.05;
      }

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      cameraTarget.y = 500 * Math.cos(phi);
      cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(cameraTarget);
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (mountRef.current && domElement) {
        mountRef.current.removeChild(domElement);
      }
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 text-left flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-gold-accent flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> 360° VENUE SIMULATOR
        </span>
        <h3 className="font-display font-bold text-2xl text-white font-black">Ballroom Panoramic Sphere</h3>
        <p className="text-xs text-[#BFC8E6]/80 font-sans max-w-md">Drag inside the canvas below to pan and review a simulated live 360° rendering of a floral ballroom setup.</p>
      </div>

      <div className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border border-white/8 bg-navy-dark select-none shadow-xl">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        
        {loading && (
          <div className="absolute inset-0 bg-[#050816] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-sans text-gold-soft font-semibold">Generating 3D sphere panorama...</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-10 px-3.5 py-1.5 rounded-xl glass text-[9px] text-white/50 font-semibold tracking-wider font-sans pointer-events-none">
          DRAG TO ROTATE SCENE
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Interactive Project Timeline
// ----------------------------------------------------------------------
export function InteractiveTimeline() {
  const [activeItem, setActiveItem] = useState(4); // 2026 default

  const timelineData = [
    { year: '2017', label: 'Started', desc: 'Began as a small bespoke web and custom IT solutions team in Colombo.', details: 'Initial setup of client databases, POS software tests, and local birthday planning.' },
    { year: '2019', label: 'First 100 Clients', desc: 'Formalized SWS Events, importing high-end fabrics and backdrops.', details: 'Created back-to-back setups at luxury resorts. Extended Studio U1 creative camera operations.' },
    { year: '2021', label: 'Software Division', desc: 'Rollout of double-entry ledger ERP modules and merchant POS terminals.', details: 'Offline-first cash registers, automated invoice generation, and real-time inventory counts.' },
    { year: '2024', label: 'Luxury Conglomerate Brand', desc: 'Integrating travels, IT solutions, and cinematography suites.', details: 'Syndicated corporate structure to handle multi-faceted operations from single cloud console.' },
    { year: '2026', label: '1500+ Projects', desc: 'Scaling cloud databases internationally with high-altitude drones.', details: 'Expanding software packages across Southeast Asia. Serving 1500+ couples and enterprise stores.' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 text-left">
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-gold-accent flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> GROUP HISTOGRAM
        </span>
        <h3 className="font-display font-bold text-2xl text-white font-black">Interactive Project Timeline</h3>
        <p className="text-xs text-[#BFC8E6]/80 font-sans">Click on any year checkpoint below to review operational milestones and expansion logs.</p>
      </div>

      <div className="relative">
        {/* Horizontal Checkpoints */}
        <div className="relative flex justify-between items-center mb-8 pb-4">
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
          {/* Active progress bar line */}
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-gold-accent -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(activeItem / (timelineData.length - 1)) * 100}%` }}
          />

          {timelineData.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveItem(idx)}
              className="relative z-10 flex flex-col items-center gap-2 select-none group cursor-pointer"
            >
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs transition-all duration-300 border ${
                  activeItem === idx 
                    ? 'bg-gold-accent border-gold-accent text-navy-dark shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110' 
                    : 'bg-navy-medium border-white/10 text-white/50 group-hover:border-gold-accent/50 group-hover:text-gold-soft'
                }`}
              >
                {item.year}
              </div>
              <span className={`text-[10px] font-semibold tracking-wider transition-colors font-sans hidden sm:block ${
                activeItem === idx ? 'text-gold-soft' : 'text-gray-500 group-hover:text-white'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Year Details Display */}
        <div className="glass-premium rounded-3xl p-6.5 border border-gold-accent/15 min-h-[160px] flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="flex-1 text-left flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gold-accent uppercase tracking-widest font-sans">
              Checkpoint Milestone &bull; {timelineData[activeItem].year}
            </span>
            <h4 className="font-display font-bold text-xl text-white leading-tight">
              {timelineData[activeItem].desc}
            </h4>
            <p className="text-xs text-[#BFC8E6]/85 font-sans leading-relaxed">
              {timelineData[activeItem].details}
            </p>
          </div>
          <div className="px-6 py-4.5 rounded-2xl bg-white/2 border border-white/5 font-display flex flex-col text-center shrink-0">
            <span className="text-[28px] font-black text-gold-soft leading-none">{timelineData[activeItem].year}</span>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mt-1.5 font-sans">MAHDEV LOG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. Client Login Portal Mockup
// ----------------------------------------------------------------------
export function ClientLoginPortal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clientId, setClientId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate lookup call
    setTimeout(() => {
      if (clientId.trim() === 'MAH-992' && passcode.trim() === 'colombo26') {
        setSuccess(true);
        confetti({
          particleCount: 60,
          spread: 50,
          colors: ['#D4AF37', '#ffffff']
        });
      } else {
        setError('Invalid Client Registry ID or Passcode credential. Please check your invoice paperwork or ask office WhatsApp support.');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050816]/90 z-[9999] backdrop-blur-md"
          />
          {/* Slider Panel */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-96 max-w-full glass-premium border-l border-gold-accent/20 z-[10000] p-8 flex flex-col justify-between mobile-bottom-sheet"
          >
            <div className="flex flex-col gap-6 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-black text-2xl text-white">Client Portal</h3>
                  <p className="text-xs text-gray-400 mt-1 font-sans">Access active invoices and design plans</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!success ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-5.5 mt-4">
                  {/* Client ID */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">CLIENT REGISTRY ID</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., MAH-992"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Passcode */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">ACCESS PASSCODE</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input 
                        type="password" 
                        required
                        placeholder="e.g., colombo26"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[11px] text-rose-400 leading-normal font-sans bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-center rounded-2xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark text-xs font-black tracking-widest uppercase hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'VALIDATING CREDS...' : 'PORTAL SIGN IN'}
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-[10px] text-gray-500 leading-normal font-sans text-left mt-2">
                    <span className="font-bold text-gold-soft block mb-1">Demo Credentials:</span>
                    <span>Registry ID: <code className="text-white">MAH-992</code></span>
                    <span className="block">Passcode: <code className="text-white">colombo26</code></span>
                  </div>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-5 mt-6 text-center text-sans"
                >
                  <div className="w-14 h-14 rounded-full bg-gold-accent/15 border border-gold-accent/30 text-gold-soft flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-white">Registry Identified</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans px-2">Access granted for event file catalog **Shangri-La wedding gala**. Downloading blueprints invoice receipts...</p>

                  <div className="flex flex-col gap-3 mt-4 text-left">
                    <div className="p-4.5 rounded-2xl glass border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="block font-bold text-white">Invoice Balance Log</span>
                        <span className="text-[10px] text-gray-500 font-sans">Payment ledger</span>
                      </div>
                      <span className="font-numbers font-black text-emerald-400">Rs. 0 Paid</span>
                    </div>

                    <a
                      href="https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4"
                      download
                      className="p-4.5 rounded-2xl glass border border-gold-accent/30 hover:border-gold-accent text-gold-soft flex justify-between items-center text-xs transition-colors"
                    >
                      <div>
                        <span className="block font-bold">Download Profile PDF</span>
                        <span className="text-[10px] text-gray-500 font-sans">Venue floorplan blueprints</span>
                      </div>
                      <ArrowUpRight className="w-4.5 h-4.5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="text-[10px] text-gray-500 font-sans flex items-center justify-between border-t border-white/5 pt-4">
              <span>Mahdev Client Portal v2.6</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gold-accent" /> SSL Sec</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------
// 6. Project Inquiry Wizard (Stepped Stepper Form)
// ----------------------------------------------------------------------
export function ProjectInquiryWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [division, setDivision] = useState('sws-events');
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const nextStep = () => setStep((prev) => Math.min(3, prev + 1));
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setLoading(true);
    try {
      // 1. Try database write (catch permission/rule blocks gracefully)
      try {
        await addDoc(collection(db, 'inquiries'), {
          name,
          email,
          phone,
          division,
          date,
          details,
          timestamp: serverTimestamp()
        });
      } catch (dbErr) {
        console.warn("Firestore inquiry write blocked by Security Rules:", dbErr);
      }

      // 2. Dispatch the Next.js API mail request, throwing real errors if mail server fails
      const mailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, division,
          message: `Wizard Booking Request. Target Date: ${date}. Detail logs: ${details}`
        })
      });

      if (!mailRes.ok) {
        const errData = await mailRes.json();
        throw new Error(errData.error || 'Failed to dispatch email');
      }

      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#D4AF37', '#ffffff', '#A5B4FC']
      });
    } catch (err) {
      console.error(err);
      alert('Failed to send inquiry: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full glass-premium rounded-[32px] p-6.5 sm:p-8 border border-gold-accent/15 shadow-[0_30px_90px_rgba(0,0,0,0.55)] text-left select-none relative">
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-white font-black">Project Inquiry Wizard</h3>
          <p className="text-[10px] text-gray-500 font-sans mt-0.5">Let's blueprint your custom solution step-by-step</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-numbers text-xs font-bold text-gold-soft">
          Step {step} of 3
        </div>
      </div>

      {/* Progress horizontal steps indicator */}
      <div className="flex gap-2 items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
              step >= s ? 'bg-gold-accent shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {!success ? (
        <form onSubmit={handleWizardSubmit} className="flex flex-col gap-6">
          {/* STEP 1: Select Division */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5.5"
            >
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">1. SELECT FOCUS DIVISION AREA</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'sws-events', title: 'SWS Event Design', desc: 'Decor, drapes, floral architecture', icon: Sparkles, color: 'text-purple-400' },
                  { id: 'u1-studio', title: 'Studio U1 Cinema', desc: 'Pre-wedding candid photo & video', icon: Camera, color: 'text-cyan-400' },
                  { id: 'it-solutions', title: 'IT & Cloud Solutions', desc: 'ERP accounting software & API registers', icon: Cpu, color: 'text-blue-400' },
                  { id: 'travels', title: 'Mahdev VIP Travels', desc: 'Chauffeur rental luxury fleet transit', icon: Compass, color: 'text-green-400' },
                ].map((div) => {
                  const Icon = div.icon;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => setDivision(div.id)}
                      className={`p-4.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-300 ${
                        division === div.id 
                          ? 'bg-gold-accent/15 border-gold-accent text-white shadow-[0_0_20px_rgba(212,175,55,0.08)]' 
                          : 'bg-white/2 border-white/5 text-[#BFC8E6]/80 hover:bg-white/5'
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-white/5 mt-0.5">
                        <Icon className={`w-5 h-5 ${div.color}`} />
                      </div>
                      <div className="font-sans">
                        <span className="block text-xs font-bold font-display">{div.title}</span>
                        <span className="block text-[9px] text-[#BFC8E6]/50 mt-1">{div.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Date & Details */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5.5"
            >
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">2. TIMELINE & SPECIFICATION DETAILS</label>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/70 font-semibold font-sans">Target Execution Date</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none text-white font-sans transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/70 font-semibold font-sans">Additional Project Requests</label>
                <textarea 
                  rows={4}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us about the venue, guest count, custom requirements or ERP terminal details..."
                  className="bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none text-white font-sans transition-all resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: Contact details */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5.5"
            >
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">3. CONTACT INFORMATION</label>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/70 font-semibold font-sans">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none text-white font-sans transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/70 font-semibold font-sans">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none text-white font-sans transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/70 font-semibold font-sans">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +94 76 898 8970"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/4 border border-white/8 focus:border-gold-accent/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none text-white font-sans transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Stepper controls */}
          <div className="flex justify-between items-center border-t border-white/5 pt-5 mt-2">
            <button
              type="button"
              disabled={step === 1}
              onClick={prevStep}
              className="px-5 py-3 rounded-xl border border-white/8 hover:border-white/20 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark text-xs font-black tracking-widest uppercase hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Submitting...'
              ) : step === 3 ? (
                <>Submit Inquiry <CheckCircle className="w-4 h-4" /></>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10 flex flex-col items-center gap-4.5 font-sans"
        >
          <div className="w-16 h-16 rounded-full bg-gold-accent/10 border border-gold-accent/30 text-gold-soft flex items-center justify-center mb-2">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h4 className="font-display font-black text-xl text-white">Inquiry Blueprint Registered!</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">Your project wizard details have been logged directly into our executive Firebase terminal. Our director of execution will email or call you within 4 business hours.</p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setDate('');
              setDetails('');
              setName('');
              setEmail('');
              setPhone('');
            }}
            className="mt-4 px-6.5 py-3 rounded-xl border border-gold-accent/30 text-gold-soft hover:bg-gold-accent/10 transition-colors text-xs font-bold cursor-pointer"
          >
            Submit Another Request
          </button>
        </motion.div>
      )}
    </div>
  );
}
