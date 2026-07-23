'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Play } from 'lucide-react';
import * as THREE from 'three';

export default function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ projects: 0, divisions: 5, countries: 0 });

  // Count up animation for stats
  useEffect(() => {
    let start = 0;
    const endProjects = 1200;
    const endCountries = 8;
    const duration = 2000; // ms
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const stepProjects = endProjects / steps;
    const stepCountries = endCountries / steps;

    const timer = setInterval(() => {
      start += 1;
      setStats(prev => ({
        projects: Math.min(Math.floor(prev.projects + stepProjects), endProjects),
        divisions: 5,
        countries: Math.min(Math.ceil(prev.countries + stepCountries), endCountries)
      }));

      if (start >= steps) {
        clearInterval(timer);
        setStats({ projects: endProjects, divisions: 5, countries: endCountries });
      }
    }, incrementTime);

    return () => clearInterval(timer);
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
    <section className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-gradient-to-b from-navy-dark via-navy-medium to-navy-dark">
      {/* 3D Canvas Background Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 opacity-55 pointer-events-none" />

      {/* Decorative gradient glowing spots */}
      <div className="glow-ball glow-ball-purple w-[500px] h-[500px] -top-40 -left-40 opacity-20" />
      <div className="glow-ball glow-ball-blue w-[500px] h-[500px] -bottom-20 -right-40 opacity-20" />
      <div className="glow-ball glow-ball-gold w-[350px] h-[350px] top-1/3 left-1/3 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left text column */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-gold-accent/20 max-w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-gold-accent animate-ping" />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-gold-soft">Mahdev Conglomerate v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.05] text-white"
          >
            Architecting <span className="text-gradient-purple-blue">Enterprise</span> & <span className="text-gradient-gold">Luxury</span> Experiences
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl"
          >
            From enterprise ERP software and bespoke cloud engineering to luxury weddings, cinematic film production, and tour travels. We build the infrastructure of excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4"
          >
            <Link 
              href="/contact"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all group"
            >
              INQUIRE NOW
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#divisions"
              className="px-8 py-4 rounded-full glass hover:bg-white/5 border border-white/10 text-white font-sans font-semibold text-sm tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              EXPLORE SUITE
              <ChevronRight className="w-4 h-4 text-gold-accent" />
            </Link>
          </motion.div>
        </div>

        {/* Right columns - floating cards container */}
        <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[420px] flex items-center justify-center">
          
          {/* Decorative Glass floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute top-4 left-6 w-[250px] glass-premium rounded-2xl p-5 border border-white/5 shadow-2xl backdrop-blur-xl z-20 flex flex-col gap-3 hover:translate-y-[-5px] transition-transform duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                ERP
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">Smart POS Cloud</h4>
                <p className="text-[10px] text-gray-400">Inventory & Double Ledger</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 border-t border-white/5 pt-2">
              <span>Offline-first billing</span>
              <span className="text-purple-400 font-bold">Active</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-4 right-6 w-[270px] glass-gold rounded-2xl p-5 border border-gold-accent/25 shadow-2xl backdrop-blur-xl z-30 flex flex-col gap-3 hover:translate-y-[-5px] transition-transform duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center text-gold-soft font-bold">
                SWS
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">Royal Stage Decor</h4>
                <p className="text-[10px] text-gray-400">Floral Arrangements & Lights</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 border-t border-white/5 pt-2">
              <span>Luxury Weddings</span>
              <span className="text-gold-soft font-bold">Bespoke</span>
            </div>
          </motion.div>

          {/* Central Live Statistics Counter Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute z-40 bg-navy-dark/95 border border-white/10 rounded-3xl p-6 shadow-2xl w-[260px] flex flex-col gap-4 text-center hover:border-gold-accent/40 transition-all duration-300"
          >
            <div>
              <span className="font-display text-4xl font-black text-white">{stats.projects}+</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gold-accent mt-1">Projects Completed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div>
                <span className="font-display text-2xl font-black text-white">{stats.divisions}</span>
                <span className="block text-[9px] uppercase tracking-wider text-gray-400">Divisions</span>
              </div>
              <div>
                <span className="font-display text-2xl font-black text-white">{stats.countries}+</span>
                <span className="block text-[9px] uppercase tracking-wider text-gray-400">Countries</span>
              </div>
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
