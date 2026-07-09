import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Briefcase, FileText, CheckCircle, 
  Clock, AlertTriangle, Calendar, Plus, Edit, Trash2, Copy, Printer, Download, 
  Mail, Share2, Send, QrCode, Search, Building, Phone, MapPin, Shield, Activity, 
  FileSpreadsheet, Upload, Folder, Bell, Settings, Lock, Database, Award, 
  Sparkles, Check, X, RefreshCw, Eye, Landmark, Percent, Clock3, UserCheck, 
  Sliders, Globe, HelpCircle, Key, Laptop, Layers, Compass, Car
} from 'lucide-react';
import { 
  Customer, Company, ErpProject, ErpTask, Quotation, Invoice, 
  PaymentRecord, ExpenseRecord, IncomeRecord, Employee, CompanyProfile, SeoSettings, ThemeSettings
} from '../../types';
import { 
  getCustomers, saveCustomers, getCompanies, saveCompanies, 
  getErpProjects, saveErpProjects, getQuotations, saveQuotations, 
  getInvoices, saveInvoices, getPayments, savePayments, 
  getExpenses, saveExpenses, getIncomes, saveIncomes, 
  getEmployees, saveEmployees, getCompanyProfile, saveCompanyProfile,
  getSeoSettings, saveSeoSettings, getThemeSettings, saveThemeSettings
} from '../../utils/storage';
import CRMModule from './CRMModule';
import InvoicingModule from './InvoicingModule';

interface EnterpriseHubProps {
  isDarkMode: boolean;
  onDataChange: () => void;
  activeTab: string;
}

