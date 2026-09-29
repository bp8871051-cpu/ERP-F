import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const QuoteList = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchQuotes();
  }, [search, status, page]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await salesService.getQuotes({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setQuotes(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Mark this quotation as accepted by customer?')) {
      try {
        setActionLoadingId(id);
        await salesService.acceptQuote(id);
        fetchQuotes();
      } catch (err) {
        alert(err.response?.data?.message || 'Error accepting quote');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleConvertQuote = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Convert this accepted quote into a confirmed Sales Order?')) {
      try {
        setActionLoadingId(id);
        const res = await salesService.convertQuote(id);
        const newOrderId = res.data?.data?.id;
        alert('Quotation successfully converted into Sales Order!');
        if (newOrderId) {
          navigate(`/app/sales/orders/${newOrderId}`);
        } else {
          fetchQuotes();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error converting quote');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (!quotes.length) return;
    const headers = ['Quote #', 'Customer', 'Quote Date', 'Valid Until', 'Grand Total', 'Status'];
    const rows = quotes.map((q) => [
      `"${q.quote_number || ''}"`,
      `"${q.customer?.name || ''}"`,
      `"${q.quote_date || ''}"`,
      `"${q.valid_until || ''}"`,
      `"${q.grand_total || 0}"`,
      `"${q.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `sales_quotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'converted':
        return <Badge variant="info">Converted to Order</Badge>;
      case 'sent':
        return <Badge variant="warning">Sent to Client</Badge>;
      case 'rejected':
      case 'expired':
        return <Badge variant="danger">{st}</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Sales Quotations & Proposals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate formal pricing quotations, track customer approvals, and convert directly into Sales Orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/app/sales/quotes/create')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quote #, customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="gap-1.5 text-xs text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Quotes Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : quotes.length === 0 ? (
          <div className="py-16 text-center">
            <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Quotations Found</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Send formal proposals to potential clients to win deals.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/app/sales/quotes/create')}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Quotation
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Quote #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Valid Until</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/app/sales/quotes/${q.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {q.quote_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {q.customer?.name || 'Prospective Client'}
                      </div>
                      {q.customer?.company_name && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {q.customer.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{q.quote_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {q.valid_until || 'No expiry'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(q.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(q.status)}</td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {['draft', 'sent'].includes(q.status) && (
                          <button
                            onClick={(e) => handleAcceptQuote(q.id, e)}
                            disabled={actionLoadingId === q.id}
                            title="Accept Quote"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {q.status === 'accepted' && (
                          <button
                            onClick={(e) => handleConvertQuote(q.id, e)}
                            disabled={actionLoadingId === q.id}
                            title="Convert to Sales Order"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/app/sales/quotes/${q.id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-900 dark:text-white">{meta.current_page}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} quotes total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuoteList;
