/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ActivePage, 
  ServiceCard, 
  DecorationCategory, 
  PhotoPortfolioItem, 
  ErpModule, 
  ItProject, 
  Testimonial 
} from './types';

export const COMPANY_CONTACT = {
  phone: '076 898 8970 / 075 092 8078',
  whatsapp: 'https://wa.me/94768988970?text=Hi%20Mahdev%20Pvt%20Ltd,%20I%20would%20like%20to%20know%20more%20about%20your%20services.',
  email: 'info.mahdev.lk@gmail.com',
  address: '41/22, Pickerings Road, Kotahena, Colombo 13',
  hours: 'Monday - Saturday: 9:00 AM - 8:00 PM (Sunday: Prior Booking Only)',
  mapsIframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5905187788484!2d79.86047717498674!3d6.939466593060667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b4f62cae1%3A0xc0fb198eeaa07897!2sPickerings%20Rd%2C%20Colombo!5e0!3m2!1sen!2slk!4v1719650000000!5m2!1sen!2slk',
  logo: '/src/assets/images/mahadev_logo_1782729909050.jpg'
};

export const SERVICES_LIST: ServiceCard[] = [
  {
    id: 'decoration',
    title: 'SWS Event Management',
    description: 'Transforming spaces into breathtaking visual narratives. We specialize in luxury weddings, themed stages, church floral setups, and high-profile corporate galas.',
    icon: 'Sparkles',
    page: ActivePage.Decoration,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?fm=webp&fit=crop&q=70&w=600'
  },
  {
    id: 'photography',
    title: 'U1 Studio',
    description: 'Capturing fleeting raw emotions and grand moments with cinematic precision. From high-altitude drone cinematography to intimate baby and studio portraits.',
    icon: 'Camera',
    page: ActivePage.Photography,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?fm=webp&fit=crop&q=70&w=600'
  },
  {
    id: 'erp',
    title: 'Mahdev ERP System',
    description: 'Robust, custom-engineered ERP ecosystems designed to centralize and automate payroll, POS, school records, live multi-warehouse inventories, and accounting.',
    icon: 'Cpu',
    page: ActivePage.ErpSolutions,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?fm=webp&fit=crop&q=70&w=600'
  },
  {
    id: 'it',
    title: 'Mahdev IT Solutions',
    description: 'End-to-end fullstack development, intuitive UI/UX design, cloud native solutions, secure managed hosting, and proactive cybersecurity monitoring.',
    icon: 'Globe',
    page: ActivePage.ItSolutions,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?fm=webp&fit=crop&q=70&w=600'
  },
  {
    id: 'travels',
    title: 'Mahdev Travels',
    description: 'Elite passenger vans, premier wedding car rental, and comprehensive vacation packages across Sri Lanka with professional English chauffeurs.',
    icon: 'Compass',
    page: ActivePage.Travels,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?fm=webp&fit=crop&q=70&w=600'
  }
];

export const DECORATION_CATEGORIES: DecorationCategory[] = [
  {
    id: 'wedding',
    title: 'Wedding Decorations',
    description: 'Magical, royal, and luxury stages, entry walkways, and floral canopies tailored to your exact wedding theme.',
    image: '/src/assets/images/wedding_decoration_1782729925686.jpg', // Custom generated premium banner
    iconName: 'Heart'
  },
  {
    id: 'birthday',
    title: 'Birthday Decorations',
    description: 'Whimsical balloon arches, vibrant theme backdrops, and immersive fairytale-style children birthday setups.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Gift'
  },
  {
    id: 'church',
    title: 'Church Decorations',
    description: 'Solemn, elegant, and serene floral arrangements, pew linings, and altar backdrops for holy unions and festivals.',
    image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Church'
  },
  {
    id: 'corporate',
    title: 'Corporate Events',
    description: 'Sleek, minimalist branding elements, keynote stages, panel panels, and VIP lounge styling with professional floral pairings.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Briefcase'
  },
  {
    id: 'stage',
    title: 'Stage Decoration',
    description: 'Immersive LED backdrop integrations, dynamic projection mapping frames, and high-impact physical set constructions.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Sparkles'
  },
  {
    id: 'flower',
    title: 'Flower Decoration',
    description: 'Bespoke exotic and traditional floral layouts using hand-picked marigolds, premium orchids, and imported red roses.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Flower'
  },
  {
    id: 'indoor',
    title: 'Indoor Decoration',
    description: 'Cosy banquets, intimate lighting design, dynamic ceiling hangings, and ambient photo booths for indoor setups.',
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Home'
  },
  {
    id: 'outdoor',
    title: 'Outdoor Decoration',
    description: 'Bohemian canopy lights, garden hangings, grand rustic lawn arches, and weather-resilient evening lounge setups.',
    image: 'https://images.unsplash.com/photo-1507504038482-76210374325a?fm=webp&fit=crop&q=60&w=400',
    iconName: 'Sun'
  }
];

