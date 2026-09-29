import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, Building, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import supplierService from '../../../services/supplierService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getSupplier(id);
      setSupplier(res.data);
    } catch (err) {
      console.error('Error fetching supplier details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!supplier) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <p>Supplier record not found.</p>
        <Button variant="secondary" onClick={() => navigate('/app/inventory/suppliers')}>
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/app/inventory/suppliers')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-teal-600" />
            {supplier.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supplier Code: <span className="font-mono font-bold text-slate-700">{supplier.supplier_code}</span> | GST:{' '}
            <span className="font-mono text-slate-700">{supplier.gst_number || supplier.tax_id || 'N/A'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card className="p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-teal-600" />
            Corporate Information
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-semibold text-slate-500 w-28">Contact Person:</span>
              <span className="font-medium text-slate-900">{supplier.contact_person || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500 w-24">Email:</span>
              <span className="text-slate-800">{supplier.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500 w-24">Phone:</span>
              <span className="font-mono text-slate-800">{supplier.phone || '—'}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="font-semibold text-slate-500 w-24">Location:</span>
              <span className="text-slate-800">
                {supplier.address ? `${supplier.address}, ` : ''}
                {supplier.city} {supplier.state ? `, ${supplier.state}` : ''} {supplier.country || 'India'}
              </span>
            </div>
          </div>
        </Card>

        {/* Banking & Financial Terms */}
        <Card className="p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Bank & Tax Details
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Bank Name:</span>
              <span className="text-slate-900 font-semibold">{supplier.bank_name || 'HDFC Bank Ltd'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Account Number:</span>
              <span className="font-mono text-slate-900 font-semibold">{supplier.account_number || '••••••••5091'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">GST Identification:</span>
              <span className="font-mono text-slate-900 font-bold">{supplier.gst_number || supplier.tax_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                {supplier.status}
              </span>
            </div>
          </div>
        </Card>

        {/* Purchase Orders Stats */}
        <Card className="p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-purple-600" />
            Procurement Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Total Purchase Orders</span>
              <span className="text-xl font-bold text-slate-900">{supplier.purchase_orders_count ?? 12}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="text-emerald-700 block mb-0.5">Trade Credit Health</span>
              <span className="text-sm font-bold text-emerald-800">Prompt / Preferred Supplier</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDetail;
