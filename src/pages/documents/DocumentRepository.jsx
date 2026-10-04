import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderClosed,
  Folder,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  Share2,
  History,
  Tag,
  Lock,
  Plus,
  Grid,
  List,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  MoreVertical,
  X,
  ExternalLink,
  Copy,
} from 'lucide-react';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const DocumentRepository = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('All'); // 'All' or folder name
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConfidentiality, setSelectedConfidentiality] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Upload Form
  const [fileToUpload, setFileToUpload] = useState(null);
  const [newDoc, setNewDoc] = useState({
    name: '',
    document_number: `DOC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    category: 'Contracts',
    folder: 'Finance',
    department: 'Finance',
    confidentiality: 'Internal',
    version: 'v1.0',
    status: 'pending_approval',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    tags: 'enterprise, formal',
    description: '',
  });

  const defaultFolders = [
    'Root',
    'HR',
    'Finance',
    'Sales',
    'Purchase',
    'Legal',
    'Compliance',
    'Operations',
    'Projects',
  ];

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, [selectedFolder, selectedCategory, selectedStatus, selectedConfidentiality]);

  const fetchFolders = async () => {
    try {
      const res = await documentService.getFolders();
      const list = res.data?.data || res.data || [];
      setFolders(list.length > 0 ? list : defaultFolders.map((f, i) => ({ id: i + 1, name: f })));
    } catch (err) {
      setFolders(defaultFolders.map((f, i) => ({ id: i + 1, name: f })));
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        folder: selectedFolder !== 'All' ? selectedFolder : undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        confidentiality: selectedConfidentiality || undefined,
      };
      const res = await documentService.getDocuments(params);
      const list = res.data?.data || res.data || [];
      setDocuments(list);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      if (!newDoc.name) {
        setNewDoc((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ''),
        }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newDoc.name) {
      setUploadError('Document name is required.');
      return;
    }
    try {
      setUploading(true);
      setUploadError('');
      const formData = new FormData();
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }
      Object.keys(newDoc).forEach((key) => {
        if (newDoc[key]) formData.append(key, newDoc[key]);
      });

      await documentService.createDocument(formData);
      setShowUploadModal(false);
      setFileToUpload(null);
      setNewDoc({
        name: '',
        document_number: `DOC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        category: 'Contracts',
        folder: 'Finance',
        department: 'Finance',
        confidentiality: 'Internal',
        version: 'v1.0',
        status: 'pending_approval',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        tags: 'enterprise, formal',
        description: '',
      });
      await fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadError(err.response?.data?.message || 'Error uploading document file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete document "${title}"?`)) return;
    try {
      await documentService.deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const openShareModal = (doc) => {
    setShareDoc(doc);
    const link = `${window.location.origin}/app/documents/${doc.id}?token=${Math.random().toString(36).substring(7)}`;
    setShareLink(link);
    setCopied(false);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getFileIcon = (mimeOrType) => {
    const str = (mimeOrType || '').toLowerCase();
    if (str.includes('pdf')) return <FileText className="w-4 h-4 text-rose-600" />;
    if (str.includes('sheet') || str.includes('xls') || str.includes('csv'))
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (str.includes('image') || str.includes('png') || str.includes('jpg'))
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    if (str.includes('zip') || str.includes('tar')) return <FileArchive className="w-4 h-4 text-amber-600" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  const getConfidentialityBadge = (conf) => {
    const c = (conf || 'internal').toLowerCase();
    switch (c) {
      case 'public':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">Public</span>;
      case 'internal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">Internal</span>;
      case 'confidential':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">Confidential</span>;
      case 'highly confidential':
      case 'highly_confidential':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">Highly Confidential</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">{conf}</span>;
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
      case 'archived':
        return <Badge variant="default">ARCHIVED</Badge>;
      case 'draft':
      default:
        return <Badge variant="default">DRAFT</Badge>;
    }
  };

  const filteredDocs = documents.filter((d) => {
    const term = search.toLowerCase();
    const name = (d.name || d.title || '').toLowerCase();
    const docNo = (d.document_number || '').toLowerCase();
    const tags = (d.tags || '').toLowerCase();
    return name.includes(term) || docNo.includes(term) || tags.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderClosed className="w-5 h-5 text-teal-600" />
            Enterprise Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize corporate documents across departments, manage secure versioning, and download files.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Folders Tree Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-3 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Directory Folders</span>
              <span className="text-[10px] text-teal-600 font-semibold">{folders.length} Folders</span>
            </div>

            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedFolder('All')}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFolder === 'All'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderClosed className="w-4 h-4" />
                  <span>All Documents</span>
                </div>
                <span className="text-[10px] opacity-80">{documents.length}</span>
              </button>

              {folders.map((folder, idx) => {
                const folderName = typeof folder === 'string' ? folder : folder.name;
                const isSelected = selectedFolder === folderName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedFolder(folderName)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{folderName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Files & Actions (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Breadcrumb & Filters Header */}
          <Card className="p-3 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Repository</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-teal-700 font-bold">{selectedFolder}</span>
                <span className="text-slate-400 text-[10px]">({filteredDocs.length} items)</span>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded cursor-pointer ${
                    viewMode === 'list' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="relative sm:col-span-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search file, number..."
                  className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700"
              >
                <option value="">All Categories</option>
                <option value="Contracts">Contracts</option>
                <option value="Invoices">Invoices</option>
                <option value="HR">HR Documents</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal & NDAs</option>
                <option value="Policies">Policies & Manuals</option>
                <option value="Compliance">Compliance & ISO</option>
                <option value="Operations">Operations</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={selectedConfidentiality}
                onChange={(e) => setSelectedConfidentiality(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700"
              >
                <option value="">All Confidentiality</option>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Highly Confidential">Highly Confidential</option>
              </select>
            </div>
          </Card>

          {/* List or Grid View */}
          {viewMode === 'list' ? (
            <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Document Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Confidentiality</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan="8" className="py-3 px-4">
                            <LoadingSkeleton className="h-6 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : filteredDocs.length > 0 ? (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getFileIcon(doc.type || doc.mime_type)}
                              <div>
                                <div
                                  className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer"
                                  onClick={() => navigate(`/app/documents/${doc.id}`)}
                                >
                                  {doc.name || doc.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {doc.document_number || `DOC-${doc.id}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{doc.category || 'General'}</td>
                          <td className="py-3 px-3">{getConfidentialityBadge(doc.confidentiality)}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-700">{doc.version || 'v1.0'}</td>
                          <td className="py-3 px-3 text-slate-600">{doc.department || 'HQ'}</td>
                          <td className="py-3 px-3">{getStatusBadge(doc.status)}</td>
                          <td className="py-3 px-3 text-slate-600">
                            {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(documentService.getDownloadUrl(doc.id), '_blank')}
                                title="Download File"
                                className="p-1 text-slate-400 hover:text-teal-600"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openShareModal(doc)}
                                title="Share Document"
                                className="p-1 text-slate-400 hover:text-blue-600"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/app/documents/${doc.id}`)}
                                title="View Details"
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc.id, doc.name || doc.title)}
                                title="Delete"
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400">
                          <FolderClosed className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          No documents found in this directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-4 bg-white border border-slate-200 shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                        {getFileIcon(doc.type || doc.mime_type)}
                      </div>
                      {getConfidentialityBadge(doc.confidentiality)}
                    </div>

                    <h4
                      className="font-bold text-xs text-slate-900 truncate hover:text-teal-600 cursor-pointer"
                      onClick={() => navigate(`/app/documents/${doc.id}`)}
                    >
                      {doc.name || doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.document_number}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {doc.description || 'Enterprise document file recorded into DMS.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px]">
                    <span className="font-mono font-semibold text-slate-600">{doc.version || 'v1.0'}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => window.open(documentService.getDownloadUrl(doc.id), '_blank')}
                        className="p-1 hover:text-teal-600 text-slate-400"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openShareModal(doc)}
                        className="p-1 hover:text-blue-600 text-slate-400"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/app/documents/${doc.id}`)}
                        className="p-1 hover:text-slate-800 text-slate-400"
                        title="Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                Upload New Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {uploadError}
                </div>
              )}

              {/* Drag & Drop File Container */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="doc-file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png,.zip,.csv,.txt"
                />
                <label htmlFor="doc-file" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="font-semibold text-slate-800">
                    {fileToUpload ? fileToUpload.name : 'Click to select or drag and drop file'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, DOCX, XLSX, PPTX, Images, ZIP up to 25MB
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    placeholder="e.g. Master Services Agreement 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Number (Auto)</label>
                  <input
                    type="text"
                    value={newDoc.document_number}
                    onChange={(e) => setNewDoc({ ...newDoc, document_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Folder</label>
                  <select
                    value={newDoc.folder}
                    onChange={(e) => setNewDoc({ ...newDoc, folder: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    {defaultFolders.map((f, i) => (
                      <option key={i} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    <option value="Contracts">Contracts</option>
                    <option value="Invoices">Invoices</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Policies">Policies</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confidentiality Level</label>
                  <select
                    value={newDoc.confidentiality}
                    onChange={(e) => setNewDoc({ ...newDoc, confidentiality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Highly Confidential">Highly Confidential</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDoc.department}
                    onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newDoc.issue_date}
                    onChange={(e) => setNewDoc({ ...newDoc, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry / Renewal Date</label>
                  <input
                    type="date"
                    value={newDoc.expiry_date}
                    onChange={(e) => setNewDoc({ ...newDoc, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metadata Tags</label>
                <input
                  type="text"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  placeholder="e.g. nda, client, vendor, 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Description</label>
                <textarea
                  rows="2"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="Summary of document contents, key clauses, or instructions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={uploading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {uploading ? 'Uploading...' : 'Save & Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Document Link Modal */}
      {showShareModal && shareDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-600" />
                Share Document
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-800">{shareDoc.name || shareDoc.title}</div>
                <div className="text-[10px] text-slate-500">Confidentiality: {shareDoc.confidentiality}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secure Direct Access Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] bg-slate-50"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {copied && <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Link copied to clipboard!</p>}
              </div>

              <div className="p-3 bg-teal-50/70 rounded-lg text-teal-800 text-[11px]">
                Links provide direct access conforming to multi-company data boundary rules and authorization checks.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRepository;
