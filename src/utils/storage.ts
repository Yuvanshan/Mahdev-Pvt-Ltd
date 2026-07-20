/**
 * Mahdev Cloud Storage — ZERO localStorage
 * All reads come from the server API (/api/get-all-data).
 * All writes go directly to the server API (/api/save-data-key).
 * NO localStorage is used anywhere in this file.
 */

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

// ─────────────────────────────────────────────────────────────────────────────
//  DB KEY CONSTANTS  (must match server-side keys in server.ts)
// ─────────────────────────────────────────────────────────────────────────────
export const KEYS = {
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
  SMTP_TEMPLATES: 'mahdev_smtp_templates',
};

// ─────────────────────────────────────────────────────────────────────────────
//  CLOUD API  — all data goes through these two functions
// ─────────────────────────────────────────────────────────────────────────────

/** Save one or more keys to the server database */
export async function saveToCloud(keyOrBatch: string | Record<string, any>, value?: any): Promise<void> {
  try {
    const body = typeof keyOrBatch === 'string'
      ? { [keyOrBatch]: value }
      : keyOrBatch;

    const res = await fetch('/api/save-data-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[Cloud Save] Server responded ${res.status}`);
    }
  } catch (err) {
    console.error('[Cloud Save] Network error:', err);
  }
}

