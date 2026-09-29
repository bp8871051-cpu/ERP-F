import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Landmark,
  CreditCard,
  ShoppingBag,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getVendor(id);
      setVendor(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Vendor Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/app/purchase/vendors')} className="mt-4">
          Back to Vendor Directory
        </Button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Purchases', val: `₹${Number(vendor.total_purchases || 0).toLocaleString('en-IN')}`, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Purchase Orders', val: vendor.total_orders || (vendor.purchase_orders?.length || 0), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Outstanding Payable', val: `₹${Number(vendor.outstanding_payable || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Paid Disbursements', val: `₹${Number(vendor.paid_amount || 0).toLocaleString('en-IN')}`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/purchase/vendors')}
          className="p-2 text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {vendor.name}
            </h1>
            <Badge variant={vendor.status === 'active' ? 'success' : 'neutral'}>{vendor.status}</Badge>
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
              {vendor.vendor_code}
            </span>
          </div>
          {vendor.company_name && (
            <p className="text-xs text-slate-500 mt-0.5">{vendor.company_name}</p>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((sc, idx) => {
          const Icon = sc.icon;
          return (
            <Card key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl ${sc.bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${sc.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-400 block truncate">{sc.label}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{sc.val}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Vendor Profile & Banking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Contact & Tax Compliance
          </h3>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Contact:</span> {vendor.contact_person || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span> {vendor.email || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Phone:</span> {vendor.phone || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Address:</span> {vendor.address || 'N/A'}, {vendor.city || ''} {vendor.state || ''}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">GSTIN / VAT:</span> <span className="font-mono">{vendor.gst_number || 'N/A'}</span></p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600" /> Banking & Credit Terms
          </h3>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Bank Name:</span> {vendor.bank_name || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Account Holder:</span> {vendor.account_holder || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">A/C Number:</span> <span className="font-mono">{vendor.account_number || 'N/A'}</span></p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">IFSC / SWIFT:</span> <span className="font-mono">{vendor.ifsc || 'N/A'}</span></p>
            <p><span className="font-semibold text-slate-700 dark:text-slate-200">Payment Terms:</span> {vendor.payment_terms || 'Net 30'}</p>
          </div>
        </Card>
      </div>

      {/* Tabs for Orders, Purchases, Payments */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-semibold">
          {[
            { id: 'orders', label: `Purchase Orders (${vendor.purchase_orders?.length || 0})` },
            { id: 'purchases', label: `Purchases / GRNs (${vendor.purchases?.length || 0})` },
            { id: 'returns', label: `Returns (${vendor.purchase_returns?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">PO #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(vendor.purchase_orders || []).length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">No purchase orders found.</td></tr>
                  ) : (
                    vendor.purchase_orders.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/app/purchase/orders/${po.id}`)}>
                        <td className="py-2.5 px-3 font-semibold text-indigo-600">{po.po_number}</td>
                        <td className="py-2.5 px-3">{po.po_date || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          ₹{Number(po.grand_total || po.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={po.status === 'received' ? 'success' : 'neutral'}>{po.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Purchase #</th>
                    <th className="py-2.5 px-3">Vendor Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(vendor.purchases || []).length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">No purchases found.</td></tr>
                  ) : (
                    vendor.purchases.map((pc) => (
                      <tr key={pc.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/app/purchase/purchases/${pc.id}`)}>
                        <td className="py-2.5 px-3 font-semibold text-indigo-600">{pc.purchase_number}</td>
                        <td className="py-2.5 px-3">{pc.vendor_invoice_number || '—'}</td>
                        <td className="py-2.5 px-3">{pc.invoice_date || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          ₹{Number(pc.grand_total || pc.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={pc.status === 'received' ? 'success' : 'neutral'}>{pc.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Return #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(vendor.purchase_returns || []).length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400">No returns found.</td></tr>
                  ) : (
                    vendor.purchase_returns.map((ret) => (
                      <tr key={ret.id}>
                        <td className="py-2.5 px-3 font-semibold text-indigo-600">{ret.return_number}</td>
                        <td className="py-2.5 px-3">{ret.return_date || 'N/A'}</td>
                        <td className="py-2.5 px-3">{ret.reason}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                          ₹{Number(ret.total || ret.grand_total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="neutral">{ret.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VendorDetails;
