/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActivePage {
  Home = 'home',
  Decoration = 'decoration',
  Photography = 'photography',
  Travels = 'travels',
  ErpSolutions = 'erp-solutions',
  ItSolutions = 'it-solutions',
  Contact = 'contact',
  Admin = 'admin'
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  page: ActivePage;
  image: string;
}

export interface DecorationCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  iconName: string;
}

export interface PhotoPortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface ErpModule {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface ItProject {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  url: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface BookingDetails {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  eventDate: string;
  guests?: number;
  notes: string;
}

export interface Booking {
  id: string;
  brand: 'SWS' | 'IT' | 'Studio' | 'Travels';
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  eventDate: string;
  endDate?: string;
  guests?: number;
  budget?: string;
  location?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
  amount?: number;
  createdDate: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface DecorationGalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface RentalItem {
  id: string;
  name: string;
  category: string;
  price: string; // e.g. "Rs. 2,500 / day"
  image: string;
  description: string;
  availableQty: number;
}

export interface TravelsVehicle {
  id: string;
  name: string;
  category: 'wedding' | 'premium' | 'vans';
  image: string;
  price: string;
  passengers: number;
  luggage: number;
  engine: string;
  features: string[];
}

export interface TourItineraryDay {
  day: number;
  title: string;
  desc: string;
}

export interface TravelsTour {
  id: string;
  title: string;
  duration: string;
  image: string;
  price: string;
  highlights: string[];
  itinerary: TourItineraryDay[];
}

export interface ThemeSettings {
  primaryColor: string;
  themePreset: 'purple' | 'emerald' | 'blue' | 'rose' | 'amber' | 'custom';
  fontFamily: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;
  brandName: string;
  websiteTitle: string;
  faviconUrl: string;
  animationMode: 'multiverse' | 'decoration' | 'photography' | 'it' | 'erp';
  brandLogo?: string;
  decorationBanner?: string;
  photographyBanner?: string;
  itBanner?: string;
  travelsBanner?: string;
  weddingDecorationBanner?: string;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  notes: string;
  status: 'Active' | 'Lead' | 'Inactive' | 'New Lead' | 'Active Customer' | 'Returning Customer' | 'VIP Customer' | 'Corporate Customer' | 'Government Customer' | 'Inactive Customer' | 'Blacklisted';
  history: { date: string; action: string; details: string; user?: string }[];
  documents: { name: string; url: string; size: string; uploadedAt: string; category?: string }[];
  
  // Basic Information
  customerType?: 'Individual' | 'Company';
  companyName?: string;
  contactPerson?: string;
  designation?: string;
  
  // Contact Details
  altPhone?: string;
  whatsappNumber?: string;
  secondaryEmail?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  googleMapsLocation?: string;

  // Business Information (For Companies)
  businessRegNum?: string;
  taxNumber?: string;
  website?: string;
  industry?: string;

  // Additional Information
  preferredCommMethod?: 'Email' | 'WhatsApp' | 'Phone';
  preferredLanguage?: 'English' | 'Tamil' | 'Sinhala';
  tags?: string[];
  deleted?: boolean; // Soft Delete support
}

export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  registrationNumber?: string;
  taxNumber?: string;
  industry?: string;
  notes?: string;
  deleted?: boolean;
}

export interface ErpProject {
  id: string;
  name: string;
  customerId: string;
  companyId?: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate: string;
  deadline: string;
  progress: number;
  budget: number;
  assignedEmployees: string[];
  tasks: ErpTask[];
  milestones: { id: string; title: string; dueDate: string; isCompleted: boolean }[];
  files: { name: string; url: string; size: string }[];
}

export interface ErpTask {
  id: string;
  title: string;
  projectId: string;
  assignedTo: string;
  dueDate: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  projectId?: string;
  createdDate: string;
  validUntil: string;
  items: QuotationItem[];
  discount: number;
  vat: number;
  nbt: number;
  terms: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  signature?: string;
}

export interface InvoiceItem {
  id: string;
  name?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

export interface InvoiceLog {
  user: string;
  timestamp: string;
  action: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  projectId?: string;
  projectName?: string;
  projectCategory?: string;
  salesRep?: string;
  createdDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  tax: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded' | 'Pending';
  advanceAmount: number;
  remainingAmount: number;
  paidAmount: number;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  activityLogs?: InvoiceLog[];
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  source: string; // This stores the payment method, e.g. Cash, Bank Transfer, etc.
  receiptNumber: string;
  type: 'Advance' | 'Installment' | 'Final';
  receivedBy?: string;
  referenceNumber?: string;
  notes?: string;
  transactionId?: string;
  paymentProof?: string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor: string;
  receiptUrl?: string;
}

export interface IncomeRecord {
  id: string;
  description: string;
  source: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  attendance: { [date: string]: 'Present' | 'Absent' | 'Leave' };
  salary: number;
  leaveRequests: { id: string; startDate: string; endDate: string; reason: string; status: 'Pending' | 'Approved' | 'Rejected' }[];
  payrollHistory: { month: string; basic: number; bonus: number; net: number; paidAt: string }[];
  performanceScore: number;
}

export interface CompanyProfile {
  name: string;
  logo: string;
  favicon: string;
  registrationNumber: string;
  address: string;
  phones: string[];
  whatsApp: string;
  email: string;
  website: string;
  googleMapsLocation: string;
  workingHours: string;
  bankAccount: string;
  paymentQrCode: string;
  taxInformation: string;
  invoicePrefix: string;
  currency: string;
  timezone: string;
}

export interface SmtpSettings {
  provider: 'gmail' | 'brevo' | 'mailjet' | 'zoho' | 'custom';
  host: string;
  port: number;
  username: string;
  password?: string;
  encryption: 'TLS' | 'SSL' | 'STARTTLS';
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  enabled: boolean;
}

export interface SmtpTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}
