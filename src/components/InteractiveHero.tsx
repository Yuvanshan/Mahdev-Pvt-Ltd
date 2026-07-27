'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles, Shield, Compass, Camera } from 'lucide-react';
import * as THREE from 'three';

const heroSlides = [
  {
    title: 'Wedding Decoration',
    img: '/images/wedding_decoration_1782729925686.jpg',
    tagline: 'Elegant Floral Arches & Royal Canopies'
  },
  {
    title: 'Stage Decoration',
    img: '/images/sws_robot_decor_1783346269673.jpg',
    tagline: 'Mughal-Inspired Traditional Backdrops'
  },
  {
    title: 'Birthday Decoration',
    img: '/images/birthday_decor.jpg',
    tagline: 'Fairytale Pastels & Character Cascades'
  },
  {
    title: 'Engagement Decoration',
    img: '/images/wedding_decoration_1782729925686.jpg',
    tagline: 'Warm Fairy-Light Altar Schemes'
  },
  {
    title: 'Floral Decoration',
    img: '/images/church_decor.jpg',
    tagline: 'Pristine Imported Orchids & Lilies'
  },
  {
    title: 'Corporate Events',
    img: '/images/sws_robot_decor_1783346269673.jpg',
    tagline: 'Sleek Branded Keynote Stages'
  },
  {
    title: 'Outdoor Events',
    img: '/images/drone_photography.jpg',
    tagline: 'Picturesque Coastal & Garden setups'
  },
  {
    title: 'Reception Decorations',
    img: '/images/wedding_decoration_1782729925686.jpg',
    tagline: 'Grand Hall Entrance Pathways'
  }
];

