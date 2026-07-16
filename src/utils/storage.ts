import { getFirestoreClient } from '../firebaseClient';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { COMPANY_CONTACT, SERVICES_LIST, DECORATION_CATEGORIES, DECORATION_GALLERY, PHOTO_PORTFOLIO, PHOTO_PRICING, ERP_MODULES, IT_PROJECTS, CLIENT_TESTIMONIALS } from '../data';
import { 
  Leader, ServiceCard, DecorationCategory, PhotoPortfolioItem, ItProject, Testimonial, 
  DecorationGalleryItem, RentalItem, ThemeSettings, Booking, TravelsVehicle, TravelsTour, 
  SeoSettings, Customer, Company, ErpProject, ErpTask, Quotation, Invoice, 
  PaymentRecord, ExpenseRecord, IncomeRecord, Employee, CompanyProfile,
  SmtpSettings, SmtpTemplate
} from '../types';
import mahadevLogo from '../assets/images/mahadev_logo_1782729909050.jpg';
import swsDecorBanner from '../assets/images/sws_robot_decor_1783346269673.jpg';
import u1PhotographyBanner from '../assets/images/u1_robot_camera_1783346286743.jpg';
import itBanner from '../assets/images/it_robot_developer_1783346302442.jpg';
import travelsBannerImg from '../assets/images/travels_robot_car_1783346316762.jpg';
import weddingDecorationBannerImg from '../assets/images/wedding_decoration_1782729925686.jpg';

const KEYS = {
  CONTACT: 'mahdev_company_contact',
  SERVICES: 'mahdev_services_list',
  DECORATION_CATS: 'mahdev_decoration_categories',
  DECOR_GALLERY: 'mahdev_decor_gallery',
  RENTAL_ITEMS: 'mahdev_rental_items',
  PHOTO_PORTFOLIO: 'mahdev_photo_portfolio',
  PHOTO_PRICING: 'mahdev_photo_pricing',
  ERP_MODULES: 'mahdev_erp_modules',
  IT_PROJECTS: 'mahdev_it_projects',
  TESTIMONIALS: 'mahdev_testimonials',
  LEADERSHIP: 'mahdev_leadership_team',
  THEME_SETTINGS: 'mahdev_theme_settings',
  BOOKINGS: 'mahdev_bookings_list',
  TRAVELS_VEHICLES: 'mahdev_travels_vehicles',
  TRAVELS_TOURS: 'mahdev_travels_tours',
  SEO_SETTINGS: 'mahdev_seo_settings',
  CUSTOMERS: 'mahdev_customers_list',
  COMPANIES: 'mahdev_companies_list',
  ERP_PROJECTS: 'mahdev_erp_projects_list',
  QUOTATIONS: 'mahdev_quotations_list',
  INVOICES: 'mahdev_invoices_list',
  PAYMENTS: 'mahdev_payments_list',
  EXPENSES: 'mahdev_expenses_list',
  INCOMES: 'mahdev_incomes_list',
  EMPLOYEES: 'mahdev_employees_list',
  COMPANY_PROFILE: 'mahdev_company_profile',
  SMTP_SETTINGS: 'mahdev_smtp_settings',
  SMTP_TEMPLATES: 'mahdev_smtp_templates'
};

// Request batching queue for optimized sync
const syncQueue = new Map<string, any>();
let syncTimeout: NodeJS.Timeout | null = null;
const BATCH_DELAY = 1000; // Batch requests every 1 second

// Syncing and hydration helpers with offline support
export function setItemAndSync(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Storage ERROR] Failed to save "${key}" to localStorage:`, e);
    return;
  }

  // Queue for batched sync
  syncQueue.set(key, value);
  
  // Clear existing timeout and set new one for batch processing
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => processSyncQueue(), BATCH_DELAY);
}

// Process batched sync queue directly to Cloud Firestore
async function processSyncQueue() {
  if (syncQueue.size === 0) return;
  
  const batchData = Object.fromEntries(syncQueue);
  const keysToSync = Array.from(syncQueue.keys());
  syncQueue.clear();
  
  // Check if online
  if (!navigator.onLine) {
    console.warn('[Storage] Offline - sync will retry when connection restored');
    window.addEventListener('online', () => processSyncQueue(), { once: true });
    return;
  }

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Storage] Client-direct syncing ${keysToSync.length} keys to Firestore...`);
      const database = await getFirestoreClient();
      
      // Perform writes
      for (const [key, value] of Object.entries(batchData)) {
        const docRef = doc(database, 'app_state', key);
        await setDoc(docRef, { data: value, updatedAt: new Date().toISOString() });
      }
      
      console.log(`[Storage] ✅ Client-direct sync completed for: ${keysToSync.join(", ")}`);
      return;
    } catch (err) {
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`[Storage] Direct sync retry ${attempt}/${maxAttempts} in ${delay}ms:`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`[Storage ERROR] Direct sync failed after ${maxAttempts} attempts:`, err);
      }
    }
  }
}

export async function hydrateDatabaseFromServer(): Promise<boolean> {
  // Check if we have cached data that's recent
  const cacheKey = 'mahdev_cache_timestamp';
  const cacheTimestamp = localStorage.getItem(cacheKey);
  const now = Date.now();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  if (cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
    console.log('[Database Sync] Using cached data (still valid)');
    return true;
  }

  const maxRetries = 5;
  const baseDelayMs = 600; // Reduced from 800 for faster initial sync

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Database Sync] Client-direct loading from Firestore (Attempt ${attempt}/${maxRetries})...`);
      
      const database = await getFirestoreClient();
      const colRef = collection(database, 'app_state');
      const querySnapshot = await getDocs(colRef);
      
      const db: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        db[doc.id] = docData.data ?? docData;
      });

      if (Object.keys(db).length > 0) {
        let itemsSync = 0;
        const startTime = performance.now();
        
        // Batch localStorage writes for better performance
        const entries = Object.entries(db);
        for (let i = 0; i < entries.length; i += 10) {
          const batch = entries.slice(i, i + 10);
          for (const [key, value] of batch) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              itemsSync++;
            } catch (e) {
              console.warn(`[Database Sync] Failed key: ${key}`);
            }
          }
          // Yield to prevent blocking
          if (i + 10 < entries.length) await new Promise(r => setTimeout(r, 0));
        }
        
        localStorage.setItem(cacheKey, now.toString());
        const duration = (performance.now() - startTime).toFixed(0);
        console.log(`[Database Sync] ✅ Client-direct synced ${itemsSync} keys in ${duration}ms`);
        return true;
      }
    } catch (error) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      if (attempt < maxRetries) {
        console.warn(`[Database Sync] Retry direct load in ${delayMs}ms: ${error instanceof Error ? error.message : error}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.warn(`[Database Sync] Using local cache after ${maxRetries} attempts`);
      }
    }
  }
  return false;
}


