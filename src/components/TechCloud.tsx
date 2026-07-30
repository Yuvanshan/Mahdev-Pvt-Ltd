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
  { name: 'Flutter', icon: SiFlutter },
  { name: 'Laravel', icon: SiLaravel },
  { name: 'Firebase', icon: SiFirebase },
  { name: 'NodeJS', icon: SiNodedotjs },
  { name: 'AWS Cloud', icon: FaAws },
  { name: 'Azure', icon: Cloud },
  { name: 'Docker', icon: SiDocker },
  { name: 'Kubernetes', icon: SiKubernetes },
  { name: 'Google Maps', icon: SiGooglemaps },
  { name: 'React / Next.js', icon: SiReact },
  { name: 'Tailwind CSS', icon: SiTailwindcss },
  { name: 'TypeScript', icon: SiTypescript },
];

export default function TechCloud() {
  return (
    <div className="w-full py-10 bg-navy-dark/40 overflow-hidden relative border-y border-card-border">
      {/* Absolute fade overlays */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-navy-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-navy-dark to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-6">
        <h4 className="font-display text-xs font-bold uppercase text-gold-soft tracking-[0.2em] text-center">
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
                className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/30 transition-colors duration-200"
              >
                <Icon className="w-5 h-5 text-text-body" />
                <span className="font-sans text-sm font-semibold tracking-wide text-text-heading">{tech.name}</span>
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
                className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/30 transition-colors duration-200"
              >
                <Icon className="w-5 h-5 text-text-body" />
                <span className="font-sans text-sm font-semibold tracking-wide text-text-heading">{tech.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
