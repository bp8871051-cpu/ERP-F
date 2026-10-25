import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Check, Plus, Edit2, Users, Lock, Sparkles, 
  CheckSquare, Square, X, CheckCircle, AlertCircle, RefreshCw,
  FolderTree, KeyRound, ArrowRight
} from 'lucide-react';
import systemService from '../../services/systemService';
import { Link } from 'react-router-dom';

const PERMISSION_GROUPS = [
  'Dashboard', 'CRM', 'Sales', 'Purchase', 'Inventory', 
  'POS', 'Finance', 'HRM', 'Assets', 'Documents', 
  'Support', 'Membership', 'Reports', 'System', 'Settings',
  'Service', 'Store', 'QC', 'Projects'
];

const PERMISSION_ACTIONS = [
  'view', 'create', 'edit', 'delete', 'approve', 'export', 'manage', 'assign'
];

export default function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form for new role
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    guard_name: 'web'
  });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        systemService.getRoles(),
        systemService.getPermissions()
      ]);
      const rolesList = Array.isArray(rolesRes) ? rolesRes : (rolesRes?.data || []);
      const permsList = Array.isArray(permsRes) ? permsRes : (permsRes?.data || []);
      setRoles(rolesList);
      setPermissions(permsList);
      if (rolesList.length > 0 && !selectedRole) {
        setSelectedRole(rolesList[0]);
        const initialIds = (rolesList[0].permissions || []).map(p => p.id);
        setSelectedPermissionIds(initialIds);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const ids = (role.permissions || []).map(p => p.id);
    setSelectedPermissionIds(ids);
  };

  const togglePermission = (permId) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleModuleAll = (moduleName) => {
    const modulePerms = permissions.filter(p => 
      p.name?.toLowerCase().startsWith(moduleName.toLowerCase()) || 
      p.module?.toLowerCase() === moduleName.toLowerCase()
    );
    const modulePermIds = modulePerms.map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...modulePermIds])));
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSyncing(true);
      await systemService.syncRolePermissions(selectedRole.id, selectedPermissionIds);
      setNotification({ type: 'success', message: `Permissions updated successfully for ${selectedRole.name}!` });
      setTimeout(() => setNotification(null), 3000);
      fetchRolesData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to sync permissions' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await systemService.createRole(roleForm);
      setShowRoleModal(false);
      setRoleForm({ name: '', description: '', guard_name: 'web' });
      setNotification({ type: 'success', message: 'New role created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchRolesData();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create role' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Roles & Granular Permissions (RBAC)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative access controls enforced through Laravel Gates, Policies, and Middleware.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/system/permissions"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <KeyRound className="w-4 h-4" /> Permission Matrix
          </Link>
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Role
          </button>
        </div>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Main Layout: Left Roles List, Right Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Roles Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Configured Roles ({roles.length})
          </h3>

          <div className="space-y-2">
            {roles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              const isSuper = role.name?.toLowerCase().includes('super');

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {role.name}
                    </span>
                    {isSuper && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Root
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {role.description || `${role.name} authority access profile`}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span>{role.permissions?.length || 0} permissions</span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                      Configure <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Assign Capabilities to</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                    {selectedRole?.name || 'Selected Role'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select permissions to grant or revoke. Changes will be saved directly into Laravel RBAC database.
                </p>
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={syncing}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {syncing ? 'Saving in Laravel...' : 'Save Permissions'}
              </button>
            </div>

            {/* Permission Module Groups */}
            <div className="space-y-6">
              {PERMISSION_GROUPS.map(grp => {
                const groupPerms = permissions.filter(p => 
                  p.name?.toLowerCase().startsWith(grp.toLowerCase()) || 
                  p.module?.toLowerCase() === grp.toLowerCase()
                );

                // Fallback mock permissions if none seeded for specific group
                const displayPerms = groupPerms.length > 0 ? groupPerms : PERMISSION_ACTIONS.slice(0, 4).map((act, i) => ({
                  id: `${grp.toLowerCase()}_${act}_${i}`,
                  name: `${grp.toLowerCase()}.${act}`,
                  display_name: `${act.toUpperCase()} ${grp}`
                }));

                const allSelected = displayPerms.every(p => selectedPermissionIds.includes(p.id));

                return (
                  <div key={grp} className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-indigo-500" /> {grp} Management
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(grp)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        {allSelected ? 'Deselect All' : 'Select All Module'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {displayPerms.map(perm => {
                        const isChecked = selectedPermissionIds.includes(perm.id);
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition ${
                              isChecked 
                                ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{perm.display_name || perm.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" /> Create Custom Role
                </h2>
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compliance Auditor"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="What responsibilities does this role hold?"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