export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  primaryColor: '#a855f7',
  themePreset: 'purple',
  fontFamily: 'Poppins',
  heroTitle1: 'Building Experiences.',
  heroTitle2: 'Creating Technology.',
  heroDescription: 'Mahdev Pvt Ltd is a multi-service company providing decoration services, photography, ERP software solutions, and IT services.',
  brandName: 'Mahdev Pvt Ltd',
  websiteTitle: 'Mahdev Pvt Ltd - Elite Service Suite',
  faviconUrl: '/favicon.ico',
  animationMode: 'multiverse',
  brandLogo: mahadevLogo,
  decorationBanner: swsDecorBanner,
  photographyBanner: u1PhotographyBanner,
  itBanner: itBanner,
  travelsBanner: travelsBannerImg,
  weddingDecorationBanner: weddingDecorationBannerImg
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle: "Mahdev Pvt Ltd",
  metaDescription: "Welcome to Mahdev Pvt Ltd, your elite conglomerate partner for Luxury SWS Event Decoration, U1 Studio Photography, Enterprise ERP Systems, custom IT Solutions, and elite Travels.",
  metaKeywords: "Mahdev, SWS Events, U1 Studio, IT Solutions, ERP, Travels, Sri Lanka, Wedding, Tech",
  ogTitle: "Mahdev Pvt Ltd - Multi-Service Elite Enterprise Conglomerate",
  ogDescription: "A high-performance conglomerate providing Luxury SWS Event Decoration, U1 Studio Photography, Enterprise ERP Systems, custom IT Solutions, and elite Travels.",
  ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
};

export const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  provider: 'custom',
  host: 'smtp.mailgun.org',
  port: 587,
  username: 'postmaster@sandbox.mailgun.org',
  password: '',
  encryption: 'TLS',
  fromEmail: 'office@mahdev.lk',
  fromName: 'Mahdev Pvt Ltd',
  replyToEmail: 'support@mahdev.lk',
  enabled: false
};

export const DEFAULT_SMTP_TEMPLATES: SmtpTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{Company Name}}!',
    body: `Dear {{Customer Name}},\n\nWelcome to {{Company Name}}! We are thrilled to have you with us.\n\nAt {{Company Name}}, we are committed to delivering the highest standards of service across SWS Event Decorations, U1 Studio Photography, Custom IT Solutions, and Travels Fleet.\n\nIf you have any questions, feel free to reply to this email or contact our administration.\n\nBest regards,\n{{Company Name}} Team\nDate: {{Current Date}}`
  },
  {
    id: 'contact_notification',
    name: 'Contact Form Notification',
    subject: 'New Inquiry Received - {{Company Name}}',
    body: `Dear Admin,\n\nA new inquiry has been received through the contact form on {{Current Date}}.\n\nCustomer Details:\n- Name: {{Customer Name}}\n- Project Name: {{Project Name}}\n\nPlease review and follow up promptly.\n\nBest regards,\nAutomated System`
  },
  {
    id: 'quotation',
    name: 'Quotation Email',
    subject: 'Quotation #{{Quotation Number}} from {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nPlease find attached or detailed below our official quotation #{{Quotation Number}} for your project "{{Project Name}}".\n\nQuotation Summary:\n- Project: {{Project Name}}\n- Quote Ref: {{Quotation Number}}\n- Date: {{Current Date}}\n- Estimated Value: Rs. {{Payment Amount}}\n\nWe look forward to partnering with you on this. Please feel free to reach out if you have any questions or require revisions.\n\nBest regards,\n{{Company Name}} Team`
  },
  {
    id: 'invoice',
    name: 'Invoice Email',
    subject: 'Invoice #{{Invoice Number}} from {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nWe have generated invoice #{{Invoice Number}} for your active project "{{Project Name}}".\n\nInvoice Details:\n- Invoice Number: {{Invoice Number}}\n- Date: {{Current Date}}\n- Amount Due: Rs. {{Payment Amount}}\n- Remaining Balance: Rs. {{Remaining Balance}}\n\nPlease process the payment at your earliest convenience. Thank you for your continued business.\n\nBest regards,\n{{Company Name}} Finance Division`
  },
  {
    id: 'advance_receipt',
    name: 'Advance Payment Receipt',
    subject: 'Receipt of Advance Payment - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nThank you for your payment. This email serves as an official receipt for the advance payment received for your project "{{Project Name}}".\n\nPayment Details:\n- Date: {{Current Date}}\n- Amount Received: Rs. {{Payment Amount}}\n- Remaining Balance: Rs. {{Remaining Balance}}\n\nYour booking is now fully secured. We are looking forward to delivering an exceptional experience.\n\nBest regards,\n{{Company Name}} Accounting`
  },
  {
    id: 'final_receipt',
    name: 'Final Payment Receipt',
    subject: 'Receipt of Final Settlement - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nThank you for your final payment. This email serves as an official receipt of full settlement for your project "{{Project Name}}".\n\nReceipt Details:\n- Date: {{Current Date}}\n- Amount Received: Rs. {{Payment Amount}}\n- Remaining Balance: Rs. 0.00 (Fully Settled)\n\nWe appreciate your business and hope to work with you again in the future!\n\nBest regards,\n{{Company Name}} Accounting`
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your Password - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nWe received a request to reset your password for your {{Company Name}} account on {{Current Date}}.\n\nPlease use the following temporary verification code to reset your password: \n\nCode: 984120\n\nIf you did not make this request, please ignore this email.\n\nBest regards,\nIT Security Desk`
  },
  {
    id: 'account_verification',
    name: 'Account Verification',
    subject: 'Verify Your Account - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nThank you for registering. Please verify your account by using the verification code below:\n\nVerification Code: 510482\n\nBest regards,\n{{Company Name}} Team`
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    subject: 'Quarterly Corporate Insights - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nWe are delighted to bring you the latest news, updates, and innovations from across all sectors of {{Company Name}}.\n\nIn SWS Event Decor, we have introduced zero-waste floral installations. In U1 Studio, we now support high-dynamic-range cinema editing. Our IT division has deployed 3 new custom enterprise ERPs, and Travels has added 4 brand new passenger vans to our luxury fleet.\n\nThank you for being a part of our journey!\n\nBest regards,\nExecutive Board, {{Company Name}}`
  },
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    subject: 'Booking Confirmed - {{Company Name}}',
    body: `Dear {{Customer Name}},\n\nWe are pleased to confirm your booking with {{Company Name}}.\n\nBooking Details:\n- Contact Name: {{Customer Name}}\n- Event/Project: {{Project Name}}\n- Confirmed Date: {{Current Date}}\n\nOur operations team is already coordinating details. We will contact you soon.\n\nBest regards,\nOperations Desk`
  },
  {
    id: 'event_confirmation',
    name: 'Event Confirmation',
    subject: 'Event Scheduled Successfully - {{Company Name}} SWS',
    body: `Dear {{Customer Name}},\n\nYour event details have been officially confirmed and added to our master SWS Schedulers.\n\nEvent Details:\n- Client: {{Customer Name}}\n- Service Type: SWS Luxury Event Design\n- Execution Date: {{Current Date}}\n\nEverything is set for a memorable occasion.\n\nBest regards,\nSWS Events Management`
  }
];



