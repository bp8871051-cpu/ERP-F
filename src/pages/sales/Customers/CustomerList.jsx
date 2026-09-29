import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  ExternalLink,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import CustomerModal from './CustomerModal';

export const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search, status, page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await salesService.getCustomers({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setCustomers(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (formData) => {
    if (editingCustomer) {
      await salesService.updateCustomer(editingCustomer.id, formData);
    } else {
      await salesService.createCustomer(formData);
    }
    fetchCustomers();
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await salesService.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting customer.');
      }
    }
  };

  const handleExportCSV = () => {
    if (!customers.length) return;
    const headers = ['Customer Code', 'Name', 'Company', 'Email', 'Phone', 'City', 'Status'];
    const rows = customers.map((c) => [
      `"${c.customer_code || ''}"`,
      `"${c.name || ''}"`,
      `"${c.company_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
      `"${c.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Customers Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise customer records, credit terms, tax profiles, and transaction summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingCustomer(null);
              setShowModal(true);
            }}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, code or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchCustomers}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Customer Ledger Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Sales</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-slate-400">
                        No customers found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-teal-600 dark:text-teal-400">
                          {c.customer_code || `CUST-${c.id}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <button
                            onClick={() => navigate(`/app/sales/customers/${c.id}`)}
                            className="hover:text-teal-600 text-left cursor-pointer"
                          >
                            {c.name}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {c.company_name || 'Individual'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px]">
                            {c.email && (
                              <span className="flex items-center gap-1 text-slate-500 truncate max-w-[160px]">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {c.email}
                              </span>
                            )}
                            {c.phone && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {c.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {c.city ? `${c.city}, ${c.state || ''}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {c.sales_orders_count || c.total_orders || 0}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          ${Number(c.invoices_sum_grand_total || c.total_sales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                          ${Number(c.balance || c.outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">
                            {c.status || 'active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/app/sales/customers/${c.id}`)}
                              title="Customer Dossier & History"
                              className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCustomer(c);
                                setShowModal(true);
                              }}
                              title="Edit Customer"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(c.id)}
                              title="Delete Customer"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing page {meta.current_page} of {meta.last_page} ({meta.total} total customers)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Customer Modal (Create & Edit) */}
      <CustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />
    </div>
  );
};

export default CustomerList;