/** Fetch the entire database from the server — NO localStorage */
export async function fetchAllFromCloud(): Promise<Record<string, any>> {
  const res = await fetch('/api/get-all-data', {
    headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (!res.ok) throw new Error(`fetchAllFromCloud HTTP ${res.status}`);
  return res.json();
}

/**
 * Legacy compat shim — previously wrote to localStorage.
 * Now is a no-op (server data is loaded in App.tsx directly).
 */
export async function hydrateDatabaseFromServer(): Promise<boolean> {
  try {
    await fetchAllFromCloud();
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  IMAGE ASSET MAP  (maps bundled asset filenames to their Vite-hashed URLs)
// ─────────────────────────────────────────────────────────────────────────────
const IMAGE_ASSET_MAP: Record<string, string> = {
  'mahadev_logo_1782729909050.jpg': mahadevLogo,
  'sws_robot_decor_1783346269673.jpg': swsDecorBanner,
  'u1_robot_camera_1783346286743.jpg': u1PhotographyBanner,
  'it_robot_developer_1783346302442.jpg': itBanner,
  'travels_robot_car_1783346316762.jpg': travelsBannerImg,
  'wedding_decoration_1782729925686.jpg': weddingDecorationBannerImg,
};

export function normalizeImageValue(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/uploads/') || value.startsWith('blob:')) {
    return value;
  }
  const candidate = value.split('?')[0].split('/').pop() || '';
  const mapped = IMAGE_ASSET_MAP[candidate];
  if (mapped) return mapped;
  if (value.includes('/src/assets/images/') || value.includes('/assets/images/')) {
    const fbFile = fallback.split('/').pop() || '';
    return IMAGE_ASSET_MAP[fbFile] || fallback;
  }
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEFAULT SETTINGS  (used as initial React state before server data loads)
// ─────────────────────────────────────────────────────────────────────────────

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
  weddingDecorationBanner: weddingDecorationBannerImg,
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle: 'Mahdev Pvt Ltd',
  metaDescription: 'Welcome to Mahdev Pvt Ltd, your elite conglomerate partner for Luxury SWS Event Decoration, U1 Studio Photography, Enterprise ERP Systems, custom IT Solutions, and elite Travels.',
  metaKeywords: 'Mahdev, SWS Events, U1 Studio, IT Solutions, ERP, Travels, Sri Lanka, Wedding, Tech',
  ogTitle: 'Mahdev Pvt Ltd - Multi-Service Elite Enterprise Conglomerate',
  ogDescription: 'A high-performance conglomerate providing Luxury SWS Event Decoration, U1 Studio Photography, Enterprise ERP Systems, custom IT Solutions, and elite Travels.',
  ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
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
  enabled: false,
};

export const DEFAULT_SMTP_TEMPLATES: SmtpTemplate[] = [
  { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to {{Company Name}}!', body: `Dear {{Customer Name}},\n\nWelcome to {{Company Name}}! We are thrilled to have you with us.\n\nBest regards,\n{{Company Name}} Team` },
  { id: 'contact_notification', name: 'Contact Form Notification', subject: 'New Inquiry Received - {{Company Name}}', body: `Dear Admin,\n\nA new inquiry has been received.\n\nCustomer: {{Customer Name}}\nDate: {{Current Date}}` },
  { id: 'quotation', name: 'Quotation Email', subject: 'Quotation #{{Quotation Number}} from {{Company Name}}', body: `Dear {{Customer Name}},\n\nPlease find your quotation #{{Quotation Number}}.\n\nProject: {{Project Name}}\nValue: Rs. {{Payment Amount}}\n\nBest regards,\n{{Company Name}} Team` },
  { id: 'invoice', name: 'Invoice Email', subject: 'Invoice #{{Invoice Number}} from {{Company Name}}', body: `Dear {{Customer Name}},\n\nInvoice #{{Invoice Number}}\nAmount Due: Rs. {{Payment Amount}}\n\nBest regards,\n{{Company Name}} Finance` },
  { id: 'advance_receipt', name: 'Advance Payment Receipt', subject: 'Receipt of Advance Payment - {{Company Name}}', body: `Dear {{Customer Name}},\n\nThank you for your advance payment of Rs. {{Payment Amount}}.\nRemaining: Rs. {{Remaining Balance}}\n\nBest regards,\n{{Company Name}} Accounting` },
  { id: 'final_receipt', name: 'Final Payment Receipt', subject: 'Receipt of Final Settlement - {{Company Name}}', body: `Dear {{Customer Name}},\n\nThank you for your final payment of Rs. {{Payment Amount}}. Your account is fully settled.\n\nBest regards,\n{{Company Name}} Accounting` },
  { id: 'booking_confirmation', name: 'Booking Confirmation', subject: 'Booking Confirmed - {{Company Name}}', body: `Dear {{Customer Name}},\n\nYour booking for {{Project Name}} is confirmed.\n\nBest regards,\nOperations Desk` },
  { id: 'event_confirmation', name: 'Event Confirmation', subject: 'Event Scheduled Successfully - {{Company Name}} SWS', body: `Dear {{Customer Name}},\n\nYour SWS event on {{Current Date}} is confirmed.\n\nBest regards,\nSWS Events Management` },
];

// ─────────────────────────────────────────────────────────────────────────────
//  PARSERS  — called by App.tsx after fetching server data to resolve images
// ─────────────────────────────────────────────────────────────────────────────

export function parseThemeSettings(raw: any): ThemeSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_THEME_SETTINGS;
  return {
    ...DEFAULT_THEME_SETTINGS,
    ...raw,
    brandLogo: normalizeImageValue(raw.brandLogo, DEFAULT_THEME_SETTINGS.brandLogo || ''),
    decorationBanner: normalizeImageValue(raw.decorationBanner, DEFAULT_THEME_SETTINGS.decorationBanner || ''),
    photographyBanner: normalizeImageValue(raw.photographyBanner, DEFAULT_THEME_SETTINGS.photographyBanner || ''),
    itBanner: normalizeImageValue(raw.itBanner, DEFAULT_THEME_SETTINGS.itBanner || ''),
    travelsBanner: normalizeImageValue(raw.travelsBanner, DEFAULT_THEME_SETTINGS.travelsBanner || ''),
    weddingDecorationBanner: normalizeImageValue(raw.weddingDecorationBanner, DEFAULT_THEME_SETTINGS.weddingDecorationBanner || ''),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET FUNCTIONS  — return defaults only; App.tsx overrides with server data
// ─────────────────────────────────────────────────────────────────────────────

export function getCompanyContact() { return { ...COMPANY_CONTACT }; }
export function getServicesList(): ServiceCard[] { return [...SERVICES_LIST]; }
export function getDecorationCategories(): DecorationCategory[] { return [...DECORATION_CATEGORIES]; }
export function getPhotoPortfolio(): PhotoPortfolioItem[] { return [...PHOTO_PORTFOLIO]; }
export function getPhotoPricing() { return { ...PHOTO_PRICING }; }
export function getErpModules() { return { ...ERP_MODULES }; }
export function getItProjects(): ItProject[] { return [...IT_PROJECTS]; }
export function getTestimonials(): Testimonial[] { return [...CLIENT_TESTIMONIALS]; }
export function getLeadershipTeam(): Leader[] { return [...DEFAULT_LEADERSHIP]; }
export function getDecorationGallery(): DecorationGalleryItem[] { return [...DECORATION_GALLERY]; }
export function getRentalItems(): RentalItem[] { return [...DEFAULT_RENTALS]; }
export function getThemeSettings(): ThemeSettings { return { ...DEFAULT_THEME_SETTINGS }; }
export function getSeoSettings(): SeoSettings { return { ...DEFAULT_SEO_SETTINGS }; }
export function getSmtpSettings(): SmtpSettings { return { ...DEFAULT_SMTP_SETTINGS }; }
export function getSmtpTemplates(): SmtpTemplate[] { return [...DEFAULT_SMTP_TEMPLATES]; }
export function getBookings(): Booking[] { return [...SEED_BOOKINGS]; }
export function getTravelsVehicles(): TravelsVehicle[] { return [...DEFAULT_VEHICLES]; }
export function getTravelsTours(): TravelsTour[] { return [...DEFAULT_TOURS]; }
export function getCompanies(): Company[] { return [...DEFAULT_COMPANIES]; }
export function getCustomers(): Customer[] { return [...DEFAULT_CUSTOMERS]; }
export function getEmployees(): Employee[] { return [...DEFAULT_EMPLOYEES]; }
export function getErpProjects(): ErpProject[] { return [...DEFAULT_ERP_PROJECTS]; }
export function getQuotations(): Quotation[] { return [...DEFAULT_QUOTATIONS]; }
export function getInvoices(): Invoice[] { return [...DEFAULT_INVOICES]; }
export function getPayments(): PaymentRecord[] { return [...DEFAULT_PAYMENTS]; }
export function getExpenses(): ExpenseRecord[] { return [...DEFAULT_EXPENSES]; }
export function getIncomes(): IncomeRecord[] { return [...DEFAULT_INCOMES]; }
export function getCompanyProfile(): CompanyProfile { return { ...DEFAULT_COMPANY_PROFILE }; }

// ─────────────────────────────────────────────────────────────────────────────
//  SAVE FUNCTIONS  — all go directly to the cloud API, NO localStorage
// ─────────────────────────────────────────────────────────────────────────────

export function saveCompanyContact(data: typeof COMPANY_CONTACT): Promise<void> {
  return saveToCloud(KEYS.CONTACT, data);
}
export function saveServicesList(data: ServiceCard[]): Promise<void> {
  return saveToCloud(KEYS.SERVICES, data);
}
export function saveDecorationCategories(data: DecorationCategory[]): Promise<void> {
  return saveToCloud(KEYS.DECORATION_CATS, data);
}
export function savePhotoPortfolio(data: PhotoPortfolioItem[]): Promise<void> {
  return saveToCloud(KEYS.PHOTO_PORTFOLIO, data);
}
export function savePhotoPricing(data: typeof PHOTO_PRICING): Promise<void> {
  return saveToCloud(KEYS.PHOTO_PRICING, data);
}
export function saveErpModules(data: typeof ERP_MODULES): Promise<void> {
  return saveToCloud(KEYS.ERP_MODULES, data);
}
export function saveItProjects(data: ItProject[]): Promise<void> {
  return saveToCloud(KEYS.IT_PROJECTS, data);
}
export function saveTestimonials(data: Testimonial[]): Promise<void> {
  return saveToCloud(KEYS.TESTIMONIALS, data);
}
export function saveLeadershipTeam(data: Leader[]): Promise<void> {
  return saveToCloud(KEYS.LEADERSHIP, data);
}
export function saveDecorationGallery(data: DecorationGalleryItem[]): Promise<void> {
  return saveToCloud(KEYS.DECOR_GALLERY, data);
}
export function saveRentalItems(data: RentalItem[]): Promise<void> {
  return saveToCloud(KEYS.RENTAL_ITEMS, data);
}
export function saveThemeSettings(data: ThemeSettings): Promise<void> {
  return saveToCloud(KEYS.THEME_SETTINGS, data);
}
export function saveSeoSettings(data: SeoSettings): Promise<void> {
  return saveToCloud(KEYS.SEO_SETTINGS, data);
}
export function saveSmtpSettings(data: SmtpSettings): Promise<void> {
  return saveToCloud(KEYS.SMTP_SETTINGS, data);
}
export function saveSmtpTemplates(data: SmtpTemplate[]): Promise<void> {
  return saveToCloud(KEYS.SMTP_TEMPLATES, data);
}
export function saveBookings(data: Booking[]): Promise<void> {
  return saveToCloud(KEYS.BOOKINGS, data);
}
export function saveTravelsVehicles(data: TravelsVehicle[]): Promise<void> {
  return saveToCloud(KEYS.TRAVELS_VEHICLES, data);
}
export function saveTravelsTours(data: TravelsTour[]): Promise<void> {
  return saveToCloud(KEYS.TRAVELS_TOURS, data);
}
export function saveCompanies(data: Company[]): Promise<void> {
  return saveToCloud(KEYS.COMPANIES, data);
}
export function saveCustomers(data: Customer[]): Promise<void> {
  return saveToCloud(KEYS.CUSTOMERS, data);
}
export function saveEmployees(data: Employee[]): Promise<void> {
  return saveToCloud(KEYS.EMPLOYEES, data);
}
export function saveErpProjects(data: ErpProject[]): Promise<void> {
  return saveToCloud(KEYS.ERP_PROJECTS, data);
}
export function saveQuotations(data: Quotation[]): Promise<void> {
  return saveToCloud(KEYS.QUOTATIONS, data);
}
export function saveInvoices(data: Invoice[]): Promise<void> {
  return saveToCloud(KEYS.INVOICES, data);
}
export function savePayments(data: PaymentRecord[]): Promise<void> {
  return saveToCloud(KEYS.PAYMENTS, data);
}
export function saveExpenses(data: ExpenseRecord[]): Promise<void> {
  return saveToCloud(KEYS.EXPENSES, data);
}
export function saveIncomes(data: IncomeRecord[]): Promise<void> {
  return saveToCloud(KEYS.INCOMES, data);
}
export function saveCompanyProfile(data: CompanyProfile): Promise<void> {
  return saveToCloud(KEYS.COMPANY_PROFILE, data);
}

/** Add a booking and save the full list to cloud */
export async function addBooking(booking: Omit<Booking, 'id' | 'createdDate' | 'status'>): Promise<Booking> {
  const res = await fetch('/api/get-all-data', { headers: { Accept: 'application/json' } });
  const db = res.ok ? await res.json() : {};
  const list: Booking[] = Array.isArray(db[KEYS.BOOKINGS]) ? db[KEYS.BOOKINGS] : SEED_BOOKINGS;
  const newBooking: Booking = {
    ...booking,
    id: `b-${Date.now()}`,
    status: 'Pending',
    createdDate: new Date().toISOString().split('T')[0],
  };
  list.unshift(newBooking);
  await saveToCloud(KEYS.BOOKINGS, list);
  return newBooking;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LEADERSHIP: Leader[] = [
  {
    id: 'leader-1',
    name: 'Yuvanshan Prabakaran',
    role: 'CEO',
    bio: 'Directing overall corporate strategy and technical execution at Mahdev Pvt Ltd.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'leader-2',
    name: 'Divaincy Fernando',
    role: 'Co Founder & Managing Director',
    bio: 'Spearheading business operations, design excellence, and event management logistics.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
];

const DEFAULT_RENTALS: RentalItem[] = [
  { id: 'rent-1', name: 'Luxury Banquet Gold Chiavari Chair', category: 'Furniture', price: 'Rs. 250 / day', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600', description: 'Elegant gold-finished titanium metal Chiavari chairs.', availableQty: 450 },
  { id: 'rent-2', name: 'Rustic Hexagonal Wooden Arch', category: 'Backdrops', price: 'Rs. 7,500 / day', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600', description: 'Sturdy modular solid mahogany hex arch frame.', availableQty: 4 },
  { id: 'rent-3', name: 'Warm LED Bulbs String Lights (50m)', category: 'Lighting', price: 'Rs. 1,500 / day', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600', description: 'Heavy-duty commercial outdoor string lights.', availableQty: 25 },
  { id: 'rent-4', name: 'Polished Brass Traditional 6ft Oil Lamp', category: 'Props', price: 'Rs. 3,000 / day', image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=600', description: 'Grand 6-feet polished brass standing lamp.', availableQty: 6 },
  { id: 'rent-5', name: 'Exotic Silver 5-Arm Candelabra', category: 'Tableware', price: 'Rs. 850 / day', image: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600', description: 'Stately five-arm polished silver table centerpiece.', availableQty: 30 },
  { id: 'rent-6', name: 'High-Definition P2.5 LED Screen (12ft x 8ft)', category: 'AV Equipment', price: 'Rs. 45,000 / day', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', description: 'Ultra HD high-brightness P2.5 LED modular wall backdrop.', availableQty: 2 },
];

const SEED_BOOKINGS: Booking[] = [
  { id: 'b-1', brand: 'SWS', name: 'Dilruwan Perera', phone: '+94 77 123 4567', email: 'dilruwan@example.com', serviceType: 'Wedding Stage Design', eventDate: '2026-07-20', status: 'Confirmed', notes: 'Premium gold themed wedding stage.', location: 'Kingsbury Hotel, Colombo', budget: 'Rs. 150,000 - 200,000', guests: 250, amount: 150000, createdDate: '2026-07-01' },
  { id: 'b-2', brand: 'SWS', name: 'Sheruni Alwis', phone: '+94 71 987 6543', email: 'sheruni@example.com', serviceType: 'Birthday Decoration', eventDate: '2026-07-04', status: 'Completed', notes: 'Magical pink and white theme.', location: 'Private Residence, Negombo', budget: 'Rs. 40,000 - 60,000', guests: 50, amount: 45000, createdDate: '2026-06-28' },
  { id: 'b-3', brand: 'IT', name: 'Senura Holdings', phone: '+94 11 234 5678', email: 'contact@senura.lk', serviceType: 'ERP Inventory System', eventDate: '2026-07-15', status: 'Pending', notes: 'Bespoke inventory management portal.', budget: 'Rs. 500,000 - 800,000', amount: 650000, createdDate: '2026-07-05' },
  { id: 'b-4', brand: 'IT', name: 'Oceanic Leisure Ltd', phone: '+94 76 543 2109', email: 'info@oceanicleisure.com', serviceType: 'Website Development', eventDate: '2026-06-25', status: 'Completed', notes: 'Luxury travel e-commerce portal.', budget: 'Rs. 250,000 - 350,000', amount: 280000, createdDate: '2026-06-10' },
  { id: 'b-5', brand: 'Studio', name: 'Kanishka & Piyumi', phone: '+94 72 345 6789', email: 'kanishka@example.com', serviceType: 'Wedding Videography', eventDate: '2026-07-18', status: 'Confirmed', notes: 'Full-day cinematic shoot.', budget: 'Rs. 100,000 - 150,000', amount: 120000, createdDate: '2026-07-03' },
  { id: 'b-6', brand: 'Travels', name: 'Arthur Pendelton', phone: '+44 7911 123456', email: 'arthur.p@yahoo.co.uk', serviceType: 'Travel Package', eventDate: '2026-07-25', endDate: '2026-08-01', status: 'Confirmed', notes: 'Sri Lanka Tour.', guests: 4, location: 'Sri Lanka (Colombo to Mirissa)', amount: 195000, createdDate: '2026-07-02' },
];

const DEFAULT_VEHICLES: TravelsVehicle[] = [
  { id: 'v1', name: 'Mercedes-Benz S-Class (White)', category: 'wedding', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', price: 'Rs. 45,000 / day', passengers: 4, luggage: 3, engine: '2.0L Turbo Hybrid', features: ['Silk White Interior', 'Chauffeur Driven', 'Luxury Floral Decor Option', 'Ambient Dual Lighting', 'Panoramic Glass Roof'] },
  { id: 'v2', name: 'Chrysler 300C Luxury Sedan', category: 'wedding', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600', price: 'Rs. 38,000 / day', passengers: 4, luggage: 4, engine: '3.6L V6 Dual-VVT', features: ['Classic Royal Presence', 'Heated Leather Seats', 'Custom Ribbons & Decor'] },
  { id: 'v3', name: 'Toyota Land Cruiser Prado TX', category: 'premium', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', price: 'Rs. 32,000 / day', passengers: 7, luggage: 5, engine: '2.8L Intercooler Diesel', features: ['Robust 4x4 Drivetrain', 'Tri-Zone A/C Climate', 'Spacious Third Row Cabin'] },
  { id: 'v4', name: 'Toyota Premio F (Luxury Edition)', category: 'premium', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600', price: 'Rs. 18,000 / day', passengers: 4, luggage: 3, engine: '1.5L Dual VVT-i', features: ['Ultra Smooth Commute', 'Exceptional Fuel Economy', 'Plush Beige Velvet Seats'] },
  { id: 'v5', name: 'Toyota HiAce KDH Luxury Van', category: 'vans', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600', price: 'Rs. 25,000 / day', passengers: 14, luggage: 8, engine: '3.0L Turbo Diesel', features: ['Individually Adjustable Recliners', 'Dual A/C Evaporators', 'Bluetooth Sound Hub'] },
];

const DEFAULT_TOURS: TravelsTour[] = [
  { id: 't1', title: 'Cultural Triangle & Temple Wonders', duration: '5 Days / 4 Nights', image: 'https://images.unsplash.com/photo-1588598126749-0144d18ecf0d?auto=format&fit=crop&q=80&w=600', price: 'Rs. 145,000 / person', highlights: ['Sigiriya Fortress Hike', 'Dambulla Cave Temple', 'Kandy Sacred Temple of Tooth', 'Traditional Kandyan Dance'], itinerary: [{ day: 1, title: 'Arrival & Sigiriya Journey', desc: 'Airport greeting and scenic transport to Sigiriya.' }, { day: 2, title: 'Sigiriya Rock Fortress & Dambulla', desc: 'Morning hike up the Sigiriya Lion Rock Citadel.' }, { day: 3, title: 'Sacred Kandy Exploration', desc: 'Travel to Kandy via spice gardens.' }, { day: 4, title: 'Royal Botanical Gardens', desc: 'Walk through Peradeniya Royal Botanic wonders.' }, { day: 5, title: 'Airport Departure', desc: 'Chauffeur transport to airport.' }] },
  { id: 't2', title: 'The Misty Emerald Highlands Tour', duration: '4 Days / 3 Nights', image: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600', price: 'Rs. 115,000 / person', highlights: ['Nuwara Eliya Tea Plucking', 'Nine Arch Bridge Walk', 'Ella Rock Sunset Trek', 'Scenic Alpine Train Ride'], itinerary: [{ day: 1, title: 'Kandy to Nuwara Eliya Alpine Drive', desc: 'Scenic mountain climb.' }, { day: 2, title: 'Tea Estates & Train Ride', desc: 'Live organic tea leaves harvesting.' }, { day: 3, title: 'Ella Rock Trek & Nine Arches', desc: 'Hike to Ella Rock summit.' }, { day: 4, title: 'Ravana Falls & Airport Return', desc: 'Admire Ravana waterfall.' }] },
  { id: 't3', title: 'Southern Golden Sands & Wild Safaris', duration: '6 Days / 5 Nights', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600', price: 'Rs. 165,000 / person', highlights: ['Galle Dutch Fort Heritage Tour', 'Yala National Park Leopard Safari', 'Mirissa Whale Watching'], itinerary: [{ day: 1, title: 'Arrival & Beach Check-in', desc: 'Direct luxury express drive.' }, { day: 2, title: 'Galle Fort Discovery', desc: 'Explore cobblestone alleys.' }, { day: 3, title: 'Whale Watching & Turtle Hatcheries', desc: 'Early morning oceanic yacht cruise.' }, { day: 4, title: 'Yala Wildlife Safari', desc: 'Full-day open-roof 4x4 safari.' }, { day: 5, title: 'Water Sports in Bentota', desc: 'Thrilling water sports.' }, { day: 6, title: 'Farewell Coastal Tour', desc: 'Coastal train commute.' }] },
];

const DEFAULT_COMPANIES: Company[] = [
  { id: 'C-1', name: 'Nations Trust Bank PLC', address: 'No. 242, Union Place, Colombo 02, Sri Lanka', phone: '+94 11 471 1411', email: 'corporate@ntb.lk', website: 'www.nationstrust.com', registrationNumber: 'PB-1294' },
  { id: 'C-2', name: 'Aitken Spence PLC', address: 'Aitken Spence Tower, No. 315, Vauxhall Street, Colombo 02', phone: '+94 11 230 8308', email: 'info@aitkenspence.lk', website: 'www.aitkenspence.com', registrationNumber: 'PB-435' },
  { id: 'C-3', name: 'Dilmah Ceylon Tea Company PLC', address: 'No. 111, Negombo Road, Peliyagoda, Sri Lanka', phone: '+94 11 482 2000', email: 'info@dilmahtea.com', website: 'www.dilmahtea.com', registrationNumber: 'PQ-209' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Kamal Perera', email: 'kamal.perera@ntb.lk', phone: '+94 77 123 4567', companyId: 'C-1', notes: 'Senior VP of Infrastructure.', status: 'Active', history: [{ date: '2026-06-01', action: 'Account Created', details: 'Initial sales lead established.' }], documents: [] },
  { id: 'cust-2', name: 'Anura de Silva', email: 'anura.desilva@aitkenspence.lk', phone: '+94 71 987 6543', companyId: 'C-2', notes: 'Lead procurement manager.', status: 'Active', history: [{ date: '2026-06-10', action: 'Quotation Dispatched', details: 'Sent Rs. 4,500,000 CRM brief.' }], documents: [] },
  { id: 'cust-3', name: 'Sanduni Jayasinghe', email: 'sanduni.j@outlook.com', phone: '+94 72 345 6789', notes: 'Wedding Planner coordinate client.', status: 'Active', history: [{ date: '2026-06-15', action: 'Initial Site Inspection', details: 'Completed floral layout.' }], documents: [] },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Roshan Ranasinghe', email: 'roshan@mahdev.lk', phone: '+94 77 888 1111', department: 'IT Solutions', role: 'Lead Solutions Architect', attendance: {}, salary: 250000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 250000, bonus: 15000, net: 265000, paidAt: '2026-06-30' }], performanceScore: 5 },
  { id: 'emp-2', name: 'Shalini Fonseka', email: 'shalini@mahdev.lk', phone: '+94 77 888 2222', department: 'SWS Events', role: 'Chief Creative Decorator', attendance: {}, salary: 180000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 180000, bonus: 20000, net: 200000, paidAt: '2026-06-30' }], performanceScore: 4 },
  { id: 'emp-3', name: 'Nuwan Bandara', email: 'nuwan@mahdev.lk', phone: '+94 77 888 3333', department: 'U1 Studio', role: 'Senior Cinematic Videographer', attendance: {}, salary: 160000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 160000, bonus: 5000, net: 165000, paidAt: '2026-06-30' }], performanceScore: 4 },
  { id: 'emp-4', name: 'Priyantha Jayawardena', email: 'priyantha@mahdev.lk', phone: '+94 77 888 4444', department: 'Finance', role: 'Senior Accountant', attendance: {}, salary: 150000, leaveRequests: [], payrollHistory: [{ month: 'June 2026', basic: 150000, bonus: 0, net: 150000, paidAt: '2026-06-30' }], performanceScore: 5 },
];

const DEFAULT_ERP_PROJECTS: ErpProject[] = [
  { id: 'p-1', name: 'Aitken Spence Custom CRM & Automation', customerId: 'cust-2', companyId: 'C-2', description: 'Enterprise CRM with automated workflows and executive forecasting analytics.', status: 'In Progress', startDate: '2026-05-10', deadline: '2026-09-30', progress: 65, budget: 4500000, assignedEmployees: ['emp-1'], tasks: [{ id: 't-1-1', title: 'Database Schema & Security Auditing', projectId: 'p-1', assignedTo: 'emp-1', dueDate: '2026-07-20', status: 'In Progress', priority: 'High' }], milestones: [{ id: 'm-1-1', title: 'Database & REST API Endpoints Signed Off', dueDate: '2026-07-31', isCompleted: false }], files: [] },
  { id: 'p-2', name: 'SWS Luxury Wedding - Taj Samudra Grand Ballroom', customerId: 'cust-3', description: 'Bespoke design, canopy structure, 40-foot illuminated stage.', status: 'Planning', startDate: '2026-07-15', deadline: '2026-08-25', progress: 40, budget: 1800000, assignedEmployees: ['emp-2'], tasks: [{ id: 't-2-1', title: 'Floral Selection & Silk Canopy Sourcing', projectId: 'p-2', assignedTo: 'emp-2', dueDate: '2026-07-25', status: 'Todo', priority: 'High' }], milestones: [{ id: 'm-2-1', title: 'Botanical Assets Sourced', dueDate: '2026-08-01', isCompleted: false }], files: [] },
];

const DEFAULT_QUOTATIONS: Quotation[] = [
  { id: 'q-1', quotationNumber: 'QT-2026-101', customerId: 'cust-1', createdDate: '2026-06-01', validUntil: '2026-07-15', items: [{ id: 'qi-1', description: 'Bespoke Bank Branch Digital Lobby Portal Screen Suite', quantity: 1, unitPrice: 1500000 }], discount: 0, vat: 15, nbt: 2, terms: '50% advance upon confirmation.', status: 'Approved' },
  { id: 'q-2', quotationNumber: 'QT-2026-102', customerId: 'cust-2', createdDate: '2026-06-10', validUntil: '2026-07-30', items: [{ id: 'qi-2-1', description: 'Enterprise CRM Core Modules Integration', quantity: 1, unitPrice: 3000000 }, { id: 'qi-2-2', description: 'Dynamic Interactive Executive Dashboard', quantity: 1, unitPrice: 1500000 }], discount: 10, vat: 15, nbt: 0, terms: '30% Advance, 40% on Beta, 30% on Final.', status: 'Approved' },
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV-2026-001', customerId: 'cust-1', projectId: 'p-1', projectName: 'Corporate Lobby Digital Suite', createdDate: '2026-06-01', dueDate: '2026-07-01', items: [{ id: 'ii-1', description: 'Bespoke Bank Branch Digital Lobby Portal Screen Suite', quantity: 1, unitPrice: 1500000 }], discount: 0, tax: 15, status: 'Paid', advanceAmount: 750000, remainingAmount: 0, paidAmount: 1500000 },
  { id: 'inv-2', invoiceNumber: 'INV-2026-002', customerId: 'cust-2', projectId: 'p-1', projectName: 'Aitken Spence Custom CRM', createdDate: '2026-06-12', dueDate: '2026-07-15', items: [{ id: 'ii-2-1', description: 'Enterprise CRM Core Modules Integration', quantity: 1, unitPrice: 3000000 }], discount: 10, tax: 15, status: 'Partially Paid', advanceAmount: 1350000, remainingAmount: 2250000, paidAmount: 2250000 },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  { id: 'pay-1', invoiceId: 'inv-1', amount: 1500000, paymentDate: '2026-06-05', source: 'Bank Transfer (Nations Trust Bank)', receiptNumber: 'REC-2026-0891', type: 'Final' },
  { id: 'pay-2', invoiceId: 'inv-2', amount: 2250000, paymentDate: '2026-06-20', source: 'Bank Transfer (Commercial Bank)', receiptNumber: 'REC-2026-0892', type: 'Advance' },
];

const DEFAULT_EXPENSES: ExpenseRecord[] = [
  { id: 'exp-1', description: 'Imported Silk Canopy fabric rolls (SWS Wedding)', category: 'Decorations', amount: 320000, date: '2026-06-15', vendor: 'Selas Timber & Fabrics Ltd', receiptUrl: '' },
  { id: 'exp-2', description: 'AWS Cloud Server Hosting Fees', category: 'IT Solutions', amount: 45000, date: '2026-07-01', vendor: 'Amazon Web Services Inc.', receiptUrl: '' },
  { id: 'exp-3', description: 'KDH High-Roof Van Fuel & Toll Fees', category: 'Travels', amount: 15000, date: '2026-07-05', vendor: 'Ceypetco Fuel Station', receiptUrl: '' },
];

const DEFAULT_INCOMES: IncomeRecord[] = [
  { id: 'inc-1', description: 'Cinematic Pre-Wedding Drone Videography Booking Deposit', source: 'U1 Studio Services', amount: 80000, date: '2026-07-02', notes: 'Taj Samudra Sunset Package' },
  { id: 'inc-2', description: 'SWS Event Stage Flowers Bulk Resale Margin', source: 'SWS Flower Wholesale', amount: 35000, date: '2026-07-04', notes: 'Sold leftover roses to local florists' },
];

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'Mahdev Pvt Ltd',
  logo: mahadevLogo,
  favicon: '/favicon.ico',
  registrationNumber: 'PV-987654',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  phones: ['+94 11 234 5678', '+94 77 123 4567'],
  whatsApp: '+94 77 123 4567',
  email: 'corporate@mahdev.lk',
  website: 'https://www.mahdev.lk',
  googleMapsLocation: 'https://maps.google.com/?q=Colombo',
  workingHours: '9:00 AM - 6:00 PM (Monday - Saturday)',
  bankAccount: 'Nations Trust Bank PLC, Colombo 03 Branch - A/C No. 100234567890',
  paymentQrCode: '',
  taxInformation: 'VAT Registration No: 100234567-7000',
  invoicePrefix: 'MAH',
  currency: 'Rs. (LKR)',
  timezone: 'Asia/Colombo',
};