const DEFAULT_LEADERSHIP: Leader[] = [
  {
    id: 'leader-1',
    name: 'Yuvanshan Prabakaran',
    role: 'CEO',
    bio: 'Directing overall corporate strategy and technical execution at Mahdev Pvt Ltd. Yuvanshan drives high-performance cloud databases, enterprise infrastructure, and division alignment.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'leader-2',
    name: 'Divaincy Fernando',
    role: 'Co Founder & Managing Director',
    bio: 'Spearheading business operations, design excellence, and event management logistics. Divaincy oversees creative styling pipelines and client success partnerships.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  }
];

function resolveImageValue(value: string | undefined, fallback: string): string {
  return normalizeImageValue(value, fallback);
}

const IMAGE_ASSET_MAP: Record<string, string> = {
  'mahadev_logo_1782729909050.jpg': mahadevLogo,
  'sws_robot_decor_1783346269673.jpg': swsDecorBanner,
  'u1_robot_camera_1783346286743.jpg': u1PhotographyBanner,
  'it_robot_developer_1783346302442.jpg': itBanner,
  'travels_robot_car_1783346316762.jpg': travelsBannerImg,
  'wedding_decoration_1782729925686.jpg': weddingDecorationBannerImg
};

function normalizeImageValue(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  if (value.startsWith('data:')) {
    return value;
  }

  const candidate = value.split('?')[0].split('/').pop() || '';
  const mapped = IMAGE_ASSET_MAP[candidate];
  if (mapped) {
    return mapped;
  }

  if (value.includes('/src/assets/images/') || value.includes('/assets/images/')) {
    const fallbackFile = fallback.split('/').pop() || '';
    const fallbackMapped = IMAGE_ASSET_MAP[fallbackFile];
    return fallbackMapped || fallback;
  }

  return value;
}

export function getCompanyContact() {
  const data = localStorage.getItem(KEYS.CONTACT);
  if (!data) {
    setItemAndSync(KEYS.CONTACT, COMPANY_CONTACT);
    return COMPANY_CONTACT;
  }
  const parsed = JSON.parse(data);
  parsed.logo = normalizeImageValue(parsed.logo, COMPANY_CONTACT.logo);
  return parsed;
}

export function saveCompanyContact(data: typeof COMPANY_CONTACT) {
  setItemAndSync(KEYS.CONTACT, data);
}

export function getServicesList(): ServiceCard[] {
  const data = localStorage.getItem(KEYS.SERVICES);
  if (!data) {
    setItemAndSync(KEYS.SERVICES, SERVICES_LIST);
    return SERVICES_LIST;
  }
  const parsed = JSON.parse(data) as ServiceCard[];
  // Backport newly introduced services (e.g. Mahdev Travels) that are present in static SERVICES_LIST but not in cached data
  const hasUpdates = SERVICES_LIST.some(staticSrv => !parsed.some(cachedSrv => cachedSrv.id === staticSrv.id));
  if (hasUpdates) {
    const updated = [...parsed];
    SERVICES_LIST.forEach(staticSrv => {
      if (!updated.some(cachedSrv => cachedSrv.id === staticSrv.id)) {
        updated.push(staticSrv);
      }
    });
    setItemAndSync(KEYS.SERVICES, updated);
    return updated;
  }
  return parsed;
}

export function saveServicesList(data: ServiceCard[]) {
  setItemAndSync(KEYS.SERVICES, data);
}

export function getDecorationCategories(): DecorationCategory[] {
  const data = localStorage.getItem(KEYS.DECORATION_CATS);
  if (!data) {
    setItemAndSync(KEYS.DECORATION_CATS, DECORATION_CATEGORIES);
    return DECORATION_CATEGORIES;
  }
  return JSON.parse(data);
}

export function saveDecorationCategories(data: DecorationCategory[]) {
  setItemAndSync(KEYS.DECORATION_CATS, data);
}

export function getPhotoPortfolio(): PhotoPortfolioItem[] {
  const data = localStorage.getItem(KEYS.PHOTO_PORTFOLIO);
  if (!data) {
    setItemAndSync(KEYS.PHOTO_PORTFOLIO, PHOTO_PORTFOLIO);
    return PHOTO_PORTFOLIO;
  }
  return JSON.parse(data);
}

export function savePhotoPortfolio(data: PhotoPortfolioItem[]) {
  setItemAndSync(KEYS.PHOTO_PORTFOLIO, data);
}

export function getPhotoPricing() {
  const data = localStorage.getItem(KEYS.PHOTO_PRICING);
  if (!data) {
    setItemAndSync(KEYS.PHOTO_PRICING, PHOTO_PRICING);
    return PHOTO_PRICING;
  }
  return JSON.parse(data);
}

export function savePhotoPricing(data: typeof PHOTO_PRICING) {
  setItemAndSync(KEYS.PHOTO_PRICING, data);
}

export function getErpModules() {
  const data = localStorage.getItem(KEYS.ERP_MODULES);
  if (!data) {
    setItemAndSync(KEYS.ERP_MODULES, ERP_MODULES);
    return ERP_MODULES;
  }
  return JSON.parse(data);
}

export function saveErpModules(data: typeof ERP_MODULES) {
  setItemAndSync(KEYS.ERP_MODULES, data);
}

export function getItProjects(): ItProject[] {
  const data = localStorage.getItem(KEYS.IT_PROJECTS);
  if (!data) {
    setItemAndSync(KEYS.IT_PROJECTS, IT_PROJECTS);
    return IT_PROJECTS;
  }
  return JSON.parse(data);
}

export function saveItProjects(data: ItProject[]) {
  setItemAndSync(KEYS.IT_PROJECTS, data);
}

export function getTestimonials(): Testimonial[] {
  const data = localStorage.getItem(KEYS.TESTIMONIALS);
  if (!data) {
    setItemAndSync(KEYS.TESTIMONIALS, CLIENT_TESTIMONIALS);
    return CLIENT_TESTIMONIALS;
  }
  return JSON.parse(data);
}

export function saveTestimonials(data: Testimonial[]) {
  setItemAndSync(KEYS.TESTIMONIALS, data);
}

export function getLeadershipTeam(): Leader[] {
  const data = localStorage.getItem(KEYS.LEADERSHIP);
  if (!data) {
    setItemAndSync(KEYS.LEADERSHIP, DEFAULT_LEADERSHIP);
    return DEFAULT_LEADERSHIP;
  }
  return JSON.parse(data);
}

export function saveLeadershipTeam(data: Leader[]) {
  setItemAndSync(KEYS.LEADERSHIP, data);
}

const DEFAULT_RENTALS: RentalItem[] = [
  {
    id: 'rent-1',
    name: 'Luxury Banquet Gold Chiavari Chair',
    category: 'Furniture',
    price: 'Rs. 250 / day',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    description: 'Elegant gold-finished titanium metal Chiavari chairs, complete with standard white soft cushion padding.',
    availableQty: 450
  },
  {
    id: 'rent-2',
    name: 'Rustic Hexagonal Wooden Arch',
    category: 'Backdrops',
    price: 'Rs. 7,500 / day',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600',
    description: 'Sturdy, modular solid mahogany hex arch frame. Ideal for outdoor floral anchors and custom lighting trails.',
    availableQty: 4
  },
  {
    id: 'rent-3',
    name: 'Warm LED Bulbs String Lights (50m)',
    category: 'Lighting',
    price: 'Rs. 1,500 / day',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    description: 'Heavy-duty commercial outdoor string lights styled with warm, vintage incandescent filament bulbs.',
    availableQty: 25
  },
  {
    id: 'rent-4',
    name: 'Polished Brass Traditional 6ft Oil Lamp',
    category: 'Props',
    price: 'Rs. 3,000 / day',
    image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=600',
    description: 'Grand 6-feet polished brass standing lamp, custom engraved. Essential for traditional Sri Lankan lighting ceremonies.',
    availableQty: 6
  },
  {
    id: 'rent-5',
    name: 'Exotic Silver 5-Arm Candelabra',
    category: 'Tableware',
    price: 'Rs. 850 / day',
    image: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600',
    description: 'Stately five-arm polished silver table centerpieces to create high-end premium lighting levels.',
    availableQty: 30
  },
  {
    id: 'rent-6',
    name: 'High-Definition P2.5 LED Screen (12ft x 8ft)',
    category: 'AV Equipment',
    price: 'Rs. 45,000 / day',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
    description: 'Ultra HD high-brightness P2.5 LED modular wall backdrop with professional video switcher control rack.',
    availableQty: 2
  }
];

export function getDecorationGallery(): DecorationGalleryItem[] {
  const data = localStorage.getItem(KEYS.DECOR_GALLERY);
  if (!data) {
    setItemAndSync(KEYS.DECOR_GALLERY, DECORATION_GALLERY);
    return DECORATION_GALLERY;
  }
  return JSON.parse(data);
}

export function saveDecorationGallery(data: DecorationGalleryItem[]) {
  setItemAndSync(KEYS.DECOR_GALLERY, data);
}

export function getRentalItems(): RentalItem[] {
  const data = localStorage.getItem(KEYS.RENTAL_ITEMS);
  if (!data) {
    setItemAndSync(KEYS.RENTAL_ITEMS, DEFAULT_RENTALS);
    return DEFAULT_RENTALS;
  }
  return JSON.parse(data);
}

export function saveRentalItems(data: RentalItem[]) {
  setItemAndSync(KEYS.RENTAL_ITEMS, data);
}

export function getThemeSettings(): ThemeSettings {
  const data = localStorage.getItem(KEYS.THEME_SETTINGS);
  if (!data) {
    setItemAndSync(KEYS.THEME_SETTINGS, DEFAULT_THEME_SETTINGS);
    return DEFAULT_THEME_SETTINGS;
  }
  const parsed = JSON.parse(data);
  // Ensure backward compatibility while keeping backend-synced image values intact.
  return {
    ...DEFAULT_THEME_SETTINGS,
    ...parsed,
    brandLogo: resolveImageValue(parsed.brandLogo, DEFAULT_THEME_SETTINGS.brandLogo || ''),
    decorationBanner: resolveImageValue(parsed.decorationBanner, DEFAULT_THEME_SETTINGS.decorationBanner || ''),
    photographyBanner: resolveImageValue(parsed.photographyBanner, DEFAULT_THEME_SETTINGS.photographyBanner || ''),
    itBanner: resolveImageValue(parsed.itBanner, DEFAULT_THEME_SETTINGS.itBanner || ''),
    travelsBanner: resolveImageValue(parsed.travelsBanner, DEFAULT_THEME_SETTINGS.travelsBanner || ''),
    weddingDecorationBanner: resolveImageValue(parsed.weddingDecorationBanner, DEFAULT_THEME_SETTINGS.weddingDecorationBanner || '')
  };
}

export function saveThemeSettings(data: ThemeSettings) {
  setItemAndSync(KEYS.THEME_SETTINGS, data);
}

export function getSeoSettings(): SeoSettings {
  const data = localStorage.getItem(KEYS.SEO_SETTINGS);
  if (!data) {
    setItemAndSync(KEYS.SEO_SETTINGS, DEFAULT_SEO_SETTINGS);
    return DEFAULT_SEO_SETTINGS;
  }
  const parsed = JSON.parse(data);
  return { ...DEFAULT_SEO_SETTINGS, ...parsed };
}

export function saveSeoSettings(data: SeoSettings) {
  setItemAndSync(KEYS.SEO_SETTINGS, data);
}

export function getSmtpSettings(): SmtpSettings {
  const data = localStorage.getItem(KEYS.SMTP_SETTINGS);
  if (!data) {
    setItemAndSync(KEYS.SMTP_SETTINGS, DEFAULT_SMTP_SETTINGS);
    return DEFAULT_SMTP_SETTINGS;
  }
  const parsed = JSON.parse(data);
  return { ...DEFAULT_SMTP_SETTINGS, ...parsed };
}

export function saveSmtpSettings(data: SmtpSettings) {
  setItemAndSync(KEYS.SMTP_SETTINGS, data);
}

export function getSmtpTemplates(): SmtpTemplate[] {
  const data = localStorage.getItem(KEYS.SMTP_TEMPLATES);
  if (!data) {
    setItemAndSync(KEYS.SMTP_TEMPLATES, DEFAULT_SMTP_TEMPLATES);
    return DEFAULT_SMTP_TEMPLATES;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Error parsing SMTP templates", e);
  }
  return DEFAULT_SMTP_TEMPLATES;
}

export function saveSmtpTemplates(data: SmtpTemplate[]) {
  setItemAndSync(KEYS.SMTP_TEMPLATES, data);
}

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    brand: 'SWS',
    name: 'Dilruwan Perera',
    phone: '+94 77 123 4567',
    email: 'dilruwan@example.com',
    serviceType: 'Wedding Stage Design',
    eventDate: '2026-07-20',
    status: 'Confirmed',
    notes: 'Premium gold themed wedding stage with rich lighting and fresh flowers.',
    location: 'Kingsbury Hotel, Colombo',
    budget: 'Rs. 150,000 - 200,000',
    guests: 250,
    amount: 150000,
    createdDate: '2026-07-01'
  },
  {
    id: 'b-2',
    brand: 'SWS',
    name: 'Sheruni Alwis',
    phone: '+94 71 987 6543',
    email: 'sheruni@example.com',
    serviceType: 'Birthday Decoration',
    eventDate: '2026-07-04',
    status: 'Completed',
    notes: 'Magical pink and white theme birthday decorations with balloon arch.',
    location: 'Private Residence, Negombo',
    budget: 'Rs. 40,000 - 60,000',
    guests: 50,
    amount: 45000,
    createdDate: '2026-06-28'
  },
  {
    id: 'b-3',
    brand: 'IT',
    name: 'Senura Holdings',
    phone: '+94 11 234 5678',
    email: 'contact@senura.lk',
    serviceType: 'ERP Inventory System',
    eventDate: '2026-07-15',
    status: 'Pending',
    notes: 'Bespoke inventory management portal with barcode scanning and POS integrations.',
    budget: 'Rs. 500,000 - 800,000',
    amount: 650000,
    createdDate: '2026-07-05'
  },
  {
    id: 'b-4',
    brand: 'IT',
    name: 'Oceanic Leisure Ltd',
    phone: '+94 76 543 2109',
    email: 'info@oceanicleisure.com',
    serviceType: 'Website Development',
    eventDate: '2026-06-25',
    status: 'Completed',
    notes: 'Luxury travel e-commerce portal with automated itinerary builders and booking systems.',
    budget: 'Rs. 250,000 - 350,000',
    amount: 280000,
    createdDate: '2026-06-10'
  },
  {
    id: 'b-5',
    brand: 'Studio',
    name: 'Kanishka & Piyumi',
    phone: '+94 72 345 6789',
    email: 'kanishka@example.com',
    serviceType: 'Wedding Videography',
    eventDate: '2026-07-18',
    status: 'Confirmed',
    notes: 'Full-day cinematic shoot, highlight reels, drone footages, and color graded album.',
    budget: 'Rs. 100,000 - 150,000',
    amount: 120000,
    createdDate: '2026-07-03'
  },
  {
    id: 'b-6',
    brand: 'Travels',
    name: 'Arthur Pendelton',
    phone: '+44 7911 123456',
    email: 'arthur.p@yahoo.co.uk',
    serviceType: 'Travel Package',
    eventDate: '2026-07-25',
    endDate: '2026-08-01',
    status: 'Confirmed',
    notes: 'Sri Lanka Tour: Cultural Triangle, Ella Hills, Mirissa beach safari.',
    guests: 4,
    location: 'Sri Lanka (Colombo to Mirissa)',
    amount: 195000,
    createdDate: '2026-07-02'
  },
  {
    id: 'b-7',
    brand: 'Travels',
    name: 'Nadeesh de Silva',
    phone: '+94 77 987 1111',
    email: 'nadeesh@example.lk',
    serviceType: 'Airport Pickup/Drop',
    eventDate: '2026-07-05',
    status: 'Completed',
    notes: 'Luxury pickup via S-Class from BIA Airport to Colombo 7.',
    guests: 2,
    location: 'BIA to Colombo 07',
    amount: 15000,
    createdDate: '2026-07-04'
  }
];

