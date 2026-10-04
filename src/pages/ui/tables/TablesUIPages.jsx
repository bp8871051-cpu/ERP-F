import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Plus,
  SlidersHorizontal,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';
import UIDemoCard from '../../../components/ui/interface/UIDemoCard';

// 1. BASIC TABLES PAGE
export const BasicTablesPage = () => {
  const dummyRows = [
    { id: 'SKU-101', name: 'MacBook Pro M3 Max 16"', category: 'Hardware', stock: 42, price: '$3,499.00', status: 'In Stock' },
    { id: 'SKU-102', name: 'Dell UltraSharp 32" 4K', category: 'Peripherals', stock: 18, price: '$899.00', status: 'In Stock' },
    { id: 'SKU-103', name: 'Logitech MX Master 3S', category: 'Accessories', stock: 5, price: '$99.00', status: 'Low Stock' },
    { id: 'SKU-104', name: 'Herman Miller Aeron Chair', category: 'Furniture', stock: 0, price: '$1,395.00', status: 'Out of Stock' },
  ];

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Tables"
        title="Basic Tables"
        description="Clean, responsive enterprise table variants including basic, striped, bordered, hover, and compact styling."
      />

      <div className="grid grid-cols-1 gap-6">
        <UIDemoCard title="Striped & Hover Table" subtitle="Zebra stripe backgrounds with interactive hover highlighting.">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dummyRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{row.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600">{row.category}</td>
                    <td className="py-3 px-4">{row.stock} units</td>
                    <td className="py-3 px-4 font-semibold">{row.price}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 2. DATA TABLE PAGE (Full Real Laravel API Integration)
export const DataTablePage = () => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);

  // Column Visibility
  const [colVis, setColVis] = useState({
    name: true,
    email: true,
    role: true,
    department: true,
    status: true,
    salary: true,
    joined_date: true,
  });
  const [showColModal, setShowColModal] = useState(false);

  // Row Modal States
  const [editModalRecord, setEditModalRecord] = useState(null);
  const [viewModalRecord, setViewModalRecord] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    name: '',
    email: '',
    role: 'Staff Engineer',
    department: 'Engineering',
    status: 'active',
    salary: 65000,
  });

  const fetchData = (page = 1) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      per_page: meta.per_page || 10,
      search,
      status: statusFilter,
      department: departmentFilter,
      sort: sortField,
      direction: sortDir,
    });

    axios
      .get(`http://127.0.0.1:8000/api/v1/ui/data-table?${params.toString()}`)
      .then((res) => {
        setData(res.data.data || []);
        if (res.data.meta) setMeta(res.data.meta);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Data Table fetch error:', err);
        setError('Failed to load table records from Laravel backend API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(1);
  }, [search, statusFilter, departmentFilter, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((d) => d.id));
    }
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Delete ${selectedIds.length} selected records?`)) {
      axios
        .post('http://127.0.0.1:8000/api/v1/ui/data-table/bulk-delete', { ids: selectedIds })
        .then(() => {
          setSelectedIds([]);
          fetchData(meta.current_page);
        })
        .catch(() => alert('Bulk delete error'));
    }
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      axios
        .delete(`http://127.0.0.1:8000/api/v1/ui/data-table/${id}`)
        .then(() => fetchData(meta.current_page))
        .catch(() => alert('Delete error'));
    }
  };

  const handleCreateRecord = (e) => {
    e.preventDefault();
    axios
      .post('http://127.0.0.1:8000/api/v1/ui/data-table', newRecord)
      .then(() => {
        setCreateModal(false);
        setNewRecord({ name: '', email: '', role: 'Staff Engineer', department: 'Engineering', status: 'active', salary: 65000 });
        fetchData(1);
      })
      .catch((err) => alert(err.response?.data?.message || 'Error creating record'));
  };

  const handleUpdateRecord = (e) => {
    e.preventDefault();
    if (!editModalRecord) return;
    axios
      .put(`http://127.0.0.1:8000/api/v1/ui/data-table/${editModalRecord.id}`, editModalRecord)
      .then(() => {
        setEditModalRecord(null);
        fetchData(meta.current_page);
      })
      .catch((err) => alert(err.response?.data?.message || 'Error updating record'));
  };

  const exportCSV = () => {
    window.open('http://127.0.0.1:8000/api/v1/ui/data-table?export=csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Tables"
        title="Data Table"
        description="High-performance data table powered by Laravel REST API with server-side pagination, sorting, search, column visibility, bulk actions, and CSV export."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        }
      />

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          {/* Search Input */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Filters & Options */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Cloud Ops">Cloud Ops</option>
              <option value="Finance">Finance</option>
              <option value="Inventory">Inventory</option>
              <option value="Sales">Sales</option>
            </select>

            {/* Column Visibility Trigger */}
            <button
              type="button"
              onClick={() => setShowColModal(!showColModal)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchData(meta.current_page)}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Column Visibility Dropdown */}
        {showColModal && (
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
            <span className="font-bold text-slate-900">Toggle Columns:</span>
            {Object.keys(colVis).map((k) => (
              <label key={k} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={colVis[k]}
                  onChange={(e) => setColVis({ ...colVis, [k]: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600"
                />
                <span>{k.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchData(1)}
              className="px-2 py-1 rounded bg-rose-200 font-semibold text-[11px] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-teal-600"
                  />
                </th>
                <th onClick={() => handleSort('id')} className="py-3 px-3 cursor-pointer hover:text-slate-900 w-16">
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {sortField === 'id' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
                {colVis.name && (
                  <th onClick={() => handleSort('name')} className="py-3 px-3.5 cursor-pointer hover:text-slate-900">
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      {sortField === 'name' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                )}
                {colVis.email && <th className="py-3 px-3.5">Email</th>}
                {colVis.role && <th className="py-3 px-3.5">Role</th>}
                {colVis.department && <th className="py-3 px-3.5">Department</th>}
                {colVis.status && <th className="py-3 px-3.5">Status</th>}
                {colVis.salary && (
                  <th onClick={() => handleSort('salary')} className="py-3 px-3.5 cursor-pointer hover:text-slate-900">
                    <div className="flex items-center gap-1">
                      <span>Salary</span>
                      {sortField === 'salary' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                )}
                <th className="py-3 px-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                    <span>Loading database records from Laravel API...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No matching records found in database. Try clearing search filters.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      selectedIds.includes(row.id) ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-slate-300 text-teal-600"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-500">#{row.id}</td>
                    {colVis.name && (
                      <td className="py-3 px-3.5 font-semibold text-slate-900">
                        {row.name}
                      </td>
                    )}
                    {colVis.email && <td className="py-3 px-3.5 text-slate-600">{row.email}</td>}
                    {colVis.role && (
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {row.role}
                        </span>
                      </td>
                    )}
                    {colVis.department && (
                      <td className="py-3 px-3.5 text-slate-700">{row.department}</td>
                    )}
                    {colVis.status && (
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            row.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : row.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    )}
                    {colVis.salary && (
                      <td className="py-3 px-3.5 font-semibold text-slate-800">
                        ${Number(row.salary).toLocaleString()}
                      </td>
                    )}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewModalRecord(row)}
                          className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditModalRecord(row)}
                          className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing <strong className="text-slate-800">{meta.from || 0}</strong> to{' '}
            <strong className="text-slate-800">{meta.to || 0}</strong> of{' '}
            <strong className="text-slate-800">{meta.total || 0}</strong> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => fetchData(meta.current_page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800">
              Page {meta.current_page} of {meta.last_page}
            </span>

            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => fetchData(meta.current_page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Record #{viewModalRecord.id}</h3>
              <button type="button" onClick={() => setViewModalRecord(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-800">{viewModalRecord.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{viewModalRecord.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800">{viewModalRecord.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{viewModalRecord.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Salary:</span>
                <span className="font-semibold text-slate-800">${Number(viewModalRecord.salary).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold capitalize text-teal-600">{viewModalRecord.status}</span>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setViewModalRecord(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Edit Record #{editModalRecord.id}</h3>
              <button type="button" onClick={() => setEditModalRecord(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateRecord} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editModalRecord.name}
                  onChange={(e) => setEditModalRecord({ ...editModalRecord, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editModalRecord.email}
                  onChange={(e) => setEditModalRecord({ ...editModalRecord, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editModalRecord.department}
                  onChange={(e) => setEditModalRecord({ ...editModalRecord, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editModalRecord.status}
                  onChange={(e) => setEditModalRecord({ ...editModalRecord, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalRecord(null)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Create New Entity Record</h3>
              <button type="button" onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRecord} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan Edwards"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.edwards@falconerp.com"
                  value={newRecord.email}
                  onChange={(e) => setNewRecord({ ...newRecord, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newRecord.department}
                  onChange={(e) => setNewRecord({ ...newRecord, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cloud Ops">Cloud Ops</option>
                  <option value="Finance">Finance</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  value={newRecord.role}
                  onChange={(e) => setNewRecord({ ...newRecord, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setCreateModal(false)} className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer">
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
