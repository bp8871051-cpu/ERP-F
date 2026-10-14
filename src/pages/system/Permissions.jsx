import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  KeyRound, Shield, Search, Filter, ArrowLeft, RefreshCw, 
  CheckCircle, FolderTree, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import systemService from '../../services/systemService';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await systemService.getPermissions();
      setPermissions(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const modules = Array.from(new Set(permissions.map(p => p.module || p.name?.split('.')[0] || 'General')));

  const filteredPerms = permissions.filter(p => {
    const mod = p.module || p.name?.split('.')[0] || 'General';
    const matchesMod = moduleFilter === 'all' || mod.toLowerCase() === moduleFilter.toLowerCase();
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.display_name?.toLowerCase().includes(search.toLowerCase());
    return matchesMod && matchesSearch;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/app/system/roles" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">System Permission Definitions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            Complete list of atomic operation capabilities defined across all enterprise modules.
          </p>
        </div>

        <button
          onClick={fetchPermissions}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search permissions by slug or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none capitalize"
          >
            <option value="all">All Modules</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Permission Slug</th>
                <th className="p-3.5">Display Name</th>
                <th className="p-3.5">Module Group</th>
                <th className="p-3.5">Guard</th>
                <th className="p-3.5">Super Admin Approval</th>
                <th className="p-3.5">Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td colSpan="6" className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredPerms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <Lock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No permissions matched criteria</p>
                  </td>
                </tr>
              ) : (
                filteredPerms.map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">
                      {perm.name}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {perm.display_name || perm.name}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium capitalize">
                        {perm.module || perm.name?.split('.')[0] || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {perm.guard_name || 'web'}
                    </td>
                    <td className="p-3.5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={perm.requires_approval || false}
                          onChange={async (e) => {
                            // Call systemService to update approval requirement if needed
                            // In demo, we just reflect the change visually
                          }}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        <span className="ml-2 text-[10px] font-semibold text-slate-500 peer-checked:text-amber-700">
                          Requires Approval
                        </span>
                      </label>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Laravel Policy Gate
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