export function getBookings(): Booking[] {
  const data = localStorage.getItem(KEYS.BOOKINGS);
  if (!data) {
    setItemAndSync(KEYS.BOOKINGS, SEED_BOOKINGS);
    return SEED_BOOKINGS;
  }
  return JSON.parse(data);
}

export function saveBookings(data: Booking[]) {
  setItemAndSync(KEYS.BOOKINGS, data);
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdDate' | 'status'>) {
  const list = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: `b-${Date.now()}`,
    status: 'Pending',
    createdDate: new Date().toISOString().split('T')[0]
  };
  list.unshift(newBooking);
  saveBookings(list);
  return newBooking;
}

const DEFAULT_VEHICLES: TravelsVehicle[] = [
  {
    id: 'v1',
    name: 'Mercedes-Benz S-Class (White)',
    category: 'wedding',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 45,000 / day',
    passengers: 4,
    luggage: 3,
    engine: '2.0L Turbo Hybrid',
    features: ['Silk White Interior', 'Chauffeur Driven', 'Luxury Floral Decor Option', 'Ambient Dual Lighting', 'Panoramic Glass Roof']
  },
  {
    id: 'v2',
    name: 'Chrysler 300C Luxury Sedan',
    category: 'wedding',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 38,000 / day',
    passengers: 4,
    luggage: 4,
    engine: '3.6L V6 Dual-VVT',
    features: ['Classic Royal Presence', 'Heated Leather Seats', 'Custom Ribbons & Decor', 'Premium Harman Kardon Sound', 'Climate Zone Comfort']
  },
  {
    id: 'v3',
    name: 'Toyota Land Cruiser Prado TX',
    category: 'premium',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 32,000 / day',
    passengers: 7,
    luggage: 5,
    engine: '2.8L Intercooler Diesel',
    features: ['Robust 4x4 Drivetrain', 'Tri-Zone A/C Climate', 'Spacious Third Row Cabin', 'Offroad Cruise Control', 'USB fast-chargers']
  },
  {
    id: 'v4',
    name: 'Toyota Premio F (Luxury Edition)',
    category: 'premium',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 18,000 / day',
    passengers: 4,
    luggage: 3,
    engine: '1.5L Dual VVT-i',
    features: ['Ultra Smooth Commute', 'Exceptional Fuel Economy', 'Plush Beige Velvet Seats', 'Quiet Sound Dampening', 'Reverse Safety Camera']
  },
  {
    id: 'v5',
    name: 'Toyota HiAce KDH Luxury Van',
    category: 'vans',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 25,000 / day',
    passengers: 14,
    luggage: 8,
    engine: '3.0L Turbo Diesel',
    features: ['Individually Adjustable Recliners', 'Dual A/C Evaporators', 'Ambient Reading Lights', 'Bluetooth Sound Hub', 'Step Footboard LED']
  }
];

