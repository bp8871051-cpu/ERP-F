import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Search,
  Users,
  FolderTree,
  ChevronRight,
  Folder,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parent_id: '',
    description: '',
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrmService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Unable to load departmental structure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createDepartment({
        ...formData,
        parent_id: formData.parent_id || null,
      });
      setSuccessMessage(`Department "${formData.name}" established.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', parent_id: '', description: '' });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    const q = searchTerm.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
  });

  const rootDepartments = filteredDepartments.filter((d) => !d.parent_id);
  const getSubdepartments = (parentId) =>
    departments.filter((d) => d.parent_id === parentId);

  if (loading && departments.length === 0) return <LoadingSkeleton type="table" />;
  if (error && departments.length === 0) return <ErrorState message={error} onRetry={fetchDepartments} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departmental Organization & Hierarchy</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organizational divisions, branch hierarchies, cost centers, and departmental staffing levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Department
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search department name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500">
            Active Divisions: <span className="font-semibold text-slate-800">{departments.length}</span>
          </div>
        </div>
      </Card>

      {/* Department Hierarchy Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Department & Division Hierarchy</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Lead / Manager</th>
                <th className="py-3 px-4 text-center">Staff Count</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rootDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No departments found.
                  </td>
                </tr>
              ) : (
                rootDepartments.map((parent) => {
                  const subs = getSubdepartments(parent.id);
                  return (
                    <React.Fragment key={parent.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors font-medium text-slate-900 bg-slate-50/40">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Building className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-900">{parent.name}</span>
                          {subs.length > 0 && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                              {subs.length} sub-units
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[11px]">
                            {parent.code || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {parent.manager?.name || 'Department Head'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-teal-700">
                            {parent.employees_count || parent.employees?.length || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={parent.is_active !== false ? 'success' : 'neutral'}>
                            {parent.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>

                      {subs.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                          <td className="py-2.5 px-4 pl-10 flex items-center gap-2 text-slate-700">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{sub.name}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px]">
                              {sub.code || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{sub.manager?.name || 'Unit Lead'}</td>
                          <td className="py-2.5 px-4 text-center font-semibold text-slate-700">
                            {sub.employees_count || sub.employees?.length || 0}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <Badge variant={sub.is_active !== false ? 'teal' : 'neutral'}>
                              {sub.is_active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Department</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence, QA & Testing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. AI-ML"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Parent Division</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="">None (Top-Level)</option>
                    {departments
                      .filter((d) => !d.parent_id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Operational remit and scope..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Establish Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
