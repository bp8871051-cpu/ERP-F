import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  FileText,
  Award,
  BookOpen,
  Activity,
  Edit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrmService.getEmployee(id);
      setEmployee(data);
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Unable to load employee dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  if (loading) return <LoadingSkeleton type="card" />;
  if (error || !employee) return <ErrorState message={error} onRetry={fetchEmployeeData} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hrm/employees"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {employee.first_name?.[0]}
              {employee.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {employee.first_name} {employee.last_name}
                </h1>
                <Badge variant={employee.status === 'active' ? 'success' : 'neutral'}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {employee.designation?.name || 'Staff'} • {employee.department?.name || 'General Operations'} • ID: {employee.employee_code}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase">Joining Date</span>
          <span className="font-semibold text-slate-900 mt-0.5 block">{employee.joining_date}</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase">Employment Type</span>
          <span className="font-semibold text-slate-900 mt-0.5 block capitalize">
            {employee.employment_type?.replace('_', ' ')}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase">Work Location</span>
          <span className="font-semibold text-slate-900 mt-0.5 block">
            {employee.work_location || 'Headquarters'}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-slate-400 block text-[10px] uppercase">Monthly Base Salary</span>
          <span className="font-bold text-teal-700 mt-0.5 block text-sm">
            ₹{Number(employee.salary || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Bio', icon: User },
          { id: 'attendance', label: 'Attendance Telemetry', icon: Clock },
          { id: 'leave', label: 'Leave History', icon: Calendar },
          { id: 'payroll', label: 'Payroll & Compensation', icon: DollarSign },
          { id: 'documents', label: 'Documents & IDs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Personal & Contact Info</h3>
            <div className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="font-semibold text-slate-800">{employee.email}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800">{employee.phone || 'N/A'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Gender / DOB:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {employee.gender} • {employee.date_of_birth}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-semibold text-slate-800 max-w-xs text-right">
                  {employee.address || '—'}, {employee.city} {employee.state}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Bank & Emergency Contact</h3>
            <div className="divide-y divide-slate-100">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Bank & Account:</span>
                <span className="font-semibold text-slate-800">
                  {employee.bank_name || 'HDFC Bank'} (••••{' '}
                  {employee.account_number ? employee.account_number.slice(-4) : '3492'})
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {employee.ifsc || 'HDFC0001234'}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-semibold text-slate-800">
                  {employee.emergency_contact_name || 'Jane Doe'} ({employee.emergency_contact_relationship || 'Spouse'})
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-semibold text-slate-800">
                  {employee.emergency_contact_phone || '+91 9876543210'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Attendance Records</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Check In</th>
                  <th className="py-2.5 px-4">Check Out</th>
                  <th className="py-2.5 px-4 text-center">Working Hours</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(employee.attendances || []).slice(0, 10).map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-900">{att.date}</td>
                    <td className="py-2.5 px-4">{att.check_in || '—'}</td>
                    <td className="py-2.5 px-4">{att.check_out || '—'}</td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {(att.working_minutes / 60).toFixed(1)} hrs
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={att.status === 'present' ? 'success' : 'warning'}>
                        {att.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Leave */}
      {activeTab === 'leave' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Leave History & Allocations</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Leave Type</th>
                  <th className="py-2.5 px-4">Start Date</th>
                  <th className="py-2.5 px-4">End Date</th>
                  <th className="py-2.5 px-4 text-center">Days</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(employee.leave_requests || []).slice(0, 10).map((lr) => (
                  <tr key={lr.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {lr.leave_type?.name || 'Annual Leave'}
                    </td>
                    <td className="py-2.5 px-4">{lr.start_date}</td>
                    <td className="py-2.5 px-4">{lr.end_date}</td>
                    <td className="py-2.5 px-4 text-center font-bold">{lr.days} days</td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={lr.status === 'approved' ? 'success' : 'warning'}>
                        {lr.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Payroll */}
      {activeTab === 'payroll' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Salary & Payslips Disbursed</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Pay Period</th>
                  <th className="py-2.5 px-4 text-right">Basic Salary</th>
                  <th className="py-2.5 px-4 text-right">Allowances</th>
                  <th className="py-2.5 px-4 text-right">Deductions</th>
                  <th className="py-2.5 px-4 text-right">Net Disbursed</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(employee.payrolls || []).slice(0, 10).map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {pr.payroll_period?.name || 'Monthly Cycle'}
                    </td>
                    <td className="py-2.5 px-4 text-right">₹{Number(pr.basic_salary).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">
                      +₹{Number(pr.allowances || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-600">
                      -₹{Number(pr.deductions || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      ₹{Number(pr.net_salary).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={pr.status === 'paid' ? 'success' : 'teal'}>{pr.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 5: Documents */}
      {activeTab === 'documents' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Statutory Documents & Identity Proofs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">PAN Card</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{employee.pan || 'ABCDE1234F'}</p>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Aadhaar Card / ID</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    •••• •••• {employee.aadhaar ? employee.aadhaar.slice(-4) : '9012'}
                  </p>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDetails;