const DEFAULT_TOURS: TravelsTour[] = [
  {
    id: 't1',
    title: 'Cultural Triangle & Temple Wonders',
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1588598126749-0144d18ecf0d?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 145,000 / person',
    highlights: ['Sigiriya Fortress Hike', 'Dambulla Cave Temple', 'Kandy Sacred Temple of Tooth', 'Traditional Kandyan Dance'],
    itinerary: [
      { day: 1, title: 'Arrival & Sigiriya Journey', desc: 'Airport greeting and scenic transport to Sigiriya. Relax in custom eco-luxury lodges.' },
      { day: 2, title: 'Sigiriya Rock Fortress & Dambulla', desc: 'Morning hike up the Sigiriya Lion Rock Citadel. Evening tour of the ancient golden Dambulla caves.' },
      { day: 3, title: 'Sacred Kandy Exploration', desc: 'Travel to Kandy via spice gardens. Visit the Temple of the Sacred Tooth Relic and catch Kandyan live drums.' },
      { day: 4, title: 'Royal Botanical Gardens', desc: 'Walk through Peradeniya Royal Botanic wonders and complete Colombo shopping excursions.' },
      { day: 5, title: 'Airport Departure', desc: 'Chauffeur transport to airport with souvenir gift pack from Mahdev team.' }
    ]
  },
  {
    id: 't2',
    title: 'The Misty Emerald Highlands Tour',
    duration: '4 Days / 3 Nights',
    image: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 115,000 / person',
    highlights: ['Nuwara Eliya Tea Plucking', 'Nine Arch Bridge Walk', 'Ella Rock Sunset Trek', 'Scenic Alpine Train Train Ride'],
    itinerary: [
      { day: 1, title: 'Kandy to Nuwara Eliya Alpine Drive', desc: 'Scenic mountain climb to Nuwara Eliya. Inspect colonial estates and Ramboda cascading waterfall.' },
      { day: 2, title: 'Scenic Tea Estates & Train Ride', desc: 'Live organic tea leaves harvesting demonstration. Scenic high-altitude mountain railway journey to Ella.' },
      { day: 3, title: 'Ella Rock Trek & Nine Arches', desc: 'Hike to Ella Rock summit. Walk on the world-famous stone Nine Arch railway bridge.' },
      { day: 4, title: 'Ravana Falls & Airport Return', desc: 'Admire Ravana waterfall legends and return safely through the rolling southern plains.' }
    ]
  },
  {
    id: 't3',
    title: 'Southern Golden Sands & Wild Safaris',
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600',
    price: 'Rs. 165,000 / person',
    highlights: ['Galle Dutch Fort Heritage Tour', 'Yala National Park Leopard Safari', 'Mirissa Whale Watching', 'Traditional Stilt Fishermen'],
    itinerary: [
      { day: 1, title: 'Arrival & Beach Check-in', desc: 'Direct luxury express drive to Hikkaduwa/Galle beach resorts.' },
      { day: 2, title: 'Unesco Galle Fort Discovery', desc: 'Explore cobblestone alleys, Dutch ramparts, lighthouses, and authentic handloom stores.' },
      { day: 3, title: 'Whale Watching & Turtle Hatcheries', desc: 'Early morning oceanic yacht cruise to spot Blue Whales. Evening sea turtle release program.' },
      { day: 4, title: 'Deep Yala Wildlife Safari', desc: 'Full-day open-roof 4x4 safari looking for Sri Lankan leopards, wild elephants, and peacocks.' },
      { day: 5, title: 'Water Sports in Bentota', desc: 'Thrilling jet-ski, banana-boat, and river safaris down Madu Ganga.' },
      { day: 6, title: 'Farewell Coastal Tour', desc: 'Coastal train commute and comfortable airport drop.' }
    ]
  }
];

