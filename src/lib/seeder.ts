import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface DivisionData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  type: 'events' | 'photography' | 'it' | 'travels' | 'generic';
  accentColor: string;
  gradient: string;
  bgVideo?: string;
  bgImage: string;
  services: Array<{
    title: string;
    description: string;
    iconName: string;
    price?: string;
  }>;
  packages?: Array<{
    title: string;
    price: string;
    duration: string;
    features: string[];
    img?: string;
  }>;
  fleet?: Array<{
    name: string;
    type: string;
    capacity: string;
    desc: string;
    features: string[];
    img?: string;
  }>;
  routes?: Array<{
    name: string;
    coords: [number, number][]; // coordinates for SVG route lines
  }>;
}

const defaultDivisions: DivisionData[] = [
  {
    id: 'sws-events',
    name: 'SWS Event Management',
    slug: 'sws-events',
    tagline: 'Creating Spaces of Unrivaled Luxury',
    description: 'We design and coordinate breathtaking visual environments for luxury weddings, solemn church functions, and elite corporate gala events.',
    type: 'events',
    accentColor: '#a855f7',
    gradient: 'from-purple-500/20 to-pink-500/20',
    bgImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200',
    services: [
      { title: 'Wedding Decorations', description: 'Magical, royal, and luxury stages, entry walkways, and floral canopies.', iconName: 'Heart' },
      { title: 'Church Decorations', description: 'Solemn, elegant, and serene floral arrangements and altar backdrops.', iconName: 'Church' },
      { title: 'Birthday Decorations', description: 'Whimsical balloon arches, vibrant theme backdrops, and fairytale child settings.', iconName: 'Gift' },
      { title: 'Corporate Events', description: 'Sleek branding boards, keynote stages, VIP lounges, and professional corporate styling.', iconName: 'Briefcase' },
      { title: 'Cultural & Religious Events', description: 'Traditional mandaps, temple flower garlands, and festival setups.', iconName: 'Sparkles' },
      { title: 'School Events', description: 'Graduation backdrops, stage lighting, and thematic student festival decor.', iconName: 'Award' }
    ],
    packages: [
      {
        title: 'Silver Blossom Decor',
        price: 'Rs. 75,000',
        duration: 'Single Day Event',
        features: ['Main Stage Backdrop (Up to 24ft)', 'Altar / Couple Table Setup', 'Standard Entry Archway', 'Pathway Lighting & Carpet', 'Bridal Set / Settee Decor']
      },
      {
        title: 'Royal Gold Imperial',
        price: 'Rs. 185,000',
        duration: 'Premium Full Event',
        features: ['Exclusive Glasshouse Stage Set', 'Fresh Flower Canopy & Pew Linings', 'Tunnel of Fairy Lights (50ft)', 'Smoke/Dry Ice Special Effects', 'Ambient LED Uplighting Suite', 'Interactive Photo Booth Backdrop']
      }
    ]
  },
  {
    id: 'u1-studio',
    name: 'Studio U1 Photography',
    slug: 'u1-studio',
    tagline: 'Capturing Fleeting Raw Emotions',
    description: 'Award-winning cinematography and portraiture. We freeze raw human bonds and grand architectures with cinematic lens systems.',
    type: 'photography',
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    bgImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200',
    services: [
      { title: 'Wedding Photography', description: 'Capturing split-second laughs and tearful glances with prime portrait lenses.', iconName: 'Camera' },
      { title: 'Cinematography', description: '10-bit log files, advanced gimbal stabilization runs, and custom lut color-grading.', iconName: 'Film' },
      { title: 'Aerial Drone Runs', description: 'Capturing sweeping lawn layouts, ocean backdrops, and birds-eye landscape videos.', iconName: 'Compass' },
      { title: 'Newborn & Family', description: 'Comfortable temperature-controlled studio spaces to capture secure initial milestones.', iconName: 'User' },
      { title: 'Outdoor Shoots', description: 'Curating natural forest coordinates and coastal paths for pre-wedding portfolio shoots.', iconName: 'Palette' },
      { title: 'Studio Portfolios', description: 'Bespoke corporate headshots, glamour photography, and commercial product catalogs.', iconName: 'Sparkles' }
    ],
    packages: [
      {
        title: 'Essential Shoot',
        price: 'Rs. 24,999',
        duration: '1 Day Session',
        features: ['1 Lead Photographer', 'High-Resolution Edited Digital Copies (150+)', '1 Cinematic Video Teaser (2 mins)', 'Digital Album Access for 1 Year', 'UHD Post-Processing Color Grading']
      },
      {
        title: 'Imperial Cinematic',
        price: 'Rs. 59,999',
        duration: '2 Days Session',
        features: ['2 Candid Photographers & 1 Videographer', 'High-Altitude Drone Shoots (Weather permitting)', 'Full Cinematic Movie (15-20 mins)', 'Premium Leatherette Physical Photobook (40 Pages)', 'Pre-Wedding Outdoor Shoot Session (Free)']
      },
      {
        title: 'Grand Masterpiece',
        price: 'Rs. 119,999',
        duration: 'Multi-Day Event',
        features: ['3 Photographers & 2 Videographers', 'Unlimited Drone Aerial Footage & Steadicam Runs', 'Full length movie & Instagram Reels package', '2 Copy Luxury Hardcover Photobooks', 'Live photo viewing stream on custom cloud portal']
      }
    ]
  },
  {
    id: 'it-solutions',
    name: 'Mahdev IT Solutions',
    slug: 'it-solutions',
    tagline: 'Delivering Engineering & AI Innovation',
    description: 'We develop highly scalable enterprise ERP software, custom mobile applications, cloud infrastructures, and interactive AI products.',
    type: 'it',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    bgImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200',
    services: [
      { title: 'ERP Systems', description: 'Double-entry bookkeeping, multi-warehouse inventory tracking, and specialized modules.', iconName: 'Cpu' },
      { title: 'POS Solutions', description: 'Thermal printer checkouts, omnichannel software suites, and cloud register sync.', iconName: 'Terminal' },
      { title: 'Web & Mobile Dev', description: 'High-performance React/Next.js platforms and native iOS/Android applications.', iconName: 'Globe' },
      { title: 'AI Solutions', description: 'Neural networks, recommendation engines, chat agents, and automated data pipelines.', iconName: 'Sparkles' },
      { title: 'CCTV & Networking', description: 'Industrial network switches, IP camera matrices, and enterprise firewall deployment.', iconName: 'Shield' }
    ],
    packages: [
      {
        title: 'Standard Cloud POS',
        price: 'Rs. 4,500/mo',
        duration: 'SaaS License',
        features: ['1 Register Register Sync', 'Thermal Printing Integration', 'Cloud Inventory (Up to 1000 items)', 'Daily Email Reports', 'WhatsApp Receipt Dispatch']
      },
      {
        title: 'Custom ERP Suite',
        price: 'Rs. 250,000+',
        duration: 'One-Time Setup',
        features: ['Full Double-Entry Accounting', 'Multi-Warehouse Inventory Ledger', 'Role-Based Access (Admin/Cashier/Auditor)', 'Lifetime System Support', 'Custom Dashboard Widgets']
      }
    ]
  },
  {
    id: 'travels',
    name: 'Mahdev Travels',
    slug: 'travels',
    tagline: 'Elite Tourism & Luxury Transports',
    description: 'Bespoke travel experiences across Sri Lanka. High-roof passenger vans and premium VIP cars with professional English-speaking chauffeurs.',
    type: 'travels',
    accentColor: '#10b981',
    gradient: 'from-green-500/20 to-emerald-500/20',
    bgImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200',
    services: [
      { title: 'Airport Transfers', description: 'On-time pickup/drop-off at BIA Airport with premium high-roof Toyota KDH vans.', iconName: 'Plane' },
      { title: 'Curated Island Tours', description: 'Tailored itineraries covering Ella greenery, Sigiriya trails, and Galle coastal sunset.', iconName: 'Compass' },
      { title: 'VIP Wedding Transport', description: 'Mercedes C-Class and BMW luxury sedans, fully polished and decorated.', iconName: 'Car' },
      { title: 'Corporate Dispatch', description: 'Reliable regular vehicle dispatch for corporate board members and foreign clients.', iconName: 'Shield' }
    ],
    fleet: [
      {
        name: 'Elite Passenger Van (Toyota KDH)',
        type: 'Luxury Van',
        capacity: '9 - 14 Seats',
        desc: 'Luxurious high-roof vans, fully dual-air-conditioned, adjustable bucket seats, onboard entertainment systems. Perfect for corporate travel or family tours.',
        features: ['Professional Chauffeur', 'Dual Air-Conditioning', 'Adjustable Seats', 'Luggage Space']
      },
      {
        name: 'VIP Wedding Car (Mercedes C-Class)',
        type: 'VIP Car',
        capacity: '4 Seats',
        desc: 'Premium white sedan luxury cars. Clean, polished, decorated with flowers (optional), driven by professional chauffeurs in formals.',
        features: ['Decorations optional', 'Chauffeur in formal uniform', 'Dual-zone climate control', 'Premium leather interior']
      }
    ],
    packages: [
      { title: 'Ella Greenery Escape', duration: '3 Days / 2 Nights', price: 'Rs. 45,000+', features: ['Sightseeing in scenic train bridges, tea plantations, waterfalls, and Ella Rock climbs.'], img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800' },
      { title: 'Sigiriya Cultural Trail', duration: '2 Days / 1 Night', price: 'Rs. 35,000+', features: ['Explore historical rock fortress, Dambulla cave temple, and heritage ruins.'], img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800' },
      { title: 'Galle Coastal Sunset', duration: '1 Day Tour', price: 'Rs. 18,000+', features: ['Visit Portuguese Galle Fort, sea turtle conservation hubs, and relax on sandy beaches.'], img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800' }
    ]
  }
];

const defaultTestimonials = [
  {
    name: 'Suresh Gunawardena',
    review: 'Mahdev IT Solutions converted our physical ledger into a secure POS double-entry ERP cloud terminal. Extremely fast, robust checkouts, and thermal print workflows.',
    rating: 5,
    company: 'Vastra Silk Stores',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Rebecca & Tharindu',
    review: 'The SWS Events team planned our wedding stage decoration with royal marigolds, fairy-light lanes, and imported orchids. It was cinematic and beautiful!',
    rating: 5,
    company: 'Colombo Wedding',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Michael Peterson',
    review: 'Our tour package to Ella and Galle with Mahdev Travels was outstanding. The driver spoke fluent English, knew the best view coordinates, and the KDH was spotless.',
    rating: 5,
    company: 'Australian Tourist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
  }
];

const defaultStats = {
  happyClients: 1500,
  eventsCompleted: 450,
  softwareProjects: 120,
  vehiclesInFleet: 18,
  yearsExperience: 10,
  countriesReached: 8
};

const defaultBlogs = [
  {
    title: 'Designing Cinematic Wedding Decors: The SWS Guide',
    slug: 'designing-cinematic-wedding-decors',
    content: 'Luxury event design is more than placing flowers. It is about creating depth, lighting, and transitions that make the couple feel they have stepped into a royal story. In this article, we share details of the Mughal Stage designs, orchid setups, and fairy light tunnels deployed in Sri Lankan venues.',
    category: 'Events',
    author: 'SWS Decor Lead',
    date: 'July 15, 2026',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800'
  },
  {
    title: 'Migrating to Cloud ERP: Why Double-Entry Ledger Matters',
    slug: 'migrating-to-cloud-erp',
    content: 'Many businesses fail because of poor inventory control and cashflow tracking. With double-entry bookkeeping ledgers integrated directly into real-time POS terminals, businesses can manage stocks across multiple locations, print slips dynamically, and access profit reports on the fly.',
    category: 'Technology',
    author: 'ERP System Architect',
    date: 'June 28, 2026',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800'
  },
  {
    title: 'Exploring Sri Lanka: The Ultimate Ella-Galle Road Trip',
    slug: 'exploring-sri-lanka-ella-galle',
    content: 'From the cold tea plantation bridges of Ella to the sunny shores and historic Portuguese walls of Galle Fort. Discover the best driving routes, local food coordinates, and packing schedules for an elite Sri Lankan chauffeured van tour.',
    category: 'Travel',
    author: 'Mahdev Travels Director',
    date: 'May 14, 2026',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800'
  }
];

const defaultCareers = [
  {
    id: 'it-intern',
    title: 'Full Stack Next.js Intern',
    department: 'Engineering Department',
    type: 'Internship',
    description: 'Work directly with our lead software engineers to build enterprise-scale POS and ERP cloud portals. Experience with TypeScript, Firebase, React, and Tailwind CSS v4 is highly valued.',
    status: 'Open'
  },
  {
    id: 'event-planner',
    title: 'Creative Event & Floral Designer',
    department: 'SWS Event Division',
    type: 'Full-time',
    description: 'Curate luxury decoration themes, coordinate floral backdrops, arrange lighting vectors, and coordinate stages at major luxury hotels in Colombo.',
    status: 'Open'
  },
  {
    id: 'travel-dispatcher',
    title: 'Travel Operations & Fleet Coordinator',
    department: 'Mahdev Travels',
    type: 'Full-time',
    description: 'Manage VIP car rental schedules, chauffeur assignments, customer travel package booking confirmations, and coordinate airport transfer logistics.',
    status: 'Open'
  }
];

const defaultGallery = [
  { id: '1', title: 'Mughal Imperial Canopy', category: 'Wedding', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800' },
  { id: '2', title: 'Studio U1 Drone Footage', category: 'Cinema', img: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800' },
  { id: '3', title: 'VIP Wedding Mercedes', category: 'Travel', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800' },
  { id: '4', title: 'Hilton Keynote Backdrop', category: 'Corporate', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800' },
  { id: '5', title: 'Fairy Light Arch Lanes', category: 'Lighting', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800' },
  { id: '6', title: 'Ella Greenery Escape Van', category: 'Travel', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800' },
  { id: '7', title: 'Church Canopy Pew Flowers', category: 'Wedding', img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=800' },
  { id: '8', title: 'Cinematic Newborn Shoot', category: 'Cinema', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800' }
];

const defaultFaqs = [
  { q: 'What services are included in SWS Event backdrops?', a: 'SWS Event Planning specializes in custom structural builds including grand glasshouse canopies, traditional oil lamps (mandaps), imported pastel balloon arches, and ambient church floral setups.' },
  { q: 'Can I request a custom API checkout inventory module for the POS system?', a: 'Yes. Our IT & Cloud Solutions division customizes POS cash registers, double-entry ERP software layers, stock count logs, and custom payment terminals for hotels and restaurants.' },
  { q: 'How early should I book the Travels VIP luxury Mercedes convoys?', a: 'For wedding Mercedes hires, VIP Colombo transfers, or customized Ella greenery escape runs, we suggest placing bookings at least 3 weeks in advance to lock the fleet allocation.' },
  { q: 'Is there direct database integration for checking event progress?', a: 'Yes. Authorized clients receive credentials to access the secure Client Portal to review real-time blueprints, invoice payouts, and design drafts.' }
];

const defaultHomepage = {
  heroTitleLine1: 'Crafting Luxury Events',
  heroTitleLine2: 'That People Remember Forever.',
  heroDescription: 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
};

export async function seedDatabase(force = false) {
  try {
    const snap = await getDocs(collection(db, 'divisions'));
    if (snap.size > 0 && !force) {
      console.log('Database already seeded.');
      return false;
    }

    console.log('Seeding Firestore Database...');

    for (const div of defaultDivisions) {
      await setDoc(doc(db, 'divisions', div.id), {
        ...div,
        updatedAt: serverTimestamp()
      });
    }

    let idx = 0;
    for (const test of defaultTestimonials) {
      await setDoc(doc(db, 'testimonials', `test-${idx++}`), {
        ...test,
        updatedAt: serverTimestamp()
      });
    }

    await setDoc(doc(db, 'stats', 'mahdev_stats'), {
      ...defaultStats,
      updatedAt: serverTimestamp()
    });

    for (const blog of defaultBlogs) {
      await setDoc(doc(db, 'blogs', blog.slug), {
        ...blog,
        updatedAt: serverTimestamp()
      });
    }

    for (const job of defaultCareers) {
      await setDoc(doc(db, 'careers', job.id), {
        ...job,
        updatedAt: serverTimestamp()
      });
    }

    // Seed homepage configs
    await setDoc(doc(db, 'settings', 'homepage'), {
      ...defaultHomepage,
      updatedAt: serverTimestamp()
    });

    // Seed FAQs configs
    await setDoc(doc(db, 'settings', 'faqs'), {
      items: defaultFaqs,
      updatedAt: serverTimestamp()
    });

    // Seed Gallery collection
    for (const item of defaultGallery) {
      await setDoc(doc(db, 'gallery', `gal-${item.id}`), {
        title: item.title,
        category: item.category,
        img: item.img,
        updatedAt: serverTimestamp()
      });
    }

    console.log('Database Seeding Successful!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
