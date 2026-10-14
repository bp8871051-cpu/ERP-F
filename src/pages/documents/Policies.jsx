import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const Policies = () => {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    title: '',
    policy_number: `POL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    category: 'IT Policies',
    version: 'v1.0',
    owner: 'IT Governance',
    department: 'Technology',
    effective_date: new Date().toISOString().split('T')[0],
    review_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    expiry_date: '',
    status: 'published',
    description: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, [selectedCategory, selectedStatus]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await documentService.getPolicies({
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
      });
      const list = res.data?.data || res.data || [];
      setPolicies(list);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!policyForm.title) {
      alert('Policy Title is required.');
      return;
    }
    try {
      setSubmitting(true);
      await documentService.createPolicy(policyForm);
      setShowCreateModal(false);
      setPolicyForm({
        title: '',
        policy_number: `POL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        category: 'IT Policies',
        version: 'v1.0',
        owner: 'IT Governance',
        department: 'Technology',
        effective_date: new Date().toISOString().split('T')[0],
        review_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        expiry_date: '',
        status: 'published',
        description: '',
      });
      await fetchPolicies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving policy');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'draft').toLowerCase();
    switch (s) {
      case 'published':
        return <Badge variant="success">PUBLISHED</Badge>;
      case 'review':
      case 'in_review':
        return <Badge variant="warning">IN REVIEW</Badge>;
      case 'approval':
      case 'pending_approval':
        return <Badge variant="info">PENDING APPROVAL</Badge>;
      case 'review due':
      case 'review_due':
        return <Badge variant="danger">REVIEW DUE</Badge>;
      case 'archived':
        return <Badge variant="default">ARCHIVED</Badge>;
      case 'draft':
      default:
        return <Badge variant="default">DRAFT</Badge>;
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const term = search.toLowerCase();
    const title = (p.title || p.name || '').toLowerCase();
    const num = (p.policy_number || '').toLowerCase();
    const owner = (p.owner || '').toLowerCase();
    return title.includes(term) || num.includes(term) || owner.includes(term);
  });

  const publishedCount = policies.filter((p) => p.status === 'published').length;
  const reviewDueCount = policies.filter((p) => p.status === 'review_due' || p.status === 'review').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Corporate Policies & Operations Manuals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard operating procedures, employee handbooks, IT security policies, and regulatory manuals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Create Policy Document
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Registered Policies</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{policies.length}</p>
          <span className="text-[11px] text-slate-400">All enterprise guidelines</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active & Published</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Currently in-force</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">In Review / Due</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{reviewDueCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Under annual revision</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Policy Categories</span>
          <p className="text-xl font-bold text-slate-700 mt-1">7 Categories</p>
          <span className="text-[11px] text-slate-400">HR, IT, Security, Finance...</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs !overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 !overflow-visible">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search policy title, number, owner..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
            />
          </div>

          <div className="z-20">
            <SearchableSelect
              options={[
                { value: '', label: 'All Policy Types' },
                { value: 'Company Policies', label: 'Company Policies' },
                { value: 'HR Policies', label: 'HR Policies' },
                { value: 'IT Policies', label: 'IT Policies' },
                { value: 'Security Policies', label: 'Security Policies' },
                { value: 'Finance Policies', label: 'Finance Policies' },
                { value: 'Operations Manuals', label: 'Operations Manuals' },
                { value: 'Employee Handbooks', label: 'Employee Handbooks' }
              ]}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              searchable={false}
            />
          </div>

          <div className="z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'review', label: 'Review' },
                { value: 'approval', label: 'Approval' },
                { value: 'draft', label: 'Draft' },
                { value: 'review_due', label: 'Review Due' },
                { value: 'archived', label: 'Archived' }
              ]}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              searchable={false}
            />
          </div>
        </div>
      </Card>

      {/* Policies Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Policy Title</th>
                <th className="py-3 px-3">Policy Number</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Owner / Author</th>
                <th className="py-3 px-3">Effective Date</th>
                <th className="py-3 px-3">Review Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="10" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredPolicies.length > 0 ? (
                filteredPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.title || p.name}</div>
                      {p.description && <div className="text-[10px] text-slate-400 line-clamp-1">{p.description}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">{p.policy_number}</td>
                    <td className="py-3 px-3 text-slate-600">{p.category}</td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">{p.version || 'v1.0'}</td>
                    <td className="py-3 px-3 text-slate-600">{p.department || 'HQ'}</td>
                    <td className="py-3 px-3 text-slate-600">{p.owner || 'Management'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.effective_date ? new Date(p.effective_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.review_date ? new Date(p.review_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Opening policy document: ${p.title}`)}
                        className="p-1 text-slate-400 hover:text-teal-600"
                        title="Read Policy"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No policy documents found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col my-8 !overflow-visible">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                Register Corporate Policy or Manual
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Policy Title *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                    placeholder="e.g. Information Security & Acceptable Use Policy"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Policy Number (Auto)</label>
                  <input
                    type="text"
                    value={policyForm.policy_number}
                    onChange={(e) => setPolicyForm({ ...policyForm, policy_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="z-20">
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <SearchableSelect
                    options={[
                      { value: 'Company Policies', label: 'Company Policies' },
                      { value: 'HR Policies', label: 'HR Policies' },
                      { value: 'IT Policies', label: 'IT Policies' },
                      { value: 'Security Policies', label: 'Security Policies' },
                      { value: 'Finance Policies', label: 'Finance Policies' },
                      { value: 'Operations Manuals', label: 'Operations Manuals' },
                      { value: 'Employee Handbooks', label: 'Employee Handbooks' }
                    ]}
                    value={policyForm.category}
                    onChange={(val) => setPolicyForm({ ...policyForm, category: val })}
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={policyForm.version}
                    onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-500"
                  />
                </div>

                <div className="z-10">
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'review', label: 'Review' },
                      { value: 'published', label: 'Published' }
                    ]}
                    value={policyForm.status}
                    onChange={(val) => setPolicyForm({ ...policyForm, status: val })}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={policyForm.department}
                    onChange={(e) => setPolicyForm({ ...policyForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner / Author</label>
                  <input
                    type="text"
                    value={policyForm.owner}
                    onChange={(e) => setPolicyForm({ ...policyForm, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={policyForm.effective_date}
                    onChange={(e) => setPolicyForm({ ...policyForm, effective_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Due Date</label>
                  <input
                    type="date"
                    value={policyForm.review_date}
                    onChange={(e) => setPolicyForm({ ...policyForm, review_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={policyForm.expiry_date}
                    onChange={(e) => setPolicyForm({ ...policyForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Scope & Summary</label>
                <textarea
                  rows="3"
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  placeholder="Outline applicability, mandatory compliance standards, and revision objectives..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {submitting ? 'Registering...' : 'Register Policy'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
