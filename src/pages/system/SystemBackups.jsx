import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  ShieldCheck,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import systemService from '../../services/systemService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function SystemBackups() {
  const { user } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [purging, setPurging] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [selectedType, setSelectedType] = useState('database');

  const isSuperAdmin = user?.role === 'Super Admin';

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await systemService.getBackups();
      setBackups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load system backups:', err);
      showAlert('error', err.response?.data?.message || 'Could not retrieve backup snapshots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => setAlertInfo(null), 6000);
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await systemService.createBackup(selectedType);
      showAlert('success', res.message || 'Backup snapshot generated successfully!');
      await fetchBackups();
    } catch (err) {
      console.error('Backup creation error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to generate backup.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete backup "${filename}"?`)) {
      return;
    }
    try {
      await systemService.deleteBackup(filename);
      showAlert('success', 'Backup deleted successfully.');
      setBackups(prev => prev.filter(b => b.filename !== filename));
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete backup file.');
    }
  };

  const handleDownload = (filename) => {
    const url = systemService.downloadBackupUrl(filename);
    const token = localStorage.getItem('token') || localStorage.getItem('erp_token');
    
    // Create an authenticated download link
    const a = document.createElement('a');
    a.href = url + (token ? `?token=${encodeURIComponent(token)}` : '');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Database Backups</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete database snapshots, automated disaster recovery, and 30-day soft-deleted retention policy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchBackups}
            loading={loading}
          >
            Refresh
          </Button>

          {isSuperAdmin && (
            <Button
              variant="teal"
              size="sm"
              icon={Plus}
              onClick={handleCreateBackup}
              loading={creating}
            >
              Take Snapshot Now
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              alertInfo.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {alertInfo.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Backups</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{backups.length}</h3>
              <p className="text-[10px] text-teal-600 font-medium mt-1">Available for restore</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Storage Path</p>
              <h3 className="text-xs font-mono font-bold text-slate-800 mt-1 truncate max-w-[200px]" title="storage/app/backups">
                storage/app/backups
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Local / Secure Dedicated</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Auto Retention Policy</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">30 Days</h3>
              <p className="text-[10px] text-amber-600 font-medium mt-1">Soft-deleted purged daily</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Information Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-slate-700">
          <p className="font-semibold text-slate-900">Enterprise Data Governance & Soft-Delete Lifecycle</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            1. <strong>Lead Deletion Approval:</strong> Any lead deletion executed by staff or managers creates a safe request sent to Super Admin for approval.<br />
            2. <strong>30-Day Permanent Purge:</strong> When records are deleted across any module, they are protected with Soft-Delete. The system automated scheduler (<code>Schedule::daily()</code>) permanently purges items older than 30 days.
          </p>
        </div>
      </div>

      {/* Backup Snapshots Table */}
      <Card className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900">Database & System Snapshots</h3>
          <span className="text-[11px] text-slate-400">{backups.length} archives recorded</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading backup archives...</div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No system backup snapshots found.</p>
            <p className="text-[11px] text-slate-400">Click &ldquo;Take Snapshot Now&rdquo; to generate your first complete database dump.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Snapshot Name</th>
                  <th className="py-3 px-4 font-semibold">Archive Type</th>
                  <th className="py-3 px-4 font-semibold">File Size</th>
                  <th className="py-3 px-4 font-semibold">Created At</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {backups.map((b) => (
                  <tr key={b.id || b.filename} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{b.filename}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="teal">{b.type || 'Database Dump'}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.size}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(b.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Download}
                          onClick={() => handleDownload(b.filename)}
                          title="Download SQL Backup"
                        >
                          Download
                        </Button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteBackup(b.filename)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                            title="Delete Snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

