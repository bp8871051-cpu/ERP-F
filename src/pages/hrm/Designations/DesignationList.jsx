import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Building,
  DollarSign,
  Award,
  Layers,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const DesignationList = () => {
  const [designations, setDesignations] = useState([]);
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
    department_id: '',
    level: 1,
    min_salary: '',
    max_salary: '',
    description: '',
  });

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [desRes, depRes] = await Promise.all([
        hrmService.getDesignations(),
        hrmService.getDepartments(),
      ]);
      setDesignations(desRes || []);
      setDepartments(depRes || []);
      if (depRes && depRes.length > 0 && !formData.department_id) {
        setFormData((prev) => ({ ...prev, department_id: depRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError('Unable to load professional job titles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleCreateDesignation = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createDesignation({
        ...formData,
        min_salary: formData.min_salary ? parseFloat(formData.min_salary) : 0,
        max_salary: formData.max_salary ? parseFloat(formData.max_salary) : 0,
      });
      setSuccessMessage(`Designation "${formData.name}" established.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        department_id: departments[0]?.id || '',
        level: 1,
        min_salary: '',
        max_salary: '',
        description: '',
      });
      fetchDesignations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create designation');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDesignations = designations.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.department?.name?.toLowerCase().includes(q)
    );
  });

  if (loading && designations.length === 0) return <LoadingSkeleton type="table" />;
  if (error && designations.length === 0) return <ErrorState message={error} onRetry={fetchDesignations} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Designations & Grade Bands</h1>
          <p className="text-xs text-slate-500 mt-1">
            Job titles, seniority ranking levels, and compensation brackets (separate from security permissions).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Designation
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
              placeholder="Search title, grade code, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500">
            Total Job Designations: <span className="font-semibold text-slate-800">{designations.length}</span>
          </div>
        </div>
      </Card>

      {/* Designations Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Designation Title</th>
                <th className="py-3 px-4">Grade Code</th>
                <th className="py-3 px-4">Primary Department</th>
                <th className="py-3 px-4 text-center">Seniority Level</th>
                <th className="py-3 px-4 text-right">Standard Salary Bracket</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDesignations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No designations found.
                  </td>
                </tr>
              ) : (
                filteredDesignations.map((des) => (
                  <tr key={des.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{des.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {des.code || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {des.department?.name || 'All Departments'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                        L{des.level || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      ₹{Number(des.min_salary || 0).toLocaleString()} - ₹{Number(des.max_salary || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={des.is_active !== false ? 'success' : 'neutral'}>
                        {des.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Designation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Job Designation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDesignation} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Designation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Architect, HR Lead"
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
                    placeholder="e.g. S-ARCH"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Seniority Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((l) => (
                      <option key={l} value={l}>
                        Level {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="">Company-Wide / Generic</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Min Salary (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={formData.min_salary}
                    onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Salary (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150000"
                    value={formData.max_salary}
                    onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
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
                  Save Designation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationList;
