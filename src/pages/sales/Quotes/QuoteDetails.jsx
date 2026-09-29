import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Printer,
  CheckCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const QuoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const res = await salesService.getQuote(id);
      setQuote(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load quotation:', err);
      setError('Quotation could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!window.confirm('Mark this quotation as accepted by the customer?')) return;
    try {
      setActionLoading(true);
      await salesService.acceptQuote(id);
      fetchQuote();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!window.confirm('Convert this accepted quotation into an active Sales Order?')) return;
    try {
      setActionLoading(true);
      const res = await salesService.convertQuote(id);
      const newOrderId = res.data?.data?.id;
      alert('Quotation successfully converted to Sales Order!');
      if (newOrderId) {
        navigate(`/app/sales/orders/${newOrderId}`);
      } else {
        fetchQuote();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error converting quote to sales order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quotation Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">{error || 'This proposal does not exist.'}</p>
        <Button variant="outline" onClick={() => navigate('/app/sales/quotes')}>
          Back to Quotations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/sales/quotes')}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {quote.quote_number}
              </h1>
              <Badge variant={quote.status === 'accepted' ? 'success' : quote.status === 'converted' ? 'info' : 'warning'}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued: {quote.quote_date || 'N/A'} • Valid Until: {quote.valid_until || 'No Expiry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['draft', 'sent'].includes(quote.status) && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleAccept}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Accept Quote
            </Button>
          )}

          {quote.status === 'accepted' && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleConvert}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Layers className="w-4 h-4" />
              Convert to Sales Order
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Printable Quotation Sheet */}
      <Card className="p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                F
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FALCON ENTERPRISE</span>
            </div>
            <p className="text-xs text-slate-500">Corporate Tower, Phase II, Tech Park</p>
            <p className="text-xs text-slate-500">Ahmedabad, Gujarat - 380015, India</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
              COMMERCIAL PROPOSAL
            </h2>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{quote.quote_number}</p>
            <p className="text-xs text-slate-500 mt-2">
              Date: <span className="font-semibold">{quote.quote_date || 'N/A'}</span>
            </p>
            <p className="text-xs text-slate-500">
              Valid Until: <span className="font-semibold text-amber-600">{quote.valid_until || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Client details */}
        <div className="my-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Prepared For:</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{quote.customer?.name || 'Prospective Customer'}</p>
          {quote.customer?.company_name && (
            <p className="font-medium text-slate-700 dark:text-slate-200">{quote.customer.company_name}</p>
          )}
          <p className="text-slate-500 mt-1">{quote.customer?.email || '—'} • {quote.customer?.phone || '—'}</p>
        </div>

        {/* Line Items */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3 text-right w-20">Qty</th>
                <th className="py-3 px-3 text-right w-28">Rate (₹)</th>
                <th className="py-3 px-3 text-right w-20">Disc %</th>
                <th className="py-3 px-3 text-right w-20">Tax %</th>
                <th className="py-3 px-3 text-right w-32">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(quote.items || []).map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {it.product?.name || 'Proposed Product'}
                  </td>
                  <td className="py-3 px-3 text-right">{it.quantity}</td>
                  <td className="py-3 px-3 text-right">
                    ₹{Number(it.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600">{Number(it.discount || 0)}%</td>
                  <td className="py-3 px-3 text-right">{Number(it.tax || 0)}%</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{Number(it.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
            {quote.notes && (
              <div>
                <span className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">Proposal Notes:</span>
                <p className="mt-1">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <span className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">Terms:</span>
                <p className="mt-1">{quote.terms}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(quote.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated Tax:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(quote.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-black text-slate-900 dark:text-white">
              <span>Quotation Total:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                ₹{Number(quote.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuoteDetails;