export const DECORATION_GALLERY = [
  {
    id: 'dg1',
    title: 'The Imperial Marigold Haven',
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?fm=webp&fit=crop&q=65&w=500'
  },
  {
    id: 'dg2',
    title: 'Vibrant Alice in Balloonland',
    category: 'Birthday',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?fm=webp&fit=crop&q=65&w=500'
  },
  {
    id: 'dg3',
    title: 'Modern Keynote Tech Summit',
    category: 'Corporate',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=webp&fit=crop&q=65&w=500'
  },
  {
    id: 'dg4',
    title: 'St. Peter\'s Holy Orchid Union',
    category: 'Church',
    image: 'https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?fm=webp&fit=crop&q=65&w=500'
  },
  {
    id: 'dg5',
    title: 'Whimsical Rustic Garden Arch',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?fm=webp&fit=crop&q=65&w=500'
  },
  {
    id: 'dg6',
    title: 'Royal Mughal Durbar Stage',
    category: 'Stage',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?fm=webp&fit=crop&q=65&w=500'
  }
];

export const PHOTO_PORTFOLIO: PhotoPortfolioItem[] = [
  {
    id: 'p1',
    title: 'Eternal Golden Hour Union',
    category: 'Wedding Photography',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?fm=webp&fit=crop&q=65&w=450'
  },
  {
    id: 'p2',
    title: 'Cinematic Cinematic Teaser Reel',
    category: 'Cinematography',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?fm=webp&fit=crop&q=65&w=450'
  },
  {
    id: 'p3',
    title: 'Grand Palace Aerial Horizon',
    category: 'Drone Photography',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?fm=webp&fit=crop&q=65&w=450'
  },
  {
    id: 'p4',
    title: 'Enchanted Forest Outdoor Session',
    category: 'Outdoor Shoots',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?fm=webp&fit=crop&q=65&w=450'
  },
  {
    id: 'p5',
    title: 'Prism Light Studio Portrait',
    category: 'Studio Photography',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?fm=webp&fit=crop&q=65&w=450'
  },
  {
    id: 'p6',
    title: 'Sleeping Cherub Newborn Studio',
    category: 'Baby Shoots',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebf?fm=webp&fit=crop&q=65&w=450'
  }
];

export const PHOTO_PRICING = [
  {
    title: 'Essential Shoot',
    price: 'Rs. 24,999',
    duration: '1 Day',
    features: [
      '1 Lead Photographer',
      'High-Resolution Edited Digital Copies (150+)',
      '1 Cinematic Video Teaser (2 mins)',
      'Digital Album Access for 1 Year',
      'UHD Post-Processing Color Grading'
    ]
  },
  {
    title: 'Imperial Cinematic',
    price: 'Rs. 59,999',
    duration: '2 Days',
    badge: 'Popular',
    features: [
      '2 Candid Photographers & 1 Videographer',
      'High-Altitude Drone Shoots (Weather permitting)',
      'Full Cinematic Movie (15-20 mins)',
      'Premium Leatherette Physical Photobook (40 Pages)',
      'Pre-Wedding Outdoor Shoot Session (Free)'
    ]
  },
  {
    title: 'Grand Masterpiece',
    price: 'Rs. 1,19,999',
    duration: 'Multi-Day Event',
    features: [
      'Entire Team: 3 Photographers & 2 Videographers',
      'Unlimited Drone Arial Footage & Steadicam Runs',
      'Full length movie & Instagram Reels package',
      '2 Copy Luxury Hardcover Photobooks',
      'Live photo viewing stream on custom cloud portal',
      'Premium Baby/Family portraits included'
    ]
  }
];

