import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Truck,
  ArrowLeft,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await salesService.getCustomer(id);
      setCustomer(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        Customer record not found.
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/app/sales/customers')}>
            Return to Customers
          </Button>
        </div>
      </div>
    );
  }

  const {
    salesOrders = [],
    invoices = [],
    payments = [],
    creditNotes = [],
    refunds = [],
    deliveryNotes = [],
    auditLogs = [],
  } = customer;

  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grand_total) || 0), 0);
  const paidAmount = payments.reduce((sum, pay) => sum + (parseFloat(pay.amount) || 0), 0);
  const outstanding = Math.max(0, totalSales - paidAmount);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/sales/customers')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {customer.name}
              <Badge variant={customer.status === 'active' ? 'success' : 'neutral'} size="sm">
                {customer.status || 'active'}
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Code: <span className="font-semibold text-teal-600">{customer.customer_code || `CUST-${customer.id}`}</span> • {customer.company_name || 'Individual'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={ShoppingCart}
            onClick={() => navigate(`/app/sales/orders/create?customer_id=${customer.id}`)}
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Sales"
          value={`$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatCard
          title="Total Sales Orders"
          value={salesOrders.length}
          icon={ShoppingCart}
        />
        <StatCard
          title="Outstanding Receivable"
          value={`$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="Pending Balance"
          isPositive={false}
          icon={AlertCircle}
        />
        <StatCard
          title="Total Amount Settled"
          value={`$${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          isPositive={true}
          icon={CheckCircle}
        />
      </div>

      {/* Customer Info Card & Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800">
            Account Dossier
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Email:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{customer.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Phone:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{customer.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Website:</span>
              <span className="font-medium text-teal-600 truncate max-w-[160px]">{customer.website || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Credit Limit:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                ${Number(customer.credit_limit || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Payment Terms:</span>
              <span className="font-medium uppercase">{customer.payment_terms || 'Net 30'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">GST / Tax Number:</span>
              <span className="font-medium">{customer.gst_number || customer.tax_number || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Addresses */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
            Locations & Logistics Addresses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> Billing Address
              </p>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {customer.billing_address || 'No billing address on file.'}
              </p>
              <p className="text-slate-400 mt-2">
                {[customer.city, customer.state, customer.postal_code, customer.country].filter(Boolean).join(', ')}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Shipping Destination
              </p>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {customer.shipping_address || customer.billing_address || 'Same as billing address.'}
              </p>
              <p className="text-slate-400 mt-2">
                {[customer.city, customer.state, customer.postal_code, customer.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabbed Activity & Transaction Lists */}
      <Card className="overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 overflow-x-auto text-xs font-semibold">
          {[
            { key: 'orders', label: `Sales Orders (${salesOrders.length})` },
            { key: 'invoices', label: `Invoices (${invoices.length})` },
            { key: 'payments', label: `Payments (${payments.length})` },
            { key: 'creditNotes', label: `Credit Notes (${creditNotes.length})` },
            { key: 'refunds', label: `Refunds (${refunds.length})` },
            { key: 'deliveries', label: `Delivery Notes (${deliveryNotes.length})` },
            { key: 'timeline', label: `Activity Timeline (${auditLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* TAB 1: SALES ORDERS */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Delivery Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {salesOrders.length === 0 ? (
                    <tr><td colSpan="7" className="py-6 text-center text-slate-400">No sales orders on record.</td></tr>
                  ) : (
                    salesOrders.map((so) => (
                      <tr key={so.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-teal-600">{so.order_number}</td>
                        <td className="py-2.5 px-3">{so.order_date}</td>
                        <td className="py-2.5 px-3">{so.expected_delivery_date || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          ${Number(so.grand_total || so.total || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3"><Badge variant="neutral" size="sm">{so.status}</Badge></td>
                        <td className="py-2.5 px-3"><Badge variant={so.payment_status === 'paid' ? 'success' : 'warning'} size="sm">{so.payment_status}</Badge></td>
                        <td className="py-2.5 px-3 text-right">
                          <button onClick={() => navigate(`/app/sales/orders/${so.id}`)} className="text-teal-600 hover:underline">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Invoice Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Grand Total</th>
                    <th className="py-2.5 px-3">Paid</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr><td colSpan="7" className="py-6 text-center text-slate-400">No invoices generated for this client.</td></tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-teal-600">{inv.invoice_number}</td>
                        <td className="py-2.5 px-3">{inv.invoice_date}</td>
                        <td className="py-2.5 px-3">{inv.due_date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">${Number(inv.grand_total).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-semibold">${Number(inv.paid_amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3"><Badge variant={inv.payment_status === 'paid' ? 'success' : 'warning'} size="sm">{inv.payment_status}</Badge></td>
                        <td className="py-2.5 px-3 text-right">
                          <button onClick={() => navigate(`/app/sales/invoices/${inv.id}`)} className="text-teal-600 hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Payment #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.length === 0 ? (
                    <tr><td colSpan="5" className="py-6 text-center text-slate-400">No payment receipts found.</td></tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-semibold text-teal-600">{p.payment_number}</td>
                        <td className="py-2.5 px-3">{p.payment_date}</td>
                        <td className="py-2.5 px-3 capitalize">{p.payment_method}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.reference || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">${Number(p.amount).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CREDIT NOTES */}
          {activeTab === 'creditNotes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Credit Note #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Total Credit</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {creditNotes.length === 0 ? (
                    <tr><td colSpan="5" className="py-6 text-center text-slate-400">No credit notes issued.</td></tr>
                  ) : (
                    creditNotes.map((cn) => (
                      <tr key={cn.id}>
                        <td className="py-2.5 px-3 font-semibold text-teal-600">{cn.credit_note_number}</td>
                        <td className="py-2.5 px-3">{cn.date}</td>
                        <td className="py-2.5 px-3 text-slate-500">{cn.reason}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">${Number(cn.total).toLocaleString()}</td>
                        <td className="py-2.5 px-3"><Badge variant="teal" size="sm">{cn.status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: REFUNDS */}
          {activeTab === 'refunds' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Refund #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {refunds.length === 0 ? (
                    <tr><td colSpan="5" className="py-6 text-center text-slate-400">No refunds recorded.</td></tr>
                  ) : (
                    refunds.map((rf) => (
                      <tr key={rf.id}>
                        <td className="py-2.5 px-3 font-semibold text-rose-600">{rf.refund_number}</td>
                        <td className="py-2.5 px-3">{rf.refund_date}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">${Number(rf.refund_amount).toLocaleString()}</td>
                        <td className="py-2.5 px-3 capitalize">{rf.refund_method}</td>
                        <td className="py-2.5 px-3"><Badge variant={rf.status === 'processed' ? 'success' : 'warning'} size="sm">{rf.status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: DELIVERY NOTES */}
          {activeTab === 'deliveries' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-2.5 px-3">Delivery #</th>
                    <th className="py-2.5 px-3">Delivery Date</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Driver / Van</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deliveryNotes.length === 0 ? (
                    <tr><td colSpan="5" className="py-6 text-center text-slate-400">No delivery dispatches yet.</td></tr>
                  ) : (
                    deliveryNotes.map((dn) => (
                      <tr key={dn.id}>
                        <td className="py-2.5 px-3 font-semibold text-teal-600">{dn.delivery_number}</td>
                        <td className="py-2.5 px-3">{dn.delivery_date}</td>
                        <td className="py-2.5 px-3 truncate max-w-[200px]">{dn.delivery_address}</td>
                        <td className="py-2.5 px-3">{dn.driver_name || 'Fleet'} ({dn.vehicle_number || 'Van'})</td>
                        <td className="py-2.5 px-3"><Badge variant="teal" size="sm">{dn.status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 py-2">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No audit logs logged yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{log.action}</p>
                      <p className="text-[11px] text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomerDetails;
