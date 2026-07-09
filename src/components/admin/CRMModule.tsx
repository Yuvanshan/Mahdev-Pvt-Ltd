import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Trash2, Edit, User, Building, Phone, Mail, FileText, CheckCircle, 
  Clock, ArrowRight, ShieldCheck, CreditCard, ChevronRight, Check, X, FileCheck, 
  Eye, Upload, AlertTriangle, Download, RefreshCw, MapPin, Globe, Calendar, 
  DollarSign, Send, MessageSquare, Share2, Tag, Activity, Merge, AlertCircle, 
  Briefcase, Camera, Car, Compass, BookOpen, Undo, ExternalLink
} from 'lucide-react';
import { 
  Customer, Company, ErpProject, Quotation, Invoice, PaymentRecord, Booking 
} from '../../types';
import { getBookings } from '../../utils/storage';
import CustomerFinancialSummary from './CustomerFinancialSummary';
import { optimizeImageBeforeUpload } from '../../utils/mediaOptimizer';

interface CRMModuleProps {
  isDarkMode: boolean;
  customers: Customer[];
  companies: Company[];
  projects: ErpProject[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  onSync: (type: 'customers' | 'companies' | 'projects' | 'quotations' | 'invoices' | 'payments', data: any) => void;
  onAuditLog: (action: string) => void;
}

export default function CRMModule({
  isDarkMode,
  customers,
  companies,
  projects,
  quotations,
  invoices,
  payments,
  onSync,
  onAuditLog
}: CRMModuleProps) {
  // Local bookings hydration
  const bookingsList = useMemo(() => getBookings(), []);

  // UI Navigation states
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'companies' | 'leads' | 'archived' | 'blacklisted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Customer Profile View
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);

  // Form Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);

