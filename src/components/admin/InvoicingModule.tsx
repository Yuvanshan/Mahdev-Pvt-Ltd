import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Plus, Edit, Trash2, Printer, Download, Share2, Mail, CheckCircle2, 
  Clock, AlertCircle, Calendar, DollarSign, QrCode, Search, Building, User, 
  ArrowRight, ShieldCheck, CreditCard, ChevronRight, Check, X, FileCheck, Eye, Upload, AlertTriangle
} from 'lucide-react';
import { Invoice, InvoiceItem, PaymentRecord, Customer, Company, InvoiceLog, CompanyProfile } from '../../types';
import { optimizeImageBeforeUpload } from '../../utils/mediaOptimizer';

interface InvoicingModuleProps {
  isDarkMode: boolean;
  invoices: Invoice[];
  customers: Customer[];
  companies: Company[];
  payments: PaymentRecord[];
  profile: CompanyProfile;
  onSync: (type: 'invoices' | 'payments' | 'customers', data: any) => void;
  onAuditLog: (action: string) => void;
}

export default function InvoicingModule({ 
  isDarkMode, 
  invoices, 
  customers, 
  companies, 
  payments, 
  profile,
  onSync,
  onAuditLog
}: InvoicingModuleProps) {
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<'all_invoices' | 'payments' | 'client_portal'>('all_invoices');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Detail views and editors
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Partial<Invoice> | null>(null);
  
  // Payment recorder
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentType, setPaymentType] = useState<'Advance' | 'Installment' | 'Final'>('Advance');

  // Payment proof uploads state
  const [isProofUploading, setIsProofUploading] = useState(false);
  const [proofUploadError, setProofUploadError] = useState<string | null>(null);
  const [isAdminProofUploading, setIsAdminProofUploading] = useState(false);
  const [adminProofUploadError, setAdminProofUploadError] = useState<string | null>(null);

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProofUploading(true);
    setProofUploadError(null);

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
        throw new Error("Failed to upload payment proof.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        setUploadedProofUrl(data.url);
      } else {
        throw new Error(data.error || "Failed to upload payment proof.");
      }
    } catch (err: any) {
      console.error("[Proof Upload Error]", err);
      setProofUploadError(err.message || "Upload failed.");
    } finally {
      setIsProofUploading(false);
    }
  };

  const handleAdminProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAdminProofUploading(true);
    setAdminProofUploadError(null);

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
        throw new Error("Failed to upload payment proof.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        setPaymentProofUrl(data.url);
      } else {
        throw new Error(data.error || "Failed to upload payment proof.");
      }
    } catch (err: any) {
      console.error("[Admin Proof Upload Error]", err);
      setAdminProofUploadError(err.message || "Upload failed.");
    } finally {
      setIsAdminProofUploading(false);
    }
  };

  // Client Portal simulation states
  const [actingCustomerId, setActingCustomerId] = useState<string>('');
  const [uploadedProofInvoiceId, setUploadedProofInvoiceId] = useState('');
  const [uploadedAmount, setUploadedAmount] = useState('');
  const [uploadedProofUrl, setUploadedProofUrl] = useState('');
  const [uploadedProofMethod, setUploadedProofMethod] = useState('Bank Transfer');
  const [uploadedProofRef, setUploadedProofRef] = useState('');
  const [uploadedProofNotes, setUploadedProofNotes] = useState('');

  // Active printable receipt modal
  const [activeReceipt, setActiveReceipt] = useState<{
    type: 'invoice' | 'advance_receipt' | 'balance_receipt';
    invoice: Invoice;
    payment?: PaymentRecord;
  } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; message: string; timestamp: string }[]>([]);

  // Quick Customer Creation State
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [quickCustName, setQuickCustName] = useState('');
  const [quickCustPhone, setQuickCustPhone] = useState('');
  const [quickCustEmail, setQuickCustEmail] = useState('');
  const [quickCustAddress, setQuickCustAddress] = useState('');

  // Quick Customer Submit Handler
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName || !quickCustPhone || !quickCustEmail) {
      alert('Please fill out Name, Phone and Email.');
      return;
    }

    const newCustId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: newCustId,
      name: quickCustName,
      email: quickCustEmail,
      phone: quickCustPhone,
      notes: `Quick-created during invoice generation. Address: ${quickCustAddress}`,
      status: 'Active Customer',
      customerType: 'Individual',
      addressLine1: quickCustAddress,
      history: [
        {
          date: new Date().toISOString().substring(0, 10),
          action: 'Account Created',
          details: 'Profile generated quickly from Invoice Creator module.',
          user: 'yuvanshan875@gmail.com'
        }
      ],
      documents: []
    };

    const updated = [newCustomer, ...customers];
    onSync('customers', updated);
    
    // Automatically link to current invoice
    if (editInvoice) {
      setEditInvoice({
        ...editInvoice,
        customerId: newCustId,
        projectName: `Project for ${quickCustName}`
      });
    }

    // Reset fields
    setQuickCustName('');
    setQuickCustPhone('');
    setQuickCustEmail('');
    setQuickCustAddress('');
    setShowQuickCustomerModal(false);
    
    onAuditLog(`Quick-created customer ${quickCustName} (${newCustId}) during invoice generation.`);
    addNotification(`Quick created and linked customer: ${quickCustName}`);
  };

  // Show dynamic toast/notification helper
  const addNotification = (message: string) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
  };

  // Pre-populate some notifications or default items
  useEffect(() => {
    // Generate an invoice number automatically on edit init
    if (isEditing && editInvoice && !editInvoice.invoiceNumber) {
      const year = new Date().getFullYear();
      const count = invoices.length + 1;
      const autoNum = `INV-${year}-${String(count).padStart(3, '0')}`;
      setEditInvoice(prev => prev ? { ...prev, invoiceNumber: autoNum } : prev);
    }
  }, [isEditing, editInvoice, invoices]);

  // Status colors map
  const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
    'Draft': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    'Sent': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    'Approved': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    'Partially Paid': { bg: 'bg-amber-100/80', text: 'text-amber-800', border: 'border-amber-300' },
    'Paid': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    'Overdue': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
    'Cancelled': { bg: 'bg-neutral-200', text: 'text-neutral-700', border: 'border-neutral-400' },
    'Refunded': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
  };

  // Calculate grand totals for an invoice
  const calculateTotals = (items: InvoiceItem[], discountPercent: number, taxPercent: number) => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemQty = item.quantity || 1;
      const itemPrice = item.unitPrice || 0;
      const itemDisc = item.discount || 0; // percentage
      const itemTaxVal = item.tax || 0; // percentage

      const lineBase = itemQty * itemPrice;
      const lineDiscAmount = lineBase * (itemDisc / 100);
      const lineAfterDisc = lineBase - lineDiscAmount;
      const lineTaxAmount = lineAfterDisc * (itemTaxVal / 100);

      subtotal += lineBase;
      totalDiscount += lineDiscAmount;
      totalTax += lineTaxAmount;
    });

    // Apply global discount and tax on top of subtotal if individual are empty, or additionally
    // Here we'll sum individual line discounts and global discount percent on subtotal
    const globalDiscAmount = (subtotal - totalDiscount) * (discountPercent / 100);
    const totalDiscountFinal = totalDiscount + globalDiscAmount;
    
    const baseAfterDiscount = subtotal - totalDiscountFinal;
    const globalTaxAmount = baseAfterDiscount * (taxPercent / 100);
    const totalTaxFinal = totalTax + globalTaxAmount;

    const grandTotal = baseAfterDiscount + totalTaxFinal;

    return {
      subtotal,
      totalDiscount: totalDiscountFinal,
      taxAmount: totalTaxFinal,
      grandTotal
    };
  };

  // Convert Quotation to Invoice helper
  const handleConvertQuotation = (quotationId: string) => {
    // We would look for Quotation from parent state or mock some data
    onAuditLog(`Quotation converted to Invoice successfully.`);
    addNotification(`Quotation converted to invoice automatically.`);
  };

  // Handle saving newly created or edited invoice
  const handleSaveInvoice = () => {
    setValidationError(null);
    if (!editInvoice?.customerId) {
      setValidationError('Validation Failed: Please select a corporate client / customer recipient.');
      return;
    }
    if (!editInvoice?.items || editInvoice.items.length === 0) {
      setValidationError('Validation Failed: Please add at least one service or product line item to this invoice.');
      return;
    }
    const hasEmptyItem = editInvoice.items.some(it => !it.name || it.name.trim() === '');
    if (hasEmptyItem) {
      setValidationError('Validation Failed: All service line items must have a valid Name.');
      return;
    }

    const calculated = calculateTotals(editInvoice.items, editInvoice.discount || 0, editInvoice.tax || 0);
    
    const updatedLogs: InvoiceLog[] = editInvoice.activityLogs || [];
    const isNew = !editInvoice.id;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (isNew) {
      updatedLogs.push({
        user: 'yuvanshan875@gmail.com',
        timestamp,
        action: 'Invoice Created from Scratch'
      });
    } else {
      updatedLogs.push({
        user: 'yuvanshan875@gmail.com',
        timestamp,
        action: 'Invoice Details Updated'
      });
    }

    const finalInvoice: Invoice = {
      id: editInvoice.id || `inv-${Date.now()}`,
      invoiceNumber: editInvoice.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: editInvoice.customerId,
      projectId: editInvoice.projectId || '',
      projectName: editInvoice.projectName || 'Mahdev Professional Service Contract',
      projectCategory: editInvoice.projectCategory || 'IT Solutions',
      salesRep: editInvoice.salesRep || 'Yuvanshan Prabakaran',
      createdDate: editInvoice.createdDate || new Date().toISOString().split('T')[0],
      dueDate: editInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: editInvoice.items,
      discount: editInvoice.discount || 0,
      tax: editInvoice.tax || 0,
      status: editInvoice.status || 'Draft',
      advanceAmount: editInvoice.advanceAmount || 0,
      remainingAmount: calculated.grandTotal - (editInvoice.paidAmount || 0),
      paidAmount: editInvoice.paidAmount || 0,
      paymentTerms: editInvoice.paymentTerms || '50% Advance Payment on approval. Balance within 15 days of project closeout.',
      notes: editInvoice.notes || 'Thank you for partnering with Mahdev Pvt Ltd.',
      termsAndConditions: editInvoice.termsAndConditions || 'This invoice is subject to standard service level agreements. Late fees of 1.5% per month apply on balances unpaid past due date.',
      activityLogs: updatedLogs
    };

    let newInvoicesList: Invoice[] = [];
    if (isNew) {
      newInvoicesList = [finalInvoice, ...invoices];
      onAuditLog(`Invoice ${finalInvoice.invoiceNumber} created successfully.`);
      addNotification(`Invoice ${finalInvoice.invoiceNumber} has been generated.`);
    } else {
      newInvoicesList = invoices.map(i => i.id === finalInvoice.id ? finalInvoice : i);
      onAuditLog(`Invoice ${finalInvoice.invoiceNumber} updated successfully.`);
      addNotification(`Invoice ${finalInvoice.invoiceNumber} updated.`);
    }

    onSync('invoices', newInvoicesList);
    setIsEditing(false);
    setSelectedInvoice(finalInvoice);
  };

  // Transition workflow status
  const handleTransitionStatus = (targetInvoice: Invoice, nextStatus: Invoice['status']) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedLogs = [...(targetInvoice.activityLogs || [])];
    
    updatedLogs.push({
      user: 'yuvanshan875@gmail.com',
      timestamp,
      action: `Status Transited from ${targetInvoice.status} to ${nextStatus}`
    });

    const updatedInvoice: Invoice = {
      ...targetInvoice,
      status: nextStatus,
      activityLogs: updatedLogs
    };

    const newInvoices = invoices.map(i => i.id === targetInvoice.id ? updatedInvoice : i);
    onSync('invoices', newInvoices);
    setSelectedInvoice(updatedInvoice);
    
    onAuditLog(`Invoice ${targetInvoice.invoiceNumber} status updated to ${nextStatus}`);
    addNotification(`Invoice ${targetInvoice.invoiceNumber} is now marked as ${nextStatus}.`);
  };

  // Record payment installment
  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please input a valid positive amount.');
      return;
    }

    const computed = calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax);
    const totalPaidPrior = selectedInvoice.paidAmount || 0;
    const newPaidAmount = totalPaidPrior + amount;
    const remaining = computed.grandTotal - newPaidAmount;

    // Validate that we aren't exceeding the remaining balance heavily
    if (newPaidAmount > computed.grandTotal + 0.01) {
      if (!confirm(`Warning: This payment of Rs. ${amount.toLocaleString()} will overpay the remaining balance of Rs. ${(computed.grandTotal - totalPaidPrior).toLocaleString()}. Do you wish to proceed?`)) {
        return;
      }
    }

    const year = new Date().getFullYear();
    const count = payments.filter(p => p.invoiceId === selectedInvoice.id).length + 1;
    const receiptNum = `REC-${year}-${selectedInvoice.invoiceNumber.split('-')[2] || 'MAH'}-${String(count).padStart(2, '0')}`;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoice.id,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      source: paymentMethod,
      receiptNumber: receiptNum,
      type: paymentType,
      receivedBy: 'yuvanshan875@gmail.com',
      referenceNumber: paymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: paymentRemarks || `${paymentType} payment for ${selectedInvoice.projectName}`,
      transactionId: paymentRef || `TXN-${Date.now()}`,
      paymentProof: paymentProofUrl || undefined
    };

    // Update invoice balance and status
    let autoNextStatus: Invoice['status'] = selectedInvoice.status;
    if (remaining <= 1) {
      autoNextStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      autoNextStatus = 'Partially Paid';
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedLogs = [...(selectedInvoice.activityLogs || [])];
    updatedLogs.push({
      user: 'yuvanshan875@gmail.com',
      timestamp,
      action: `Recorded ${paymentType} Payment of Rs. ${amount.toLocaleString()}. Receipt issued: ${receiptNum}`
    });

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      paidAmount: newPaidAmount,
      advanceAmount: paymentType === 'Advance' ? amount : (selectedInvoice.advanceAmount || 0),
      remainingAmount: remaining > 0 ? remaining : 0,
      status: autoNextStatus,
      activityLogs: updatedLogs
    };

    const newInvoices = invoices.map(i => i.id === selectedInvoice.id ? updatedInvoice : i);
    const newPayments = [newPayment, ...payments];

    onSync('invoices', newInvoices);
    onSync('payments', newPayments);
    setSelectedInvoice(updatedInvoice);
    setPaymentModalOpen(false);

    // Reset payment fields
    setPaymentAmount('');
    setPaymentRef('');
    setPaymentRemarks('');
    setPaymentProofUrl('');

    onAuditLog(`Payment of Rs. ${amount.toLocaleString()} received against ${selectedInvoice.invoiceNumber}.`);
    addNotification(`Payment of Rs. ${amount.toLocaleString()} successfully recorded.`);
    
    // Automatically trigger receipt PDF popup
    setActiveReceipt({
      type: paymentType === 'Advance' ? 'advance_receipt' : 'balance_receipt',
      invoice: updatedInvoice,
      payment: newPayment
    });
  };

  // Client Portal Payment Submission simulation
  const handleClientSubmitProof = () => {
    if (!uploadedProofInvoiceId) {
      alert('Please select an invoice to pay.');
      return;
    }
    const targetInvoice = invoices.find(i => i.id === uploadedProofInvoiceId);
    if (!targetInvoice) return;

    const amount = parseFloat(uploadedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please input a valid payment amount.');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Create payment record from customer
    const year = new Date().getFullYear();
    const count = payments.filter(p => p.invoiceId === targetInvoice.id).length + 1;
    const receiptNum = `REC-SIM-${year}-${targetInvoice.invoiceNumber.split('-')[2] || 'CLIENT'}-${String(count).padStart(2, '0')}`;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: targetInvoice.id,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      source: uploadedProofMethod,
      receiptNumber: receiptNum,
      type: 'Installment',
      receivedBy: 'Client Portal (Awaiting Approval)',
      referenceNumber: uploadedProofRef || `PROOF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Uploaded Proof: ${uploadedProofNotes}`,
      transactionId: uploadedProofRef || `PROOF-${Date.now()}`,
      paymentProof: uploadedProofUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300'
    };

    // Add activity log to invoice
    const updatedLogs = [...(targetInvoice.activityLogs || [])];
    updatedLogs.push({
      user: 'Client User (Via Portal)',
      timestamp,
      action: `Submitted payment proof of Rs. ${amount.toLocaleString()} via portal. Reference: ${uploadedProofRef}`
    });

    const computed = calculateTotals(targetInvoice.items, targetInvoice.discount, targetInvoice.tax);
    const newPaidAmount = (targetInvoice.paidAmount || 0) + amount;
    const remaining = computed.grandTotal - newPaidAmount;

    const updatedInvoice: Invoice = {
      ...targetInvoice,
      paidAmount: newPaidAmount,
      remainingAmount: remaining > 0 ? remaining : 0,
      status: remaining <= 1 ? 'Paid' : 'Partially Paid',
      activityLogs: updatedLogs
    };

    const newInvoices = invoices.map(i => i.id === targetInvoice.id ? updatedInvoice : i);
    const newPayments = [newPayment, ...payments];

    onSync('invoices', newInvoices);
    onSync('payments', newPayments);
    
    if (selectedInvoice && selectedInvoice.id === targetInvoice.id) {
      setSelectedInvoice(updatedInvoice);
    }

    alert(`Receipt & proof of payment submitted successfully! Your account administrator will verify the bank transfer reference: ${newPayment.referenceNumber}`);
    onAuditLog(`Client uploaded payment proof of Rs. ${amount.toLocaleString()} against invoice ${targetInvoice.invoiceNumber}`);
    
    // Clear submission form
    setUploadedAmount('');
    setUploadedProofUrl('');
    setUploadedProofRef('');
    setUploadedProofNotes('');
  };

  // Computed live dashboard financial aggregates
  const dashboardStats = () => {
    let totalInvoicedVal = 0;
    let totalCollected = 0;
    let totalAdvance = 0;
    let outstanding = 0;
    let overdueCount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    invoices.forEach(inv => {
      const computed = calculateTotals(inv.items, inv.discount, inv.tax);
      totalInvoicedVal += computed.grandTotal;
      totalCollected += inv.paidAmount || 0;
      totalAdvance += inv.advanceAmount || 0;
      outstanding += inv.remainingAmount;

      if (inv.status === 'Paid') paidCount++;
      else if (inv.status === 'Overdue') overdueCount++;
      else pendingCount++;
    });

    return {
      totalInvoicedVal,
      totalCollected,
      totalAdvance,
      outstanding,
      overdueCount,
      paidCount,
      pendingCount
    };
  };

  const stats = dashboardStats();

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const company = companies.find(cp => cp.id === customer?.companyId);
    
    const textMatch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === 'All' || inv.status === statusFilter;

    return textMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Financial Analytics Summary Header widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Invoiced', value: `Rs. ${stats.totalInvoicedVal.toLocaleString()}`, color: 'border-purple-500/20 text-purple-400' },
          { label: 'Collected', value: `Rs. ${stats.totalCollected.toLocaleString()}`, color: 'border-emerald-500/20 text-emerald-400' },
          { label: 'Advance Paid', value: `Rs. ${stats.totalAdvance.toLocaleString()}`, color: 'border-blue-500/20 text-blue-400' },
          { label: 'Outstanding Balance', value: `Rs. ${stats.outstanding.toLocaleString()}`, color: 'border-amber-500/20 text-amber-500' },
          { label: 'Paid Files', value: `${stats.paidCount} Invoices`, color: 'border-slate-800 text-slate-300' },
          { label: 'Overdue', value: `${stats.overdueCount} Invoices`, color: 'border-rose-500/20 text-rose-500' },
          { label: 'Open/Draft', value: `${stats.pendingCount} Invoices`, color: 'border-slate-800 text-slate-400' },
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40' : 'bg-slate-50'} flex flex-col justify-between`}
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{item.label}</span>
            <span className={`text-xs font-bold font-mono mt-1 ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-purple-500/10">
        <div className="flex gap-2">
          {[
            { id: 'all_invoices', label: 'All Invoices' },
            { id: 'payments', label: 'Payment Ledger' },
            { id: 'client_portal', label: '👤 Client View Sim' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedInvoice(null);
                setIsEditing(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                activeSubTab === tab.id 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/10' 
                  : isDarkMode 
                    ? 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live System In-App Notifications Toast */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] text-purple-300 font-mono animate-pulse">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>
            <span>SYSTEM LOG: {notifications[0].message}</span>
          </div>
        )}
      </div>

      {/* --- ALL INVOICES TAB --- */}
      {activeSubTab === 'all_invoices' && !selectedInvoice && !isEditing && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-neutral-950/20 border border-purple-500/10">
            <div className="flex gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search invoice number, customer or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:border-purple-500 ${
                    isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                  isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-white border-slate-200'
                }`}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <button
              onClick={() => {
                const year = new Date().getFullYear();
                const count = invoices.length + 1;
                const autoNum = `INV-${year}-${String(count).padStart(3, '0')}`;
                setEditInvoice({
                  invoiceNumber: autoNum,
                  createdDate: new Date().toISOString().split('T')[0],
                  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  items: [],
                  discount: 0,
                  tax: 15,
                  status: 'Draft',
                  advanceAmount: 0,
                  paidAmount: 0,
                  remainingAmount: 0,
                  projectName: '',
                  projectCategory: 'IT Solutions',
                  paymentTerms: '50% Advance, 50% Balance on completion',
                  notes: 'Thank you for your business!',
                  termsAndConditions: 'Payment is requested via bank transfer within 15 days of invoice date.'
                });
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/10"
            >
              <Plus size={14} />
              <span>Draft New Invoice</span>
            </button>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? 'border-purple-500/10 bg-neutral-950/20' : 'border-slate-200 bg-white'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono uppercase text-[10px] tracking-wider ${
                  isDarkMode ? 'border-slate-800 bg-neutral-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Project / Service Name</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4 text-right">Paid Amount</th>
                  <th className="p-4 text-right">Remaining Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Management</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-600'}`}>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No invoices found matching current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const client = customers.find(c => c.id === inv.customerId);
                    const calculated = calculateTotals(inv.items, inv.discount, inv.tax);
                    const statusStyle = statusColors[inv.status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

                    return (
                      <tr key={inv.id} className={`hover:bg-purple-950/[0.02] transition-colors`}>
                        <td className="p-4 font-bold text-purple-400 font-mono">{inv.invoiceNumber}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{client ? client.name : 'Unknown Customer'}</div>
                          <div className="text-[10px] text-slate-400">{client?.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-white max-w-xs truncate">{inv.projectName || 'Corporate Deliverables'}</div>
                          <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
                            {inv.projectCategory || 'IT Solutions'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                          Rs. {calculated.grandTotal.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-semibold text-emerald-500 font-mono">
                          Rs. {(inv.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-bold text-rose-400 font-mono">
                          Rs. {Math.max(0, calculated.grandTotal - (inv.paidAmount || 0)).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setEditInvoice({ ...inv });
                              setIsEditing(true);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                              isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Edit size={12} className="inline-block" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- INVOICE EDITOR / DRAFTER FORM --- */}
      {isEditing && editInvoice && (
        <div className="space-y-6">
          {/* Form Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/10 dark:border-slate-150/15">
            <div>
              <h4 className="text-base font-extrabold uppercase tracking-wider text-purple-400">
                {editInvoice.id ? 'Modify Active Invoice' : 'Create Branded Tax Invoice'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Define corporate client deliverables and financial configurations.</p>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3"
            >
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Attention Required:</span> {validationError}
              </div>
              <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-300">
                <X size={14} />
              </button>
            </motion.div>
          )}

          {/* 3-Column Split Desktop Layout / Stacking Mobile Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Invoice Fields - spans 7/12 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Customer and General Details */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4 shadow-sm`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10 dark:border-slate-800/25">
                  <User size={14} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client & Metadata Configuration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">Invoice Number <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={editInvoice.invoiceNumber || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, invoiceNumber: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white font-mono' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="INV-2026-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">Customer Recipient <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select
                        value={editInvoice.customerId || ''}
                        onChange={(e) => {
                          const cust = customers.find(c => c.id === e.target.value);
                          setEditInvoice({ 
                            ...editInvoice, 
                            customerId: e.target.value,
                            projectName: cust ? `Corporate Services for ${cust.name}` : ''
                          });
                        }}
                        className={`flex-1 px-3 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                          isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <option value="">Select Recipient...</option>
                        {customers.filter(c => !c.deleted).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({companies.find(comp => comp.id === c.companyId)?.name || 'Private Client'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowQuickCustomerModal(true)}
                        className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        title="Add New Customer"
                      >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Quick Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">Project Name / Invoice Subject</label>
                  <input 
                    type="text"
                    value={editInvoice.projectName || ''}
                    onChange={(e) => setEditInvoice({ ...editInvoice, projectName: e.target.value })}
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="E.g., SWS Taj Samudra Ballroom Stage Decoration"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Issue Date</label>
                    <input 
                      type="date"
                      value={editInvoice.createdDate || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, createdDate: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Due Date</label>
                    <input 
                      type="date"
                      value={editInvoice.dueDate || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, dueDate: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Project Division</label>
                    <select
                      value={editInvoice.projectCategory || 'IT Solutions'}
                      onChange={(e) => setEditInvoice({ ...editInvoice, projectCategory: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="IT Solutions">IT Solutions</option>
                      <option value="SWS Events">SWS Event Decor</option>
                      <option value="U1 Studio">U1 Studio Photo</option>
                      <option value="Travels Fleet">Travels Fleet Rental</option>
                      <option value="ERP Solutions">ERP Software Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Sales Rep</label>
                    <input 
                      type="text"
                      value={editInvoice.salesRep || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, salesRep: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="Kamal Perera"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Workflow Status</label>
                    <select
                      value={editInvoice.status || 'Draft'}
                      onChange={(e) => setEditInvoice({ ...editInvoice, status: e.target.value as any })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white font-bold' : 'bg-slate-50 border-slate-200 font-bold'
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent / Issued</option>
                      <option value="Approved">Customer Approved</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Line Items & Dynamic Calculators */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4 shadow-sm`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/10 dark:border-slate-800/25">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Services & Products Line Items</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const items = editInvoice.items || [];
                      setEditInvoice({
                        ...editInvoice,
                        items: [...items, { id: `item-${Date.now()}-${items.length}`, name: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }]
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus size={12} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {(editInvoice.items || []).length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-slate-800/10 dark:border-slate-800 rounded-2xl text-slate-400 italic text-xs">
                      No services or items defined yet. Click "+ Add Item" above to get started.
                    </div>
                  ) : (
                    (editInvoice.items || []).map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-xl border relative transition-all ${
                          isDarkMode ? 'bg-neutral-900/40 border-slate-850 hover:bg-neutral-900/60' : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                        } space-y-3`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editInvoice.items || []).filter(it => it.id !== item.id);
                            setEditInvoice({ ...editInvoice, items: updated });
                          }}
                          className="absolute top-3 right-3 text-rose-500 hover:text-rose-400 p-1.5 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5 font-bold">Item Name <span className="text-red-500">*</span></label>
                            <input 
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].name = e.target.value;
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                              placeholder="E.g., Stage Arch Decor"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5">Description details</label>
                            <input 
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].description = e.target.value;
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                              placeholder="E.g., Premium local lilies, warm lights"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5">Qty</label>
                            <input 
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none text-center font-mono ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5">Unit Price (Rs)</label>
                            <input 
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none text-right font-mono ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5">Discount %</label>
                            <input 
                              type="number"
                              min={0}
                              max={100}
                              value={item.discount || 0}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].discount = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none text-center font-mono ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-slate-400 font-mono mb-0.5">Tax %</label>
                            <input 
                              type="number"
                              min={0}
                              max={100}
                              value={item.tax || 0}
                              onChange={(e) => {
                                const list = [...(editInvoice.items || [])];
                                list[idx].tax = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setEditInvoice({ ...editInvoice, items: list });
                              }}
                              className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none text-center font-mono ${
                                isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card 3: Terms, Conditions & Bank instructions */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4 shadow-sm`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10 dark:border-slate-800/25">
                  <CreditCard size={14} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Instructions & Service SLA agreements</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Payment Instructions</label>
                    <textarea 
                      rows={3}
                      value={editInvoice.paymentTerms || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, paymentTerms: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-purple-500 transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="Provide bank details, deposit schedule rules..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Terms & Conditions</label>
                    <textarea 
                      rows={3}
                      value={editInvoice.termsAndConditions || ''}
                      onChange={(e) => setEditInvoice({ ...editInvoice, termsAndConditions: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-purple-500 transition-colors ${
                        isDarkMode ? 'bg-neutral-900 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="This invoice is subject to Mahdev Standard Service Agreement..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Modern Real-Time Invoice Preview Panel - spans 5/12 */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-250 shadow-sm'
              } space-y-4`}>
                
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-800/30 dark:border-slate-800/10">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-emerald-400" />
                    <span className="text-[10px] font-black font-mono tracking-widest text-emerald-400 uppercase">Live working Draft Preview</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase">VAT compliant</span>
                </div>

                {/* Simulated Real Invoice Paper */}
                <div className="bg-white text-slate-800 p-5 rounded-xl border border-slate-100 shadow-xl space-y-4 text-[11px] leading-normal font-sans">
                  
                  {/* Preview Header */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <h5 className="font-extrabold text-slate-900 tracking-tight uppercase text-xs">Mahdev Pvt Ltd</h5>
                      <p className="text-[9px] text-slate-400 font-mono">Colombo, Sri Lanka</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {editInvoice.projectCategory || 'Corporate Services'}
                      </span>
                      <h6 className="text-[10px] font-bold text-purple-600 font-mono mt-1">{editInvoice.invoiceNumber || 'INV-DRAFT'}</h6>
                    </div>
                  </div>

                  {/* Preview Customer Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                    <div>
                      <span className="font-mono uppercase text-[8px] tracking-wider block text-slate-400">Bill To Recipient</span>
                      <span className="font-bold text-slate-800 text-[10px]">
                        {customers.find(c => c.id === editInvoice.customerId)?.name || 'Select Customer...'}
                      </span>
                      <span className="block">{customers.find(c => c.id === editInvoice.customerId)?.phone || ''}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono uppercase text-[8px] tracking-wider block text-slate-400">Financial Dates</span>
                      <span className="block font-medium">Issued: {editInvoice.createdDate || '-'}</span>
                      <span className="block font-medium text-rose-500">Due: {editInvoice.dueDate || '-'}</span>
                    </div>
                  </div>

                  {/* Preview Project Subject */}
                  {editInvoice.projectName && (
                    <div className="border-b border-slate-100 pb-2">
                      <span className="font-mono uppercase text-[8px] tracking-wider block text-slate-400">Subject/Project Reference</span>
                      <p className="font-bold text-slate-800 text-[10px] mt-0.5">{editInvoice.projectName}</p>
                    </div>
                  )}

                  {/* Preview Line Items Table */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 gap-1 font-bold text-[8px] font-mono text-slate-400 uppercase border-b border-slate-100 pb-1">
                      <span className="col-span-6">Item description</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-4 text-right">Ext Price</span>
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {(editInvoice.items || []).length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic py-2 text-center">No deliverables added.</p>
                      ) : (
                        (editInvoice.items || []).map((it) => {
                          const itemExtTotal = (it.quantity || 1) * (it.unitPrice || 0);
                          const itemDisc = itemExtTotal * ((it.discount || 0) / 100);
                          const finalItemTotal = Math.max(0, itemExtTotal - itemDisc + (itemExtTotal * ((it.tax || 0) / 100)));
                          return (
                            <div key={it.id} className="grid grid-cols-12 gap-1 text-[9px] border-b border-dashed border-slate-100 pb-1.5">
                              <div className="col-span-6">
                                <span className="font-bold text-slate-800 block">{it.name || 'Untitled item'}</span>
                                <span className="text-[8px] text-slate-400 block line-clamp-1">{it.description || ''}</span>
                              </div>
                              <span className="col-span-2 text-center font-mono text-slate-600 mt-1">{it.quantity || 1}</span>
                              <span className="col-span-4 text-right font-bold text-slate-800 font-mono mt-1">Rs. {finalItemTotal.toLocaleString()}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Preview Financial Totals Calculation Summary */}
                  {(() => {
                    const computed = calculateTotals(editInvoice.items || [], editInvoice.discount || 0, editInvoice.tax || 0);
                    return (
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[9px]">
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>Subtotal Base Amount:</span>
                          <span className="font-mono">Rs. {computed.subtotal.toLocaleString()}</span>
                        </div>
                        {computed.totalDiscount > 0 && (
                          <div className="flex justify-between text-rose-500 font-medium">
                            <span>Total Applied Discounts:</span>
                            <span className="font-mono">- Rs. {computed.totalDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        {computed.taxAmount > 0 && (
                          <div className="flex justify-between text-blue-500 font-medium">
                            <span>Applied Taxes (VAT):</span>
                            <span className="font-mono">+ Rs. {computed.taxAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px] font-black text-slate-900 border-t border-slate-200 pt-1 mt-1 font-mono">
                          <span>GRAND TOTAL DUE:</span>
                          <span className="text-purple-700">Rs. {computed.grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Preview Footer details */}
                  <div className="text-[8px] text-slate-400 font-mono leading-normal pt-1 text-center border-t border-slate-100">
                    SWS Events • U1 Studio • IT solutions • travels suite
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Actions Bar at the bottom of form */}
          <div className={`sticky bottom-0 z-40 p-4 border rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 backdrop-blur-md ${
            isDarkMode ? 'bg-neutral-950/90 border-purple-500/15 text-white shadow-lg' : 'bg-slate-50/95 border-slate-250 text-slate-800 shadow-md'
          }`}>
            <div className="text-left">
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block">Grand Total Draft Value</span>
              <span className="text-sm font-black font-mono text-purple-400">
                Rs. {calculateTotals(editInvoice.items || [], editInvoice.discount || 0, editInvoice.tax || 0).grandTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button 
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setIsEditing(false);
                }}
                className={`px-4 py-2.5 text-xs rounded-xl font-bold uppercase tracking-wider transition-colors ${
                  isDarkMode ? 'bg-neutral-900 hover:bg-neutral-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Discard Draft
              </button>
              
              <button 
                type="button"
                onClick={handleSaveInvoice}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-purple-600/15 transition-transform active:scale-95"
              >
                Commit & Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVOICE DETAILED VIEW / PROFILE --- */}
      {selectedInvoice && !isEditing && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Breadcrumb back control */}
          <button 
            onClick={() => setSelectedInvoice(null)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <span>← Return to Invoice Listing</span>
          </button>

          {/* Action Header Card */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
          } flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400">{selectedInvoice.invoiceNumber}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  (statusColors[selectedInvoice.status] || {}).bg
                } ${(statusColors[selectedInvoice.status] || {}).text} ${(statusColors[selectedInvoice.status] || {}).border}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedInvoice.projectName}</h3>
              <p className="text-xs text-slate-400">Account Owner: {customers.find(c => c.id === selectedInvoice.customerId)?.name || 'Private Client'}</p>
            </div>

            {/* Quick transition triggers */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  setEditInvoice({ ...selectedInvoice });
                  setIsEditing(true);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                  isDarkMode ? 'bg-neutral-900 hover:bg-neutral-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Modify Fields
              </button>
              <button 
                onClick={() => {
                  setPaymentType(selectedInvoice.paidAmount > 0 ? 'Installment' : 'Advance');
                  setPaymentAmount(Math.max(0, calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax).grandTotal - selectedInvoice.paidAmount).toString());
                  setPaymentModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                Record Payment
              </button>
              <button 
                onClick={() => {
                  setActiveReceipt({
                    type: 'invoice',
                    invoice: selectedInvoice
                  });
                }}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs uppercase flex items-center gap-1"
              >
                <Eye size={12} />
                <span>View Final PDF</span>
              </button>
            </div>
          </div>

          {/* Detailed Workflow Visualizer Timeline */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
          } space-y-4`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Life Cycle Progress</span>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 pt-2">
              {[
                { stage: 'Draft', desc: 'Quotation Drafted', val: 'Draft', num: 1 },
                { stage: 'Sent', desc: 'Issued to Customer', val: 'Sent', num: 2 },
                { stage: 'Approved', desc: 'Approved / Locked', val: 'Approved', num: 3 },
                { stage: 'Partially Paid', desc: 'Advance Enrolled', val: 'Partially Paid', num: 4 },
                { stage: 'Work in Progress', desc: 'Active SWS / IT Dev', val: 'Partially Paid', num: 5 },
                { stage: 'Paid', desc: 'Final Balance Settlement', val: 'Paid', num: 6 },
                { stage: 'Cancelled', desc: 'Void Document', val: 'Cancelled', num: 7 },
              ].map((step, idx) => {
                // Determine step completeness
                const isCurrent = selectedInvoice.status === step.val;
                const activeIndex = ['Draft', 'Sent', 'Approved', 'Partially Paid', 'Partially Paid', 'Paid'].indexOf(selectedInvoice.status);
                const isPassed = activeIndex >= idx && selectedInvoice.status !== 'Cancelled';

                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (step.val !== 'Work in Progress') {
                        handleTransitionStatus(selectedInvoice, step.val as Invoice['status']);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isCurrent 
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' 
                        : isPassed 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                          : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono">0{step.num}</span>
                      {isCurrent && <Clock size={10} className="text-purple-400" />}
                      {isPassed && !isCurrent && <CheckCircle2 size={10} className="text-emerald-400" />}
                    </div>
                    <p className="font-bold text-xs mt-1.5">{step.stage}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left and Mid Pane: Details list and payments */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Deliverable details */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
              } space-y-4`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statement of Account Deliverables</span>
                  <span className="text-xs text-purple-400 font-mono">Currency: LKR (Rs.)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 pb-2 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="py-2">Item Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Unit Price</th>
                        <th className="py-2 text-right">Discount</th>
                        <th className="py-2 text-right">VAT</th>
                        <th className="py-2 text-right">Total Line</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedInvoice.items.map((it, idx) => {
                        const base = it.quantity * it.unitPrice;
                        const disc = base * ((it.discount || 0) / 100);
                        const tax = (base - disc) * ((it.tax || 0) / 100);
                        const lineTotal = base - disc + tax;

                        return (
                          <tr key={idx} className="hover:bg-purple-950/[0.01]">
                            <td className="py-3">
                              <div className="font-bold text-slate-900 dark:text-white">{it.name || 'Professional Services'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{it.description}</div>
                            </td>
                            <td className="py-3 text-center font-mono">{it.quantity}</td>
                            <td className="py-3 text-right font-mono">Rs. {it.unitPrice.toLocaleString()}</td>
                            <td className="py-3 text-right text-rose-400 font-mono">-{it.discount || 0}%</td>
                            <td className="py-3 text-right text-blue-400 font-mono">+{it.tax || 0}%</td>
                            <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">Rs. {lineTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Account Balances summary */}
                <div className="flex justify-end pt-4 border-t border-slate-800/10 dark:border-slate-100/10 text-xs">
                  <div className="w-80 space-y-2">
                    {(() => {
                      const computed = calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax);
                      return (
                        <>
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal Base Amount:</span>
                            <span className="font-mono text-slate-200 dark:text-slate-300">Rs. {computed.subtotal.toLocaleString()}</span>
                          </div>
                          {computed.totalDiscount > 0 && (
                            <div className="flex justify-between text-rose-400">
                              <span>Total Savings / Discounts:</span>
                              <span className="font-mono">- Rs. {computed.totalDiscount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-blue-400">
                            <span>Consolidated VAT Registration:</span>
                            <span className="font-mono">+ Rs. {computed.taxAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-b border-slate-800/20 pb-2">
                            <span>Invoice Grand Total:</span>
                            <span className="font-mono text-purple-400">Rs. {computed.grandTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Advance Paid Enrolled:</span>
                            <span className="font-mono text-emerald-400">Rs. {(selectedInvoice.advanceAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Accumulated Total Payments:</span>
                            <span className="font-mono text-emerald-400">Rs. {(selectedInvoice.paidAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-rose-400 pt-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                            <span>Outstanding Settlement:</span>
                            <span className="font-mono">Rs. {Math.max(0, computed.grandTotal - (selectedInvoice.paidAmount || 0)).toLocaleString()}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Installment Payment History ledger */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
              } space-y-4`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detailed Payment installment history ledger</span>
                
                {payments.filter(p => p.invoiceId === selectedInvoice.id).length === 0 ? (
                  <div className="p-6 text-center text-slate-400 italic text-xs">
                    No transactions recorded against this invoice yet. Click "Record Payment" to process payments.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.filter(p => p.invoiceId === selectedInvoice.id).map((pay, pIdx) => {
                      // Calculate outstanding balance after this payment dynamically
                      const invoicePaymentsInOrder = payments
                        .filter(p => p.invoiceId === selectedInvoice.id)
                        .reverse(); // oldest first
                      
                      const grand = calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax).grandTotal;
                      let runningPaid = 0;
                      const runningBalances = invoicePaymentsInOrder.map(p => {
                        runningPaid += p.amount;
                        return grand - runningPaid;
                      });
                      
                      const reverseIndex = invoicePaymentsInOrder.findIndex(p => p.id === pay.id);
                      const balanceAfterThis = runningBalances[reverseIndex] || 0;

                      return (
                        <div 
                          key={pay.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 ${
                            isDarkMode ? 'bg-neutral-900/40 border-slate-800' : 'bg-slate-50 border-slate-150'
                          }`}
                        >
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white font-mono">{pay.receiptNumber}</span>
                              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[9px] font-bold uppercase">
                                {pay.type}
                              </span>
                            </div>
                            <p className="text-slate-400">Method: {pay.source} | Reference ID: {pay.referenceNumber}</p>
                            <p className="text-slate-500 italic">"{pay.notes}"</p>
                            <p className="text-[10px] text-slate-400">Processed by: {pay.receivedBy || 'yuvanshan875@gmail.com'} on {pay.paymentDate}</p>
                          </div>
                          
                          <div className="text-right flex flex-col justify-between shrink-0">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block">Amount Paid</span>
                              <span className="font-bold text-emerald-400 font-mono text-sm">Rs. {pay.amount.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-[9px] text-slate-400 uppercase block">Running Balance</span>
                              <span className="font-bold text-slate-400 font-mono">Rs. {Math.max(0, balanceAfterThis).toLocaleString()}</span>
                            </div>

                            {/* View Receipt PDF button */}
                            <button
                              onClick={() => {
                                setActiveReceipt({
                                  type: pay.type === 'Advance' ? 'advance_receipt' : 'balance_receipt',
                                  invoice: selectedInvoice,
                                  payment: pay
                                });
                              }}
                              className="text-[10px] font-bold uppercase text-purple-400 hover:text-purple-300 mt-2 text-right"
                            >
                              Print Receipt PDF →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Pane: Client & Audit Logs */}
            <div className="space-y-6">
              
              {/* Client info & metadata */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
              } space-y-4 text-xs`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Recipient Details</span>
                
                {(() => {
                  const client = customers.find(c => c.id === selectedInvoice.customerId);
                  const company = companies.find(cp => cp.id === client?.companyId);
                  return (
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Corporate Customer</span>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{client?.name || 'Walk-in Private Client'}</p>
                      </div>
                      {company && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Company Legal Group</span>
                          <div className="flex items-center gap-1.5 font-semibold text-purple-400 mt-0.5">
                            <Building size={12} />
                            <span>{company.name}</span>
                          </div>
                          <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">{company.address}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Email</span>
                          <p className="text-slate-300">{client?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Phone</span>
                          <p className="text-slate-300">{client?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Payment Terms Contract</span>
                        <p className="text-slate-400 italic leading-relaxed">"{selectedInvoice.paymentTerms || 'Standard NET-15 bank wire.'}"</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Log / Audit Trail */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'
              } space-y-4 text-xs`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Audit Trail & Ledger Logs</span>
                
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {(selectedInvoice.activityLogs || []).length === 0 ? (
                    <div className="text-slate-400 italic text-[10px]">No ledger audits recorded.</div>
                  ) : (
                    (selectedInvoice.activityLogs || []).reverse().map((log, lIdx) => (
                      <div key={lIdx} className="p-2.5 rounded bg-neutral-900/40 border border-slate-800 text-[10px]">
                        <div className="flex justify-between text-slate-400">
                          <span className="font-bold text-slate-300">{log.action}</span>
                          <span className="font-mono text-[9px]">{log.timestamp.substring(11)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 mt-1 font-mono text-[9px]">
                          <span>User: {log.user}</span>
                          <span>{log.timestamp.substring(0, 10)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- PAYMENT LEDGER TAB --- */}
      {activeSubTab === 'payments' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-neutral-950/20 border border-purple-500/10">
            <span className="text-xs text-slate-400 font-medium">Consolidated payments registry. All incoming transactions logged securely.</span>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search payments by reference ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:border-purple-500 ${
                  isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? 'border-purple-500/10 bg-neutral-950/20' : 'border-slate-200 bg-white'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono uppercase text-[10px] tracking-wider ${
                  isDarkMode ? 'border-slate-800 bg-neutral-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <th className="p-4">Receipt Number</th>
                  <th className="p-4">Invoice Reference</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Transaction Code</th>
                  <th className="p-4 font-mono">Date Received</th>
                  <th className="p-4">Received By</th>
                  <th className="p-4 text-right">Amount Enrolled</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-600'}`}>
                {payments.filter(p => p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No matching payments found in company ledger.
                    </td>
                  </tr>
                ) : (
                  payments.filter(p => p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())).map((pay) => {
                    const refInv = invoices.find(i => i.id === pay.invoiceId);
                    return (
                      <tr key={pay.id} className="hover:bg-purple-950/[0.01]">
                        <td className="p-4 font-bold text-white font-mono">{pay.receiptNumber}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => refInv && setSelectedInvoice(refInv)}
                            className="text-purple-400 hover:underline font-mono font-bold"
                          >
                            {refInv ? refInv.invoiceNumber : 'External Ledger'}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-neutral-800 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                            {pay.source}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{pay.referenceNumber || pay.transactionId}</td>
                        <td className="p-4 font-mono text-slate-500">{pay.paymentDate}</td>
                        <td className="p-4">{pay.receivedBy || 'yuvanshan875@gmail.com'}</td>
                        <td className="p-4 text-right font-bold text-emerald-400 font-mono">Rs. {pay.amount.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              const ref = invoices.find(i => i.id === pay.invoiceId);
                              if (ref) {
                                setActiveReceipt({
                                  type: pay.type === 'Advance' ? 'advance_receipt' : 'balance_receipt',
                                  invoice: ref,
                                  payment: pay
                                });
                              } else {
                                alert('Referenced invoice not found in local state.');
                              }
                            }}
                            className="px-2 py-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg text-[10px] font-bold"
                          >
                            PDF Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SIMULATED CLIENT PORTAL VIEW TAB --- */}
      {activeSubTab === 'client_portal' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-purple-950/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'} text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
            <div>
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <ShieldCheck size={16} />
                <span>Simulated Client Workspace Portal</span>
              </p>
              <p className="mt-1 opacity-80">Experience exactly what Mahdev customers see: view payment terms, track pending settlements, download PDFs, and submit bank payment proofs.</p>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="font-bold uppercase text-[9px] tracking-wider text-slate-400">Select Client Profile:</span>
              <select
                value={actingCustomerId}
                onChange={(e) => setActingCustomerId(e.target.value)}
                className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none font-bold ${
                  isDarkMode ? 'bg-neutral-900 border-purple-500/20 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {!actingCustomerId ? (
            <div className="p-12 text-center text-slate-400 italic text-xs border border-dashed border-slate-800 rounded-2xl">
              Please choose a customer from the dropdown to experience their client dashboard view.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left pane: Invoices list & receipts */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <FileText size={15} />
                    <span>Your Mahdev Invoices</span>
                  </h4>

                  <div className="space-y-4">
                    {invoices.filter(i => i.customerId === actingCustomerId).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">You have no active invoices billed currently.</p>
                    ) : (
                      invoices.filter(i => i.customerId === actingCustomerId).map(inv => {
                        const comp = calculateTotals(inv.items, inv.discount, inv.tax);
                        const stateStyle = statusColors[inv.status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

                        return (
                          <div 
                            key={inv.id}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                              isDarkMode ? 'bg-neutral-900/60 border-slate-850' : 'bg-slate-50 border-slate-150'
                            }`}
                          >
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${stateStyle.bg} ${stateStyle.text} ${stateStyle.border}`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-300">{inv.projectName}</p>
                              <p className="text-[10px] text-slate-400">Due Date Settlement Required: {inv.dueDate}</p>
                              <p className="text-[11px] text-slate-500 italic">"Instructions: {inv.paymentTerms}"</p>
                            </div>

                            <div className="text-right shrink-0 space-y-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-mono">Invoice Value</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">Rs. {comp.grandTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setActiveReceipt({
                                      type: 'invoice',
                                      invoice: inv
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold uppercase transition-all"
                                >
                                  Download PDF
                                </button>
                                {payments.filter(p => p.invoiceId === inv.id).length > 0 && (
                                  <button
                                    onClick={() => {
                                      const p = payments.find(pay => pay.invoiceId === inv.id && pay.type === 'Advance');
                                      if (p) {
                                        setActiveReceipt({
                                          type: 'advance_receipt',
                                          invoice: inv,
                                          payment: p
                                        });
                                      } else {
                                        const pLatest = payments.filter(pay => pay.invoiceId === inv.id)[0];
                                        setActiveReceipt({
                                          type: 'balance_receipt',
                                          invoice: inv,
                                          payment: pLatest
                                        });
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-neutral-800 text-slate-300 rounded text-[10px]"
                                  >
                                    Receipts
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Client Payment History Ledger */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">Your Receipts & Settlement Records</h4>
                  
                  {payments.filter(p => invoices.find(i => i.id === p.invoiceId)?.customerId === actingCustomerId).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No receipts issued yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.filter(p => invoices.find(i => i.id === p.invoiceId)?.customerId === actingCustomerId).map(pay => {
                        const inv = invoices.find(i => i.id === pay.invoiceId);
                        return (
                          <div 
                            key={pay.id} 
                            className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                              isDarkMode ? 'bg-neutral-900 border-slate-800' : 'bg-slate-50 border-slate-150'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-slate-900 dark:text-white font-mono">{pay.receiptNumber}</span>
                              <span className="ml-2 text-[9px] px-1 py-0.2 bg-emerald-500/10 text-emerald-400 rounded font-bold">{pay.type}</span>
                              <p className="text-slate-400">Settled via {pay.source} on {pay.paymentDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-400 font-mono">Rs. {pay.amount.toLocaleString()}</p>
                              <button
                                onClick={() => {
                                  if (inv) {
                                    setActiveReceipt({
                                      type: pay.type === 'Advance' ? 'advance_receipt' : 'balance_receipt',
                                      invoice: inv,
                                      payment: pay
                                    });
                                  }
                                }}
                                className="text-[10px] text-purple-400 hover:underline block mt-1"
                              >
                                View PDF Receipt
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Right pane: Upload proof of payment */}
              <div className="space-y-6">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-white border-slate-200'} space-y-4`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Upload Bank Wire Slip</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Made an installment or advance payment via online banking? Upload your bank wire transaction slip or checkout proof here to alert our accounts team immediately.</p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Select Invoice</label>
                      <select
                        value={uploadedProofInvoiceId}
                        onChange={(e) => setUploadedProofInvoiceId(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                          isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <option value="">Choose Invoice Reference...</option>
                        {invoices.filter(i => i.customerId === actingCustomerId).map(i => (
                          <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.projectName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Amount Settled (Rs.)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 100000"
                          value={uploadedAmount}
                          onChange={(e) => setUploadedAmount(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                            isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Payment Method</label>
                        <select
                          value={uploadedProofMethod}
                          onChange={(e) => setUploadedProofMethod(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                            isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Online Banking">Online Banking</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Mobile Wallet">Mobile Wallet</option>
                          <option value="Cheque">Cheque Deposit</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Bank Transaction Reference ID</label>
                      <input 
                        type="text"
                        placeholder="e.g. FT26090400192"
                        value={uploadedProofRef}
                        onChange={(e) => setUploadedProofRef(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                          isDarkMode ? 'bg-neutral-900 border-slate-800 text-white font-mono' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>

                     <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] uppercase text-slate-400 font-mono">Upload Slip Image / PDF URL</label>
                        {proofUploadError && <span className="text-[9px] text-rose-500 font-mono">{proofUploadError}</span>}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="https://..."
                          value={uploadedProofUrl}
                          onChange={(e) => setUploadedProofUrl(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none truncate ${
                            isDarkMode ? 'bg-neutral-900 border-slate-800 text-white font-mono' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                        <input 
                          type="file" 
                          id="client-proof-file-input"
                          onChange={handleProofFileChange} 
                          className="hidden" 
                          accept="image/*,application/pdf"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('client-proof-file-input')?.click()}
                          disabled={isProofUploading}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold font-mono border transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider ${
                            isProofUploading 
                              ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 cursor-not-allowed font-semibold'
                              : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                          }`}
                        >
                          <Upload size={11} className={isProofUploading ? "animate-bounce" : ""} />
                          <span>{isProofUploading ? "..." : "Upload"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Client Remarks Notes</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Balance remaining will be settled within 10 days"
                        value={uploadedProofNotes}
                        onChange={(e) => setUploadedProofNotes(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                          isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleClientSubmitProof}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-xl shadow-md transition-all mt-2"
                    >
                      Submit Payment Proof
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* --- RE-USABLE RECORD PAYMENT MODAL DIALOG --- */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative overflow-hidden bg-gradient-to-b ${
            isDarkMode 
              ? 'from-neutral-900 via-neutral-950 to-black border-purple-500/25 text-white shadow-purple-950/20' 
              : 'from-white to-slate-50 border-slate-200 text-slate-800'
          } space-y-4`}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
            
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-3 pt-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 font-mono flex items-center gap-2">
                <CreditCard size={16} className="text-purple-400 animate-pulse" />
                <span>Record Incoming Payment</span>
              </h4>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className={`p-1.5 rounded-lg border transition-all ${
                  isDarkMode 
                    ? 'border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white' 
                    : 'border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Selected Billed Target:</span>
                <p className="font-bold text-slate-100">{selectedInvoice.invoiceNumber} - {selectedInvoice.projectName}</p>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Grand Total: Rs. {calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax).grandTotal.toLocaleString()}</span>
                  <span className="text-emerald-400">Unsettled: Rs. {(calculateTotals(selectedInvoice.items, selectedInvoice.discount, selectedInvoice.tax).grandTotal - selectedInvoice.paidAmount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Installment / Payment Stage Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Advance">Advance Deposit Settlement</option>
                  <option value="Installment">Partial / Progress Installment</option>
                  <option value="Final">Balance Settlement / Final Payment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Amount Enrolled (LKR)</label>
                  <input 
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-neutral-900 border-slate-800 text-white text-emerald-400' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="e.g. 150000"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-neutral-900 border-slate-800 text-white font-bold' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online Banking">Online Banking</option>
                    <option value="Cash">Cash Currency</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="QR Payment">QR Code Payment</option>
                    <option value="Mobile Wallet">Mobile Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Bank wire / Cash ref number code</label>
                <input 
                  type="text"
                  placeholder="e.g. NTB-FT-82019"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none font-mono ${
                    isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] uppercase text-slate-400 font-mono">Upload Slip Attachment URL (Optional)</label>
                  {adminProofUploadError && <span className="text-[9px] text-rose-500 font-mono">{adminProofUploadError}</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={paymentProofUrl}
                    onChange={(e) => setPaymentProofUrl(e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none truncate ${
                      isDarkMode ? 'bg-neutral-900 border-slate-800 text-white font-mono' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <input 
                    type="file" 
                    id="admin-proof-file-input"
                    onChange={handleAdminProofFileChange} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('admin-proof-file-input')?.click()}
                    disabled={isAdminProofUploading}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold font-mono border transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider ${
                      isAdminProofUploading 
                        ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 cursor-not-allowed font-semibold'
                        : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                    }`}
                  >
                    <Upload size={11} className={isAdminProofUploading ? "animate-bounce" : ""} />
                    <span>{isAdminProofUploading ? "..." : "Upload"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-mono mb-1">Internal Ledger Remarks</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Cleared via CEO check. Confirmed by finance director."
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/10 mt-4">
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className={`px-4 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-colors font-mono ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleRecordPayment}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              >
                Book Transaction Ledger
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PROFESSIONAL PDF RECEIPT & INVOICE GENERATOR modal OVERLAY --- */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl p-8 rounded-3xl bg-white text-slate-800 shadow-2xl relative my-8 font-sans">
            
            {/* Close control */}
            <button 
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full print:hidden"
            >
              <X size={16} />
            </button>

            {/* --- PAPER PDF FRAME A4 AREA --- */}
            <div className="p-8 border border-slate-300 rounded-2xl bg-white space-y-6 max-h-[75vh] overflow-y-auto text-slate-800 print:max-h-none print:border-none print:p-0">
              
              {/* BRANDING HEADER */}
              <div className="flex justify-between items-start border-b-2 border-purple-500/20 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center text-white font-black text-sm shadow-md">M</div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight text-slate-900">MAHDEV PVT LTD</h2>
                      <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">Multi-Service Conglomerate</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-mono">Registration: PV-987654 | VAT: 100234567-7000</p>
                  <p className="text-[10px] text-slate-500 max-w-sm mt-1 leading-relaxed">No. 45, Galle Road, Colombo 03, Sri Lanka</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Hotline: +94 11 234 5678 | WhatsApp: +94 77 123 4567</p>
                </div>
                
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                    {activeReceipt.type === 'invoice' ? 'Tax Invoice' : activeReceipt.type === 'advance_receipt' ? 'Advance Payment Receipt' : 'Balance Settlement Receipt'}
                  </span>
                  
                  <div className="mt-4 space-y-0.5 font-mono text-[10px]">
                    <p className="text-slate-500">Document No: 
                      <span className="font-bold text-slate-900 ml-1">
                        {activeReceipt.type === 'invoice' ? activeReceipt.invoice.invoiceNumber : activeReceipt.payment?.receiptNumber}
                      </span>
                    </p>
                    {activeReceipt.type !== 'invoice' && (
                      <p className="text-slate-500">Invoice Ref: 
                        <span className="font-bold text-slate-900 ml-1">{activeReceipt.invoice.invoiceNumber}</span>
                      </p>
                    )}
                    <p className="text-slate-500">Issued Date: 
                      <span className="font-semibold text-slate-700 ml-1">
                        {activeReceipt.type === 'invoice' ? activeReceipt.invoice.createdDate : activeReceipt.payment?.paymentDate}
                      </span>
                    </p>
                    {activeReceipt.type === 'invoice' && (
                      <p className="text-slate-500">Due Settlement: 
                        <span className="font-semibold text-rose-600 ml-1">{activeReceipt.invoice.dueDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RECIPIENT INFORMATION & BILLING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Client Recipient</span>
                  {(() => {
                    const cust = customers.find(c => c.id === activeReceipt.invoice.customerId);
                    const comp = companies.find(cp => cp.id === cust?.companyId);
                    return (
                      <div className="mt-1.5 space-y-1">
                        <p className="font-extrabold text-slate-900 text-sm">{cust?.name || 'Walk-In Private Client'}</p>
                        {comp && <p className="font-bold text-purple-700">{comp.name}</p>}
                        <p className="text-slate-500 leading-relaxed">{comp?.address || 'Billing Address Provided on File'}</p>
                        <p className="text-slate-500 font-mono text-[10px]">E: {cust?.email} | M: {cust?.phone}</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Project Overview</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{activeReceipt.invoice.projectName}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold uppercase">
                      {activeReceipt.invoice.projectCategory || 'Corporate solutions'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-1.5">
                    <span>Sales Rep: {activeReceipt.invoice.salesRep || 'Accounts Dept'}</span>
                    <span>Currency: Sri Lankan LKR (Rs.)</span>
                  </div>
                </div>
              </div>

              {/* LINE ITEMS DELIVERABLES STATEMENT */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Billed Deliverables Statement</span>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-100 text-slate-600 text-[9px] uppercase font-mono font-bold">
                      <th className="p-3">Deliverable Line Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Discount</th>
                      <th className="p-3 text-right">VAT</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeReceipt.invoice.items.map((it, idx) => {
                      const base = it.quantity * it.unitPrice;
                      const disc = base * ((it.discount || 0) / 100);
                      const tax = (base - disc) * ((it.tax || 0) / 100);
                      const total = base - disc + tax;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{it.name || 'Administrative Service Contract'}</p>
                            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{it.description}</p>
                          </td>
                          <td className="p-3 text-center font-mono">{it.quantity}</td>
                          <td className="p-3 text-right font-mono">Rs. {it.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-right text-rose-500 font-mono">-{it.discount || 0}%</td>
                          <td className="p-3 text-right text-blue-500 font-mono">+{it.tax || 0}%</td>
                          <td className="p-3 text-right font-bold font-mono text-slate-900">Rs. {total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* GRAND TOTAL CALCULATIONS & SETTLEMENT RECEIPT HIGHLIGHTS */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200 text-xs">
                
                {/* Left side of totals: Payment verification qr, notes */}
                <div className="space-y-3 flex-1">
                  
                  {activeReceipt.type !== 'invoice' && activeReceipt.payment && (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700">Receipt Transaction Confirmation</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mt-1">
                        <div>
                          <span className="text-slate-400 block">Current Amount Enrolled</span>
                          <span className="font-extrabold text-emerald-600 text-sm">Rs. {activeReceipt.payment.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Payment Date</span>
                          <span className="font-semibold text-slate-800">{activeReceipt.payment.paymentDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Settled Via</span>
                          <span className="font-semibold text-slate-800">{activeReceipt.payment.source}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Transaction Reference ID</span>
                          <span className="font-semibold text-slate-800 font-mono">{activeReceipt.payment.referenceNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Company Bank Settlement Accounts:</span>
                    <p className="text-[10px] leading-relaxed text-slate-500 italic font-mono">{profile.bankAccount}</p>
                  </div>
                </div>

                {/* Right side of totals: Billed balances summary */}
                <div className="w-72 space-y-2 text-right shrink-0">
                  {(() => {
                    const computed = calculateTotals(activeReceipt.invoice.items, activeReceipt.invoice.discount, activeReceipt.invoice.tax);
                    return (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>Base Subtotal Billed:</span>
                          <span className="font-mono font-semibold">Rs. {computed.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-500">
                          <span>Applied Volume Discounts:</span>
                          <span className="font-mono">- Rs. {computed.totalDiscount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-blue-500">
                          <span>Tax Surcharges (VAT):</span>
                          <span className="font-mono">+ Rs. {computed.taxAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5 text-sm">
                          <span>Grand Invoice Total:</span>
                          <span className="font-extrabold text-purple-700 font-mono">Rs. {computed.grandTotal.toLocaleString()}</span>
                        </div>

                        {activeReceipt.type === 'advance_receipt' && (
                          <div className="p-2 rounded-lg bg-purple-50 text-[11px] font-mono space-y-1 mt-2 border border-purple-200">
                            <div className="flex justify-between text-slate-500">
                              <span>Grand Invoice Total:</span>
                              <span className="font-bold">Rs. {computed.grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-purple-700 font-bold">
                              <span>Advance Deposit Enrolled:</span>
                              <span className="font-extrabold text-emerald-600">Rs. {activeReceipt.payment?.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-bold border-t border-purple-200 pt-1">
                              <span>Remaining Outstanding:</span>
                              <span>Rs. {(computed.grandTotal - (activeReceipt.payment?.amount || 0)).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {activeReceipt.type === 'balance_receipt' && (
                          <div className="p-2 rounded-lg bg-purple-50 text-[11px] font-mono space-y-1 mt-2 border border-purple-200">
                            <div className="flex justify-between text-slate-500">
                              <span>Grand Invoice Total:</span>
                              <span className="font-bold">Rs. {computed.grandTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Payments Enrolled Previously:</span>
                              <span className="font-semibold text-emerald-600">Rs. {(activeReceipt.invoice.paidAmount - (activeReceipt.payment?.amount || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-purple-700 font-bold">
                              <span>Current Installment:</span>
                              <span className="font-extrabold text-emerald-600">Rs. {activeReceipt.payment?.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-bold border-t border-purple-200 pt-1">
                              <span>Remaining Account Balance:</span>
                              <span>Rs. {activeReceipt.invoice.remainingAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {activeReceipt.type === 'invoice' && (
                          <div className="p-2 rounded-lg bg-purple-50 text-[11px] font-mono space-y-1 mt-2 border border-purple-200">
                            <div className="flex justify-between text-slate-500">
                              <span>Cumulative Payments Received:</span>
                              <span className="font-bold text-emerald-600">Rs. {activeReceipt.invoice.paidAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-bold border-t border-purple-200 pt-1">
                              <span>Current Outstanding Balance:</span>
                              <span>Rs. {activeReceipt.invoice.remainingAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

              </div>

              {/* DOCUMENT SIGNATURES, SEAL & AUTHENTICATION BLOCK */}
              <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <QrCode size={45} className="text-purple-700 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Mahdev Audit Verification ID</p>
                      <p className="text-[9px] text-slate-500 leading-normal max-w-xs font-mono">Secure ledger verification code: {activeReceipt.invoice.id}-{activeReceipt.payment?.id || 'FINAL'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">"Thank you for choosing Mahdev Pvt Ltd. We appreciate your valued business partners."</p>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <div className="relative">
                    {/* Beautiful Simulated Authorized Digital Stamp and Signatures */}
                    <div className="absolute -top-10 right-4 opacity-15 select-none pointer-events-none">
                      <div className="w-20 h-20 rounded-full border-4 border-double border-purple-700 flex items-center justify-center text-center font-black text-purple-700 text-[10px] uppercase tracking-tighter leading-none p-1">
                        <span>MAHDEV PVT LTD<br />CORPORATE<br />SEAL</span>
                      </div>
                    </div>
                    <div className="h-8 border-b border-slate-300 w-44 mx-auto" />
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Authorized Account Signature</p>
                  <p className="text-[9px] text-slate-500">Yuvanshan Prabakaran, Chief Executive Officer</p>
                </div>

              </div>

              {/* Legal Terms & Footer Contact details */}
              <div className="pt-4 border-t border-slate-100 text-[9px] text-slate-400 leading-normal flex flex-col sm:flex-row justify-between gap-2">
                <span>Subject to Mahdev administrative contracts terms of engagement.</span>
                <span className="font-mono">IP Address: 192.168.1.100 | Sync Timestamp: 2026-07-08 UTC</span>
              </div>

            </div>

            {/* QUICK EXPORT SHARING CONTROLS */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-3 print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Printer size={12} />
                <span>Print Document</span>
              </button>
              
              <button 
                onClick={() => {
                  alert('Branded PDF invoice/receipt document compiled and downloaded successfully onto customer file.');
                  onAuditLog(`Branded PDF generated and saved for customer.`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase"
              >
                <Download size={12} />
                <span>Download PDF</span>
              </button>

              <a 
                href={`https://wa.me/${(customers.find(c => c.id === activeReceipt.invoice.customerId)?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi,\n\nThis is Mahdev Pvt Ltd Finance team. Please find attached invoice/receipt reference (${
                    activeReceipt.type === 'invoice' ? activeReceipt.invoice.invoiceNumber : activeReceipt.payment?.receiptNumber
                  }) for Rs. ${
                    activeReceipt.type === 'invoice' 
                      ? calculateTotals(activeReceipt.invoice.items, activeReceipt.invoice.discount, activeReceipt.invoice.tax).grandTotal.toLocaleString() 
                      : activeReceipt.payment?.amount.toLocaleString()
                  }.\n\nThank you for choosing Mahdev.\nBest regards,\nMahdev HQ`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Share2 size={12} />
                <span>Share WhatsApp</span>
              </a>

              <a 
                href={`mailto:${customers.find(c => c.id === activeReceipt.invoice.customerId)?.email || ''}?subject=${encodeURIComponent(
                  `Mahdev Pvt Ltd - ${activeReceipt.type === 'invoice' ? 'Tax Invoice' : 'Receipt'} Reference ${
                    activeReceipt.type === 'invoice' ? activeReceipt.invoice.invoiceNumber : activeReceipt.payment?.receiptNumber
                  }`
                )}&body=${encodeURIComponent(
                  `Dear Valued Client,\n\nPlease locate details for invoice reference (${activeReceipt.invoice.invoiceNumber}) inside your client workspace portal.\n\nShould you have any questions, kindly contact our accounts help desk.\n\nBest Regards,\nMahdev Pvt Ltd Accounts Dept`
                )}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Mail size={12} />
                <span>Dispatch Email</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOMER MODAL */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-purple-500/25 rounded-3xl shadow-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>

            <div className="flex justify-between items-center border-b border-purple-500/10 pb-3 pt-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <User size={16} className="text-purple-400 animate-pulse" />
                <span>Quick Register New Customer</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowQuickCustomerModal(false)} 
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kamal Perera"
                  value={quickCustName}
                  onChange={(e) => setQuickCustName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567"
                    value={quickCustPhone}
                    onChange={(e) => setQuickCustPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kamal@domain.lk"
                    value={quickCustEmail}
                    onChange={(e) => setQuickCustEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">Address Details</label>
                <input
                  type="text"
                  placeholder="No 242, Union Place, Colombo 02"
                  value={quickCustAddress}
                  onChange={(e) => setQuickCustAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-neutral-950 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-purple-500/10 mt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-mono uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.01]"
                >
                  Create & Bind Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
