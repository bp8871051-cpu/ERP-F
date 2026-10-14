import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  CheckSquare,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import ContactModal from './ContactModal';

export const ContactList = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [leadSourceId, setLeadSourceId] = useState('');
  const [leadSources, setLeadSources] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showColMenu, setShowColMenu] = useState(false);

  // Column visibility state
  const [visibleCols, setVisibleCols] = useState({
    company: true,
    email: true,
    phone: true,
    job_title: true,
    source: true,
    owner: true,
    status: true,
    created_at: true,
  });

  useEffect(() => {
    loadLeadSources();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [search, status, leadSourceId, page, sortField, sortOrder]);

  const loadLeadSources = async () => {
    try {
      const res = await crmService.getLeadSources();
      setLeadSources(res.data || []);
    } catch (err) {
      console.error('Failed to load lead sources:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await crmService.getContacts({
        search: search || undefined,
        status: status || undefined,
        lead_source_id: leadSourceId || undefined,
        sort_by: sortField,
        sort_order: sortOrder,
        page,
        per_page: 15,
      });
      const payload = res;
      setContacts(payload.data || payload || []);
      setMeta({
        current_page: payload.meta?.current_page || payload.current_page || 1,
        last_page: payload.meta?.last_page || payload.last_page || 1,
        total: payload.meta?.total || payload.total || 0,
      });
    } catch (err) {
      console.error('Error fetching CRM contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await crmService.deleteContact(id);
        fetchContacts();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting contact.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Delete ${selectedIds.length} selected contacts?`)) {
      try {
        for (const id of selectedIds) {
          await crmService.deleteContact(id);
        }
        setSelectedIds([]);
        fetchContacts();
      } catch (err) {
        alert('Error performing bulk deletion.');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await crmService.exportContacts({ search, status });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crm_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error downloading CSV export.');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      setImporting(true);
      await crmService.importContacts(formData);
      alert('Contacts imported successfully!');
      setImportOpen(false);
      setImportFile(null);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error during import.');
    } finally {
      setImporting(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            CRM Contacts Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise business contacts, decision makers, multi-channel reach, and linked ERP customers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>

          <Button variant="secondary" size="sm" icon={Upload} onClick={() => setImportOpen(true)}>
            Import CSV
          </Button>

          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingContact(null);
              setModalOpen(true);
            }}
          >
            Create Contact
          </Button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <Card className="p-4 !overflow-visible">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
                placeholder="All Statuses"
                searchable={false}
              />
            </div>

            <div className="w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Sources' },
                  ...leadSources.map((s) => ({ value: String(s.id), label: s.name }))
                ]}
                value={String(leadSourceId)}
                onChange={(val) => {
                  setLeadSourceId(val);
                  setPage(1);
                }}
                placeholder="All Sources"
                searchable={false}
              />
            </div>

            {/* Column toggle */}
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setShowColMenu(!showColMenu)}
              >
                Columns
              </Button>
              {showColMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20 space-y-1 text-xs">
                  {Object.keys(visibleCols).map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols[col]}
                        onChange={() =>
                          setVisibleCols((prev) => ({ ...prev, [col]: !prev[col] }))
                        }
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{col.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchContacts}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card className="overflow-hidden" noPadding>
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          contacts.length > 0 && selectedIds.length === contacts.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Contact Name</th>
                    {visibleCols.company && <th className="py-3 px-4">Company</th>}
                    {visibleCols.email && <th className="py-3 px-4">Email</th>}
                    {visibleCols.phone && <th className="py-3 px-4">Phone / WhatsApp</th>}
                    {visibleCols.job_title && <th className="py-3 px-4">Job Title</th>}
                    {visibleCols.source && <th className="py-3 px-4">Lead Source</th>}
                    {visibleCols.owner && <th className="py-3 px-4">Owner</th>}
                    {visibleCols.status && <th className="py-3 px-4">Status</th>}
                    {visibleCols.created_at && <th className="py-3 px-4">Created Date</th>}
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-12 text-center text-slate-400">
                        No CRM contacts found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          selectedIds.includes(c.id) ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => navigate(`/app/crm/contacts/${c.id}`)}
                            className="hover:text-teal-600 text-left font-bold cursor-pointer"
                          >
                            {c.first_name} {c.last_name}
                          </button>
                          {c.customer_id && (
                            <span className="block text-[10px] text-teal-600 font-normal">
                              Linked ERP Customer
                            </span>
                          )}
                        </td>
                        {visibleCols.company && (
                          <td className="py-3 px-4 text-slate-700">
                            {c.company_name || c.customer?.company_name || 'Individual'}
                          </td>
                        )}
                        {visibleCols.email && (
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-[170px]">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {c.email || '—'}
                            </span>
                          </td>
                        )}
                        {visibleCols.phone && (
                          <td className="py-3 px-4">
                            <div className="flex flex-col text-[11px] text-slate-600">
                              {c.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {c.phone}
                                </span>
                              )}
                              {c.whatsapp && (
                                <span className="text-emerald-600 text-[10px]">
                                  WA: {c.whatsapp}
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {visibleCols.job_title && (
                          <td className="py-3 px-4 text-slate-500">{c.job_title || '—'}</td>
                        )}
                        {visibleCols.source && (
                          <td className="py-3 px-4">
                            <Badge variant="neutral" size="sm">
                              {c.lead_source?.name || 'Organic'}
                            </Badge>
                          </td>
                        )}
                        {visibleCols.owner && (
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {c.owner?.name || 'Unassigned'}
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className="py-3 px-4">
                            <Badge
                              variant={c.status === 'active' ? 'success' : 'neutral'}
                              size="sm"
                            >
                              {c.status}
                            </Badge>
                          </td>
                        )}
                        {visibleCols.created_at && (
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {new Date(c.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/app/crm/contacts/${c.id}`)}
                              title="View Contact Details"
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingContact(c);
                                setModalOpen(true);
                              }}
                              title="Edit Contact"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Delete Contact"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <strong>{contacts.length}</strong> of <strong>{meta.total}</strong> records
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={ChevronLeft}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 font-medium">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                  variant="secondary"
                  size="xs"
                  icon={ChevronRight}
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Contact Create / Edit Modal */}
      <ContactModal
        isOpen={modalOpen}
        contact={editingContact}
        onClose={() => {
          setModalOpen(false);
          setEditingContact(null);
        }}
        onSuccess={fetchContacts}
      />

      {/* CSV Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-600" />
              Import Contacts CSV
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload a valid CSV file with columns: first_name, last_name, email, phone, company_name, job_title.
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <input
                required
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button variant="teal" size="sm" type="submit" disabled={importing || !importFile}>
                  {importing ? 'Importing...' : 'Upload & Process'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
