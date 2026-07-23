'use client';

import { 
  SiFlutter, 
  SiLaravel, 
  SiFirebase, 
  SiNodedotjs, 
  SiDocker, 
  SiKubernetes, 
  SiGooglemaps,
  SiReact,
  SiTailwindcss,
  SiTypescript
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa';
import { Cpu, Cloud } from 'lucide-react';

const technologies = [
  { name: 'Flutter', icon: SiFlutter, color: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  { name: 'Laravel', icon: SiLaravel, color: 'text-red-500', glow: 'shadow-red-500/10' },
  { name: 'Firebase', icon: SiFirebase, color: 'text-yellow-500', glow: 'shadow-yellow-500/10' },
  { name: 'NodeJS', icon: SiNodedotjs, color: 'text-green-500', glow: 'shadow-green-500/10' },
  { name: 'AWS Cloud', icon: FaAws, color: 'text-orange-400', glow: 'shadow-orange-500/10' },
  { name: 'Azure', icon: Cloud, color: 'text-blue-500', glow: 'shadow-blue-500/10' },
  { name: 'Docker', icon: SiDocker, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
  { name: 'Kubernetes', icon: SiKubernetes, color: 'text-blue-600', glow: 'shadow-blue-600/10' },
  { name: 'Google Maps', icon: SiGooglemaps, color: 'text-green-400', glow: 'shadow-green-500/10' },
  { name: 'React / Next.js', icon: SiReact, color: 'text-sky-400', glow: 'shadow-sky-500/10' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'text-teal-400', glow: 'shadow-teal-500/10' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-500', glow: 'shadow-blue-500/10' },
];

export default function TechCloud() {
  return (
    <div className="w-full py-10 bg-navy-dark/40 overflow-hidden relative border-y border-white/5">
      {/* Absolute blur glows */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-navy-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-navy-dark to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-6">
        <h4 className="font-display text-xs font-bold uppercase text-gold-accent tracking-[0.2em] text-center">
          POWERING NEXT-GEN ENTERPRISE PLATFORMS
        </h4>
      </div>

      <div className="marquee-container">
        {/* First Loop */}
        <div className="marquee-content py-4">
          {technologies.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div 
                key={idx}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl glass hover:border-gold-accent/20 transition-all duration-300 hover:scale-105 shadow-xl ${tech.glow}`}
              >
                <Icon className={`w-6 h-6 ${tech.color}`} />
                <span className="font-sans text-sm font-semibold tracking-wide text-white">{tech.name}</span>
              </div>
            );
          })}
        </div>

        {/* Second Loop (Duplicate to make scroll seamless) */}
        <div className="marquee-content py-4" aria-hidden="true">
          {technologies.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div 
                key={`dup-${idx}`}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl glass hover:border-gold-accent/20 transition-all duration-300 hover:scale-105 shadow-xl ${tech.glow}`}
              >
                <Icon className={`w-6 h-6 ${tech.color}`} />
                <span className="font-sans text-sm font-semibold tracking-wide text-white">{tech.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
