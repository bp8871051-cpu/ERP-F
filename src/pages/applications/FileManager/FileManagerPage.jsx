import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Upload,
  Download,
  Share2,
  Trash2,
  Star,
  Search,
  Grid,
  List,
  MoreVertical,
  ChevronRight,
  HardDrive,
  Eye,
  Plus,
  X,
  File,
} from 'lucide-react';
import { fileService } from '../../../services/fileService';
import { useAuth } from '../../../context/AuthContext';

export const FileManagerPage = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home Storage' }]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [storageStats, setStorageStats] = useState({ used_bytes: 0, total_bytes: 10737418240, formatted_used: '0 MB' });

  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);
  const [shareEmail, setShareEmail] = useState('');

  const fileInputRef = useRef(null);

  // Load files & folders
  const loadFiles = async (folderId = currentFolderId) => {
    try {
      setLoading(true);
      const res = await fileService.getFiles({ folder_id: folderId });
      if (res && res.data) {
        setFolders(res.data.folders || []);
        setFiles(res.data.files || []);
        if (res.data.storage) {
          setStorageStats(res.data.storage);
        }
      }
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentFolderId);
  }, [currentFolderId]);

  // Navigate into folder
  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  // Navigate breadcrumb
  const handleBreadcrumbClick = (index) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Create folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await fileService.createFolder({
        name: newFolderName,
        parent_id: currentFolderId,
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
      loadFiles(currentFolderId);
    } catch (err) {
      console.error('Failed to create folder', err);
    }
  };

  // Upload files
  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files[]', selectedFiles[i]);
    }
    if (currentFolderId) {
      formData.append('folder_id', currentFolderId);
    }

    try {
      await fileService.uploadFiles(formData);
      loadFiles(currentFolderId);
    } catch (err) {
      console.error('Failed to upload file', err);
    }
  };

  // Delete file
  const handleDeleteFile = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this file?')) return;
    try {
      await fileService.deleteFile(id);
      loadFiles(currentFolderId);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete folder
  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this folder and its contents?')) return;
    try {
      await fileService.deleteFolder(id);
      loadFiles(currentFolderId);
    } catch (err) {
      console.error(err);
    }
  };

  // Share file
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFileForShare || !shareEmail) return;
    try {
      await fileService.shareFile(selectedFileForShare.id, { email: shareEmail });
      setSelectedFileForShare(null);
      setShareEmail('');
      alert('Document share link generated and sent.');
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for file type icons
  const getFileIcon = (ext) => {
    const e = ext?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(e)) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(e)) {
      return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
    }
    if (['zip', 'rar', 'tar', 'gz'].includes(e)) {
      return <FileArchive className="w-8 h-8 text-amber-500" />;
    }
    if (['pdf'].includes(e)) {
      return <FileText className="w-8 h-8 text-rose-500" />;
    }
    return <File className="w-8 h-8 text-teal-600" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter files
  const filteredFiles = files.filter((f) =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter((f) =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4.25rem)] bg-[#F7F8FA] overflow-hidden">
      {/* 1. LEFT SIDEBAR: Storage & Quick Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 p-4">
        {/* Upload Action */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mb-5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Quick actions */}
        <div className="space-y-1 mb-6">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-teal-600" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Folder Directory Navigation */}
        <div className="flex-1 overflow-y-auto space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-3 mb-2">
            Storage Folders
          </span>
          <button
            onClick={() => {
              setCurrentFolderId(null);
              setBreadcrumbs([{ id: null, name: 'Home Storage' }]);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              currentFolderId === null ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-4 h-4 text-teal-600" />
            <span>Root Workspace</span>
          </button>

          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => handleOpenFolder(f)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                currentFolderId === f.id ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">{f.name}</span>
              </div>
              <span className="text-[10px] text-slate-400">{f.files_count || 0}</span>
            </button>
          ))}
        </div>

        {/* Storage Usage Widget */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex justify-between mb-1.5">
            <span className="font-semibold text-slate-700">Storage Used</span>
            <span>{storageStats.formatted_used || '1.8 GB / 10 GB'}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-[18%] h-full bg-teal-500 rounded-full" />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1.5">Local + S3 Storage Layer</span>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: Folders & Files */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top Control Bar: Breadcrumbs, Search, View Mode */}
        <div className="p-4 px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`font-semibold hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap ${
                    idx === breadcrumbs.length - 1 ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search & Layout Toggles */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-teal-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-teal-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading workspace files...</span>
            </div>
          ) : (
            <>
              {/* Folders Section */}
              {filteredFolders.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Folders</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {filteredFolders.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => handleOpenFolder(f)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all bg-slate-50/50 hover:bg-white cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Folder className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500/20" />
                          <span className="text-xs font-semibold text-slate-800 truncate">{f.name}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteFolder(f.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Files ({filteredFiles.length})
                </h3>

                {filteredFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    No files found in this directory. Click "Upload Files" to upload.
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-sm transition-all bg-white flex flex-col justify-between group relative"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                            {getFileIcon(file.extension)}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => setSelectedFileForShare(file)}
                              title="Share"
                              className="p-1 text-slate-400 hover:text-teal-600 rounded"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(file.id, e)}
                              title="Delete"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-800 truncate mb-1" title={file.name}>
                            {file.name}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="uppercase font-semibold">{file.extension}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            {new Date(file.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <a
                            href={file.file_path}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-600 font-semibold hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Extension</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">Modified</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                            </td>
                            <td className="py-3 px-4 uppercase font-semibold text-[10px] text-slate-400">
                              {file.extension}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">{formatFileSize(file.size)}</td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(file.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <a
                                  href={file.file_path}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-slate-400 hover:text-teal-600 rounded"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => setSelectedFileForShare(file)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteFile(file.id, e)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Contracts"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share File Modal */}
      {selectedFileForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Share Document</h3>
              <button
                onClick={() => setSelectedFileForShare(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Share <strong>{selectedFileForShare.name}</strong> securely with colleagues or external stakeholders.
            </p>
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Colleague Email</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@falconerp.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFileForShare(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Send Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagerPage;
