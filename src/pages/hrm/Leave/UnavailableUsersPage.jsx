import React, { useState, useEffect } from 'react';
import {
  Users,
  UserX,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  Building2,
  Briefcase,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const UnavailableUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState({
    total_count: 0,
    total_unavailable: 0,
    total_available: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | unavailable | available

  const fetchData = async () => {
    try {
      setError(null);
      const data = await hrmService.getUnavailableUsers({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRecords(data?.records || []);
      setMetrics(data?.metrics || { total_count: 0, total_unavailable: 0, total_available: 0 });
    } catch (err) {
      console.error('Error fetching unavailable users:', err);
      setError(err?.response?.data?.message || 'Failed to load employee availability records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Falcon ERP</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>HRM</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-teal-600 font-semibold">Unavailable Users</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Unavailable & On-Leave Personnel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of employee availability, leave status, and projected return dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards: Total Count, Total Unavailable, Total Available */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users / Personnel */}
        <Card className="p-4 border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Workforce
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{metrics.total_count}</span>
              <span className="text-[11px] font-medium text-slate-400">Tracked Profiles</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Unavailable (On Leave, Inactive) */}
        <Card
          onClick={() => setStatusFilter(statusFilter === 'unavailable' ? 'all' : 'unavailable')}
          className={`p-4 border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-rose-400 ${
            statusFilter === 'unavailable' ? 'ring-2 ring-rose-500 bg-rose-50/20' : ''
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
              Total Unavailable
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700">{metrics.total_unavailable}</span>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                On Leave / Out
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Available */}
        <Card
          onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
          className={`p-4 border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-emerald-400 ${
            statusFilter === 'available' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Total Available
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{metrics.total_available}</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Active & On-Duty
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar & Search Option */}
      <Card className="p-4 border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, employee code, email, role, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Personnel ({metrics.total_count})</option>
              <option value="unavailable">Unavailable Only ({metrics.total_unavailable})</option>
              <option value="available">Available Only ({metrics.total_available})</option>
            </select>

            <Button type="submit" size="sm" className="whitespace-nowrap">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Main Table with End Date Column */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchData} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Role & Dept</th>
                  <th className="py-3 px-3">Availability Status</th>
                  <th className="py-3 px-3">Reason / Details</th>
                  <th className="py-3 px-4 font-bold text-slate-700">End Date (Expected Return)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <UserX className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try modifying your search or status filter options.
                      </p>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const isUnavailable = r.status === 'Unavailable';

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isUnavailable ? 'bg-rose-50/10' : ''
                        }`}
                      >
                        {/* Employee Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                              {r.avatar ? (
                                <img
                                  src={r.avatar}
                                  alt={r.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                r.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{r.name}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span className="font-mono">{r.employee_code || `EMP-${r.id}`}</span>
                                <span>•</span>
                                <span className="truncate">{r.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Department */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{r.role}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {r.department}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          {isUnavailable ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              Unavailable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Available
                            </span>
                          )}
                        </td>

                        {/* Reason / Details */}
                        <td className="py-3 px-3 text-slate-600">
                          {r.reason ? (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate max-w-xs font-medium">{r.reason}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Active on shift</span>
                          )}
                        </td>

                        {/* End Date (with highlight) */}
                        <td className="py-3 px-4">
                          {isUnavailable && r.end_date ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 font-mono">
                                  {r.end_date}
                                </span>
                                <span className="text-[10px] text-rose-600 font-medium">
                                  {r.end_date === 'Indefinite'
                                    ? 'Indefinite Leave'
                                    : 'Until End of Day'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UnavailableUsersPage;