export function getTravelsVehicles(): TravelsVehicle[] {
  const data = localStorage.getItem(KEYS.TRAVELS_VEHICLES);
  if (!data) {
    setItemAndSync(KEYS.TRAVELS_VEHICLES, DEFAULT_VEHICLES);
    return DEFAULT_VEHICLES;
  }
  return JSON.parse(data);
}

export function saveTravelsVehicles(data: TravelsVehicle[]) {
  setItemAndSync(KEYS.TRAVELS_VEHICLES, data);
}

export function getTravelsTours(): TravelsTour[] {
  const data = localStorage.getItem(KEYS.TRAVELS_TOURS);
  if (!data) {
    setItemAndSync(KEYS.TRAVELS_TOURS, DEFAULT_TOURS);
    return DEFAULT_TOURS;
  }
  return JSON.parse(data);
}

export function saveTravelsTours(data: TravelsTour[]) {
  setItemAndSync(KEYS.TRAVELS_TOURS, data);
}

const DEFAULT_COMPANIES: Company[] = [
  { id: 'C-1', name: 'Nations Trust Bank PLC', address: 'No. 242, Union Place, Colombo 02, Sri Lanka', phone: '+94 11 471 1411', email: 'corporate@ntb.lk', website: 'www.nationstrust.com', registrationNumber: 'PB-1294' },
  { id: 'C-2', name: 'Aitken Spence PLC', address: 'Aitken Spence Tower, No. 315, Vauxhall Street, Colombo 02', phone: '+94 11 230 8308', email: 'info@aitkenspence.lk', website: 'www.aitkenspence.com', registrationNumber: 'PB-435' },
  { id: 'C-3', name: 'Dilmah Ceylon Tea Company PLC', address: 'No. 111, Negombo Road, Peliyagoda, Sri Lanka', phone: '+94 11 482 2000', email: 'info@dilmahtea.com', website: 'www.dilmahtea.com', registrationNumber: 'PQ-209' }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Kamal Perera', email: 'kamal.perera@ntb.lk', phone: '+94 77 123 4567', companyId: 'C-1', notes: 'Senior VP of Infrastructure. Prefers email communication.', status: 'Active', history: [{ date: '2026-06-01', action: 'Account Created', details: 'Initial sales lead established for branch software overhaul.' }], documents: [] },
  { id: 'cust-2', name: 'Anura de Silva', email: 'anura.desilva@aitkenspence.lk', phone: '+94 71 987 6543', companyId: 'C-2', notes: 'Lead procurement manager. Expects 10% volume corporate discounts on custom CRM.', status: 'Active', history: [{ date: '2026-06-10', action: 'Quotation Dispatched', details: 'Sent Rs. 4,500,000 CRM system architectural brief.' }], documents: [] },
  { id: 'cust-3', name: 'Sanduni Jayasinghe', email: 'sanduni.j@outlook.com', phone: '+94 72 345 6789', notes: 'Wedding Planner coordinate client. Organizing high-profile SWS Grand Taj Ballroom stage.', status: 'Active', history: [{ date: '2026-06-15', action: 'Initial Site Inspection', details: 'Completed floral layout and lighting alignment at Taj Samudra.' }], documents: [] }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Roshan Ranasinghe', email: 'roshan@mahdev.lk', phone: '+94 77 888 1111', department: 'IT Solutions', role: 'Lead Solutions Architect', attendance: {}, salary: 250000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 250000, bonus: 15000, net: 265000, paidAt: '2026-06-30' }], performanceScore: 5 },
  { id: 'emp-2', name: 'Shalini Fonseka', email: 'shalini@mahdev.lk', phone: '+94 77 888 2222', department: 'SWS Events', role: 'Chief Creative Decorator', attendance: {}, salary: 180000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 180000, bonus: 20000, net: 200000, paidAt: '2026-06-30' }], performanceScore: 4 },
  { id: 'emp-3', name: 'Nuwan Bandara', email: 'nuwan@mahdev.lk', phone: '+94 77 888 3333', department: 'U1 Studio', role: 'Senior Cinematic Videographer', attendance: {}, salary: 160000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 160000, bonus: 5000, net: 165000, paidAt: '2026-06-30' }], performanceScore: 4 },
  { id: 'emp-4', name: 'Priyantha Jayawardena', email: 'priyantha@mahdev.lk', phone: '+94 77 888 4444', department: 'Finance', role: 'Senior Accountant', attendance: {}, salary: 150000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 150000, bonus: 0, net: 150000, paidAt: '2026-06-30' }], performanceScore: 5 }
];

