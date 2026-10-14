import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, Edit2, Key, Shield, UserCheck, 
  UserX, Building, Mail, Phone, Clock, ChevronRight, X, 
  CheckCircle, AlertCircle, RefreshCw, Lock, Eye, EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import systemService from '../../services/systemService';
import SearchableSelect from '../../components/ui/SearchableSelect';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPass, setSelectedUserForPass] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // User form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    department: 'Operations',
    company_name: 'Falcon Corp',
    password: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        systemService.getUsers({
          search: search || undefined,
          role_id: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        systemService.getRoles()
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.data || []));
      setRoles(Array.isArray(rolesRes) ? rolesRes : (rolesRes?.data || []));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role_id: roles[0]?.id || '',
      department: 'Operations',
      company_name: 'Falcon Corp',
      password: '',
      is_active: true
    });
    setShowUserModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role_id: u.roles?.[0]?.id || u.role_id || '',
      department: u.department || 'Operations',
      company_name: u.company?.name || u.company_name || 'Falcon Corp',
      password: '',
      is_active: u.is_active !== false
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingUser) {
        await systemService.updateUser(editingUser.id, form);
        setNotification({ type: 'success', message: 'User profile updated successfully!' });
      } else {
        await systemService.createUser(form);
        setNotification({ type: 'success', message: 'New user account created successfully!' });
      }
      setShowUserModal(false);
      setTimeout(() => setNotification(null), 3000);
      fetchUsers();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await systemService.toggleUserStatus(user.id);
      setNotification({ 
        type: 'success', 
        message: `User ${user.name} has been ${user.is_active ? 'deactivated' : 'activated'}.` 
      });
      setTimeout(() => setNotification(null), 3000);
      fetchUsers();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update user status' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    try {
      setSubmitting(true);
      await systemService.resetUserPassword(selectedUserForPass.id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setNotification({ type: 'success', message: `Password reset successfully for ${selectedUserForPass.name}` });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to reset password' });
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
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Enterprise User Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage system access credentials, role-based assignments, departmental segregation, and account security.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
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

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 !overflow-visible">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-40 z-20">
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Roles' },
                ...roles.map(r => ({ value: r.id, label: r.name }))
              ]}
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              searchable={false}
            />
          </div>

          <div className="w-40 z-10">
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive / Suspended' }
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              searchable={false}
            />
          </div>

          <button
            onClick={fetchUsers}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td colSpan="8" className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Adjust your search or add a new user.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const roleName = u.roles?.[0]?.name || u.role_name || 'Employee';
                  const isActive = u.is_active !== false;
                  const deptName = typeof u.department === 'object' && u.department !== null 
                    ? (u.department.name || u.department.department_name || 'Operations') 
                    : (u.department || 'Operations');
                  const compName = u.company?.name || (typeof u.company === 'string' ? u.company : 'Falcon Corp');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <Link 
                          to={`/app/system/users/${u.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <span>{u.name}</span>
                        </Link>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Shield className="w-3 h-3" /> {roleName}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {deptName}
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {compName}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never logged in'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/app/system/users/${u.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View Profile & Activity"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUserForPass(u);
                              setShowPasswordModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition ${
                              isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full flex flex-col my-8 !overflow-visible shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  {editingUser ? 'Edit User Credentials' : 'Create New User Account'}
                </h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="z-20">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role Assignment *</label>
                    <SearchableSelect
                      options={[
                        { value: '', label: 'Select Role...' },
                        ...roles.map(r => ({ value: r.id, label: r.name }))
                      ]}
                      value={form.role_id}
                      onChange={(val) => setForm({ ...form, role_id: val })}
                      searchable={false}
                    />
                  </div>
                  <div className="z-10">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <SearchableSelect
                      options={[
                        { value: 'Operations', label: 'Operations' },
                        { value: 'Support & Tech', label: 'Support & Tech' },
                        { value: 'Finance & Accounting', label: 'Finance & Accounting' },
                        { value: 'Human Resources', label: 'Human Resources' },
                        { value: 'Sales & CRM', label: 'Sales & CRM' },
                        { value: 'Warehouse & Inventory', label: 'Warehouse & Inventory' }
                      ]}
                      value={form.department}
                      onChange={(val) => setForm({ ...form, department: val })}
                      searchable={false}
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedUserForPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
                <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" /> Reset Password
                </h2>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Enter a new administrative password for <strong>{selectedUserForPass.name}</strong> ({selectedUserForPass.email}).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Resetting...' : 'Set Password'}
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
