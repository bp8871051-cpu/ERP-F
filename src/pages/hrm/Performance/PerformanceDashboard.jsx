import React, { useState, useEffect } from 'react';
import {
  Award,
  Star,
  Plus,
  Search,
  CheckCircle,
  TrendingUp,
  User,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Appraisal Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    rating: 4,
    goals: 'Deliver enterprise microservices, optimize MySQL query response latency',
    kpi: 'Sprint velocity > 90%, zero critical production incidents',
    feedback: 'Consistent high delivery with excellent paired problem solving.',
  });

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const [perfRes, empRes] = await Promise.all([
        hrmService.getPerformance(),
        hrmService.getEmployees(),
      ]);
      setPerformanceData(perfRes || []);
      setEmployees(empRes || []);
      if (empRes && empRes.length > 0 && !formData.employee_id) {
        setFormData((prev) => ({ ...prev, employee_id: empRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching performance:', err);
      setError('Unable to load employee appraisal evaluations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.submitReview(formData);
      setSuccessMessage('Performance evaluation filed and scored.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      fetchPerformance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit appraisal');
    } finally {
      setActionLoading(false);
    }
  };

  const getRatingLabel = (score) => {
    const s = Math.round(score);
    switch (s) {
      case 5:
        return { label: '5 - Outstanding', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 4:
        return { label: '4 - Exceeds Expectations', color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 3:
        return { label: '3 - Meets Expectations', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 2:
        return { label: '2 - Developing', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 1:
      default:
        return { label: '1 - Needs Improvement', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
  };

  if (loading && performanceData.length === 0) return <LoadingSkeleton type="card" />;
  if (error && performanceData.length === 0) return <ErrorState message={error} onRetry={fetchPerformance} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Appraisals & OKRs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized 1-5 rating frameworks, self and manager review workflows, and annual bonus appraisals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Record Appraisal Review
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Appraisal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceData.map((cycle) => (
          <Card key={cycle.id} className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                  Annual Appraisal Cycle
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{cycle.name || '2026 Annual Review'}</h3>
              </div>
              <Badge variant="teal">Cycle Active</Badge>
            </div>

            <p className="text-xs text-slate-500">{cycle.description || 'Enterprise OKRs and Manager Evaluations'}</p>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              {(cycle.reviews || []).slice(0, 3).map((r) => {
                const ratingBadge = getRatingLabel(r.rating || 4);
                return (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {r.employee?.first_name} {r.employee?.last_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ratingBadge.color}`}>
                        {ratingBadge.label}
                      </span>
                    </div>
                    {r.feedback && (
                      <p className="text-[11px] text-slate-500 italic">"{r.feedback}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Submit Appraisal Review</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Staff Member *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Standardized Performance Rating *</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs font-semibold"
                >
                  <option value={5}>5 - Outstanding (Top 5% Performer)</option>
                  <option value={4}>4 - Exceeds Expectations (Consistently Delivers Above Target)</option>
                  <option value={3}>3 - Meets Expectations (Solid Core Contributor)</option>
                  <option value={2}>2 - Developing (Shows Potential with Gaps)</option>
                  <option value={1}>1 - Needs Improvement (Performance Plan Required)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Key Goals Achieved</label>
                <textarea
                  rows={2}
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Manager Feedback & Development Plan</label>
                <textarea
                  rows={2}
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
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
                  File Appraisal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
