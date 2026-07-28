'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Calendar, MapPin, PlayCircle } from 'lucide-react';
import * as THREE from 'three';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const heroBulletTags = ['Events', 'Software', 'Media', 'Travels'];

export default function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  
  // Parallax tracking
  const [parallaxY, setParallaxY] = useState(0);

  // Firestore dynamic hero state
  const [heroData, setHeroData] = useState({
    title1: 'Crafting Luxury Events',
    title2: 'That People Remember Forever.',
    desc: 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setHeroData({
          title1: d.heroTitleLine1 || 'Crafting Luxury Events',
          title2: d.heroTitleLine2 || 'That People Remember Forever.',
          desc: d.heroDescription || 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
          videoUrl: d.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxY(window.scrollY * 0.15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Card Mouse Tilt and Glow spotlight position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    setTilt({ x: x * 25, y: -y * 25 }); // Rotations limits
    
    // Spotlight coordinates (relative in pixels)
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Three.js Particle Wave background
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 25;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle wave geometry
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const cols = 50;
    const rows = 30;
    const spacing = 1.0;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = (col - cols / 2) * spacing;
      const z = (row - rows / 2) * spacing;
      const y = Math.sin(col * 0.15) * 1.2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture (circle glow)
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 217, 120, 1)');
      grad.addColorStop(0.4, 'rgba(212, 175, 55, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.8,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xD4AF37,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
      const time = clock.getElapsedTime();
      const posAttr = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const x = posAttr[i * 3];
        const z = posAttr[i * 3 + 2];
        // Beautiful floating wave function
        posAttr[i * 3 + 1] = 
          Math.sin(x * 0.12 + time * 1.5) * 1.4 + 
          Math.cos(z * 0.12 + time * 1.2) * 1.4;
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.y = time * 0.03;

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Split-text animation parameters
  const wordVariants = {
    hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.12,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    })
  } as any;

  const textLines = [
    { text: heroData.title1, class: "text-white" },
    { text: heroData.title2, class: "text-gradient-gold" }
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden premium-bg-gradient">
      
      {/* Background Animated Noise and Mesh Gradients */}
      <div className="noise-overlay" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 mesh-gradient-glow ambient-light-1" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 mesh-gradient-glow ambient-light-2" />

      {/* Dynamic Golden Particle Waves */}
      <div ref={containerRef} className="absolute inset-0 z-[2] opacity-45 pointer-events-none" />

      {/* Layout Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center mt-4">
        
        {/* Left Side Content Column */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-left" style={{ transform: `translateY(${parallaxY * -0.2}px)` }}>
          
          {/* Floating Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full glass border border-gold-accent/25 max-w-fit shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-gold-accent/40 transition-colors"
          >
            <Sparkles className="w-4.5 h-4.5 text-gold-soft animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-soft">
              ONE PREMIUM COMPANY
            </span>
          </motion.div>

          {/* Heading with sequential word fades */}
          <div className="flex flex-col gap-4">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[62px] leading-[1.08] tracking-tight text-white select-none">
              {textLines.map((line, lIdx) => (
                <span key={lIdx} className={`block ${line.class}`}>
                  {line.text.split(" ").map((word, wIdx) => (
                    <motion.span
                      key={wIdx}
                      custom={lIdx * 3 + wIdx}
                      initial="hidden"
                      animate="visible"
                      variants={wordVariants}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Division Bullet Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-wrap items-center gap-2.5 font-sans mt-2"
            >
              <span className="text-xs font-semibold text-white/50 mr-1.5">Focus Sectors:</span>
              {heroBulletTags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  <span className="text-xs font-semibold text-gold-soft tracking-wider hover:text-white transition-colors duration-300">
                    {tag}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Luxury Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-sans text-[#BFC8E6] text-base sm:text-[17px] leading-relaxed max-w-xl text-left font-light"
          >
            {heroData.desc}
          </motion.p>

          {/* Action Call to Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 mt-3 select-none"
          >
            <Link 
              href="#featured-projects"
              className="px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2.5 luxury-btn luxury-btn-gold text-[12px] tracking-widest font-black uppercase text-center cursor-pointer shadow-lg"
            >
              Explore Our Work
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="#contact"
              className="px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2.5 luxury-btn text-[12px] tracking-widest font-bold uppercase text-center cursor-pointer"
            >
              Get a Quote
            </Link>
          </motion.div>
        </div>

        {/* Right Side Video Showcase (3D Glass Card) */}
        <div className="lg:col-span-5 relative w-full h-[450px] sm:h-[500px] flex items-center justify-center select-none z-10" style={{ transform: `translateY(${parallaxY * 0.1}px)` }}>
          <div 
            className="absolute w-full max-w-[380px] h-[480px] rounded-[32px] cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={cardRef}
              animate={{
                rotateY: tilt.x,
                rotateX: tilt.y,
                z: 20
              }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="w-full h-full glass-premium rounded-[32px] p-4.5 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
            >
              {/* Radial glow focus follows cursor */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-30 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(350px circle at ${glowPos.x}px ${glowPos.y}px, rgba(212, 175, 55, 0.18), transparent 80%)`
                }}
              />

              {/* Card Header details */}
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider font-sans">LIVE PREVIEW</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/60 font-semibold font-sans">
                  Colombo backdrops
                </div>
              </div>

              {/* Video Preview Loop Container */}
              <div className="relative flex-1 my-4.5 rounded-2xl overflow-hidden border border-white/8 group shadow-inner z-10">
                <video 
                  key={heroData.videoUrl}
                  src={heroData.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Simulated playback controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/75 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-gold-accent text-navy-dark shadow-md animate-pulse">
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-white text-xs font-bold font-display">Royal Canopy Build</h4>
                      <p className="text-[9px] text-[#BFC8E6]/75 font-sans">Visual decoration rendering</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer details */}
              <div className="flex justify-between items-center text-[10px] font-sans text-[#BFC8E6]/60 border-t border-white/5 pt-3 z-10">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-accent" />
                  <span>Shangri-La Hall</span>
                </div>
                <span className="text-gold-soft font-bold">1080p Ultra HD</span>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Golden Wave separator at the bottom of hero */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
          <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" className="fill-[#050816]" />
        </svg>
      </div>

    </section>
  );
}