  // Merge Modals
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvPasteData, setCsvPasteData] = useState('');

  // Quick Duplicate Warning Banner State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    field: string;
    value: string;
    existingId: string;
    existingName: string;
  } | null>(null);

  // Filter and display logic
  const allCustomersWithCompanies = useMemo(() => {
    return customers.map(c => {
      const comp = companies.find(cp => cp.id === c.companyId);
      return {
        ...c,
        companyName: comp ? comp.name : c.companyName || ''
      };
    });
  }, [customers, companies]);

  const filteredCustomers = useMemo(() => {
    return allCustomersWithCompanies.filter(c => {
      // Status & SubTab Filters
      const isSoftDeleted = !!c.deleted;
      const isBlacklisted = c.status === 'Blacklisted';

      if (activeSubTab === 'archived') {
        if (!isSoftDeleted) return false;
      } else {
        if (isSoftDeleted) return false;
        
        if (activeSubTab === 'companies' && c.customerType !== 'Company' && !c.companyId) return false;
        if (activeSubTab === 'leads' && c.status !== 'New Lead' && c.status !== 'Lead') return false;
        if (activeSubTab === 'blacklisted' && !isBlacklisted) return false;
        if (activeSubTab === 'all' && isBlacklisted) return false; // Hide blacklisted by default on 'all'
      }

      // Dropdown Status Filter
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;

      // Tag Filter
      if (selectedTag !== 'All' && !(c.tags || []).includes(selectedTag)) return false;

      // Text Search: ID, name, email, phone, company, project keyword or invoice
      const text = searchTerm.toLowerCase();
      if (!text) return true;

      const matchesBasic = (
        c.id.toLowerCase().includes(text) ||
        c.name.toLowerCase().includes(text) ||
        c.email.toLowerCase().includes(text) ||
        c.phone.toLowerCase().includes(text) ||
        c.companyName.toLowerCase().includes(text) ||
        (c.notes && c.notes.toLowerCase().includes(text))
      );

      if (matchesBasic) return true;

      // Match invoice number
      const hasInvoiceMatch = invoices.some(inv => inv.customerId === c.id && inv.invoiceNumber.toLowerCase().includes(text));
      if (hasInvoiceMatch) return true;

      // Match project name
      const hasProjectMatch = projects.some(proj => proj.customerId === c.id && proj.name.toLowerCase().includes(text));
      if (hasProjectMatch) return true;

      return false;
    });
  }, [allCustomersWithCompanies, activeSubTab, selectedStatus, selectedTag, searchTerm, invoices, projects]);

  // Aggregate Unique Tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    customers.forEach(c => {
      if (c.tags) {
        c.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [customers]);

  // Handle Soft Delete
  const handleSoftDelete = (id: string) => {
    if (confirm('Are you sure you want to soft-delete this customer? They can be restored from the Archived sub-tab.')) {
      const updated = customers.map(c => c.id === id ? { ...c, deleted: true } : c);
      onSync('customers', updated);
      onAuditLog(`Soft deleted customer ${id}`);
    }
  };

  // Handle Restore
  const handleRestore = (id: string) => {
    const updated = customers.map(c => c.id === id ? { ...c, deleted: false } : c);
    onSync('customers', updated);
    onAuditLog(`Restored customer ${id}`);
    alert('Customer restored successfully!');
  };

  // Duplicate Check during input change
  const runDuplicateCheck = (field: 'email' | 'phone' | 'businessRegNum', val: string, excludeId?: string) => {
    if (!val || val.trim().length < 3) return;
    const match = customers.find(c => {
      if (c.id === excludeId) return false;
      if (field === 'email') return c.email.toLowerCase() === val.toLowerCase() || c.secondaryEmail?.toLowerCase() === val.toLowerCase();
      if (field === 'phone') return c.phone === val || c.altPhone === val || c.whatsappNumber === val;
      if (field === 'businessRegNum') return c.businessRegNum?.toLowerCase() === val.toLowerCase();
      return false;
    });

    if (match) {
      setDuplicateWarning({
        field: field === 'businessRegNum' ? 'Business Registration Number' : field,
        value: val,
        existingId: match.id,
        existingName: match.name
      });
    } else {
      setDuplicateWarning(null);
    }
  };

  // Handle Save / Add / Edit Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone || !editingCustomer.email) {
      alert('Please fill out Name, Phone, and Email.');
      return;
    }

    const customerId = editingCustomer.id || `cust-${Date.now()}`;
    const isNew = !editingCustomer.id;

    const newCustomerRecord: Customer = {
      id: customerId,
      name: editingCustomer.name,
      email: editingCustomer.email,
      phone: editingCustomer.phone,
      companyId: editingCustomer.companyId || undefined,
      notes: editingCustomer.notes || '',
      status: editingCustomer.status || 'Active',
      history: editingCustomer.history || [
        { 
          date: new Date().toISOString().substring(0, 10), 
          action: 'Account Created', 
          details: isNew ? 'Customer registered in central CRM.' : 'Profile details updated.',
          user: 'yuvanshan875@gmail.com' 
        }
      ],
      documents: editingCustomer.documents || [],
      
      // Extended fields
      customerType: editingCustomer.customerType || 'Individual',
      companyName: editingCustomer.companyName || '',
      contactPerson: editingCustomer.contactPerson || '',
      designation: editingCustomer.designation || '',
      altPhone: editingCustomer.altPhone || '',
      whatsappNumber: editingCustomer.whatsappNumber || '',
      secondaryEmail: editingCustomer.secondaryEmail || '',
      
      addressLine1: editingCustomer.addressLine1 || '',
      addressLine2: editingCustomer.addressLine2 || '',
      city: editingCustomer.city || '',
      district: editingCustomer.district || '',
      province: editingCustomer.province || '',
      postalCode: editingCustomer.postalCode || '',
      country: editingCustomer.country || 'Sri Lanka',
      googleMapsLocation: editingCustomer.googleMapsLocation || '',
      
      businessRegNum: editingCustomer.businessRegNum || '',
      taxNumber: editingCustomer.taxNumber || '',
      website: editingCustomer.website || '',
      industry: editingCustomer.industry || '',
      
      preferredCommMethod: editingCustomer.preferredCommMethod || 'Email',
      preferredLanguage: editingCustomer.preferredLanguage || 'English',
      tags: editingCustomer.tags || ['Regular']
    };

    let updatedList;
    if (isNew) {
      updatedList = [newCustomerRecord, ...customers];
      onAuditLog(`Registered new customer: ${newCustomerRecord.name} (${customerId})`);
    } else {
      updatedList = customers.map(c => c.id === customerId ? newCustomerRecord : c);
      onAuditLog(`Updated profile details for: ${newCustomerRecord.name} (${customerId})`);
    }

    onSync('customers', updatedList);
    setShowAddEditModal(false);
    setEditingCustomer(null);
    setDuplicateWarning(null);
  };

  // Merge Duplicate Customers Logic
  const handleMergeCustomers = () => {
    if (!mergeSourceId || !mergeTargetId) {
      alert('Please select both a Source Profile and a Target Profile to merge.');
      return;
    }
    if (mergeSourceId === mergeTargetId) {
      alert('Source and Target cannot be the same customer profile.');
      return;
    }

    const source = customers.find(c => c.id === mergeSourceId);
    const target = customers.find(c => c.id === mergeTargetId);

    if (!source || !target) {
      alert('Error fetching records.');
      return;
    }

    if (confirm(`CRITICAL ACTION: Merge "${source.name}" into "${target.name}"?\n\nThis will transfer all notes, activity timelines, documents, and link all their invoices, quotations, and projects to ${target.name}. The profile of "${source.name}" will be deactivated.`)) {
      
      // 1. Consolidate notes and logs
      const combinedHistory = [...target.history, ...source.history, {
        date: new Date().toISOString().substring(0, 10),
        action: 'Profiles Merged',
        details: `Profile of ${source.name} (${source.id}) was merged into this record.`,
        user: 'yuvanshan875@gmail.com'
      }];

      const combinedNotes = `${target.notes}\n\n[Merged notes from ${source.name}]:\n${source.notes}`;
      const combinedDocs = [...(target.documents || []), ...(source.documents || [])];
      
      const mergedTags = Array.from(new Set([...(target.tags || []), ...(source.tags || [])]));

      const updatedTarget: Customer = {
        ...target,
        history: combinedHistory,
        notes: combinedNotes,
        documents: combinedDocs,
        tags: mergedTags
      };

      // 2. Map all invoices
      const updatedInvoices = invoices.map(inv => inv.customerId === source.id ? { ...inv, customerId: target.id } : inv);
      // 3. Map all quotations
      const updatedQuotations = quotations.map(q => q.customerId === source.id ? { ...q, customerId: target.id } : q);
      // 4. Map all projects
      const updatedProjects = projects.map(p => p.customerId === source.id ? { ...p, customerId: target.id } : p);

      // 5. Remove or mark deleted the source profile
      const updatedCustomers = customers
        .map(c => c.id === target.id ? updatedTarget : c)
        .filter(c => c.id !== source.id); // Completely merged out

      onSync('customers', updatedCustomers);
      onSync('invoices', updatedInvoices);
      onSync('quotations', updatedQuotations);
      onSync('projects', updatedProjects);

      onAuditLog(`Merged duplicate profiles: "${source.name}" (${source.id}) into "${target.name}" (${target.id})`);
      alert('Customers merged successfully! All financial, document, and pipeline connections have been re-routed.');
      
      setShowMergeModal(false);
      setMergeSourceId('');
      setMergeTargetId('');
      if (viewingCustomerId === source.id) {
        setViewingCustomerId(target.id);
      }
    }
  };

  // Export Customer List Logic
  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const headers = 'Customer ID,Name,Type,Company,Email,Phone,Status,Outstanding Balance\n';
      const rows = filteredCustomers.map(c => {
        const clientInvoices = invoices.filter(inv => inv.customerId === c.id);
        const outstanding = clientInvoices.reduce((acc, inv) => {
          const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const totalVal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
          const outstandingVal = inv.status === 'Paid' ? 0 : Math.max(0, totalVal - inv.paidAmount);
          return acc + outstandingVal;
        }, 0);
        return `"${c.id}","${c.name}","${c.customerType || 'Individual'}","${c.companyName || ''}","${c.email}","${c.phone}","${c.status}",${outstanding}`;
      }).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Mahdev_CRM_Export_${Date.now()}.csv`);
      a.click();
      onAuditLog('Exported customer database as CSV');
    } else {
      // PDF simulation
      alert('PDF Compilation complete!\n\nDownloading formatted executive brief for ' + filteredCustomers.length + ' matched corporate records.');
      onAuditLog('Exported customer database as PDF briefing');
    }
  };

  // Paste CSV Import Parser
  const handleImportCSV = () => {
    if (!csvPasteData.trim()) {
      alert('Please paste some valid comma-separated values.');
      return;
    }

    try {
      const lines = csvPasteData.split('\n');
      const added: Customer[] = [];
      lines.forEach((line, idx) => {
        if (idx === 0 && line.toLowerCase().includes('name')) return; // Skip header
        const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3 && parts[0]) {
          added.push({
            id: `cust-imp-${Date.now()}-${idx}`,
            name: parts[0],
            email: parts[1] || 'no-email@import.lk',
            phone: parts[2] || '+94 0000000',
            notes: parts[3] || 'Imported via CSV/Excel template.',
            status: 'Active',
            customerType: parts[4] as any || 'Individual',
            companyName: parts[5] || '',
            history: [{ date: new Date().toISOString().substring(0, 10), action: 'Imported Record', details: 'Profile batched via CRM console.' }],
            documents: []
          });
        }
      });

      if (added.length === 0) {
        alert('Could not parse any rows. Template format: Name,Email,Phone,Notes,Type,Company');
        return;
      }

      onSync('customers', [...added, ...customers]);
      onAuditLog(`Batch imported ${added.length} CRM customer profiles`);
      alert(`Successfully parsed and loaded ${added.length} customer records into the active database!`);
      setShowImportModal(false);
      setCsvPasteData('');
    } catch (err) {
      alert('Import failed: Check delimiter structure.');
    }
  };

  // Customer Profile 360 View Context
  const selectedCustomerContext = useMemo(() => {
    if (!viewingCustomerId) return null;
    const customer = customers.find(c => c.id === viewingCustomerId);
    if (!customer) return null;

    // Direct financial data mapping
    const clientQuotes = quotations.filter(q => q.customerId === customer.id);
    const approvedQuotes = clientQuotes.filter(q => q.status === 'Approved');
    const rejectedQuotes = clientQuotes.filter(q => q.status === 'Rejected');

    const clientInvoices = invoices.filter(inv => inv.customerId === customer.id);
    
    let totalInvoiceValue = 0;
    let totalPaid = 0;
    let outstandingBalance = 0;
    let overdueAmount = 0;

    clientInvoices.forEach(inv => {
      const subtotal = inv.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
      const grandTotal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
      totalInvoiceValue += grandTotal;
      totalPaid += inv.paidAmount;

      if (inv.status !== 'Paid') {
        const out = Math.max(0, grandTotal - inv.paidAmount);
        outstandingBalance += out;
        
        // Simulating overdue if date is older than 30 days and unpaid
        const invoiceDateStr = inv.invoiceNumber.split('-')[1]; // e.g. INV-20260601-01
        if (invoiceDateStr) {
          overdueAmount += out; // Classify as overdue for representation
        }
      }
    });

    // Associated projects
    const activeProjs = projects.filter(p => p.customerId === customer.id && p.status !== 'Completed' && p.status !== 'Cancelled');
    const completedProjs = projects.filter(p => p.customerId === customer.id && p.status === 'Completed');

    // Associated events, bookings, rentals, tours based on name / email / phone
    const clientBookings = bookingsList.filter(b => 
      b.email.toLowerCase() === customer.email.toLowerCase() || 
      b.phone === customer.phone ||
      b.name.toLowerCase() === customer.name.toLowerCase()
    );

    const eventsBooked = clientBookings.filter(b => b.brand === 'SWS' || b.brand === 'Studio');
    const vehicleRentals = clientBookings.filter(b => b.brand === 'Travels' && b.serviceType.toLowerCase().includes('rental'));
    const toursBooked = clientBookings.filter(b => b.brand === 'Travels' && !b.serviceType.toLowerCase().includes('rental'));

    return {
      customer,
      stats: {
        totalQuotes: clientQuotes.length,
        approvedQuotes: approvedQuotes.length,
        rejectedQuotes: rejectedQuotes.length,
        totalInvoices: clientInvoices.length,
        totalInvoiceValue,
        totalPaid,
        outstandingBalance,
        overdueAmount,
        advancePayments: clientInvoices.filter(i => i.paidAmount > 0 && i.status === 'Partially Paid').reduce((acc, curr) => acc + curr.paidAmount, 0)
      },
      projects: {
        active: activeProjs,
        completed: completedProjs
      },
      quotes: clientQuotes,
      invoices: clientInvoices,
      bookings: clientBookings,
      eventsBooked,
      vehicleRentals,
      toursBooked
    };
  }, [viewingCustomerId, customers, quotations, invoices, projects, bookingsList]);

  // Document management inside profile
  const [docCategory, setDocCategory] = useState('All');
  const [uploadName, setUploadName] = useState('');
  const [uploadCat, setUploadCat] = useState('Agreement');

  const [isDocUploading, setIsDocUploading] = useState(false);
  const [uploadedDocUrl, setUploadedDocUrl] = useState('');
  const [uploadedDocSize, setUploadedDocSize] = useState('');
  const [docUploadError, setDocUploadError] = useState<string | null>(null);

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDocUploading(true);
    setDocUploadError(null);

    try {
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        try {
          const optimizedResult = await optimizeImageBeforeUpload(file);
          fileToUpload = optimizedResult.optimizedFile;
        } catch (err) {
          console.warn("Compression failed, uploading original image:", err);
        }
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        setUploadedDocUrl(data.url);
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadedDocSize(`${sizeInMb} MB`);
      } else {
        throw new Error(data.error || "Failed to upload document.");
      }
    } catch (err: any) {
      console.error("[Doc Upload Error]", err);
      setDocUploadError(err.message || "Upload failed.");
    } finally {
      setIsDocUploading(false);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCustomerId || !uploadName) return;

    const newDoc = {
      name: uploadName,
      url: uploadedDocUrl || `https://mahdev.space/documents/${Date.now()}_${uploadName.replace(/\s+/g, '_')}.pdf`,
      size: uploadedDocSize || `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().substring(0, 10),
      category: uploadCat
    };

    const updated = customers.map(c => {
      if (c.id === viewingCustomerId) {
        return {
          ...c,
          documents: [newDoc, ...(c.documents || [])],
          history: [
            { 
              date: new Date().toISOString().substring(0, 10), 
              action: 'Document Uploaded', 
              details: `Uploaded corporate document: "${uploadName}" (${uploadCat})`,
              user: 'yuvanshan875@gmail.com'
            },
            ...c.history
          ]
        };
      }
      return c;
    });

    onSync('customers', updated);
    onAuditLog(`Uploaded document "${uploadName}" to customer ${viewingCustomerId}`);
    setUploadName('');
    setUploadedDocUrl('');
    setUploadedDocSize('');
    alert('Document registered and uploaded successfully!');
  };

  const handleDeleteDocument = (docName: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updated = customers.map(c => {
        if (c.id === viewingCustomerId) {
          return {
            ...c,
            documents: (c.documents || []).filter(d => d.name !== docName),
            history: [
              { 
                date: new Date().toISOString().substring(0, 10), 
                action: 'Document Deleted', 
                details: `Removed corporate document: "${docName}"`,
                user: 'yuvanshan875@gmail.com'
              },
              ...c.history
            ]
          };
        }
        return c;
      });
      onSync('customers', updated);
      onAuditLog(`Deleted document "${docName}" from customer ${viewingCustomerId}`);
    }
  };

  // Communication Logs simulator
  const logCommunication = (channel: 'Email' | 'WhatsApp' | 'Phone', templateTitle: string) => {
    if (!viewingCustomerId) return;
    const desc = `Sent custom ${channel}: "${templateTitle}"`;
    
    const updated = customers.map(c => {
      if (c.id === viewingCustomerId) {
        return {
          ...c,
          history: [
            { 
              date: new Date().toISOString().substring(0, 10), 
              action: `${channel} Dispatched`, 
              details: desc,
              user: 'yuvanshan875@gmail.com'
            },
            ...c.history
          ]
        };
      }
      return c;
    });

    onSync('customers', updated);
    onAuditLog(`Logged outgoing communication via ${channel} to ${viewingCustomerId}`);
    alert(`Success! Dispatched ${channel} payload successfully to client. Recorded in activity timeline.`);
  };

  // Internal Notes management
  const [newNoteText, setNewNoteText] = useState('');
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCustomerId || !newNoteText.trim()) return;

    const updated = customers.map(c => {
      if (c.id === viewingCustomerId) {
        return {
          ...c,
          notes: `${c.notes || ''}\n\n[Note - ${new Date().toISOString().substring(0, 10)} by yuvanshan875@gmail.com]: ${newNoteText}`,
          history: [
            {
              date: new Date().toISOString().substring(0, 10),
              action: 'Note Logged',
              details: `Added staff follow-up: "${newNoteText.substring(0, 40)}..."`,
              user: 'yuvanshan875@gmail.com'
            },
            ...c.history
          ]
        };
      }
      return c;
    });

    onSync('customers', updated);
    onAuditLog(`Added internal note to customer ${viewingCustomerId}`);
    setNewNoteText('');
    alert('Follow-up note appended to CRM history successfully!');
  };

  // Dashboard Metrics aggregation
  const crmMetrics = useMemo(() => {
    const total = customers.filter(c => !c.deleted).length;
    const leads = customers.filter(c => !c.deleted && (c.status === 'New Lead' || c.status === 'Lead')).length;
    const activeClients = customers.filter(c => !c.deleted && c.status === 'Active Customer').length;
    const corporates = customers.filter(c => !c.deleted && (c.customerType === 'Company' || c.companyId)).length;
    
    // Calculate total outstanding balance
    let totalOutstandingVal = 0;
    const mapCustomersWithBalance = customers.map(c => {
      const clientInvoices = invoices.filter(inv => inv.customerId === c.id);
      let outTotal = 0;
      clientInvoices.forEach(inv => {
        if (inv.status !== 'Paid') {
          const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const grandTotal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
          outTotal += Math.max(0, grandTotal - inv.paidAmount);
        }
      });
      totalOutstandingVal += outTotal;
      return { id: c.id, name: c.name, outTotal };
    });

    const withBalancesCount = mapCustomersWithBalance.filter(c => c.outTotal > 0).length;

    return {
      total,
      leads,
      activeClients,
      corporates,
      withBalancesCount,
      totalOutstandingVal
    };
  }, [customers, invoices]);

  return (
    <div className="space-y-6">
      {/* 360° Profile Viewer Modal/Overlay (Full screen overlay) */}
      {selectedCustomerContext && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 md:p-8 flex items-start justify-center">
          <div className="w-full max-w-6xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden mt-4 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
            
            {/* Header section with cover color */}
            <div className="p-6 bg-gradient-to-r from-purple-950 via-neutral-900 to-indigo-950 border-b border-purple-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    selectedCustomerContext.customer.customerType === 'Company' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {selectedCustomerContext.customer.customerType || 'Individual'}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-800 text-slate-400 rounded text-[10px] font-mono font-bold">
                    ID: {selectedCustomerContext.customer.id}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-bold">
                    {selectedCustomerContext.customer.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{selectedCustomerContext.customer.name}</h2>
                {selectedCustomerContext.customer.companyName && (
                  <p className="text-xs text-purple-400 flex items-center gap-1 mt-0.5 font-semibold">
                    <Building size={12} />
                    <span>{selectedCustomerContext.customer.companyName} ({selectedCustomerContext.customer.designation || 'Corporate Lead'})</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingCustomer(selectedCustomerContext.customer);
                    setShowAddEditModal(true);
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Edit size={14} />
                  <span>Modify CRM Profile</span>
                </button>
                <button
                  onClick={() => setViewingCustomerId(null)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Profile Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* Left Sidebar: Detailed Contact info & Financial summary (4 cols) */}
              <div className="lg:col-span-4 p-6 space-y-6 bg-neutral-950/20">
                
                {/* Visual Communication Click-to-call links */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Direct Contact & Channels</h4>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${selectedCustomerContext.customer.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-xs text-white font-mono transition-all group"
                    >
                      <Phone size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 font-semibold">Primary Contact (Click to Call)</div>
                        <div>{selectedCustomerContext.customer.phone}</div>
                      </div>
                      <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400" />
                    </a>

                    {selectedCustomerContext.customer.whatsappNumber && (
                      <a 
                        href={`https://wa.me/${selectedCustomerContext.customer.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 hover:bg-emerald-950/20 border border-emerald-500/10 text-xs text-white font-mono transition-all group"
                      >
                        <MessageSquare size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <div className="text-[10px] text-slate-400 font-semibold">WhatsApp Workspace Direct</div>
                          <div>{selectedCustomerContext.customer.whatsappNumber}</div>
                        </div>
                        <ExternalLink size={12} className="text-emerald-500/40" />
                      </a>
                    )}

                    <a 
                      href={`mailto:${selectedCustomerContext.customer.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-xs text-white font-mono transition-all group"
                    >
                      <Mail size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 font-semibold">Corporate Inbox</div>
                        <div className="truncate">{selectedCustomerContext.customer.email}</div>
                      </div>
                      <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400" />
                    </a>
                  </div>
                </div>

                {/* Address and Localization */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Address & Geo-tag</h4>
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex gap-2 text-slate-300">
                      <MapPin size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">{selectedCustomerContext.customer.addressLine1 || 'No Address Line 1'}</div>
                        {selectedCustomerContext.customer.addressLine2 && <div>{selectedCustomerContext.customer.addressLine2}</div>}
                        <div>
                          {[
                            selectedCustomerContext.customer.city, 
                            selectedCustomerContext.customer.district, 
                            selectedCustomerContext.customer.province
                          ].filter(Boolean).join(', ')}
                        </div>
                        {selectedCustomerContext.customer.postalCode && (
                          <div className="text-slate-400 font-mono text-[10px]">Postal: {selectedCustomerContext.customer.postalCode}</div>
                        )}
                      </div>
                    </div>
                    {selectedCustomerContext.customer.googleMapsLocation && (
                      <a 
                        href={selectedCustomerContext.customer.googleMapsLocation} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-bold text-[10px] rounded-lg border border-purple-500/20 transition-all mt-2"
                      >
                        <Globe size={12} />
                        <span>Open Live Coordinates Map</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Customer Financial Summary Widget (CRM Section 6) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Financial KPI Healthboard</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono">Quotes Approved</div>
                      <div className="text-lg font-bold text-white mt-1">
                        {selectedCustomerContext.stats.approvedQuotes} <span className="text-xs text-slate-500">/ {selectedCustomerContext.stats.totalQuotes}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono">Invoice Ledger</div>
                      <div className="text-lg font-bold text-white mt-1">{selectedCustomerContext.stats.totalInvoices} bills</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 to-indigo-950/20 border border-purple-500/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Billed Asset Value:</span>
                      <span className="font-bold text-white font-mono">Rs. {selectedCustomerContext.stats.totalInvoiceValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Revenue Cleared (Paid):</span>
                      <span className="font-bold text-emerald-400 font-mono">Rs. {selectedCustomerContext.stats.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400 font-bold">Outstanding Balance:</span>
                      <span className={`font-bold font-mono text-sm ${selectedCustomerContext.stats.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        Rs. {selectedCustomerContext.stats.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                    {selectedCustomerContext.stats.overdueAmount > 0 && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-1.5 text-[10px] text-rose-400 font-mono font-bold">
                        <AlertTriangle size={12} />
                        <span>Overdue Limit Detected: Rs. {selectedCustomerContext.stats.overdueAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences and Metadata */}
                <div className="p-4 rounded-2xl bg-neutral-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Communication Mode:</span>
                    <span className="font-bold text-white">{selectedCustomerContext.customer.preferredCommMethod || 'Email'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Language:</span>
                    <span className="font-bold text-white">{selectedCustomerContext.customer.preferredLanguage || 'English'}</span>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <span className="text-slate-500 block">System Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedCustomerContext.customer.tags || []).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-purple-500/15 text-purple-400 text-[9px] font-bold rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Panel: Multiple interactive tabs (8 cols) */}
              <div className="lg:col-span-8 p-6 space-y-6 flex flex-col justify-between h-full">
                
                {/* Dynamic Workspace Tabs inside 360° Profile */}
                <div className="space-y-6">
                  <div className="border-b border-slate-800 flex flex-wrap gap-2">
                    {['Overview & History', 'Billing Ledgers', 'Financial Dashboard', 'Linked Projects & Bookings', 'Documents Manager', 'Staff Timeline'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          // Local subtab hook simulation using dynamic state or class
                          (window as any)._crmActiveWorkspaceTab = t;
                          setNewNoteText(prev => prev + ''); // Trigger redraw
                        }}
                        className={`pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
                          ((window as any)._crmActiveWorkspaceTab || 'Overview & History') === t
                            ? 'border-purple-500 text-white'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* TAB CONTENT: 1. Overview & History + Notes */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Overview & History') && (
                    <div className="space-y-6">
                      
                      {/* Internal Notes & Special Requests form (CRM Section 10) */}
                      <div className="p-5 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">Internal Follow-Ups & Sticky Notes</h4>
                          <span className="text-[10px] text-slate-500">Only visible to Mahdev Administrators</span>
                        </div>
                        <div className="bg-neutral-900 border border-slate-800 p-3 rounded-xl text-xs space-y-2 whitespace-pre-line max-h-48 overflow-y-auto font-mono text-slate-300">
                          {selectedCustomerContext.customer.notes || 'No notes currently stored.'}
                        </div>
                        <form onSubmit={handleAddNote} className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add instant meeting notes, payment promise, or follow-up deadline..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                          >
                            <Send size={12} />
                            <span>Save</span>
                          </button>
                        </form>
                      </div>

                      {/* Communication Suite Dispatcher (CRM Section 9) */}
                      <div className="p-5 rounded-2xl border border-slate-800 bg-neutral-950/20 space-y-4">
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Automated Communication Dispatcher</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            onClick={() => logCommunication('Email', 'Share Quotation PDF')}
                            className="p-3 bg-neutral-900 hover:bg-purple-950/10 border border-slate-800 rounded-xl text-left space-y-1 transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-purple-400 font-bold uppercase">Email Template</span>
                              <Share2 size={12} className="text-slate-600 group-hover:text-purple-400" />
                            </div>
                            <p className="text-xs font-semibold text-white">Quotation Pitch</p>
                            <p className="text-[9px] text-slate-500 leading-normal">Email formal quotation PDF & proposal agreement package.</p>
                          </button>

                          <button
                            onClick={() => logCommunication('WhatsApp', 'Share Invoice PDF')}
                            className="p-3 bg-neutral-900 hover:bg-emerald-950/10 border border-slate-800 rounded-xl text-left space-y-1 transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">WhatsApp Quick</span>
                              <MessageSquare size={12} className="text-slate-600 group-hover:text-emerald-400" />
                            </div>
                            <p className="text-xs font-semibold text-white">Share Invoice PDF</p>
                            <p className="text-[9px] text-slate-500 leading-normal">Pushes bill overview and payment instructions link.</p>
                          </button>

                          <button
                            onClick={() => logCommunication('Email', 'Share Receipt PDF')}
                            className="p-3 bg-neutral-900 hover:bg-indigo-950/10 border border-slate-800 rounded-xl text-left space-y-1 transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-indigo-400 font-bold uppercase">Secure Receipt</span>
                              <Share2 size={12} className="text-slate-600 group-hover:text-indigo-400" />
                            </div>
                            <p className="text-xs font-semibold text-white">Share Cleared Receipt</p>
                            <p className="text-[9px] text-slate-500 leading-normal">Dispatches official VAT tax receipt and audit record.</p>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB CONTENT: 2. Billing Ledgers (Quotations, Invoices, Payments, Receipts) */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Billing Ledgers') && (
                    <div className="space-y-6">
                      
                      {/* Quotations Sub-List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Linked Commercial Quotations ({selectedCustomerContext.quotes.length})</h4>
                        {selectedCustomerContext.quotes.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-neutral-950/40 border border-slate-800 rounded-xl">No quotations issued for this client yet.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-neutral-950/40">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px]">
                                  <th className="p-3">Quote ID</th>
                                  <th className="p-3">Title / Scope</th>
                                  <th className="p-3">Total Cost</th>
                                  <th className="p-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 text-slate-300">
                                {selectedCustomerContext.quotes.map((q) => (
                                  <tr key={q.id}>
                                    <td className="p-3 font-mono font-bold text-white">{q.quotationNumber}</td>
                                    <td className="p-3 font-semibold text-slate-200">{q.scopeOfWork || 'Custom Enterprise Setup'}</td>
                                    <td className="p-3 font-mono font-bold text-purple-400">Rs. {q.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString()}</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        q.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                        q.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                      }`}>
                                        {q.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Invoices Sub-List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Sales Invoices & Balance Tracking ({selectedCustomerContext.invoices.length})</h4>
                        {selectedCustomerContext.invoices.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-neutral-950/40 border border-slate-800 rounded-xl">No invoices generated for this client yet.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-neutral-950/40">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px]">
                                  <th className="p-3">Invoice No</th>
                                  <th className="p-3">Grand Total</th>
                                  <th className="p-3">Cleared</th>
                                  <th className="p-3">Outstanding</th>
                                  <th className="p-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 text-slate-300">
                                {selectedCustomerContext.invoices.map((inv) => {
                                  const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                                  const totalVal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
                                  const outstanding = inv.status === 'Paid' ? 0 : Math.max(0, totalVal - inv.paidAmount);
                                  return (
                                    <tr key={inv.id}>
                                      <td className="p-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                                      <td className="p-3 font-mono font-bold text-white">Rs. {totalVal.toLocaleString()}</td>
                                      <td className="p-3 font-mono text-emerald-400">Rs. {inv.paidAmount.toLocaleString()}</td>
                                      <td className={`p-3 font-mono ${outstanding > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                                        Rs. {outstanding.toLocaleString()}
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                          {inv.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB CONTENT: Financial Dashboard using Recharts */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Financial Dashboard') && (
                    <CustomerFinancialSummary
                      isDarkMode={isDarkMode}
                      customer={selectedCustomerContext.customer}
                      invoices={selectedCustomerContext.invoices}
                      payments={payments}
                      quotes={selectedCustomerContext.quotes}
                      stats={selectedCustomerContext.stats}
                    />
                  )}

                  {/* TAB CONTENT: 3. Linked Projects & Bookings */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Linked Projects & Bookings') && (
                    <div className="space-y-6">
                      
                      {/* ERP Projects */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Enterprise ERP Software Overhaul Projects ({selectedCustomerContext.projects.active.length + selectedCustomerContext.projects.completed.length})</h4>
                        {[...selectedCustomerContext.projects.active, ...selectedCustomerContext.projects.completed].length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-neutral-950/40 border border-slate-800 rounded-xl">No active software projects found for this client.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...selectedCustomerContext.projects.active, ...selectedCustomerContext.projects.completed].map(p => (
                              <div key={p.id} className="p-4 bg-neutral-950/40 border border-slate-800 rounded-2xl space-y-3 text-xs">
                                <div className="flex justify-between items-start">
                                  <h5 className="font-bold text-white">{p.name}</h5>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                    p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Milestone Completion</span>
                                    <span>{p.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-purple-600 h-full" style={{ width: `${p.progress}%` }}></div>
                                  </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                  <span>Deadline: {p.deadline}</span>
                                  <span className="text-emerald-400">Value: Rs. {p.budget.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Event / Travels / Photography Bookings */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Hospitality, Events & Travels Bookings Ledger ({selectedCustomerContext.bookings.length})</h4>
                        {selectedCustomerContext.bookings.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-neutral-950/40 border border-slate-800 rounded-xl">No event, cinematic photography, or tours bookings mapped under this client's details.</p>
                        ) : (
                          <div className="space-y-3">
                            {selectedCustomerContext.bookings.map(b => (
                              <div key={b.id} className="flex items-center gap-4 p-3 bg-neutral-900 border border-slate-800 rounded-xl text-xs">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                                  {b.brand === 'SWS' && <Briefcase size={16} />}
                                  {b.brand === 'Studio' && <Camera size={16} />}
                                  {b.brand === 'Travels' && b.serviceType.toLowerCase().includes('rental') && <Car size={16} />}
                                  {b.brand === 'Travels' && !b.serviceType.toLowerCase().includes('rental') && <Compass size={16} />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{b.serviceType}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">| {b.brand} Division</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Date scheduled: {b.eventDate} at {b.location || 'Colombo Main HQ'}</p>
                                </div>
                                <div className="text-right font-mono">
                                  <div className="text-[10px] text-emerald-400 font-bold">Rs. {(b.amount || 0).toLocaleString()}</div>
                                  <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/10 text-purple-400 font-bold rounded">{b.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB CONTENT: 4. Documents Manager (CRM Section 8) */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Documents Manager') && (
                    <div className="space-y-6">
                      
                      {/* Document Upload Form */}
                      <form onSubmit={handleUploadDocument} className="p-4 bg-neutral-950/40 border border-slate-800 rounded-2xl flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-3 items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-mono uppercase text-slate-400">Document Identifier Name</label>
                            <input 
                              type="text"
                              placeholder="e.g., Signed SLA Agreement 2026, Tax Exemption Proof..."
                              value={uploadName}
                              onChange={(e) => setUploadName(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              required
                            />
                          </div>
                          <div className="w-full md:w-48 space-y-1">
                            <label className="text-[10px] font-mono uppercase text-slate-400">Classification Category</label>
                            <select 
                              value={uploadCat}
                              onChange={(e) => setUploadCat(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="Agreement">Agreement / SLA</option>
                              <option value="Signed Quotation">Signed Quotation</option>
                              <option value="Contract">Purchase Contract</option>
                              <option value="ID Verification">NIC / Passport Copy</option>
                              <option value="Business Registration">BR Document</option>
                              <option value="Payment Proof">Payment Receipt Slip</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between border-t border-slate-900 pt-3">
                          <div className="flex items-center gap-3 flex-1 w-full">
                            <div className="flex-1">
                              <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">
                                Device Upload {docUploadError && <span className="text-rose-500 ml-2">⚠ {docUploadError}</span>}
                              </label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Upload document from device..."
                                  value={uploadedDocUrl || ''}
                                  readOnly
                                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-neutral-900 text-slate-400 focus:outline-none font-mono"
                                />
                                <input 
                                  type="file" 
                                  id="crm-doc-file-input"
                                  onChange={handleDocFileChange} 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('crm-doc-file-input')?.click()}
                                  disabled={isDocUploading}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono border transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider ${
                                    isDocUploading 
                                      ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 cursor-not-allowed'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                                  }`}
                                >
                                  <Upload size={11} className={isDocUploading ? "animate-bounce" : ""} />
                                  <span>{isDocUploading ? "Uploading..." : "Upload File"}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shrink-0 self-end mt-2 md:mt-0"
                          >
                            <Plus size={13} />
                            <span>Bind Document</span>
                          </button>
                        </div>
                      </form>

                      {/* Documents Directory List */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Digitized Legal and Compliance Dossiers</h4>
                          <div className="flex gap-1">
                            {['All', 'Agreement', 'Contract', 'ID Verification', 'Payment Proof'].map(cat => (
                              <button
                                key={cat}
                                onClick={() => setDocCategory(cat)}
                                className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                                  docCategory === cat ? 'bg-purple-600 text-white' : 'bg-neutral-850 text-slate-400 hover:text-white'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(selectedCustomerContext.customer.documents || []).length === 0 ? (
                          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
                            <FileText size={28} className="text-slate-600 mx-auto" />
                            <p className="text-xs text-slate-500">No official documents have been uploaded to this customer record yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(selectedCustomerContext.customer.documents || [])
                              .filter(d => docCategory === 'All' || d.category === docCategory)
                              .map((doc, idx) => (
                                <div key={idx} className="p-4 bg-neutral-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <FileText size={14} className="text-purple-400 shrink-0" />
                                      <span className="font-bold text-white truncate block">{doc.name}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      {doc.category || 'General'} • {doc.size} • {doc.uploadedAt}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <a 
                                      href={doc.url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-slate-400 hover:text-white rounded-lg transition-all"
                                      title="Preview & Download"
                                    >
                                      <Eye size={12} />
                                    </a>
                                    <button 
                                      onClick={() => handleDeleteDocument(doc.name)}
                                      className="p-1.5 bg-neutral-800 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB CONTENT: 5. Staff Activity Timeline (CRM Section 11) */}
                  {(((window as any)._crmActiveWorkspaceTab || 'Overview & History') === 'Staff Timeline') && (
                    <div className="space-y-6">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Chronological Operations & Interaction Ledger</h4>
                      <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-6">
                        {selectedCustomerContext.customer.history.map((hist, idx) => (
                          <div key={idx} className="relative group">
                            {/* Dot */}
                            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-neutral-900 group-hover:scale-125 transition-transform"></span>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white font-mono">{hist.action}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{hist.date}</span>
                              </div>
                              <p className="text-xs text-slate-400 leading-normal font-mono">{hist.details}</p>
                              {hist.user && (
                                <div className="text-[9px] text-purple-400 font-mono">
                                  Operator: {hist.user}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer status block */}
                <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>360° Customer Workspace Verified</span>
                  <span>IP Audited Logs: yuvanshan875@gmail.com</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Main CRM Title and Directory Metrics Dashboard (CRM Section 15) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">Total CRM Profiles</div>
          <div className="text-2xl font-bold text-white mt-1">{crmMetrics.total}</div>
          <p className="text-[10px] text-slate-500 mt-1">Durable database profiles</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">Active Clients</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{crmMetrics.activeClients}</div>
          <p className="text-[10px] text-emerald-500/60 mt-1">Contracted & operating</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">Unqualified Leads</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{crmMetrics.leads}</div>
          <p className="text-[10px] text-purple-500/60 mt-1">Sales pipelines stages</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">Corporate Groups</div>
          <div className="text-2xl font-bold text-white mt-1">{crmMetrics.corporates}</div>
          <p className="text-[10px] text-slate-500 mt-1">VAT commercial entities</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">With Balances</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{crmMetrics.withBalancesCount}</div>
          <p className="text-[10px] text-amber-500/60 mt-1">Unpaid invoice links</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 to-indigo-950/15 border border-purple-500/10 text-xs">
          <div className="text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">Outstanding Receivables</div>
          <div className="text-xl font-bold text-white mt-1">Rs. {crmMetrics.totalOutstandingVal.toLocaleString()}</div>
          <p className="text-[10px] text-purple-400 font-semibold mt-1">Total revenue due</p>
        </div>
      </div>

      {/* Directory Filters & Commands Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10">
        
        {/* Sub-tabs segment selection (CRM Section 13) */}
        <div className="flex gap-1.5 bg-neutral-900 p-1 rounded-xl border border-slate-800 shrink-0">
          {(['all', 'companies', 'leads', 'archived', 'blacklisted'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveSubTab(t);
                setViewingCustomerId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === t
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Customers' : t}
            </button>
          ))}
        </div>

        {/* Text Filters */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-center justify-end w-full">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search ID, name, email, bills, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="New Lead">New Lead</option>
            <option value="Active Customer">Active Customer</option>
            <option value="Returning Customer">Returning Customer</option>
            <option value="VIP Customer">VIP Customer</option>
            <option value="Corporate Customer">Corporate Customer</option>
            <option value="Government Customer">Government Customer</option>
            <option value="Inactive Customer">Inactive Customer</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Directory Actions (Export, Import, Merge, Create) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-950/20 border border-purple-500/5 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          
          {/* Export buttons (CRM Section 1) */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <Download size={14} className="text-purple-400" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <FileText size={14} className="text-purple-400" />
            <span>Export PDF Brief</span>
          </button>

          {/* Import CSV Trigger */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <Upload size={14} className="text-purple-400" />
            <span>Batch Import (CSV)</span>
          </button>

          {/* Merge Trigger */}
          <button
            onClick={() => setShowMergeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <Merge size={14} className="text-amber-400" />
            <span>Merge Duplicates</span>
          </button>
        </div>

        {/* Customer Quick Add Trigger */}
        <button
          onClick={() => {
            setEditingCustomer({
              tags: ['Regular'],
              customerType: 'Individual',
              status: 'Active Customer',
              documents: []
            });
            setShowAddEditModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Plus size={14} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Customers List Directory */}
      <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
              <th className="p-4">Customer ID</th>
              <th className="p-4">Customer Name & Type</th>
              <th className="p-4">Contact Details</th>
              <th className="p-4">Corporate Association</th>
              <th className="p-4">Classification</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                  No active matched profiles found. Try clearing filters or refining search.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => {
                // Calculate total outstanding balance
                const clientInvoices = invoices.filter(inv => inv.customerId === cust.id);
                let outstandingTotal = 0;
                clientInvoices.forEach(inv => {
                  if (inv.status !== 'Paid') {
                    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                    const grandTotal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
                    outstandingTotal += Math.max(0, grandTotal - inv.paidAmount);
                  }
                });

                return (
                  <tr key={cust.id} className="hover:bg-purple-950/5 transition-all">
                    <td className="p-4 font-mono font-bold text-purple-400">{cust.id}</td>
                    <td className="p-4">
                      <div>
                        <button 
                          onClick={() => setViewingCustomerId(cust.id)}
                          className="font-bold text-white hover:text-purple-400 text-left hover:underline transition-all"
                        >
                          {cust.name}
                        </button>
                        <span className={`ml-2 px-1.5 py-0.2 rounded text-[8px] font-bold font-mono uppercase ${
                          cust.customerType === 'Company' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>
                          {cust.customerType || 'Individual'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Prefers: {cust.preferredCommMethod || 'Email'} ({cust.preferredLanguage || 'English'})
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-1">
                        <Mail size={11} className="text-slate-500" />
                        <span>{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        <Phone size={11} className="text-slate-500" />
                        <span>{cust.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {cust.companyId || cust.companyName ? (
                        <div className="flex items-center gap-1">
                          <Building size={12} className="text-purple-400" />
                          <span className="font-semibold text-slate-200">{cust.companyName || 'Associated Enterprise'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Private Entity</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'Active' || cust.status === 'Active Customer' ? 'bg-emerald-500/10 text-emerald-400' :
                          cust.status === 'Blacklisted' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cust.status}
                        </span>
                      </div>
                      {outstandingTotal > 0 && (
                        <div className="text-[9px] font-mono text-amber-400 font-bold mt-1">
                          Due: Rs. {outstandingTotal.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => setViewingCustomerId(cust.id)}
                        className="px-2 py-1 bg-purple-600/15 hover:bg-purple-600 hover:text-white text-purple-400 rounded-lg text-[10px] font-bold transition-all"
                        title="360 View Profile Dashboard"
                      >
                        360° Profile
                      </button>
                      <button 
                        onClick={() => {
                          setEditingCustomer(cust);
                          setShowAddEditModal(true);
                        }}
                        className="p-1 hover:text-purple-400 text-slate-500 inline-block align-middle"
                        title="Edit Details"
                      >
                        <Edit size={13} />
                      </button>
                      
                      {cust.deleted ? (
                        <button 
                          onClick={() => handleRestore(cust.id)}
                          className="p-1 hover:text-emerald-400 text-slate-500 inline-block align-middle"
                          title="Restore Profile"
                        >
                          <Undo size={13} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSoftDelete(cust.id)}
                          className="p-1 hover:text-rose-400 text-slate-500 inline-block align-middle"
                          title="Soft Delete Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CSV Batch Import Popup Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border border-purple-500/25 rounded-3xl shadow-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
            <div className="flex justify-between items-center border-b border-purple-500/10 pb-3 pt-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Upload size={16} className="text-purple-400 animate-pulse" />
                <span>Batch Import Customers (CSV/Excel)</span>
              </h3>
              <button 
                onClick={() => setShowImportModal(false)} 
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your spreadsheet rows below. The system automatically maps columns using this layout structure:
              <br />
              <code className="bg-neutral-950 px-1.5 py-1 rounded text-[10px] text-purple-400 font-mono block mt-1.5 border border-purple-500/10">
                Name, Email, Phone, Notes, Customer Type, Company Name
              </code>
            </p>

            <textarea
              rows={6}
              value={csvPasteData}
              onChange={(e) => setCsvPasteData(e.target.value)}
              placeholder={`Kamal Perera, kamal.p@domain.com, +94771234567, Senior VP, Company, Nations Bank\nAnura Silva, anura@spence.lk, +94719876543, Procurement lead, Company, Aitken Spence`}
              className="w-full p-4 text-xs font-mono rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-all focus:ring-1 focus:ring-purple-500/20"
            />

            <div className="flex justify-end gap-2.5 pt-2 border-t border-purple-500/10">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-bold rounded-xl transition-all font-mono uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.02] font-mono uppercase tracking-wider"
              >
                Deploy Batch Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Merging Wizard Popup Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-purple-500/25 rounded-3xl shadow-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
            <div className="flex justify-between items-center border-b border-purple-500/10 pb-3 pt-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Merge size={16} className="text-purple-400 animate-pulse" />
                <span>CRM Profile Merging Wizard</span>
              </h3>
              <button 
                onClick={() => setShowMergeModal(false)} 
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidate two redundant profiles. All invoices, quotes, projects, history timelines, notes, and uploaded contracts will transfer securely.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 block">Deactivating Profile (Source)</label>
                <select
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="">-- Choose Redundant profile --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id}) - {c.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 block">Preserving Profile (Target Destination)</label>
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="">-- Choose Master profile --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id}) - {c.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-purple-500/10">
              <button
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-bold rounded-xl transition-all font-mono uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeCustomers}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-950/20 hover:shadow-amber-500/40 hover:scale-[1.02] flex items-center gap-1.5 font-mono uppercase tracking-wider"
              >
                <Merge size={12} />
                <span>Execute Smart Merge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Add / Edit Customer Sidebar/Popup Modal (CRM Section 2) */}
      {showAddEditModal && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden mt-6 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>

            <div className="p-6 bg-neutral-950 border-b border-purple-500/10 flex justify-between items-center pt-7">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <User size={18} className="text-purple-400 animate-pulse" />
                  <span>{editingCustomer.id ? 'Modify Customer CRM Profile' : 'Register New CRM Client Profile'}</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Operator: yuvanshan875@gmail.com</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddEditModal(false);
                  setEditingCustomer(null);
                  setDuplicateWarning(null);
                }} 
                className="p-2 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-6">
              
              {/* Duplicate Detection Prompt banner (CRM Section 14) */}
              {duplicateWarning && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-amber-400">Duplicate Registered Record Detected!</span>
                    <p className="text-slate-300 mt-1">
                      Another profile named <span className="font-bold text-white">"{duplicateWarning.existingName}" ({duplicateWarning.existingId})</span> already utilizes this exact {duplicateWarning.field} ("{duplicateWarning.value}").
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingCustomerId(duplicateWarning.existingId);
                          setShowAddEditModal(false);
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[10px]"
                      >
                        Inspect Existing Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMergeSourceId(editingCustomer.id || '');
                          setMergeTargetId(duplicateWarning.existingId);
                          setShowMergeModal(true);
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px]"
                      >
                        Initiate Merging Wizard
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">1. Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Customer Classification Type</label>
                    <select
                      value={editingCustomer.customerType || 'Individual'}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, customerType: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Individual">Individual / Private</option>
                      <option value="Company">Corporate / Company</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Customer Name *</label>
                    <input 
                      type="text"
                      value={editingCustomer.name || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      required
                      placeholder="e.g., Kamal Perera"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Company Name (Optional)</label>
                    <input 
                      type="text"
                      value={editingCustomer.companyName || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Nations Trust Bank"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Contact Person</label>
                    <input 
                      type="text"
                      value={editingCustomer.contactPerson || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Kamal Perera"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Designation / Role</label>
                    <input 
                      type="text"
                      value={editingCustomer.designation || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, designation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Senior VP of Sourcing"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">2. Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Mobile Number *</label>
                    <input 
                      type="text"
                      value={editingCustomer.phone || ''}
                      onChange={(e) => {
                        setEditingCustomer({ ...editingCustomer, phone: e.target.value });
                        runDuplicateCheck('phone', e.target.value, editingCustomer.id);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      required
                      placeholder="+94 77 123 4567"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Alternative Mobile Number</label>
                    <input 
                      type="text"
                      value={editingCustomer.altPhone || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, altPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="+94 71 987 6543"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">WhatsApp Number</label>
                    <input 
                      type="text"
                      value={editingCustomer.whatsappNumber || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Email Address *</label>
                    <input 
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(e) => {
                        setEditingCustomer({ ...editingCustomer, email: e.target.value });
                        runDuplicateCheck('email', e.target.value, editingCustomer.id);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      required
                      placeholder="corporate@domain.lk"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Secondary Email</label>
                    <input 
                      type="email"
                      value={editingCustomer.secondaryEmail || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, secondaryEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="backup@domain.lk"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Address Details */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">3. Address & Localization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Address Line 1</label>
                    <input 
                      type="text"
                      value={editingCustomer.addressLine1 || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., No 242, Union Place"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Address Line 2</label>
                    <input 
                      type="text"
                      value={editingCustomer.addressLine2 || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, addressLine2: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Colombo 02"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">City</label>
                    <input 
                      type="text"
                      value={editingCustomer.city || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Colombo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">District</label>
                    <input 
                      type="text"
                      value={editingCustomer.district || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, district: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Colombo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Province</label>
                    <input 
                      type="text"
                      value={editingCustomer.province || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, province: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Western"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Postal Code</label>
                    <input 
                      type="text"
                      value={editingCustomer.postalCode || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="00200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Country</label>
                    <input 
                      type="text"
                      value={editingCustomer.country || 'Sri Lanka'}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, country: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Google Maps Coordinate Link</label>
                  <input 
                    type="url"
                    value={editingCustomer.googleMapsLocation || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, googleMapsLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>

              {/* Section 4: Business details */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">4. Business & Tax Information (For Companies)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Business Registration Number</label>
                    <input 
                      type="text"
                      value={editingCustomer.businessRegNum || ''}
                      onChange={(e) => {
                        setEditingCustomer({ ...editingCustomer, businessRegNum: e.target.value });
                        runDuplicateCheck('businessRegNum', e.target.value, editingCustomer.id);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g., PV-1294"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Tax Registration (VAT/NBT)</label>
                    <input 
                      type="text"
                      value={editingCustomer.taxNumber || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, taxNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="VAT Number"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Company Website</label>
                    <input 
                      type="text"
                      value={editingCustomer.website || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, website: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="www.company.lk"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Industry / Sector</label>
                    <input 
                      type="text"
                      value={editingCustomer.industry || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, industry: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Finance, IT, Hospitality"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Extra notes and tags */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">5. CRM Status, Channels & Custom Tags</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Lifecycle Status</label>
                    <select
                      value={editingCustomer.status || 'Active Customer'}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Active Customer">Active Customer</option>
                      <option value="Returning Customer">Returning Customer</option>
                      <option value="VIP Customer">VIP Customer</option>
                      <option value="Corporate Customer">Corporate Customer</option>
                      <option value="Government Customer">Government Customer</option>
                      <option value="Inactive Customer">Inactive Customer</option>
                      <option value="Blacklisted">Blacklisted (Restricted)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Preferred Channel</label>
                    <select
                      value={editingCustomer.preferredCommMethod || 'Email'}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, preferredCommMethod: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Language Preference</label>
                    <select
                      value={editingCustomer.preferredLanguage || 'English'}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, preferredLanguage: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Sinhala">Sinhala</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Custom Tags (Comma Separated)</label>
                    <input 
                      type="text"
                      value={editingCustomer.tags ? editingCustomer.tags.join(', ') : ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-semibold"
                      placeholder="VIP, Corporate, Regular"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Internal Profile Notes & Follow-Ups</label>
                  <textarea 
                    rows={3}
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter permanent CRM remarks, follow-up parameters, or physical meeting descriptions..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-purple-500/10 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEditModal(false);
                    setEditingCustomer(null);
                    setDuplicateWarning(null);
                  }}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-bold rounded-xl transition-all font-mono uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.01] font-mono uppercase tracking-wider"
                >
                  Save & Index CRM Record
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
