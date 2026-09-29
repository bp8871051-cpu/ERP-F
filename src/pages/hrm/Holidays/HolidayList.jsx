import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Gift,
  Building,
  Clock,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Holiday Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'public',
    description: '',
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrmService.getHolidays();
      setHolidays(data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Unable to load company holiday calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createHoliday(formData);
      setSuccessMessage(`Holiday "${formData.name}" scheduled.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({
        name: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'public',
        description: '',
      });
      fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create holiday');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((h) => {
    const q = searchTerm.toLowerCase();
    return h.name?.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q);
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'public':
        return <Badge variant="success">Public Holiday</Badge>;
      case 'company':
        return <Badge variant="teal">Company Holiday</Badge>;
      case 'optional':
        return <Badge variant="warning">Optional / Restricted</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  if (loading && holidays.length === 0) return <LoadingSkeleton type="table" />;
  if (error && holidays.length === 0) return <ErrorState message={error} onRetry={fetchHolidays} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Calendar & Public Holidays</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official company non-working days, statutory national holidays, and departmental observances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Schedule Holiday
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
              placeholder="Search holiday name, celebration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-slate-500">
            Total Holidays Scheduled: <span className="font-semibold text-slate-900">{holidays.length}</span>
          </div>
        </div>
      </Card>

      {/* Holidays Grid & Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Holiday Name</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Classification Type</th>
                <th className="py-3 px-4">Description / Applicability</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No holidays found.
                  </td>
                </tr>
              ) : (
                filteredHolidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{h.name}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {h.date}
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(h.type)}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                      {h.description || 'Statutory observance'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success">Confirmed</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Schedule Company Holiday</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Holiday Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Republic Day, Diwali, Annual Founders Day"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Holiday Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="public">Public Holiday</option>
                    <option value="company">Company Holiday</option>
                    <option value="optional">Optional / Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Observance details or branch applicability..."
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
                  Schedule Holiday
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayList;