const DEFAULT_ERP_PROJECTS: ErpProject[] = [
  { id: 'p-1', name: 'Aitken Spence Custom CRM & Automation', customerId: 'cust-2', companyId: 'C-2', description: 'Enterprise CRM with automated workflows, lead allocation, and executive forecasting analytics.', status: 'In Progress', startDate: '2026-05-10', deadline: '2026-09-30', progress: 65, budget: 4500000, assignedEmployees: ['emp-1'], tasks: [
    { id: 't-1-1', title: 'Database Schema & Security Auditing', projectId: 'p-1', assignedTo: 'emp-1', dueDate: '2026-07-20', status: 'In Progress', priority: 'High' }
  ], milestones: [
    { id: 'm-1-1', title: 'Database & REST API Endpoints Signed Off', dueDate: '2026-07-31', isCompleted: false },
    { id: 'm-1-2', title: 'Interactive Dashboard Components Integrated', dueDate: '2026-08-31', isCompleted: false }
  ], files: [] },
  { id: 'p-2', name: 'SWS Luxury Wedding - Taj Samudra Grand Ballroom', customerId: 'cust-3', description: 'Bespoke design, canopy structure, 40-foot illuminated stage, and customized floral configurations.', status: 'Planning', startDate: '2026-07-15', deadline: '2026-08-25', progress: 40, budget: 1800000, assignedEmployees: ['emp-2'], tasks: [
    { id: 't-2-1', title: 'Floral Selection & Silk Canopy Sourcing', projectId: 'p-2', assignedTo: 'emp-2', dueDate: '2026-07-25', status: 'Todo', priority: 'High' }
  ], milestones: [
    { id: 'm-2-1', title: 'Botanical Assets Sourced', dueDate: '2026-08-01', isCompleted: false }
  ], files: [] }
];

const DEFAULT_QUOTATIONS: Quotation[] = [
  { id: 'q-1', quotationNumber: 'QT-2026-101', customerId: 'cust-1', createdDate: '2026-06-01', validUntil: '2026-07-15', items: [
    { id: 'qi-1', description: 'Bespoke Bank Branch Digital Lobby Portal Screen Suite', quantity: 1, unitPrice: 1500000 }
  ], discount: 0, vat: 15, nbt: 2, terms: '50% advance upon confirmation. Balance 50% upon deployment.', status: 'Approved' },
  { id: 'q-2', quotationNumber: 'QT-2026-102', customerId: 'cust-2', createdDate: '2026-06-10', validUntil: '2026-07-30', items: [
    { id: 'qi-2-1', description: 'Enterprise CRM Core Modules Integration', quantity: 1, unitPrice: 3000000 },
    { id: 'qi-2-2', description: 'Dynamic Interactive Executive Dashboard', quantity: 1, unitPrice: 1500000 }
  ], discount: 10, vat: 15, nbt: 0, terms: '30% Advance, 40% on Beta, 30% on Final release.', status: 'Approved' },
  { id: 'q-3', quotationNumber: 'QT-2026-103', customerId: 'cust-3', createdDate: '2026-06-15', validUntil: '2026-08-01', items: [
    { id: 'qi-3-1', description: 'Bespoke SWS Stage Arch & Organic Florals', quantity: 1, unitPrice: 1200000 },
    { id: 'qi-3-2', description: 'Dynamic Cinematic Lighting & Truss Setup', quantity: 1, unitPrice: 600000 }
  ], discount: 0, vat: 15, nbt: 0, terms: 'Full SWS payment 14 days prior to wedding date.', status: 'Sent' }
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV-2026-001', customerId: 'cust-1', projectId: 'p-1', projectName: 'Corporate Lobby Digital Suite', createdDate: '2026-06-01', dueDate: '2026-07-01', items: [
    { id: 'ii-1', description: 'Bespoke Bank Branch Digital Lobby Portal Screen Suite', quantity: 1, unitPrice: 1500000 }
  ], discount: 0, tax: 15, status: 'Paid', advanceAmount: 750000, remainingAmount: 0, paidAmount: 1500000 },
  { id: 'inv-2', invoiceNumber: 'INV-2026-002', customerId: 'cust-2', projectId: 'p-1', projectName: 'Aitken Spence Custom CRM', createdDate: '2026-06-12', dueDate: '2026-07-15', items: [
    { id: 'ii-2-1', description: 'Enterprise CRM Core Modules Integration', quantity: 1, unitPrice: 3000000 },
    { id: 'ii-2-2', description: 'Dynamic Interactive Executive Dashboard', quantity: 1, unitPrice: 1500000 }
  ], discount: 10, tax: 15, status: 'Partially Paid', advanceAmount: 1350000, remainingAmount: 2250000, paidAmount: 2250000 },
  { id: 'inv-3', invoiceNumber: 'INV-2026-003', customerId: 'cust-3', projectId: 'p-2', projectName: 'Luxury SWS Wedding Decor', createdDate: '2026-06-25', dueDate: '2026-08-01', items: [
    { id: 'ii-3-1', description: 'Bespoke SWS Stage Arch & Organic Florals', quantity: 1, unitPrice: 1200000 },
    { id: 'ii-3-2', description: 'Dynamic Cinematic Lighting & Truss Setup', quantity: 1, unitPrice: 600000 }
  ], discount: 0, tax: 15, status: 'Pending', advanceAmount: 0, remainingAmount: 1800000, paidAmount: 0 }
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  { id: 'pay-1', invoiceId: 'inv-1', amount: 1500000, paymentDate: '2026-06-05', source: 'Bank Transfer (Nations Trust Bank)', receiptNumber: 'REC-2026-0891', type: 'Final' },
  { id: 'pay-2', invoiceId: 'inv-2', amount: 2250000, paymentDate: '2026-06-20', source: 'Bank Transfer (Commercial Bank)', receiptNumber: 'REC-2026-0892', type: 'Advance' }
];

