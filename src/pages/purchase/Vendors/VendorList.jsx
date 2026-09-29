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
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import VendorModal from './VendorModal';

export const VendorList = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, [search, status, page]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getVendors({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setVendors(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async (formData) => {
    if (editingVendor) {
      await purchaseService.updateVendor(editingVendor.id, formData);
    } else {
      await purchaseService.createVendor(formData);
    }
    fetchVendors();
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Delete this vendor from directory?')) {
      try {
        await purchaseService.deleteVendor(id);
        fetchVendors();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting vendor.');
      }
    }
  };

  const handleExportCSV = () => {
    if (!vendors.length) return;
    const headers = ['Code', 'Name', 'Company', 'Email', 'Phone', 'City', 'Status'];
    const rows = vendors.map((v) => [
      `"${v.vendor_code || ''}"`,
      `"${v.name || ''}"`,
      `"${v.company_name || ''}"`,
      `"${v.email || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.city || ''}"`,
      `"${v.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `vendors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Vendor Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supplier management, procurement contracts, and accounts payable ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingVendor(null);
              setShowModal(true);
            }}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" /> Add Vendor
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
              placeholder="Search by vendor name, code, contact..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 dark:text-white">No Vendors Found</p>
            <Button
              variant="primary"
              onClick={() => {
                setEditingVendor(null);
                setShowModal(true);
              }}
              className="mt-4 bg-indigo-600 text-white"
            >
              Add Vendor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Vendor Code</th>
                  <th className="px-5 py-3.5">Vendor / Company</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5">Communication</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vendors.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/app/purchase/vendors/${v.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                      {v.vendor_code}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{v.name}</div>
                      {v.company_name && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {v.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {v.contact_person || '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 space-y-0.5">
                      {v.email && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" /> {v.email}
                        </div>
                      )}
                      {v.phone && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400" /> {v.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {v.city ? `${v.city}, ${v.state || ''}` : 'India'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={v.status === 'active' ? 'success' : 'neutral'}>{v.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingVendor(v);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/app/purchase/vendors/${v.id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
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
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} vendors)
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

      <VendorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveVendor}
        vendor={editingVendor}
      />
    </div>
  );
};

export default VendorList;