export const ERP_MODULES: ErpModule[] = [
  {
    id: 'pos',
    title: 'Omnichannel POS System',
    description: 'Blazing-fast billing terminal running offline-first, syncs in milliseconds once online. Custom optimized for retail and quick-service food chains.',
    iconName: 'Receipt',
    features: ['Thermal printer drivers integrated', 'Quick barcode lookup', 'Custom dynamic discounts', 'Multi-payment checkout options']
  },
  {
    id: 'inventory',
    title: 'Smart Multi-Warehouse Inventory',
    description: 'Real-time stock movement, custom safety threshold alerts, auto reordering algorithms, and barcode/QR catalog management.',
    iconName: 'Box',
    features: ['Real-time shelf tracking', 'Automated PO generation', 'FIFO/LIFO valuations', 'Batch & Expiry alerts']
  },
  {
    id: 'accounting',
    title: 'Double-Entry Accounting',
    description: 'Automated ledger posting from POS and purchase slips. Comprehensive balance sheets, P&L statements, and automated GST/TDS tax summaries.',
    iconName: 'TrendingUp',
    features: ['Direct bank statement reconciliation', 'Dynamic expense filing', 'Automated tax returns', 'Multi-currency invoicing']
  },
  {
    id: 'hr_payroll',
    title: 'HR, Payroll & Attendance',
    description: 'Unified employee records, biometric scanner API connections, cloud shifts scheduler, salary slips generator with complex tax slab components.',
    iconName: 'Users',
    features: ['Biometric & Geo-fenced clock-ins', 'Automatic PF & ESI computations', 'Performance appraisals tracker', 'One-click bulk salary bank transfers']
  },
  {
    id: 'verticals',
    title: 'Industry Specialized Modules',
    description: 'Tailored workflow platforms for specialized domains like schools, hospitals, fine-dine restaurants, and active retail networks.',
    iconName: 'Layout',
    features: ['School fee collection & Grade reports', 'Hospital bed occupancy & OP/IP portals', 'Restaurant table reservations & KOT printing', 'Retail cross-store stock sharing']
  }
];

export const IT_PROJECTS: ItProject[] = [
  {
    id: 'it1',
    title: 'Vastra Luxury Silk Store',
    category: 'E-Commerce Platform',
    description: 'A luxurious custom-tailored apparel shop featuring dynamic color-swatch customizer, high-contrast visual zoom, and multi-currency checkout gateways.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?fm=webp&fit=crop&q=65&w=450',
    url: 'https://vastra-silk-example.com'
  },
  {
    id: 'it2',
    title: 'Apex Global Logistics',
    category: 'Enterprise SaaS Portal',
    description: 'Real-time fleet tracker connecting over 500+ active trucks. Features reactive interactive maps, dynamic route optimizations, and automated fuel consumption logs.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?fm=webp&fit=crop&q=65&w=450',
    url: 'https://apex-fleet-example.com'
  },
  {
    id: 'it3',
    title: 'Oakwood International School',
    category: 'Institution Web App',
    description: 'Comprehensive student/parent community hub featuring live attendance tracking, interactive fee transaction records, and an online exam portal.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?fm=webp&fit=crop&q=65&w=450',
    url: 'https://oakwood-school-example.com'
  },
  {
    id: 'it4',
    title: 'HealPath Clinics Hub',
    category: 'Healthcare Cloud App',
    description: 'A cloud clinic management web platform hosting patient electronic records, appointment calendar logs, automated SMS prescriptions, and billing audits.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?fm=webp&fit=crop&q=65&w=450',
    url: 'https://healpath-clinic-example.com'
  }
];

export const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Rajesh Singhania',
    role: 'Managing Director, Singhania Jewellers',
    rating: 5,
    comment: 'Mahdev Pvt Ltd decorated our daughter’s wedding in Colombo and it looked like a literal palace! The marigold arches and fairy lighting was absolutely breathtaking. Simultaneously, we automated our retail store billing with their POS ERP system. Outstanding multi-skilled team!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 't2',
    name: 'Dr. Anjali Mehta',
    role: 'Founder, Mehta Eye & Dental Clinics',
    rating: 5,
    comment: 'We hired them for website development and UI/UX design. They built an exceptionally responsive client portal. We were so impressed that we integrated their clinic attendance module. Truly professional and reliable.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 't3',
    name: 'Karan Malhotra',
    role: 'Executive Chef, Spice Kraft Restaurants',
    rating: 5,
    comment: 'Their Restaurant POS and payroll system saved us over 40 hours of manual bookkeeping each month. We also contracted their photography wing for our culinary shoot. The cinematic lighting is award-winning!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=webp&fit=crop&q=60&w=120'
  }
];