const DEFAULT_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', description: 'Imported Silk Canopy fabric rolls (SWS Wedding)', category: 'Decorations', amount: 320000, date: '2026-06-15', vendor: 'Selas Timber & Fabrics Ltd', receiptUrl: '' },
  { id: 'exp-2', description: 'AWS Cloud Server Hosting Fees (Enterprise SaaS)', category: 'IT Solutions', amount: 45000, date: '2026-07-01', vendor: 'Amazon Web Services Inc.', receiptUrl: '' },
  { id: 'exp-3', description: 'KDH High-Roof Van Fuel & Toll Fees (Tour Transport)', category: 'Travels', amount: 15000, date: '2026-07-05', vendor: 'Ceypetco Fuel Station', receiptUrl: '' }
];

const DEFAULT_INCOMES: IncomeRecord[] = [
  { id: 'inc-1', description: 'Cinematic Pre-Wedding Drone Videography Booking Deposit', source: 'U1 Studio Services', amount: 80000, date: '2026-07-02', notes: 'Taj Samudra Sunset Package' },
  { id: 'inc-2', description: 'SWS Event Stage Flowers Bulk Resale Margin', source: 'SWS Flower Wholesale', amount: 35000, date: '2026-07-04', notes: 'Sold leftover roses to local florists' }
];

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'Mahdev Pvt Ltd',
  logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300',
  favicon: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=32',
  registrationNumber: 'PV-987654',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  phones: ['+94 11 234 5678', '+94 77 123 4567'],
  whatsApp: '+94 77 123 4567',
  email: 'corporate@mahdev.lk',
  website: 'https://www.mahdev.lk',
  googleMapsLocation: 'https://maps.google.com/?q=Colombo',
  workingHours: '9:00 AM - 6:00 PM (Monday - Saturday)',
  bankAccount: 'Nations Trust Bank PLC, Colombo 03 Branch - A/C No. 100234567890',
  paymentQrCode: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=300',
  taxInformation: 'VAT Registration No: 100234567-7000',
  invoicePrefix: 'MAH',
  currency: 'Rs. (LKR)',
  timezone: 'Asia/Colombo'
};

export function getCompanies(): Company[] {
  const data = localStorage.getItem(KEYS.COMPANIES);
  if (!data) {
    setItemAndSync(KEYS.COMPANIES, DEFAULT_COMPANIES);
    return DEFAULT_COMPANIES;
  }
  return JSON.parse(data);
}

export function saveCompanies(data: Company[]) {
  setItemAndSync(KEYS.COMPANIES, data);
}

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  if (!data) {
    setItemAndSync(KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    return DEFAULT_CUSTOMERS;
  }
  return JSON.parse(data);
}

export function saveCustomers(data: Customer[]) {
  setItemAndSync(KEYS.CUSTOMERS, data);
}

export function getEmployees(): Employee[] {
  const data = localStorage.getItem(KEYS.EMPLOYEES);
  if (!data) {
    setItemAndSync(KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
    return DEFAULT_EMPLOYEES;
  }
  return JSON.parse(data);
}

export function saveEmployees(data: Employee[]) {
  setItemAndSync(KEYS.EMPLOYEES, data);
}

export function getErpProjects(): ErpProject[] {
  const data = localStorage.getItem(KEYS.ERP_PROJECTS);
  if (!data) {
    setItemAndSync(KEYS.ERP_PROJECTS, DEFAULT_ERP_PROJECTS);
    return DEFAULT_ERP_PROJECTS;
  }
  return JSON.parse(data);
}

export function saveErpProjects(data: ErpProject[]) {
  setItemAndSync(KEYS.ERP_PROJECTS, data);
}

export function getQuotations(): Quotation[] {
  const data = localStorage.getItem(KEYS.QUOTATIONS);
  if (!data) {
    setItemAndSync(KEYS.QUOTATIONS, DEFAULT_QUOTATIONS);
    return DEFAULT_QUOTATIONS;
  }
  return JSON.parse(data);
}

export function saveQuotations(data: Quotation[]) {
  setItemAndSync(KEYS.QUOTATIONS, data);
}

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(KEYS.INVOICES);
  if (!data) {
    setItemAndSync(KEYS.INVOICES, DEFAULT_INVOICES);
    return DEFAULT_INVOICES;
  }
  return JSON.parse(data);
}

export function saveInvoices(data: Invoice[]) {
  setItemAndSync(KEYS.INVOICES, data);
}

export function getPayments(): PaymentRecord[] {
  const data = localStorage.getItem(KEYS.PAYMENTS);
  if (!data) {
    setItemAndSync(KEYS.PAYMENTS, DEFAULT_PAYMENTS);
    return DEFAULT_PAYMENTS;
  }
  return JSON.parse(data);
}

export function savePayments(data: PaymentRecord[]) {
  setItemAndSync(KEYS.PAYMENTS, data);
}

export function getExpenses(): ExpenseRecord[] {
  const data = localStorage.getItem(KEYS.EXPENSES);
  if (!data) {
    setItemAndSync(KEYS.EXPENSES, DEFAULT_EXPENSES);
    return DEFAULT_EXPENSES;
  }
  return JSON.parse(data);
}

export function saveExpenses(data: ExpenseRecord[]) {
  setItemAndSync(KEYS.EXPENSES, data);
}

export function getIncomes(): IncomeRecord[] {
  const data = localStorage.getItem(KEYS.INCOMES);
  if (!data) {
    setItemAndSync(KEYS.INCOMES, DEFAULT_INCOMES);
    return DEFAULT_INCOMES;
  }
  return JSON.parse(data);
}

export function saveIncomes(data: IncomeRecord[]) {
  setItemAndSync(KEYS.INCOMES, data);
}

export function getCompanyProfile(): CompanyProfile {
  const data = localStorage.getItem(KEYS.COMPANY_PROFILE);
  if (!data) {
    setItemAndSync(KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
    return DEFAULT_COMPANY_PROFILE;
  }
  return JSON.parse(data);
}

export function saveCompanyProfile(data: CompanyProfile) {
  setItemAndSync(KEYS.COMPANY_PROFILE, data);
}