export default function EnterpriseHub({ isDarkMode, onDataChange, activeTab }: EnterpriseHubProps) {
  // Database States loaded from LocalStorage
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [companies, setCompanies] = useState<Company[]>(() => getCompanies());
  const [projects, setProjects] = useState<ErpProject[]>(() => getErpProjects());
  const [quotations, setQuotations] = useState<Quotation[]>(() => getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getPayments());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => getExpenses());
  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => getIncomes());
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [profile, setProfile] = useState<CompanyProfile>(() => getCompanyProfile());
  const [seo, setSeo] = useState<SeoSettings>(() => getSeoSettings());
  const [theme, setTheme] = useState<ThemeSettings>(() => getThemeSettings());

  // Sub Tab states
  const [crmSubTab, setCrmSubTab] = useState<'customers' | 'companies' | 'leads' | 'followups'>('customers');
  const [erpSubTab, setErpSubTab] = useState<'projects' | 'tasks'>('projects');
  const [finSubTab, setFinSubTab] = useState<'quotations' | 'invoices' | 'payments' | 'expenses' | 'income'>('quotations');
  const [empSubTab, setEmpSubTab] = useState<'directory' | 'leave' | 'payroll'>('directory');
  const [sysSubTab, setSysSubTab] = useState<'profile' | 'branding' | 'reports' | 'files' | 'security'>('profile');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // File Manager State
  const [filesList, setFilesList] = useState([
    { name: 'SWS_GrandStage_Layout.pdf', size: '4.2 MB', type: 'PDF', folder: 'Design Layouts', date: '2026-06-15' },
    { name: 'NTB_Lobby_Mockup.png', size: '1.8 MB', type: 'Image', folder: 'IT Mockups', date: '2026-06-20' },
    { name: 'AitkenSpence_CRM_Scope.docx', size: '850 KB', type: 'Word', folder: 'Contracts', date: '2026-06-11' },
    { name: 'Financial_Q2_Summary.xlsx', size: '1.2 MB', type: 'Excel', folder: 'Finance', date: '2026-07-01' },
    { name: 'Wedding_Promo_Cinematic.mp4', size: '48 MB', type: 'Video', folder: 'Media Assets', date: '2026-06-30' }
  ]);
  const [activeFolder, setActiveFolder] = useState('All');
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState(['Design Layouts', 'IT Mockups', 'Contracts', 'Finance', 'Media Assets']);

  // Security Activity Logs
  const [securityLogs, setSecurityLogs] = useState([
    { id: 1, action: 'Super Admin Login', user: 'yuvanshan875@gmail.com', ip: '192.168.1.100', timestamp: '2026-07-07 08:30:15', status: 'Success' },
    { id: 2, action: 'Invoice INV-2026-002 Created', user: 'corporate@mahdev.lk', ip: '192.168.1.105', timestamp: '2026-07-07 08:45:22', status: 'Success' },
    { id: 3, action: 'Database Backup Completed', user: 'System Cron', ip: '127.0.0.1', timestamp: '2026-07-07 09:00:00', status: 'Success' },
    { id: 4, action: '2FA Enabled', user: 'yuvanshan875@gmail.com', ip: '192.168.1.100', timestamp: '2026-07-07 09:05:10', status: 'Success' }
  ]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Modal State for adding/editing items
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any>(null);

  // Active Document Viewer (Quotation/Invoice printable modal)
  const [activeDoc, setActiveDoc] = useState<{ type: 'quotation' | 'invoice' | 'receipt'; data: any } | null>(null);

  // Sync to local storage and trigger global state refresh
  const syncDatabase = (type: string, updatedData: any) => {
    switch (type) {
      case 'customers':
        saveCustomers(updatedData);
        setCustomers(updatedData);
        break;
      case 'companies':
        saveCompanies(updatedData);
        setCompanies(updatedData);
        break;
      case 'projects':
        saveErpProjects(updatedData);
        setProjects(updatedData);
        break;
      case 'quotations':
        saveQuotations(updatedData);
        setQuotations(updatedData);
        break;
      case 'invoices':
        saveInvoices(updatedData);
        setInvoices(updatedData);
        break;
      case 'payments':
        savePayments(updatedData);
        setPayments(updatedData);
        break;
      case 'expenses':
        saveExpenses(updatedData);
        setExpenses(updatedData);
        break;
      case 'incomes':
        saveIncomes(updatedData);
        setIncomes(updatedData);
        break;
      case 'employees':
        saveEmployees(updatedData);
        setEmployees(updatedData);
        break;
      case 'profile':
        saveCompanyProfile(updatedData);
        setProfile(updatedData);
        break;
      case 'seo':
        saveSeoSettings(updatedData);
        setSeo(updatedData);
        break;
      case 'theme':
        saveThemeSettings(updatedData);
        setTheme(updatedData);
        break;
    }
    // Track in audit trail
    const newLog = {
      id: Date.now(),
      action: `Update database collection: ${type.toUpperCase()}`,
      user: 'yuvanshan875@gmail.com',
      ip: '192.168.1.100',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Success'
    };
    setSecurityLogs(prev => [newLog, ...prev]);
    onDataChange();
  };

  // Convert Quotation to Invoice
  const handleConvertQuotation = (quote: Quotation) => {
    if (invoices.some(inv => inv.invoiceNumber === quote.quotationNumber.replace('QT', 'INV'))) {
      alert('This quotation is already converted to an invoice.');
      return;
    }
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: quote.quotationNumber.replace('QT', 'INV'),
      customerId: quote.customerId,
      projectId: quote.projectId,
      projectName: quote.items[0]?.description || 'Custom Enterprise Deliverables',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
      items: quote.items.map(it => ({ ...it })),
      discount: quote.discount,
      tax: quote.vat,
      status: 'Pending',
      advanceAmount: 0,
      remainingAmount: 0, // calculated dynamically below
      paidAmount: 0
    };
    const updatedInvoices = [newInvoice, ...invoices];
    const updatedQuotations = quotations.map(q => q.id === quote.id ? { ...q, status: 'Approved' as const } : q);
    
    syncDatabase('invoices', updatedInvoices);
    syncDatabase('quotations', updatedQuotations);
    alert(`Quotation ${quote.quotationNumber} converted successfully to Invoice ${newInvoice.invoiceNumber}!`);
  };

  // Compute stats for financial cards
  const totalInvoiced = invoices.reduce((sum, inv) => {
    const subtotal = inv.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const afterDiscount = subtotal * (1 - inv.discount / 100);
    const finalVal = afterDiscount * (1 + inv.tax / 100);
    return sum + finalVal;
  }, 0);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0) + totalPaid;
  const netProfit = totalIncome - totalExpense;

  const paidInvoicesCount = invoices.filter(i => i.status === 'Paid').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'Pending' || i.status === 'Partially Paid').length;

  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
  const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;

  // Render dynamic SVG chart for monthly cash flow
  const renderCashFlowChart = () => {
    return (
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">Cash Flow Trend (IT, SWS, U1, Travels)</h4>
          <span className="text-xs text-slate-400">Rs. in Millions</span>
        </div>
        <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 px-2">
          {/* Mock monthly bar charts styled elegantly using pure CSS & SVG representation */}
          {[
            { month: 'Jan', income: 3.2, expense: 1.8 },
            { month: 'Feb', income: 4.5, expense: 2.1 },
            { month: 'Mar', income: 2.9, expense: 1.5 },
            { month: 'Apr', income: 5.6, expense: 3.2 },
            { month: 'May', income: 6.8, expense: 4.0 },
            { month: 'Jun', income: 8.2, expense: 4.5 },
            { month: 'Jul', income: 9.5, expense: 5.2 }
          ].map((bar, i) => {
            const incHeight = (bar.income / 10) * 100;
            const expHeight = (bar.expense / 10) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                  <div 
                    style={{ height: `${incHeight}%` }} 
                    className="w-3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-500 hover:scale-105"
                    title={`Income: Rs. ${bar.income}M`}
                  />
                  <div 
                    style={{ height: `${expHeight}%` }} 
                    className="w-3 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-500 hover:scale-105"
                    title={`Expense: Rs. ${bar.expense}M`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{bar.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-800/20">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <span>Total Inflow (Revenue)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
            <span className="w-3 h-3 bg-rose-500 rounded-sm" />
            <span>Total Outflow (Expenses)</span>
          </div>
        </div>
      </div>
    );
  };

  // Generate WhatsApp and Email Links
  const getWhatsAppShareLink = (docType: 'Quotation' | 'Invoice', num: string, customer: any, total: number) => {
    const text = `Hi ${customer.name},\n\nWe have generated your Mahdev ${docType} (${num}) for an amount of Rs. ${total.toLocaleString()}.\n\nYou can view and download the invoice details from your client portal.\n\nBest Regards,\nMahdev Corporate HQ`;
    return `https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const getEmailShareLink = (docType: 'Quotation' | 'Invoice', num: string, customer: any, total: number) => {
    const subject = `Mahdev Pvt Ltd - Your Administrative ${docType} ${num}`;
    const body = `Dear ${customer.name},\n\nPlease find attached details for your ${docType} (${num}) totaling Rs. ${total.toLocaleString()}.\n\nKindly contact our Accounts team if you have any questions.\n\nBest Regards,\nMahdev Finance Department`;
    return `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Sub-Panels based on main admin navigation selection */}
      {activeTab === 'crm' && (
        <CRMModule
          isDarkMode={isDarkMode}
          customers={customers}
          companies={companies}
          projects={projects}
          quotations={quotations}
          invoices={invoices}
          payments={payments}
          onSync={syncDatabase}
          onAuditLog={(action) => {
            const newLog = {
              id: Date.now(),
              action,
              user: 'yuvanshan875@gmail.com',
              ip: '192.168.1.100',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              status: 'Success'
            };
            setSecurityLogs(prev => [newLog, ...prev]);
          }}
        />
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Projects ERP & Task Tracking
              </h3>
              <p className="text-xs text-slate-400">
                Track full project lifecycles, milestones, tasks dispatch, and budget allocations for SWS and IT departments.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {['projects', 'tasks'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setErpSubTab(sub as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    erpSubTab === sub 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {erpSubTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-end p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10">
                <button
                  onClick={() => { setModalType('add_project'); setModalItem({}); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30"
                >
                  <Plus size={14} />
                  <span>Create Project File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((proj) => {
                  const client = customers.find(c => c.id === proj.customerId);
                  const leadEmp = employees.find(e => proj.assignedEmployees.includes(e.id));
                  return (
                    <div key={proj.id} className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400 font-bold">Project File</span>
                          <h4 className="text-base font-bold text-white mt-1">{proj.name}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          proj.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Progress completed</span>
                          <span className="font-mono font-bold text-white">{proj.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${proj.progress}%` }} 
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                          />
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-850">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Client Group</span>
                          <span className="font-bold text-slate-300">{client ? client.name : 'Individual'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Budget Assigned</span>
                          <span className="font-bold text-emerald-400 font-mono">Rs. {proj.budget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Start Date</span>
                          <span className="font-medium text-slate-300 font-mono">{proj.startDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Final Deadline</span>
                          <span className="font-medium text-rose-400 font-mono">{proj.deadline}</span>
                        </div>
                      </div>

                      {/* Lead Architect */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-slate-850 text-xs">
                        <span className="text-slate-400">Project Lead:</span>
                        <span className="font-bold text-purple-400">{leadEmp ? leadEmp.name : 'Unassigned'}</span>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={() => { setModalType('edit_project'); setModalItem(proj); }}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                        >
                          <Edit size={12} />
                          <span>Edit Scope</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete project?')) {
                              const updated = projects.filter(p => p.id !== proj.id);
                              syncDatabase('projects', updated);
                            }
                          }}
                          className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400"
                        >
                          <Trash2 size={12} />
                          <span>Close File</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {erpSubTab === 'tasks' && (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                      <th className="p-4">Task Deliverable</th>
                      <th className="p-4">Assigned Personnel</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {projects.flatMap(p => p.tasks).map((tsk) => {
                      const emp = employees.find(e => e.id === tsk.assignedTo);
                      return (
                        <tr key={tsk.id} className="hover:bg-purple-950/5">
                          <td className="p-4 font-bold text-white">{tsk.title}</td>
                          <td className="p-4 text-purple-400 font-semibold">{emp ? emp.name : 'Unassigned'}</td>
                          <td className="p-4 font-mono text-rose-400">{tsk.dueDate}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tsk.priority === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {tsk.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={tsk.status}
                              onChange={(e) => {
                                const updated = projects.map(p => {
                                  if (p.id === tsk.projectId) {
                                    return {
                                      ...p,
                                      tasks: p.tasks.map(t => t.id === tsk.id ? { ...t, status: e.target.value as any } : t)
                                    };
                                  }
                                  return p;
                                });
                                syncDatabase('projects', updated);
                              }}
                              className="px-2 py-1 rounded bg-neutral-900 border border-slate-800 text-white text-[11px]"
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm('Remove task?')) {
                                  const updated = projects.map(p => {
                                    if (p.id === tsk.projectId) {
                                      return {
                                        ...p,
                                        tasks: p.tasks.filter(t => t.id !== tsk.id)
                                      };
                                    }
                                    return p;
                                  });
                                  syncDatabase('projects', updated);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-400 text-xs font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Financial Suite
              </h3>
              <p className="text-xs text-slate-400">
                Generate professional quotations, issue multi-installment invoices, record company expenses, and analyze cash flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {['quotations', 'invoices', 'payments', 'expenses', 'income'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFinSubTab(sub as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    finSubTab === sub 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Render interactive SVG Cash Flow trend on the financial dashboard */}
          {finSubTab === 'quotations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10">
                <span className="text-xs text-slate-400">Standard quotations valid for 45 days. Fully converts to accounts invoices.</span>
                <button
                  onClick={() => { setModalType('add_quotation'); setModalItem({ items: [] }); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  <Plus size={14} />
                  <span>Draft New Quotation</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                      <th className="p-4">Quotation No</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Valid Until</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {quotations.map((q) => {
                      const client = customers.find(c => c.id === q.customerId);
                      const qtotal = q.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0) * (1 - q.discount / 100);
                      return (
                        <tr key={q.id} className="hover:bg-purple-950/5">
                          <td className="p-4 font-bold text-white font-mono">{q.quotationNumber}</td>
                          <td className="p-4 font-semibold text-slate-200">{client ? client.name : 'Unknown'}</td>
                          <td className="p-4 font-bold text-emerald-400 font-mono">Rs. {qtotal.toLocaleString()}</td>
                          <td className="p-4 font-mono text-slate-400">{q.validUntil}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => setActiveDoc({ type: 'quotation', data: q })}
                              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 rounded text-[10px] font-bold"
                            >
                              Print / Share
                            </button>
                            <button 
                              onClick={() => handleConvertQuotation(q)}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 rounded text-[10px] font-bold"
                            >
                              Convert to Inv
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {finSubTab === 'invoices' && (
            <InvoicingModule
              isDarkMode={isDarkMode}
              invoices={invoices}
              customers={customers}
              companies={companies}
              payments={payments}
              profile={profile}
              onSync={syncDatabase}
              onAuditLog={(action) => {
                const newLog = {
                  id: Date.now(),
                  action,
                  user: 'yuvanshan875@gmail.com',
                  ip: '192.168.1.100',
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  status: 'Success'
                };
                setSecurityLogs(prev => [newLog, ...prev]);
              }}
            />
          )}

          {finSubTab === 'payments' && (
            <InvoicingModule
              isDarkMode={isDarkMode}
              invoices={invoices}
              customers={customers}
              companies={companies}
              payments={payments}
              profile={profile}
              onSync={syncDatabase}
              onAuditLog={(action) => {
                const newLog = {
                  id: Date.now(),
                  action,
                  user: 'yuvanshan875@gmail.com',
                  ip: '192.168.1.100',
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  status: 'Success'
                };
                setSecurityLogs(prev => [newLog, ...prev]);
              }}
            />
          )}

          {finSubTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10">
                <span className="text-xs text-slate-400">Expense reports with automated vendor ledger tracking.</span>
                <button
                  onClick={() => { setModalType('add_expense'); setModalItem({}); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  <Plus size={14} />
                  <span>Log Expense Voucher</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                      <th className="p-4">Expense Description</th>
                      <th className="p-4">Ledger Category</th>
                      <th className="p-4">Vendor Partner</th>
                      <th className="p-4 font-mono">Voucher Date</th>
                      <th className="p-4 text-right">Amount Outflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {expenses.map((e) => (
                      <tr key={e.id}>
                        <td className="p-4 font-bold text-white">{e.description}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-slate-800 text-slate-300 text-[10px] font-semibold">
                            {e.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">{e.vendor}</td>
                        <td className="p-4 font-mono text-slate-500">{e.date}</td>
                        <td className="p-4 text-right font-bold text-rose-400 font-mono">Rs. {e.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {finSubTab === 'income' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/40 border border-purple-500/10">
                <span className="text-xs text-slate-400">Logs external sales flows or direct photography retainer reserves.</span>
                <button
                  onClick={() => { setModalType('add_income'); setModalItem({}); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  <Plus size={14} />
                  <span>Log Miscellaneous Inflow</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                      <th className="p-4">Income Description</th>
                      <th className="p-4">Inflow Source</th>
                      <th className="p-4 font-mono">Posting Date</th>
                      <th className="p-4 text-right">Amount Inflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {incomes.map((inc) => (
                      <tr key={inc.id}>
                        <td className="p-4 font-bold text-white">{inc.description}</td>
                        <td className="p-4 font-semibold text-purple-400">{inc.source}</td>
                        <td className="p-4 font-mono text-slate-500">{inc.date}</td>
                        <td className="p-4 text-right font-bold text-emerald-400 font-mono">Rs. {inc.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Human Resources & Payroll
              </h3>
              <p className="text-xs text-slate-400">
                Oversee the Mahdev workforce, attendance metrics, custom salaries payroll rosters, and performance indexes.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {['directory', 'leave', 'payroll'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setEmpSubTab(sub as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    empSubTab === sub 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {empSubTab === 'directory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {employees.map((emp) => (
                <div key={emp.id} className="p-5 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{emp.department}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-850 pt-3 text-slate-400 leading-relaxed">
                    <div>Role: <span className="font-bold text-slate-200">{emp.role}</span></div>
                    <div>Email: <span className="font-mono text-slate-300">{emp.email}</span></div>
                    <div>Contact: <span className="font-mono text-slate-300">{emp.phone}</span></div>
                    <div>Base Salary: <span className="font-bold text-emerald-400 font-mono">Rs. {emp.salary.toLocaleString()}</span></div>
                  </div>

                  {/* Performance Stars */}
                  <div className="flex justify-between items-center bg-neutral-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Performance Rating:</span>
                    <span className="font-bold text-purple-400 font-mono">{emp.performanceScore} / 5</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {empSubTab === 'leave' && (
            <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-400">Employee Leave Requests</h4>
              <p className="text-xs text-slate-500">All staff leaves are synchronized with Active Google Calendars under corporate accounts.</p>
              <div className="divide-y divide-slate-800">
                <div className="py-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Nuwan Bandara (U1 Studio)</span>
                    <span className="text-[11px] text-slate-400 leading-normal">Sick Leave Request: July 12 - July 15. Reason: Dental Surgery.</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold">Approve</button>
                    <button className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold">Reject</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {empSubTab === 'payroll' && (
            <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Basic Salary</th>
                    <th className="p-4">Standard Allowances</th>
                    <th className="p-4">Tax Deductions (EPF/ETF)</th>
                    <th className="p-4 text-right">Net Take-Home Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {employees.map((emp) => {
                    const epf = emp.salary * 0.08;
                    const net = emp.salary - epf;
                    return (
                      <tr key={emp.id}>
                        <td className="p-4 font-bold text-white">{emp.name}</td>
                        <td className="p-4 font-mono">Rs. {emp.salary.toLocaleString()}</td>
                        <td className="p-4 font-mono text-slate-400">Rs. 15,000</td>
                        <td className="p-4 font-mono text-rose-400">Rs. {epf.toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-emerald-400 font-mono">Rs. {(net + 15000).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'systems' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Enterprise System Administration, Audits & Files
              </h3>
              <p className="text-xs text-slate-400">
                Configure corporate identity profiles, browse dynamic analytics, organize physical files, and view administrative security audit logs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {['profile', 'branding', 'reports', 'files', 'security'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSysSubTab(sub as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    sysSubTab === sub 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {sysSubTab === 'profile' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'} space-y-6`}>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Corporate Master Settings Profile</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold">Corporate Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Corporate Registration Number</label>
                  <input 
                    type="text" 
                    value={profile.registrationNumber} 
                    onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">HQ Address</label>
                  <input 
                    type="text" 
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Master Corporate Email</label>
                  <input 
                    type="text" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Nations Trust Bank Details</label>
                  <textarea 
                    rows={2}
                    value={profile.bankAccount} 
                    onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">VAT Tax Information</label>
                  <input 
                    type="text" 
                    value={profile.taxInformation} 
                    onChange={(e) => setProfile({ ...profile, taxInformation: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end">
                <button
                  onClick={() => { syncDatabase('profile', profile); alert('Company corporate details updated successfully!'); }}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Save Corporate Settings
                </button>
              </div>
            </div>
          )}

          {sysSubTab === 'profile' && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-amber-500/10 text-white' : 'bg-slate-50 border-slate-200'} space-y-6`}>
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-amber-500" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Website Branding & Identity</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold">Website Title (Browser Tab)</label>
                  <input 
                    type="text" 
                    value={theme.websiteTitle} 
                    onChange={(e) => setTheme({ ...theme, websiteTitle: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., Mahdev Pvt Ltd - Elite Service Suite"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This appears in the browser tab and is used for SEO</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Brand Name</label>
                  <input 
                    type="text" 
                    value={theme.brandName} 
                    onChange={(e) => setTheme({ ...theme, brandName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., MAHDEV ELITE SERVICE SUITE"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Displayed in header and navigation</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Favicon URL</label>
                  <input 
                    type="text" 
                    value={theme.faviconUrl} 
                    onChange={(e) => setTheme({ ...theme, faviconUrl: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., /favicon.ico or /favicon-32x32.png"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Icon displayed in browser tab (32x32 recommended)</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold">Brand Logo URL</label>
                  <input 
                    type="text" 
                    value={theme.brandLogo || ''} 
                    onChange={(e) => setTheme({ ...theme, brandLogo: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-slate-800 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., /assets/images/logo.jpg"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Logo displayed in header</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                  <span><strong>Pro Tip:</strong> Changes made here will appear instantly across the entire website without requiring a restart or redeployment.</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/20 flex justify-end gap-3">
                <button
                  onClick={() => setTheme(getThemeSettings())}
                  className={`px-6 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                >
                  Reset
                </button>
                <button
                  onClick={() => { syncDatabase('theme', theme); alert('Website branding updated successfully! Changes are live.'); }}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Save Branding Settings
                </button>
              </div>
            </div>
          )}

          {sysSubTab === 'reports' && (
            <div className="space-y-6">
              {renderCashFlowChart()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Financial Summary Card */}
                <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
                  <h4 className="font-mono text-purple-400 font-bold uppercase text-[10px]">Financial Performance Analysis</h4>
                  <div className="space-y-2 leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Enrolled Incomes:</span>
                      <span className="font-bold text-emerald-400 font-mono">Rs. {totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Operational Outflow:</span>
                      <span className="font-bold text-rose-400 font-mono">Rs. {totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-850">
                      <span className="text-slate-200 font-bold">Net Earnings Balance:</span>
                      <span className="font-bold text-purple-400 font-mono">Rs. {netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => alert('Simulating PDF Ledger export. Check local file queue.')}
                      className="flex-1 py-2 bg-neutral-900 border border-slate-800 text-slate-300 font-bold rounded-lg text-center"
                    >
                      Export PDF Ledger
                    </button>
                    <button 
                      onClick={() => alert('Simulating CSV Spreadsheet export.')}
                      className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg text-center"
                    >
                      Export CSV Sheet
                    </button>
                  </div>
                </div>

                {/* Operations Summary Card */}
                <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
                  <h4 className="font-mono text-purple-400 font-bold uppercase text-[10px]">Operations & Deliverables Summary</h4>
                  <div className="space-y-2 leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total CRM Active Accounts:</span>
                      <span className="font-bold text-white font-mono">{customers.length} Accounts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active ERP Projects Running:</span>
                      <span className="font-bold text-purple-400 font-mono">{activeProjectsCount} Projects</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed Projects Delivered:</span>
                      <span className="font-bold text-emerald-400 font-mono">{completedProjectsCount} Projects</span>
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-slate-850 rounded-xl">
                    <p className="text-[10px] text-slate-500 leading-normal">
                      The operation centers report 100% SLA fulfillment. No overdue items are currently flagged for escalation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sysSubTab === 'files' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-xs">
              {/* Folder structure */}
              <div className="xl:col-span-3 space-y-3">
                <h4 className="font-mono uppercase text-slate-400 text-[10px] pl-2 font-bold">Directories</h4>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setActiveFolder('All')}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold ${
                      activeFolder === 'All' ? 'bg-purple-600 text-white' : 'bg-neutral-950 hover:bg-neutral-900 text-slate-400'
                    }`}
                  >
                    <span>All Directories</span>
                    <span className="text-[10px] font-mono">{filesList.length}</span>
                  </button>
                  {folders.map((fold) => (
                    <button 
                      key={fold}
                      onClick={() => setActiveFolder(fold)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold ${
                        activeFolder === fold ? 'bg-purple-600 text-white' : 'bg-neutral-950 hover:bg-neutral-900 text-slate-400'
                      }`}
                    >
                      <span className="truncate">{fold}</span>
                      <span className="text-[10px] font-mono">{filesList.filter(f => f.folder === fold).length}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-850 space-y-2">
                  <input 
                    type="text" 
                    placeholder="New directory..." 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-slate-800 rounded-xl"
                  />
                  <button 
                    onClick={() => {
                      if (newFolderName.trim()) {
                        setFolders([...folders, newFolderName.trim()]);
                        setNewFolderName('');
                      }
                    }}
                    className="w-full py-2 bg-neutral-900 border border-slate-800 hover:text-white font-bold rounded-xl text-center"
                  >
                    Create Folder
                  </button>
                </div>
              </div>

              {/* Files table */}
              <div className="xl:col-span-9 space-y-4">
                <div className="p-8 border border-dashed border-purple-500/20 rounded-2xl bg-neutral-950/20 text-center space-y-2">
                  <Upload className="mx-auto text-purple-400" size={24} />
                  <p className="font-bold text-white">Drag & Drop Administrative Documents here</p>
                  <p className="text-[10px] text-slate-500">Supports PDF, Word, Excel, ZIP, and images up to 50MB</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-purple-500/10 bg-neutral-950/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px] uppercase">
                        <th className="p-4">File Name</th>
                        <th className="p-4">Directory</th>
                        <th className="p-4">Size</th>
                        <th className="p-4">Modified</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filesList.filter(f => activeFolder === 'All' || f.folder === activeFolder).map((f, i) => (
                        <tr key={i}>
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <FileText size={14} className="text-purple-400 shrink-0" />
                            <span>{f.name}</span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{f.folder}</td>
                          <td className="p-4 font-mono">{f.size}</td>
                          <td className="p-4 font-mono text-slate-500">{f.date}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => {
                                setFilesList(filesList.filter(fl => fl.name !== f.name));
                                alert('File removed from file system database.');
                              }}
                              className="text-rose-500 hover:text-rose-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {sysSubTab === 'security' && (
            <div className="space-y-6 text-xs text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2FA Toggle & Activity */}
                <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
                  <h4 className="font-mono text-purple-400 font-bold uppercase text-[10px]">Two-Factor Authenticator Settings</h4>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-slate-850">
                    <div>
                      <span className="font-bold text-white block">Multi-Factor Authenticator (MFA)</span>
                      <span className="text-[11px] text-slate-500 leading-normal">Requires code from Google Authenticator on login runs.</span>
                    </div>
                    <button 
                      onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs ${
                        is2FAEnabled ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-slate-400'
                      }`}
                    >
                      {is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/10 leading-normal text-purple-300">
                    <p className="font-bold">System Backup & Restore Database</p>
                    <p className="text-[10px] text-slate-400 mt-1">Export local database contents to a self-contained ZIP file immediately.</p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => alert('Simulating Database Export. Backup archive ZIP file ready.')}
                        className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-md"
                      >
                        Backup DB
                      </button>
                      <button 
                        onClick={() => alert('Browse and upload Mahdev backup backup JSON/ZIP.')}
                        className="px-3 py-1.5 bg-neutral-900 border border-slate-800 text-slate-300 font-bold rounded-md"
                      >
                        Restore Archive
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Trial Log Table */}
                <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/20 space-y-4">
                  <h4 className="font-mono text-purple-400 font-bold uppercase text-[10px]">Administrative Audit Logs</h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {securityLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-neutral-950 border border-slate-850 flex items-start justify-between">
                        <div>
                          <span className="font-bold text-slate-200 block">{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp} | {log.user}</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Editing / Adding Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-purple-500/25 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white space-y-4 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
            
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-3 pt-1">
              <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span>{modalType.replace('_', ' ')}</span>
              </h4>
              <button 
                onClick={() => setModalType(null)} 
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
              {modalType.includes('customer') && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Full Name</label>
                    <input 
                      type="text"
                      value={modalItem.name || ''}
                      onChange={(e) => setModalItem({ ...modalItem, name: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      placeholder="Kamal Perera"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Email Address</label>
                      <input 
                        type="text"
                        value={modalItem.email || ''}
                        onChange={(e) => setModalItem({ ...modalItem, email: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                        placeholder="kamal@perera.lk"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Phone</label>
                      <input 
                        type="text"
                        value={modalItem.phone || ''}
                        onChange={(e) => setModalItem({ ...modalItem, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                        placeholder="+94 77..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Associated Group Corporate</label>
                    <select
                      value={modalItem.companyId || ''}
                      onChange={(e) => setModalItem({ ...modalItem, companyId: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-slate-300"
                    >
                      <option value="">None (Private Individual)</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Corporate CRM Notes</label>
                    <textarea 
                      rows={3}
                      value={modalItem.notes || ''}
                      onChange={(e) => setModalItem({ ...modalItem, notes: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      placeholder="Client specific notes or preferences..."
                    />
                  </div>
                </>
              )}

              {modalType.includes('company') && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Company Legal Name</label>
                    <input 
                      type="text"
                      value={modalItem.name || ''}
                      onChange={(e) => setModalItem({ ...modalItem, name: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      placeholder="Nations Trust Bank PLC"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Corporate Phone</label>
                      <input 
                        type="text"
                        value={modalItem.phone || ''}
                        onChange={(e) => setModalItem({ ...modalItem, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Registration Number</label>
                      <input 
                        type="text"
                        value={modalItem.registrationNumber || ''}
                        onChange={(e) => setModalItem({ ...modalItem, registrationNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">HQ Physical Address</label>
                    <input 
                      type="text"
                      value={modalItem.address || ''}
                      onChange={(e) => setModalItem({ ...modalItem, address: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                    />
                  </div>
                </>
              )}

              {modalType.includes('project') && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Project Name</label>
                    <input 
                      type="text"
                      value={modalItem.name || ''}
                      onChange={(e) => setModalItem({ ...modalItem, name: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Project Description</label>
                    <textarea 
                      rows={3}
                      value={modalItem.description || ''}
                      onChange={(e) => setModalItem({ ...modalItem, description: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Start Date</label>
                      <input 
                        type="date"
                        value={modalItem.startDate || ''}
                        onChange={(e) => setModalItem({ ...modalItem, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Final Deadline</label>
                      <input 
                        type="date"
                        value={modalItem.deadline || ''}
                        onChange={(e) => setModalItem({ ...modalItem, deadline: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Budget Enrolled</label>
                      <input 
                        type="number"
                        value={modalItem.budget || 0}
                        onChange={(e) => setModalItem({ ...modalItem, budget: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Progress (%)</label>
                      <input 
                        type="number"
                        value={modalItem.progress || 0}
                        onChange={(e) => setModalItem({ ...modalItem, progress: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType.includes('quotation') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Quotation No</label>
                      <input 
                        type="text"
                        value={modalItem.quotationNumber || `QT-2026-${Math.floor(100 + Math.random() * 900)}`}
                        onChange={(e) => setModalItem({ ...modalItem, quotationNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Customer Recipient</label>
                      <select
                        value={modalItem.customerId || ''}
                        onChange={(e) => setModalItem({ ...modalItem, customerId: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-slate-300"
                      >
                        <option value="">Select Customer...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Date Issued</label>
                      <input 
                        type="date"
                        value={modalItem.createdDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setModalItem({ ...modalItem, createdDate: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Valid Until</label>
                      <input 
                        type="date"
                        value={modalItem.validUntil || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => setModalItem({ ...modalItem, validUntil: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-400">Quoted Scope Deliverables</label>
                      <button
                        onClick={() => {
                          const items = modalItem.items || [];
                          setModalItem({ ...modalItem, items: [...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }] });
                        }}
                        className="text-purple-400 hover:text-purple-300 font-bold text-[11px]"
                      >
                        + Add Line Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(modalItem.items || []).map((it: any, idx: number) => (
                        <div key={it.id || idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="Deliverable description"
                            value={it.description}
                            onChange={(e) => {
                              const items = [...modalItem.items];
                              items[idx].description = e.target.value;
                              setModalItem({ ...modalItem, items });
                            }}
                            className="flex-1 px-3 py-1.5 bg-neutral-900 border border-slate-800 rounded-lg text-[11px]"
                          />
                          <input 
                            type="number" 
                            placeholder="Qty"
                            value={it.quantity}
                            onChange={(e) => {
                              const items = [...modalItem.items];
                              items[idx].quantity = parseInt(e.target.value) || 1;
                              setModalItem({ ...modalItem, items });
                            }}
                            className="w-12 px-3 py-1.5 bg-neutral-900 border border-slate-800 rounded-lg text-[11px] text-center"
                          />
                          <input 
                            type="number" 
                            placeholder="Unit Price"
                            value={it.unitPrice}
                            onChange={(e) => {
                              const items = [...modalItem.items];
                              items[idx].unitPrice = parseInt(e.target.value) || 0;
                              setModalItem({ ...modalItem, items });
                            }}
                            className="w-24 px-3 py-1.5 bg-neutral-900 border border-slate-800 rounded-lg text-[11px] text-right font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Discount (%)</label>
                      <input 
                        type="number" 
                        value={modalItem.discount || 0}
                        onChange={(e) => setModalItem({ ...modalItem, discount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">VAT (%)</label>
                      <input 
                        type="number" 
                        value={modalItem.vat || 15}
                        onChange={(e) => setModalItem({ ...modalItem, vat: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">NBT (%)</label>
                      <input 
                        type="number" 
                        value={modalItem.nbt || 0}
                        onChange={(e) => setModalItem({ ...modalItem, nbt: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-center"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Terms & Conditions Agreement</label>
                    <textarea 
                      rows={2}
                      value={modalItem.terms || '50% advance upon confirmation. Balance due upon deployment.'}
                      onChange={(e) => setModalItem({ ...modalItem, terms: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                    />
                  </div>
                </>
              )}

              {modalType.includes('expense') && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Voucher Description</label>
                    <input 
                      type="text"
                      value={modalItem.description || ''}
                      onChange={(e) => setModalItem({ ...modalItem, description: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      placeholder="SWS imported flowers purchase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Category</label>
                      <select 
                        value={modalItem.category || 'Office'}
                        onChange={(e) => setModalItem({ ...modalItem, category: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-slate-300"
                      >
                        <option value="Office">Office & Overheads</option>
                        <option value="Decorations">SWS Event Decorations</option>
                        <option value="IT Solutions">IT Cloud Infrastructure</option>
                        <option value="Travels">Travels Fleet Fuel</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Vendor Group</label>
                      <input 
                        type="text"
                        value={modalItem.vendor || ''}
                        onChange={(e) => setModalItem({ ...modalItem, vendor: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Posting Date</label>
                      <input 
                        type="date"
                        value={modalItem.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setModalItem({ ...modalItem, date: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-400">Voucher Outflow (Rs.)</label>
                      <input 
                        type="number"
                        value={modalItem.amount || 0}
                        onChange={(e) => setModalItem({ ...modalItem, amount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-neutral-900 border border-slate-800 rounded-xl text-right font-mono text-emerald-400"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/10 mt-4">
              <button 
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-neutral-800 text-slate-300 rounded-xl font-bold uppercase hover:bg-neutral-700 transition-colors font-mono text-[10px] tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  let updatedList = [];
                  if (modalType.includes('customer')) {
                    const id = modalItem.id || `cust-${Date.now()}`;
                    const newItem = { ...modalItem, id, status: modalItem.status || 'Active', history: modalItem.history || [], documents: modalItem.documents || [] };
                    updatedList = modalItem.id ? customers.map(c => c.id === modalItem.id ? newItem : c) : [newItem, ...customers];
                    syncDatabase('customers', updatedList);
                  } else if (modalType.includes('company')) {
                    const id = modalItem.id || `C-${Date.now()}`;
                    const newItem = { ...modalItem, id };
                    updatedList = modalItem.id ? companies.map(c => c.id === modalItem.id ? newItem : c) : [newItem, ...companies];
                    syncDatabase('companies', updatedList);
                  } else if (modalType.includes('project')) {
                    const id = modalItem.id || `p-${Date.now()}`;
                    const newItem = { ...modalItem, id, tasks: modalItem.tasks || [], milestones: modalItem.milestones || [], files: modalItem.files || [], assignedEmployees: modalItem.assignedEmployees || ['emp-1'] };
                    updatedList = modalItem.id ? projects.map(p => p.id === modalItem.id ? newItem : p) : [newItem, ...projects];
                    syncDatabase('projects', updatedList);
                  } else if (modalType.includes('quotation')) {
                    const id = modalItem.id || `q-${Date.now()}`;
                    const newItem = { ...modalItem, id, status: modalItem.status || 'Sent' };
                    updatedList = modalItem.id ? quotations.map(q => q.id === modalItem.id ? newItem : q) : [newItem, ...quotations];
                    syncDatabase('quotations', updatedList);
                  } else if (modalType.includes('expense')) {
                    const id = modalItem.id || `exp-${Date.now()}`;
                    const newItem = { ...modalItem, id };
                    updatedList = modalItem.id ? expenses.map(e => e.id === modalItem.id ? newItem : e) : [newItem, ...expenses];
                    syncDatabase('expenses', updatedList);
                  }
                  setModalType(null);
                  alert('Database collection synced successfully.');
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold uppercase transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.02] font-mono text-[10px] tracking-wider"
              >
                Sync File Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Document Printable Preview Panel (Quotation & Invoices) */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl relative my-8">
            <button 
              onClick={() => setActiveDoc(null)} 
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-slate-600 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="space-y-6 printable-area">
              {/* HQ Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-purple-700">{profile.name}</h2>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{profile.registrationNumber}</p>
                  <p className="text-xs text-slate-600 max-w-xs mt-1 leading-relaxed">{profile.address}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{profile.whatsApp} | {profile.email}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {activeDoc.type.toUpperCase()}
                  </h3>
                  <p className="text-base font-bold font-mono mt-1">
                    {activeDoc.type === 'quotation' ? activeDoc.data.quotationNumber : activeDoc.data.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Date Issued: {activeDoc.data.createdDate}
                  </p>
                </div>
              </div>

              {/* Client Billing Info */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">Invoiced To:</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {customers.find(c => c.id === activeDoc.data.customerId)?.name || 'Private Client'}
                  </div>
                  <div className="text-slate-500 font-mono mt-1">
                    {customers.find(c => c.id === activeDoc.data.customerId)?.email}
                  </div>
                  <div className="text-slate-500 font-mono">
                    {customers.find(c => c.id === activeDoc.data.customerId)?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block uppercase text-[10px] tracking-wider">Payment Protocol:</span>
                  <p className="font-bold text-slate-800 mt-1">Nations Trust Bank</p>
                  <p className="text-slate-500 leading-normal mt-1">{profile.bankAccount}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs mt-4">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600 text-[10px] uppercase font-mono font-bold">
                    <th className="p-3">Deliverable Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeDoc.data.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-slate-800">{it.description}</td>
                      <td className="p-3 text-center font-mono">{it.quantity}</td>
                      <td className="p-3 text-right font-mono">Rs. {it.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold font-mono">Rs. {(it.quantity * it.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grand Total Calc */}
              <div className="flex justify-end pt-4 border-t border-slate-200 text-xs">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold font-mono">
                      Rs. {activeDoc.data.items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0).toLocaleString()}
                    </span>
                  </div>
                  {activeDoc.data.discount > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Discount ({activeDoc.data.discount}%):</span>
                      <span className="font-mono">
                        - Rs. {(activeDoc.data.items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0) * activeDoc.data.discount / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-2 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-bold text-purple-700 font-mono">
                      Rs. {(
                        activeDoc.data.items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0) * 
                        (1 - activeDoc.data.discount / 100) * 
                        (1 + (activeDoc.data.vat || activeDoc.data.tax || 15) / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature QR Code & Footer */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <QrCode size={40} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold">Scan QR Code to Verify</p>
                      <p className="text-[10px] text-slate-500 leading-normal">Secured by Mahdev Pvt Ltd Corporate Ledger.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-sm italic">
                    Authorized Signatory: Yuvanshan Prabakaran, CEO.
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-10 border-b border-slate-300 w-36 mx-auto" />
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Accounts Signature Approval</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel for PDF export/WhatsApp share */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Printer size={12} />
                <span>Print PDF Layout</span>
              </button>
              <a 
                href={getWhatsAppShareLink(
                  activeDoc.type === 'quotation' ? 'Quotation' : 'Invoice',
                  activeDoc.type === 'quotation' ? activeDoc.data.quotationNumber : activeDoc.data.invoiceNumber,
                  customers.find(c => c.id === activeDoc.data.customerId) || { name: 'Client', phone: '' },
                  activeDoc.data.items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0)
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Share2 size={12} />
                <span>Share WhatsApp</span>
              </a>
              <a 
                href={getEmailShareLink(
                  activeDoc.type === 'quotation' ? 'Quotation' : 'Invoice',
                  activeDoc.type === 'quotation' ? activeDoc.data.quotationNumber : activeDoc.data.invoiceNumber,
                  customers.find(c => c.id === activeDoc.data.customerId) || { name: 'Client', email: '' },
                  activeDoc.data.items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0)
                )}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Mail size={12} />
                <span>Dispatch Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