export default function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Auto-slide image showcase
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Track scroll position for subtle parallax translations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Three.js Background Particle Wave
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particles Geometry
    const particlesCount = 1800;
    const positionArray = new Float32Array(particlesCount * 3);

    // Create a wave grid structure
    const cols = 60;
    const rows = 30;
    const spacing = 1.2;

    for (let i = 0; i < particlesCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Center the grid
      const x = (col - cols / 2) * spacing;
      const z = (row - rows / 2) * spacing;
      const y = Math.sin(col * 0.2) * 1.5 + Math.cos(row * 0.2) * 1.5;

      positionArray[i * 3] = x;
      positionArray[i * 3 + 1] = y;
      positionArray[i * 3 + 2] = z;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

    // Custom Canvas Texture for Rounded Particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(223, 186, 115, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Materials
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.65,
      map: particleTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xdfba73,
    });

    // Points mesh
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Make wave motion
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        
        // Calculate y coordinate based on time and wave equation
        positions[i * 3 + 1] = 
          Math.sin(x * 0.15 + elapsedTime * 1.2) * 1.8 + 
          Math.cos(z * 0.15 + elapsedTime * 1.2) * 1.8;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Rotate slowly
      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-navy-dark">
      {/* 1. Cinematic Cross-fading Background Images Showcase */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.28, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={heroSlides[currentSlide].img}
              alt={heroSlides[currentSlide].title}
              fill
              priority
              className="object-cover object-center filter brightness-[0.7] contrast-[1.05]"
            />
          </motion.div>
        </AnimatePresence>
        {/* Layered dark gradients for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/90 to-navy-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-navy-dark/40" />
      </div>

      {/* 2. Layered Animated Mesh Gradient Overlay (Slow moving) */}
      <div className="absolute inset-0 z-[1] opacity-40 mix-blend-screen animate-mesh pointer-events-none" />

      {/* 3. Three.js Particle Wave background container */}
      <div ref={containerRef} className="absolute inset-0 z-[2] opacity-55 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mt-6">
        
        {/* Left text column */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left relative">
          
          {/* Subtle glowing spot behind text */}
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-blue-royal/10 filter blur-[80px] rounded-full pointer-events-none" />

          {/* Premium Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass border border-gold-accent/20 max-w-fit shadow-md shadow-black/20"
          >
            <span className="w-2 h-2 rounded-full bg-gold-accent animate-ping" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-soft">
              {heroSlides[currentSlide].title} • {heroSlides[currentSlide].tagline}
            </span>
          </motion.div>

          {/* Company Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.05] text-white"
          >
            Mahdev: Crafting <span className="text-gradient-gold">Luxury Events</span> & Systems
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-sans text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
          >
            A bespoke Sri Lankan corporate syndicate. Operating at the highest standard of luxury across <strong className="text-white">SWS Event Planning</strong>, cinematic <strong className="text-white">Studio U1 Photography</strong>, premium <strong className="text-white">Travels</strong>, and cloud-scale <strong className="text-white">IT Solutions</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2"
          >
            <Link 
              href="/contact"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-xs tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-gold-accent/25 transition-all duration-300 transform active:scale-95"
            >
              INQUIRE NOW
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#divisions"
              className="px-8 py-4 rounded-xl glass hover:bg-white/5 border border-white/10 text-white font-sans font-semibold text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              EXPLORE DIVISIONS
            </Link>
          </motion.div>

          {/* Trident Energy Symbol (Floats between text & cards) */}
          <div className="absolute right-4 bottom-20 sm:-right-4 lg:-right-12 translate-y-12 select-none pointer-events-none hidden md:block">
            <svg viewBox="0 0 100 120" className="w-16 h-20 text-gold-accent opacity-65 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-trident">
              <path d="M 50,75 L 50,115" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M 44,75 L 56,83 L 44,83 L 56,75 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="79" r="1" fill="#06b6d4" />
              <path d="M 47,115 L 50,119 L 53,115 Z" fill="currentColor" />
              <path d="M 28,45 C 32,70 68,70 72,45" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M 50,20 L 50,75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M 47.5,35 L 50,20 L 52.5,35 Z" fill="currentColor" />
              <path d="M 25,48 L 28,45 L 29,52 Z" fill="currentColor" />
              <path d="M 75,48 L 72,45 L 71,52 Z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Right column - Animated overlapping cards collage */}
        <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[450px] flex items-center justify-center">
          
          {/* Card 1: SWS Event Management */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: scrollY * -0.05 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute top-2 left-2 w-[240px] sm:w-[260px] glass-premium rounded-2xl p-4 border border-gold-soft/10 shadow-2xl backdrop-blur-xl z-20 flex flex-col gap-3 group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="relative h-28 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/wedding_decoration_1782729925686.jpg"
                alt="SWS Wedding"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[8px] font-bold uppercase tracking-wider text-purple-300">
                SWS EVENTS
              </span>
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-xs text-white">Royal Stage Decor</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Fairy-light canopies & fresh marigolds.</p>
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-2">
              <span>Bespoke Design</span>
              <span className="text-gold-soft font-bold">Premium</span>
            </div>
          </motion.div>

          {/* Card 2: Studio U1 Cinematography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: scrollY * -0.08 + 180 }}
            transition={{ type: 'spring', damping: 18 }}
            className="absolute top-2 right-2 w-[220px] sm:w-[240px] glass-premium rounded-2xl p-4 border border-cyan-400/10 shadow-2xl backdrop-blur-xl z-10 flex flex-col gap-3 group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="relative h-24 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/u1_robot_camera_1783346286743.jpg"
                alt="Studio U1"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[8px] font-bold uppercase tracking-wider text-cyan-300">
                STUDIO U1
              </span>
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-xs text-white">Cinematic Wedding Films</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">HDR Color graded drone edits.</p>
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-2">
              <span>Shutter Speed</span>
              <span className="text-cyan-400 font-bold">Creative</span>
            </div>
          </motion.div>

          {/* Card 3: Travels Fleet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: scrollY * -0.03 + 120 }}
            transition={{ type: 'spring', damping: 22 }}
            className="absolute left-6 w-[230px] sm:w-[250px] glass-premium rounded-2xl p-4 border border-green-400/10 shadow-2xl backdrop-blur-xl z-30 flex flex-col gap-3 group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="relative h-24 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/travels_robot_car_1783346316762.jpg"
                alt="Travels Fleet"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-[8px] font-bold uppercase tracking-wider text-green-300">
                TRAVELS & TOURS
              </span>
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-xs text-white">VIP Toyota KDH Fleet</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Airport transfers & luxury cabs.</p>
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-2">
              <span>Chauffeur Led</span>
              <span className="text-green-400 font-bold">Available</span>
            </div>
          </motion.div>

          {/* Card 4: IT & Cloud POS Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: scrollY * -0.06 + 280 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute right-4 w-[230px] sm:w-[250px] glass-premium rounded-2xl p-4 border border-blue-400/10 shadow-2xl backdrop-blur-xl z-20 flex flex-col gap-3 group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="relative h-24 w-full rounded-xl overflow-hidden">
              <Image
                src="/images/saas_dashboard.jpg"
                alt="ERP Cloud System"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[8px] font-bold uppercase tracking-wider text-blue-300">
                IT SOLUTIONS
              </span>
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-xs text-white">Dual-Entry ERP POS</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Multi-location cloud accounting.</p>
            </div>
            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-2">
              <span>SaaS System</span>
              <span className="text-blue-400 font-bold">Deployable</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Mouse scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="mouse-scroll" />
        <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Scroll Down</span>
      </div>
    </section>
  );
}
