import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  User,
  Download,
  Eye,
  Layers,
  ShieldAlert,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const ComplianceDocs = () => {
  const navigate = useNavigate();

  const [complianceList, setComplianceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('all'); // 'all' | 'expired' | '7' | '30' | '60' | '90'

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [complianceForm, setComplianceForm] = useState({
    name: '',
    document_number: '',
    compliance_type: 'GST',
    authority: 'Ministry of Finance / CBIC',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    responsible_person: 'Finance Controller',
    department: 'Finance',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    fetchCompliance();
  }, [selectedType]);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const res = await documentService.getCompliance({
        compliance_type: selectedType || undefined,
      });
      const list = res.data?.data || res.data || [];
      setComplianceList(list);
    } catch (err) {
      console.error('Failed to load compliance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!complianceForm.name || !complianceForm.document_number) {
      alert('Document Name and Number are required.');
      return;
    }
    try {
      setSubmitting(true);
      await documentService.createCompliance(complianceForm);
      setShowCreateModal(false);
      setComplianceForm({
        name: '',
        document_number: '',
        compliance_type: 'GST',
        authority: 'Ministry of Finance / CBIC',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        responsible_person: 'Finance Controller',
        department: 'Finance',
        status: 'active',
        notes: '',
      });
      await fetchCompliance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering compliance document');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 9999;
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getComplianceStatusBadge = (daysLeft) => {
    if (daysLeft < 0) {
      return <Badge variant="danger">EXPIRED ({Math.abs(daysLeft)}d ago)</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge variant="danger">EXPIRES IN {daysLeft} DAYS</Badge>;
    }
    if (daysLeft <= 30) {
      return <Badge variant="warning">EXPIRES IN {daysLeft} DAYS</Badge>;
    }
    if (daysLeft <= 60) {
      return <Badge variant="info">EXPIRES IN {daysLeft} DAYS</Badge>;
    }
    if (daysLeft <= 90) {
      return <Badge variant="default">EXPIRES IN {daysLeft} DAYS</Badge>;
    }
    return <Badge variant="success">ACTIVE & COMPLIANT</Badge>;
  };

  const enrichedList = complianceList.map((item) => ({
    ...item,
    daysLeft: calculateDaysLeft(item.expiry_date),
  }));

  const expiredCount = enrichedList.filter((c) => c.daysLeft < 0).length;
  const in7DaysCount = enrichedList.filter((c) => c.daysLeft >= 0 && c.daysLeft <= 7).length;
  const in30DaysCount = enrichedList.filter((c) => c.daysLeft > 7 && c.daysLeft <= 30).length;
  const in60DaysCount = enrichedList.filter((c) => c.daysLeft > 30 && c.daysLeft <= 60).length;
  const in90DaysCount = enrichedList.filter((c) => c.daysLeft > 60 && c.daysLeft <= 90).length;

  const filteredList = enrichedList.filter((c) => {
    const term = search.toLowerCase();
    const name = (c.name || c.document_name || '').toLowerCase();
    const docNo = (c.document_number || '').toLowerCase();
    const auth = (c.authority || '').toLowerCase();
    const resp = (c.responsible_person || '').toLowerCase();

    const matchesSearch = name.includes(term) || docNo.includes(term) || auth.includes(term) || resp.includes(term);

    let matchesExpiry = true;
    if (expiryFilter === 'expired') matchesExpiry = c.daysLeft < 0;
    else if (expiryFilter === '7') matchesExpiry = c.daysLeft >= 0 && c.daysLeft <= 7;
    else if (expiryFilter === '30') matchesExpiry = c.daysLeft >= 0 && c.daysLeft <= 30;
    else if (expiryFilter === '60') matchesExpiry = c.daysLeft >= 0 && c.daysLeft <= 60;
    else if (expiryFilter === '90') matchesExpiry = c.daysLeft >= 0 && c.daysLeft <= 90;

    return matchesSearch && matchesExpiry;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600" />
            Regulatory Compliance Records & Filings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor GST registrations, ISO audits, government certificates, trade licenses, and statutory renewal brackets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Compliance Record
          </Button>
        </div>
      </div>

      {/* Expiry Alert Cards (5 Brackets) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            expiryFilter === 'expired'
              ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expired</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-rose-600 mt-1">{expiredCount}</p>
          <span className="text-[10px] text-slate-400">Immediate action required</span>
        </button>

        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === '7' ? 'all' : '7')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            expiryFilter === '7'
              ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expires in 7 Days</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{in7DaysCount}</p>
          <span className="text-[10px] text-slate-400">Urgent renewal cycle</span>
        </button>

        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === '30' ? 'all' : '30')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            expiryFilter === '30'
              ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expires in 30 Days</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-1">{in30DaysCount}</p>
          <span className="text-[10px] text-slate-400">Pending renewal filings</span>
        </button>

        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === '60' ? 'all' : '60')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            expiryFilter === '60'
              ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expires in 60 Days</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{in60DaysCount}</p>
          <span className="text-[10px] text-slate-400">Upcoming renewal review</span>
        </button>

        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === '90' ? 'all' : '90')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            expiryFilter === '90'
              ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expires in 90 Days</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{in90DaysCount}</p>
          <span className="text-[10px] text-slate-400">Long-term tracking</span>
        </button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs !overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 !overflow-visible">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document name, registration number, authority..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
            />
          </div>

          <div className="z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Compliance Types' },
                { value: 'GST', label: 'GST Registration & Filings' },
                { value: 'Tax', label: 'Income Tax & TDS' },
                { value: 'Legal', label: 'Legal & Incorporation' },
                { value: 'ISO', label: 'ISO 9001 / 27001 Certifications' },
                { value: 'Licenses', label: 'Trade & Factory Licenses' },
                { value: 'Certifications', label: 'Industry Certifications' },
                { value: 'Contracts', label: 'Commercial Contracts' },
                { value: 'Government Documents', label: 'Government Documents' },
                { value: 'Employee Compliance', label: 'Employee Labor Compliance' },
                { value: 'Vendor Compliance', label: 'Vendor Due Diligence' }
              ]}
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              searchable={false}
            />
          </div>
        </div>
      </Card>

      {/* Compliance Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Compliance Document</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Issuing Authority</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3 text-center">Alert Status</th>
                <th className="py-3 px-3">Responsible Person</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="9" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name || item.document_name}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-semibold">{item.document_number}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {item.compliance_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.authority || 'Government Authority'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.issue_date ? new Date(item.issue_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'Perpetual'}
                    </td>
                    <td className="py-3 px-3 text-center">{getComplianceStatusBadge(item.daysLeft)}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{item.responsible_person || 'Compliance Lead'}</td>
                    <td className="py-3 px-3 text-slate-600">{item.department || 'HQ'}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Reviewing compliance certificate: ${item.document_number}`)}
                        className="p-1 text-slate-400 hover:text-teal-600"
                        title="View Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No compliance records found matching this bracket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Compliance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col my-8 !overflow-visible">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                Register Statutory Compliance Filing
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Document / Filing Name *</label>
                  <input
                    type="text"
                    required
                    value={complianceForm.name}
                    onChange={(e) => setComplianceForm({ ...complianceForm, name: e.target.value })}
                    placeholder="e.g. GST Registration Certificate Form GST REG-06"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration / Certificate # *</label>
                  <input
                    type="text"
                    required
                    value={complianceForm.document_number}
                    onChange={(e) => setComplianceForm({ ...complianceForm, document_number: e.target.value })}
                    placeholder="27AABCT2345Q1Z8"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="z-10">
                  <label className="block font-semibold text-slate-700 mb-1">Compliance Type</label>
                  <SearchableSelect
                    options={[
                      { value: 'GST', label: 'GST Registration & Filings' },
                      { value: 'Tax', label: 'Income Tax & TDS' },
                      { value: 'Legal', label: 'Legal & Incorporation' },
                      { value: 'ISO', label: 'ISO 9001 / 27001 Certifications' },
                      { value: 'Licenses', label: 'Trade & Factory Licenses' },
                      { value: 'Certifications', label: 'Industry Certifications' },
                      { value: 'Contracts', label: 'Commercial Contracts' },
                      { value: 'Government Documents', label: 'Government Documents' },
                      { value: 'Employee Compliance', label: 'Employee Labor Compliance' },
                      { value: 'Vendor Compliance', label: 'Vendor Due Diligence' }
                    ]}
                    value={complianceForm.compliance_type}
                    onChange={(val) => setComplianceForm({ ...complianceForm, compliance_type: val })}
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issuing Authority / Agency</label>
                  <input
                    type="text"
                    value={complianceForm.authority}
                    onChange={(e) => setComplianceForm({ ...complianceForm, authority: e.target.value })}
                    placeholder="e.g. Ministry of Corporate Affairs / TUV SUD"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={complianceForm.issue_date}
                    onChange={(e) => setComplianceForm({ ...complianceForm, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry / Renewal Due Date *</label>
                  <input
                    type="date"
                    required
                    value={complianceForm.expiry_date}
                    onChange={(e) => setComplianceForm({ ...complianceForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Officer / Custodian</label>
                  <input
                    type="text"
                    value={complianceForm.responsible_person}
                    onChange={(e) => setComplianceForm({ ...complianceForm, responsible_person: e.target.value })}
                    placeholder="e.g. Chief Financial Officer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={complianceForm.department}
                    onChange={(e) => setComplianceForm({ ...complianceForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Renewal Guidelines</label>
                <textarea
                  rows="2"
                  value={complianceForm.notes}
                  onChange={(e) => setComplianceForm({ ...complianceForm, notes: e.target.value })}
                  placeholder="Renewal steps, portal credentials or contact officer details..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {submitting ? 'Saving...' : 'Register Compliance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDocs;
