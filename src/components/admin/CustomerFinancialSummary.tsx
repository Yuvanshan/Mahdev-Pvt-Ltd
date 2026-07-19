import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, CreditCard, DollarSign, AlertCircle, Calendar, 
  ArrowUpRight, FileText, CheckCircle2, Inbox
} from 'lucide-react';
import { Customer, Invoice, PaymentRecord, Quotation } from '../../types';

interface CustomerFinancialSummaryProps {
  isDarkMode: boolean;
  customer: Customer;
  invoices: Invoice[];
  payments: PaymentRecord[];
  quotes: Quotation[];
  stats: {
    totalQuotes: number;
    approvedQuotes: number;
    rejectedQuotes: number;
    totalInvoices: number;
    totalInvoiceValue: number;
    totalPaid: number;
    outstandingBalance: number;
    overdueAmount: number;
    advancePayments: number;
  };
}

export default function CustomerFinancialSummary({
  isDarkMode,
  customer,
  invoices,
  payments,
  quotes,
  stats
}: CustomerFinancialSummaryProps) {

  // 1. Fetch and sort all payments linked to this customer's invoices
  const customerPayments = useMemo(() => {
    const invoiceIds = new Set(invoices.map(inv => inv.id));
    return payments
      .filter(p => invoiceIds.has(p.invoiceId))
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }, [invoices, payments]);

  // 2. Format Invoice status breakdown for Pie Chart
  const statusPieData = useMemo(() => {
    const totalsByStatus: { [key: string]: number } = {};
    invoices.forEach(inv => {
      const subtotal = inv.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
      const grandTotal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
      totalsByStatus[inv.status] = (totalsByStatus[inv.status] || 0) + grandTotal;
    });

    return Object.entries(totalsByStatus).map(([status, value]) => ({
      name: status,
      value: Math.round(value),
    }));
  }, [invoices]);

  // 3. Format Paid vs Outstanding breakdown per invoice for Stacked Bar Chart
  const invoiceBarData = useMemo(() => {
    return invoices.map(inv => {
      const subtotal = inv.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
      const grandTotal = subtotal * (1 - inv.discount / 100) * (1 + inv.tax / 100);
      const outstanding = inv.status === 'Paid' ? 0 : Math.max(0, grandTotal - inv.paidAmount);
      return {
        name: inv.invoiceNumber,
        paid: Math.round(inv.paidAmount),
        outstanding: Math.round(outstanding),
        total: Math.round(grandTotal),
      };
    });
  }, [invoices]);

  // 4. Cumulative payments flow over time for Area Chart
  const paymentTimelineData = useMemo(() => {
    let runningTotal = 0;
    return customerPayments.map(p => {
      runningTotal += p.amount;
      return {
        date: new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: p.amount,
        cumulative: runningTotal,
        receipt: p.receiptNumber,
      };
    });
  }, [customerPayments]);

  // Color mappings for dark mode vs light mode consistency
  const COLORS = {
    Paid: '#10b981', // Emerald
    'Partially Paid': '#8b5cf6', // Violet
    Sent: '#3b82f6', // Blue
    Approved: '#06b6d4', // Cyan
    Overdue: '#ef4444', // Red
    Draft: '#f59e0b', // Amber
    Pending: '#64748b', // Slate
    Cancelled: '#6b7280', // Gray
  };

  const pieColors = statusPieData.map(item => COLORS[item.name as keyof typeof COLORS] || '#a855f7');

  const collectionRate = useMemo(() => {
    if (stats.totalInvoiceValue === 0) return 100;
    return Math.min(100, Math.round((stats.totalPaid / stats.totalInvoiceValue) * 100));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Financial KPIs Header Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Total Contract Billed</span>
              <h3 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono`}>
                Rs. {stats.totalInvoiceValue.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500">{stats.totalInvoices} sales ledger invoices</p>
            </div>
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-950/30 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
              <DollarSign size={16} />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Total Cleared (Paid)</span>
              <h3 className="text-xl font-extrabold text-emerald-400 font-mono">
                Rs. {stats.totalPaid.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500">{customerPayments.length} recorded receipts issued</p>
            </div>
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-950/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <CreditCard size={16} />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Outstanding Balance</span>
              <h3 className={`text-xl font-extrabold font-mono ${stats.outstandingBalance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                Rs. {stats.outstandingBalance.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500">
                {stats.overdueAmount > 0 ? `Rs. ${stats.overdueAmount.toLocaleString()} overdue limit` : 'No overdue records'}
              </p>
            </div>
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-950/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <AlertCircle size={16} />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Collection Rate %</span>
              <h3 className="text-xl font-extrabold text-purple-400 font-mono">
                {collectionRate}%
              </h3>
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-purple-500 h-full rounded-full" 
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-950/30 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
              <TrendingUp size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      {invoices.length === 0 ? (
        <div className={`p-8 rounded-3xl border text-center ${
          isDarkMode ? 'bg-neutral-950/20 border-slate-800' : 'bg-white border-slate-200'
        } py-16 space-y-4`}>
          <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 text-purple-400">
            <Inbox size={28} />
          </div>
          <div className="space-y-1">
            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>No Sales Ledger Invoices Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please issue commercial contracts or invoices to this client first. Financial summary visualizers require active invoice lines to render dashboard metrics.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts Row 1: Paid vs Outstanding Stacked Bar + Invoice Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Stacked Bar Chart (8 cols) */}
            <div className={`lg:col-span-7 p-5 rounded-2xl border ${
              isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className={`text-xs font-mono font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} tracking-wider`}>
                    Paid vs. Outstanding Per Invoice
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Clear breakdown of individual commercial invoice lines</p>
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={invoiceBarData}
                    margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#334155' : '#cbd5e1' }}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rs.${val >= 1000 ? (val / 1000) + 'k' : val}`}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#334155' : '#cbd5e1' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '12px',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '11px'
                      }}
                      formatter={(value: any) => [`Rs. ${value?.toLocaleString() || 0}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="paid" name="Paid Amount" stackId="a" fill="#10b981" />
                    <Bar dataKey="outstanding" name="Outstanding Balance" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Invoice Status Value Pie Chart (5 cols) */}
            <div className={`lg:col-span-5 p-5 rounded-2xl border ${
              isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              <div>
                <h4 className={`text-xs font-mono font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} tracking-wider`}>
                  Value Distribution by Status
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Asset composition divided by invoice pipeline stages</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-72">
                <div className="w-full sm:w-1/2 h-56 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index] || '#8b5cf6'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#f8fafc' : '#0f172a',
                          fontSize: '11px'
                        }}
                        formatter={(value: any) => [`Rs. ${value?.toLocaleString() || 0}`, 'Total Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center metrics indicator overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-500 font-mono">Billed Invoices</span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono`}>
                      {invoices.length}
                    </span>
                  </div>
                </div>

                {/* Custom status list legend */}
                <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {statusPieData.map((entry, index) => {
                    const percentage = Math.round((entry.value / stats.totalInvoiceValue) * 100);
                    const color = pieColors[index] || '#a855f7';
                    return (
                      <div key={entry.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-800/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rs. {entry.value.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-500 font-mono">{percentage}% share</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Cumulative Cash Collection Timeline Flow */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div>
              <h4 className={`text-xs font-mono font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} tracking-wider`}>
                Collection Stream & Cash Flow Timeline
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Cumulative payments logged over active billing cycle</p>
            </div>

            {customerPayments.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                <Calendar className="text-slate-600" size={24} />
                <p className="text-xs text-slate-500">No payment records logged yet. Cash flow visualizer is currently empty.</p>
              </div>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={paymentTimelineData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#334155' : '#cbd5e1' }}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rs.${val >= 1000 ? (val / 1000) + 'k' : val}`}
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#334155' : '#cbd5e1' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '12px',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '11px'
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-3 rounded-xl border ${
                              isDarkMode ? 'bg-neutral-900 border-slate-800' : 'bg-white border-slate-200'
                            } shadow-xl space-y-1`}>
                              <p className="font-mono text-[10px] text-slate-500">{data.date}</p>
                              <div className="flex justify-between gap-4 text-xs">
                                <span className="text-slate-400">Payment Issued:</span>
                                <span className="font-bold text-emerald-400 font-mono">Rs. {data.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-xs pt-1 border-t border-slate-850">
                                <span className="text-slate-400">Cumulative Cash:</span>
                                <span className="font-bold text-purple-400 font-mono">Rs. {data.cumulative.toLocaleString()}</span>
                              </div>
                              <p className="text-[9px] text-slate-500 font-mono">Receipt: {data.receipt}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Cumulative Inflow" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCumulative)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recorded Client Receipts Ledgers (Table List) */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-neutral-950/40 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className={`text-xs font-mono font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} tracking-wider`}>
                  Historical Payment Audit Log
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Chronological record of individual client payments cleared</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">
                {customerPayments.length} Total Receipts
              </span>
            </div>

            {customerPayments.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center">No transactions recorded for this client yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-neutral-950/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-neutral-950/60 font-mono text-slate-400 text-[10px]">
                      <th className="p-3">Receipt No</th>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Channel Method</th>
                      <th className="p-3">Allocation Type</th>
                      <th className="p-3 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {customerPayments.map((p) => {
                      const associatedInvoice = invoices.find(inv => inv.id === p.invoiceId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/10">
                          <td className="p-3 font-mono font-bold text-white">{p.receiptNumber}</td>
                          <td className="p-3 font-mono text-slate-400">{associatedInvoice?.invoiceNumber || 'Unknown Ref'}</td>
                          <td className="p-3 font-mono">{p.paymentDate}</td>
                          <td className="p-3 text-slate-400">{p.source}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.type === 'Advance' ? 'bg-purple-500/10 text-purple-400' :
                              p.type === 'Final' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {p.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400 text-right">
                            Rs. {p.amount.toLocaleString()}
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
    </div>
  );
}
