'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Code, ShieldAlert, Cpu, Database, Award, ArrowUpRight, MessageSquare, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  { icon: Code, title: 'Fullstack Web Apps', desc: 'Crafting responsive, high-performance web applications using React, Next.js, and TypeScript, backed by robust serverless databases.' },
  { icon: Globe, title: 'Cross-Platform Mobile', desc: 'Native-feeling mobile apps compiled from a single codebase via Flutter, connected to Firebase Auth & push systems.' },
  { icon: Database, title: 'Cloud Infrastructure', desc: 'Containerizing services with Docker and orchestrating clusters via Kubernetes on AWS, Google Cloud, or Azure.' },
  { icon: ShieldAlert, title: 'Cybersecurity Audits', desc: 'Implementing strict Firebase security rules, environment validation, HTTPS compliance, and rate-limiting structures.' }
];

const caseStudies = [
  {
    title: 'Vastra Luxury Silk Store',
    category: 'E-Commerce Platform',
    desc: 'Bespoke custom apparel shop featuring dynamic color-swatch customizers, high-contrast visual zoom, and integrated local gateway checkout networks.',
    img: '/images/saas_dashboard.jpg'
  },
  {
    title: 'Apex Global Logistics',
    category: 'Enterprise SaaS Portal',
    desc: 'Real-time fleet tracker connecting over 500+ active trucks. Features reactive interactive maps, dynamic route optimization, and fuel log registers.',
    img: '/images/saas_dashboard.jpg'
  }
];

export default function ItSolutions() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/it_robot_developer_1783346302442.jpg" 
            alt="IT Solutions Banner" 
            fill
            priority
            className="object-cover brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-blue-500/35 text-blue-300 text-xs font-bold uppercase tracking-wider">
              IT SOLUTIONS & CLOUD ORCHESTRATION
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Engineering Next-Gen <span className="text-gradient-purple-blue">Cloud Ecosystems</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              We design and write highly secure, scalable fullstack software systems. Certified developer squads executing custom APIs.
            </p>
          </div>
        </section>

        {/* Capabilities Grids */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              DEVELOPMENT SCOPE
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Enterprise Software Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((serv, idx) => {
              const Icon = serv.icon;
              return (
                <div 
                  key={idx}
                  className="glass p-8 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col sm:flex-row gap-6 hover:translate-y-[-4px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-7 h-7" />
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

        {/* Case Studies Section */}
        <section className="py-24 bg-navy-medium/30 relative">
          <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-10" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                SUCCESS STORIES
              </span>
              <h2 className="font-display font-bold text-3xl text-white">
                Featured IT Case Studies
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {caseStudies.map((caseStudy, idx) => (
                <div 
                  key={idx}
                  className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-gold-accent/30 transition-all duration-300 flex flex-col hover:translate-y-[-4px]"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image 
                      src={caseStudy.img} 
                      alt={caseStudy.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
                  </div>
                  <div className="p-8 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-gold-accent font-bold">{caseStudy.category}</span>
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-gold-soft transition-colors">{caseStudy.title}</h3>
                    <p className="font-sans text-sm text-gray-400 leading-relaxed">{caseStudy.desc}</p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-soft hover:underline mt-2"
                    >
                      REQUEST TECHNICAL AUDIT
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="glass-premium rounded-3xl p-10 sm:p-12 border border-gold-accent/20 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              Need a High-Performance Web App or Mobile Solution?
            </h3>
            <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Consult with our cloud engineers and system architects. We provide comprehensive technological architecture blueprints.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider rounded-full hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
              >
                SCHEDULE ARCHITECT SYNC
              </Link>
              <a 
                href="https://wa.me/94768988970?text=Hi%20Mahdev%20IT%20Solutions,%20I%20would%20like%20to%20discuss%20a%20project" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 glass hover:bg-white/5 border border-white/10 text-white font-sans font-semibold text-sm tracking-wider rounded-full flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
                CHAT ON WHATSAPP
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
