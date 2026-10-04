import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderClosed,
  FileText,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  Upload,
  MessageSquare,
  Lock,
  Tag,
  GitPullRequest,
  Check,
  Edit,
} from 'lucide-react';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'versions' | 'workflow' | 'audit'

  // Action Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [versionForm, setVersionForm] = useState({
    version: 'v1.1',
    change_summary: '',
    file: null,
  });

  useEffect(() => {
    fetchDocDetails();
  }, [id]);

  const fetchDocDetails = async () => {
    try {
      setLoading(true);
      const res = await documentService.getDocumentDetails(id);
      const data = res.data || res;
      setDoc(data);

      const vRes = await documentService.getVersions(id);
      setVersions(vRes.data?.data || vRes.data || []);
    } catch (err) {
      console.error('Failed to load document details:', err);
      setError('Unable to load document details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await documentService.approveDocument(id, { comment: approvalComment });
      setShowApproveModal(false);
      setApprovalComment('');
      await fetchDocDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) {
      alert('Please specify a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await documentService.rejectDocument(id, { reason: rejectionReason });
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchDocDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVersionSubmit = async (e) => {
    e.preventDefault();
    if (!versionForm.version || !versionForm.change_summary) {
      alert('Please specify version tag and change summary.');
      return;
    }
    try {
      setActionLoading(true);
      const formData = new FormData();
      if (versionForm.file) formData.append('file', versionForm.file);
      formData.append('version', versionForm.version);
      formData.append('change_summary', versionForm.change_summary);

      await documentService.uploadVersion(id, formData);
      setShowVersionModal(false);
      setVersionForm({ version: 'v1.2', change_summary: '', file: null });
      await fetchDocDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading new version');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'draft').toLowerCase();
    switch (s) {
      case 'approved':
        return <Badge variant="success">APPROVED</Badge>;
      case 'pending approval':
      case 'pending_approval':
      case 'pending review':
      case 'pending_review':
        return <Badge variant="warning">PENDING REVIEW</Badge>;
      case 'rejected':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'expired':
        return <Badge variant="danger">EXPIRED</Badge>;
      default:
        return <Badge variant="default">DRAFT</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <Card className="p-8 text-center bg-white shadow-xs border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 mb-1">Document Record Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'Could not find the requested document.'}</p>
        <Button variant="secondary" onClick={() => navigate('/app/documents/repository')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Repository
        </Button>
      </Card>
    );
  }

  const workflowSteps = doc.workflow?.steps || [
    { name: 'Initial Drafting', role: 'Author', status: 'completed' },
    { name: 'Technical & Legal Review', role: 'Reviewer', status: doc.status === 'approved' ? 'completed' : 'in_progress' },
    { name: 'Department Head Sign-off', role: 'Manager', status: doc.status === 'approved' ? 'completed' : 'pending' },
    { name: 'Final Executive Approval', role: 'Director', status: doc.status === 'approved' ? 'completed' : 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/documents/repository')}
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Repository
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{doc.name || doc.title}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {doc.document_number || `DOC-${doc.id}`}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold">
                {doc.version || 'v1.0'}
              </span>
              {getStatusBadge(doc.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: {doc.category || 'General'} • Folder: {doc.folder || 'Root'} • Confidentiality: {doc.confidentiality || 'Internal'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(documentService.getDownloadUrl(doc.id), '_blank')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-teal-600" /> Download File
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowVersionModal(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-blue-600" /> New Version
          </Button>

          {doc.status !== 'approved' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowApproveModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowRejectModal(true)}
                className="text-xs"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Department</span>
          <p className="text-base font-bold text-slate-900 mt-1">{doc.department || 'Finance & Legal'}</p>
          <span className="text-[11px] text-slate-400">Ownership group</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Confidentiality</span>
          <p className="text-base font-bold text-teal-700 mt-1">{doc.confidentiality || 'Internal'}</p>
          <span className="text-[11px] text-slate-400">Access permission level</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Version History</span>
          <p className="text-base font-bold text-slate-800 mt-1">
            {versions.length > 0 ? versions.length : 1} Iterations
          </p>
          <span className="text-[11px] text-slate-400">Current: {doc.version || 'v1.0'}</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Validity Period</span>
          <p className="text-base font-bold text-slate-800 mt-1">
            {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'Continuous'}
          </p>
          <span className="text-[11px] text-slate-400">Renewal deadline</span>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4">
        {[
          { id: 'overview', label: 'Document Metadata', icon: FileText },
          { id: 'versions', label: `Version History (${versions.length || 1})`, icon: History },
          { id: 'workflow', label: 'Approval Workflow', icon: GitPullRequest },
          { id: 'audit', label: 'Audit Timeline', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-teal-600 text-teal-600 bg-teal-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Specifications</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Folder Path</span>
                <span className="font-semibold text-slate-800">/{doc.folder || 'Root'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-800">{doc.category || 'Contracts'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Original File Name</span>
                <span className="font-mono text-slate-800 font-semibold">{doc.original_name || 'document.pdf'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">File Format / MIME</span>
                <span className="font-mono text-slate-800">{doc.mime_type || 'application/pdf'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">File Size</span>
                <span className="font-semibold text-slate-800">
                  {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '1.4 MB'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Uploaded By</span>
                <span className="font-semibold text-slate-800">{doc.user?.name || doc.owner || 'Admin User'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Issue Date</span>
                <span className="font-semibold text-slate-800">
                  {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expiration Date</span>
                <span className="font-semibold text-slate-800">
                  {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'No expiry'}
                </span>
              </div>
            </div>

            {doc.tags && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1.5">Keywords & Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.split(',').map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description & Key Clauses</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {doc.description ||
                'This enterprise document represents a registered legal or operational agreement subject to company governance standards, confidentiality controls, and auditing policies.'}
            </p>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Data Integrity & SHA256 Verification
              </span>
              <p className="text-[10px] text-teal-700 font-mono break-all">
                Hash: {doc.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Version History */}
      {activeTab === 'versions' && (
        <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Version History & Revision Trail</h3>
              <p className="text-xs text-slate-500">Prior revisions are preserved immutably with full download capabilities.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowVersionModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1" /> Upload Next Version
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Uploaded By</th>
                  <th className="py-2.5 px-3">Uploaded Date</th>
                  <th className="py-2.5 px-3">Change Summary</th>
                  <th className="py-2.5 px-4 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.length > 0 ? (
                  versions.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{v.version}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{v.original_name || 'document.pdf'}</td>
                      <td className="py-3 px-3 text-slate-600">{v.user?.name || v.uploaded_by || 'Admin'}</td>
                      <td className="py-3 px-3 text-slate-600">{new Date(v.created_at || Date.now()).toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-600">{v.change_summary || 'Initial revision upload.'}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(documentService.getDownloadUrl(doc.id), '_blank')}
                          className="p-1 text-slate-500 hover:text-teal-600"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{doc.version || 'v1.0'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{doc.original_name || 'document.pdf'}</td>
                    <td className="py-3 px-3 text-slate-600">{doc.user?.name || 'Administrator'}</td>
                    <td className="py-3 px-3 text-slate-600">{new Date(doc.created_at || Date.now()).toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-600">Initial document registration.</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(documentService.getDownloadUrl(doc.id), '_blank')}
                        className="p-1 text-slate-500 hover:text-teal-600"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Workflow */}
      {activeTab === 'workflow' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document Approval Workflow Sequence</h3>
              <p className="text-xs text-slate-500">Sequential multi-stage sign-offs required for publishing.</p>
            </div>
            {getStatusBadge(doc.status)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => {
              const isDone = step.status === 'completed';
              const isCurrent = step.status === 'in_progress';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDone
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                      : isCurrent
                      ? 'border-amber-400 bg-amber-50/50 text-amber-950 ring-2 ring-amber-400/20'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step {idx + 1}</span>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{step.name}</h4>
                    <p className="text-[10px] mt-0.5 opacity-80">Approver Role: {step.role}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {doc.status !== 'approved' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Your Action Required</h4>
                <p className="text-[11px] text-slate-500">Sign off as authorized reviewer or request amendments.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowApproveModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Stage
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Request Changes / Reject
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Audit */}
      {activeTab === 'audit' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Document Access & Activity Trail</h3>
          <div className="space-y-4 text-xs">
            {[
              { action: 'Created & Uploaded', date: doc.created_at, user: 'Admin User', note: 'Document file uploaded to repository.' },
              { action: 'Version Initialized', date: doc.created_at, user: 'System Engine', note: `Version ${doc.version || 'v1.0'} initialized.` },
            ].map((log, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1 pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.date || Date.now()).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-emerald-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Approve Document
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleApprove} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approval Comments (Optional)</label>
                <textarea
                  rows="3"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Verified against company legal guidelines, approved for release."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {actionLoading ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject / Request Amendments
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleReject} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rejection Reason / Required Changes *</label>
                <textarea
                  rows="3"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Clause 4.2 requires indemnity cap amendment. Please revise."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button type="submit" variant="danger" size="sm" disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Reject Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload New Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-blue-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Next Document Version
              </h3>
              <button onClick={() => setShowVersionModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleVersionSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Version Identifier</label>
                <input
                  type="text"
                  required
                  value={versionForm.version}
                  onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                  placeholder="e.g. v1.1 or v2.0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attach Updated File</label>
                <input
                  type="file"
                  onChange={(e) => setVersionForm({ ...versionForm, file: e.target.files[0] })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Change Summary / Notes *</label>
                <textarea
                  rows="3"
                  required
                  value={versionForm.change_summary}
                  onChange={(e) => setVersionForm({ ...versionForm, change_summary: e.target.value })}
                  placeholder="Summarize changes incorporated in this version..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowVersionModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {actionLoading ? 'Uploading...' : 'Save Version'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;
