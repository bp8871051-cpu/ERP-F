import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  MapPin,
  CheckCircle,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const TrainingList = () => {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form
  const [formData, setFormData] = useState({
    title: '',
    trainer_name: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    cost: '',
    description: '',
  });

  const [enrollEmployeeId, setEnrollEmployeeId] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [trRes, empRes] = await Promise.all([
        hrmService.getTraining(),
        hrmService.getEmployees(),
      ]);
      setTrainings(trRes || []);
      setEmployees(empRes || []);
      if (empRes && empRes.length > 0) {
        setEnrollEmployeeId(empRes[0].id);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError('Unable to load employee development curriculums.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createTraining({
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
      });
      setSuccessMessage(`Training program "${formData.title}" established.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsProgramModalOpen(false);
      setFormData({
        title: '',
        trainer_name: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        cost: '',
        description: '',
      });
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create training program');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnrollEmployee = async (e) => {
    e.preventDefault();
    if (!selectedTraining || !enrollEmployeeId) return;
    try {
      setActionLoading(true);
      await hrmService.enrollTraining({
        training_program_id: selectedTraining.id,
        employee_id: enrollEmployeeId,
      });
      setSuccessMessage('Staff member successfully enrolled in curriculum!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsEnrollModalOpen(false);
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll staff in training');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.trainer_name?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  if (loading && trainings.length === 0) return <LoadingSkeleton type="table" />;
  if (error && trainings.length === 0) return <ErrorState message={error} onRetry={fetchTrainings} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Training, Upskilling & Certifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated development programs, trainer scheduling, staff enrollments, and professional accreditations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsProgramModalOpen(true)}>
            New Training Curriculum
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search curriculum, trainer, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-slate-500">
            Available Curriculums: <span className="font-semibold text-slate-900">{trainings.length}</span>
          </div>
        </div>
      </Card>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainings.map((t) => (
          <Card key={t.id} className="p-5 bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                  Professional Course
                </span>
                <Badge variant="teal">{t.status || 'Active'}</Badge>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{t.description || 'Enterprise professional development track.'}</p>

              <div className="pt-2 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: {t.trainer_name || 'Corporate L&D'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.start_date} to {t.end_date}</span>
                </div>
                {t.cost > 0 && (
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span>Investment: ₹{Number(t.cost).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {t.enrollments?.length || 0} enrolled
              </span>
              <button
                onClick={() => {
                  setSelectedTraining(t);
                  setIsEnrollModalOpen(true);
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                + Enroll Staff
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Training Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Training Curriculum</h3>
              </div>
              <button
                onClick={() => setIsProgramModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Curriculum Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Laravel Microservices & Cloud Scale"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Trainer / Facilitator</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alex Mercer, Senior Principal Architect"
                  value={formData.trainer_name}
                  onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Curriculum Scope / Overview</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsProgramModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Create Program
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Staff Modal */}
      {isEnrollModalOpen && selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Enroll Staff in {selectedTraining.title}
                </h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollEmployee} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Employee *</label>
                <select
                  required
                  value={enrollEmployeeId}
                  onChange={(e) => setEnrollEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Confirm Enrollment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingList;
