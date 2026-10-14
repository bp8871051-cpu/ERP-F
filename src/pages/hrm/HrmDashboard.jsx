import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  UserPlus,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
} from 'lucide-react';
import hrmService from '../../services/hrmService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const HrmDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHrmData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getDashboard();
      
      // Transform backend data to frontend expectations
      const backendData = res;
      const transformedData = {
        metrics: {
          totalWorkforce: backendData.metrics.totalWorkforce || 0,
          onLeaveToday: backendData.metrics.onLeaveToday || 0,
          attendanceRate: backendData.metrics.totalWorkforce ? Math.round((backendData.metrics.presentToday / backendData.metrics.totalWorkforce) * 100) : 0,
          openPositions: backendData.metrics.openPositions || 0,
          monthlyPayroll: backendData.metrics.monthlyPayroll || 0,
          averageSalary: backendData.metrics.totalWorkforce ? Math.round((backendData.metrics.monthlyPayroll || 0) / backendData.metrics.totalWorkforce) : 0,
          momGrowth: "+5.2%", // mock as backend doesn't provide
        },
        attendanceSummary: {
          present: backendData.metrics.presentToday || 0,
          late: backendData.metrics.lateToday || 0,
          absent: backendData.metrics.absentToday || 0,
          remote: 0, // backend doesn't explicitly separate remote from present in summary numbers easily, so defaulting to 0 or we can calculate
        },
        employeeDistribution: backendData.charts?.departments || [],
        weeklyAttendance: (backendData.charts?.attendanceTrend || []).map(d => ({...d, remote: 0})),
        payrollTrend: (backendData.charts?.payrollTrend || []).map(d => ({...d, payroll: d.amount})),
        recruitment: {
          newApplicants: backendData.charts?.recruitmentPipeline?.find(p => p.stage === 'Applied')?.count || 0,
          screening: backendData.charts?.recruitmentPipeline?.find(p => p.stage === 'Screening')?.count || 0,
          interviews: backendData.charts?.recruitmentPipeline?.find(p => p.stage === 'Interview')?.count || 0,
          selected: backendData.charts?.recruitmentPipeline?.find(p => p.stage === 'Selected')?.count || 0,
          hired: backendData.charts?.recruitmentPipeline?.find(p => p.stage === 'Hired')?.count || 0,
        },
        recentCandidates: (backendData.recentEmployees || []).map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          position: e.designation,
          experience: 'N/A',
          stage: 'Hired',
          expectedSalary: 'N/A',
          appliedDate: e.joining_date,
        })),
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Error fetching HRM dashboard:', err);
      setError('Unable to load HRM telemetry from the Laravel backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHrmData();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchHrmData} />;

  const {
    metrics,
    attendanceSummary,
    employeeDistribution,
    weeklyAttendance,
    payrollTrend,
    recruitment,
    recentCandidates,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Human Resource Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Workforce headcount, live attendance tracking, compensation trends, and hiring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/app/hrm/leave')}
          >
            Leave Calendar
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/app/hrm/recruitment')}
          >
            New Candidate
          </Button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Workforce"
          value={metrics.totalWorkforce}
          subtitle="Full-Time Staff"
          icon={Users}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="On Leave Today"
          value={metrics.onLeaveToday}
          subtitle="2 Scheduled Returns"
          icon={Calendar}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Attendance Rate"
          value={`${metrics.attendanceRate}%`}
          change="+1.2%"
          isPositive={true}
          changeLabel="vs target"
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Open Positions"
          value={metrics.openPositions}
          subtitle="Across 3 Departments"
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Monthly Payroll"
          value={`$${metrics.monthlyPayroll.toLocaleString()}`}
          change={metrics.momGrowth}
          isPositive={true}
          changeLabel="MoM"
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Row 1: Attendance Today Summary + Weekly Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <Card title="Today's Attendance Status" subtitle="Check-in verification summary">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-medium">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-2">{attendanceSummary.present}</p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-800 font-medium">Late Arrival</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-2">{attendanceSummary.late}</p>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-800 font-medium">Absent</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-900 mt-2">{attendanceSummary.absent}</p>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-800 font-medium">Remote (WFH)</span>
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">{attendanceSummary.remote}</p>
            </div>
          </div>
        </Card>

        {/* Weekly Attendance Bar Chart */}
        <Card
          title="Weekly Attendance Overview"
          subtitle="Workforce check-in trends Monday to Sunday"
          className="lg:col-span-2"
        >
          <BarMetricChart
            data={weeklyAttendance}
            dataKeyX="day"
            bars={[
              { key: 'present', name: 'Present Onsite', color: '#0F8B7A' },
              { key: 'remote', name: 'Remote', color: '#2563EB' },
              { key: 'late', name: 'Late', color: '#F59E0B' },
            ]}
          />
        </Card>
      </div>

      {/* Row 2: Employee Distribution Donut + 6-Month Payroll Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Departmental Workforce Distribution" subtitle="Headcount by organizational division">
          <DonutMetricChart
            data={employeeDistribution.map((d) => ({ name: d.name, value: d.count }))}
            nameKey="name"
            dataKey="value"
          />
        </Card>

        <Card
          title="6-Month Payroll Trend & Headcount Growth"
          subtitle={`Average Monthly Salary: $${metrics.averageSalary.toLocaleString()}`}
          className="lg:col-span-2"
        >
          <TrendAreaChart
            data={payrollTrend}
            dataKeyX="month"
            series={[
              { key: 'payroll', name: 'Total Disbursements ($)', color: '#1E293B' },
            ]}
            formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </Card>
      </div>

      {/* Row 3: Recruitment Funnel + Recent Candidates Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Pipeline */}
        <Card title="Talent Acquisition Funnel" subtitle="Active candidate pipeline stages">
          <div className="space-y-3 mt-2">
            {[
              { stage: 'New Applicants', count: recruitment.newApplicants, color: 'bg-slate-700' },
              { stage: 'Screening', count: recruitment.screening, color: 'bg-blue-600' },
              { stage: 'Interviews Scheduled', count: recruitment.interviews, color: 'bg-amber-500' },
              { stage: 'Candidates Selected', count: recruitment.selected, color: 'bg-teal-600' },
              { stage: 'Offers Hired', count: recruitment.hired, color: 'bg-emerald-600' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                  <span className="text-xs font-medium text-slate-700">{step.stage}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {step.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Candidates Table */}
        <Card
          title="Recent Job Applicants"
          subtitle="Top candidates currently undergoing review"
          className="lg:col-span-2"
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Expected</th>
                  <th className="py-3 px-4">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.position}</td>
                    <td className="py-3 px-4 text-slate-600">{c.experience}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          c.stage === 'Hired' ? 'success' :
                          c.stage === 'Selected' ? 'teal' :
                          c.stage === 'Interview' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {c.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.expectedSalary}</td>
                    <td className="py-3 px-4 text-slate-500">{c.appliedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HrmDashboard;
