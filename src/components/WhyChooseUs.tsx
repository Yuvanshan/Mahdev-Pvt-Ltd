'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, HeartHandshake, Milestone, Clock } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Certified Excellence',
    desc: 'Award-winning software implementations and premium wedding planner associations across South Asia.',
    color: 'text-yellow-400',
    border: 'border-yellow-500/10'
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    desc: 'Our ERP systems implement end-to-end data encryption and strict Firestore rules to secure transaction ledgers.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/10'
  },
  {
    icon: Zap,
    title: 'Hyper-Performance',
    desc: 'Using cutting-edge stacks like Next.js and Firebase Client SDK to deliver page loads under 1 second.',
    color: 'text-purple-400',
    border: 'border-purple-500/10'
  },
  {
    icon: Milestone,
    title: 'Proven Track Record',
    desc: 'Successfully delivered over 1,200 projects, from custom inventory warehouses to large cinematic movies.',
    color: 'text-blue-400',
    border: 'border-blue-500/10'
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Account Managers',
    desc: 'Direct consultation pipelines for SWS wedding couples, Travels clients, and IT project stakeholders alike.',
    color: 'text-green-400',
    border: 'border-green-500/10'
  },
  {
    icon: Clock,
    title: '24/7 Engineering Support',
    desc: 'Proactive server monitoring, automated daily cloud database backups, and instant WhatsApp support pipelines.',
    color: 'text-red-400',
    border: 'border-red-500/10'
  }
];

export default function WhyChooseUs() {
  return (
    <div className="w-full py-20 relative bg-navy-dark overflow-hidden">
      {/* Background glow */}
      <div className="glow-ball glow-ball-blue w-96 h-96 top-10 right-0 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
            OUR UNIQUE ADVANTAGE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Why Elite Companies Choose Mahdev
          </h2>
          <p className="font-sans text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            We merge standard architectural precision with luxury design guidelines to create products that scale and spaces that inspire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`glass p-6 rounded-3xl border ${reason.border} hover:border-gold-accent/30 transition-all duration-300 group flex flex-col gap-4 hover:translate-y-[-4px]`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-gold-accent/20 transition-colors">
                  <Icon className={`w-6 h-6 ${reason.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors">
                    {reason.title}
                  </h3>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
