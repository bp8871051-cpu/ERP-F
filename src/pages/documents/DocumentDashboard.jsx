import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderClosed,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  Calendar,
  Layers,
  Building2,
  ShieldCheck,
  Scale,
  GitPullRequest,
  Plus,
  ArrowRight,
  UploadCloud,
  Share2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import documentService from '../../services/documentService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'];

export const DocumentDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await documentService.getDashboardData();
      setData(res.data || res);
    } catch (err) {
      console.error('Failed to load document dashboard:', err);
      setError('Unable to load document metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  const s = data?.summary || {
    total_documents: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    expiring_documents: 0,
    compliance_documents: 0,
    storage_used_mb: 0,
    uploaded_this_month: 0,
  };

  const byTypeData = (data?.by_type || [
    { type: 'PDF', count: 48 },
    { type: 'DOCX', count: 24 },
    { type: 'XLSX', count: 32 },
    { type: 'Images', count: 18 },
    { type: 'Other', count: 12 },
  ]).map((t) => ({ name: t.type, value: Number(t.count) }));

  const byDepartmentData = (data?.by_department || [
    { department: 'HR', count: 28 },
    { department: 'Finance', count: 36 },
    { department: 'Legal', count: 19 },
    { department: 'Operations', count: 22 },
    { department: 'Sales', count: 15 },
  ]).map((d) => ({ name: d.department, count: Number(d.count) }));

  const uploadTrend = data?.upload_trend || [
    { month: 'May', uploads: 14, approved: 12 },
    { month: 'Jun', uploads: 22, approved: 19 },
    { month: 'Jul', uploads: 18, approved: 17 },
    { month: 'Aug', uploads: 31, approved: 26 },
    { month: 'Sep', uploads: 29, approved: 24 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderClosed className="w-5 h-5 text-teal-600" />
            Enterprise Document Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository, version control, multi-level approval workflows, and regulatory compliance records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/documents/compliance')}
            className="text-xs"
          >
            <Scale className="w-3.5 h-3.5 mr-1 text-teal-600" /> Compliance Docs
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/documents/repository')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1" /> Open Repository
          </Button>
        </div>
      </div>

      {/* 8 KPI Executive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Files</span>
            <FileText className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{s.total_documents}</p>
          <span className="text-[10px] text-slate-400">All registered docs</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-600 mt-1">{s.pending_approval}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs review</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Approved</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{s.approved}</p>
          <span className="text-[10px] text-slate-400">Officially verified</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-lg font-bold text-rose-600 mt-1">{s.rejected}</p>
          <span className="text-[10px] text-slate-400">Revision requested</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Expiring</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-lg font-bold text-orange-600 mt-1">{s.expiring_documents}</p>
          <span className="text-[10px] text-orange-500 font-medium">Renewal due</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Compliance</span>
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-indigo-600 mt-1">{s.compliance_documents}</p>
          <span className="text-[10px] text-slate-400">ISO, GST, Licenses</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Storage</span>
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-lg font-bold text-slate-800 mt-1">{Number(s.storage_used_mb || 48.5).toFixed(1)} MB</p>
          <span className="text-[10px] text-slate-400">Disk capacity used</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">This Month</span>
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="text-lg font-bold text-teal-600 mt-1">{s.uploaded_this_month}</p>
          <span className="text-[10px] text-teal-600 font-medium">New uploads</span>
        </Card>
      </div>

      {/* Row 1: Upload Trend + Document Types Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Approval Velocity Line Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Document Upload & Approval Velocity</h3>
                <p className="text-xs text-slate-500">Monthly upload volumes vs workflow approval throughput</p>
              </div>
              <Badge variant="info">Throughput</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uploadTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="uploads" name="Uploaded Docs" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="approved" name="Approved Docs" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Documents by Type Pie (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Documents by File Format</h3>
              <span className="text-xs text-slate-400">File Type Split</span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {byTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Documents Distributed Across Departments</h3>
              <span className="text-xs text-slate-400">Department Ownership</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDepartmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Files" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick Operations Modules Links */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {[
            {
              title: 'Document Repository',
              desc: 'Browse folders, upload new files, manage version history',
              route: '/app/documents/repository',
              icon: FolderClosed,
              color: 'text-teal-600 bg-teal-50',
            },
            {
              title: 'Policies & Manuals',
              desc: 'Corporate, HR, IT security manuals with approval lifecycles',
              route: '/app/documents/policies',
              icon: ShieldCheck,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              title: 'Regulatory Compliance Docs',
              desc: 'GST filings, ISO certificates, licenses with automated expiry alerts',
              route: '/app/documents/compliance',
              icon: Scale,
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              title: 'Approval Workflow Designer',
              desc: 'Configure review, manager, finance, and legal sign-off stages',
              route: '/app/documents/workflows',
              icon: GitPullRequest,
              color: 'text-purple-600 bg-purple-50',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(item.route)}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentDashboard;
