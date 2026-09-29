import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Shield,
  HeartHandshake,
  Calendar,
  MapPin,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [activeTab, setActiveTab] = useState('personal'); // personal, contact, employment, financial, government, emergency

  const [formData, setFormData] = useState({
    // Personal
    employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '1995-05-15',

    // Contact
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',

    // Employment
    department_id: '',
    designation_id: '',
    joining_date: new Date().toISOString().slice(0, 10),
    employment_type: 'full_time',
    work_location: 'Headquarters',
    status: 'active',

    // Financial
    salary: '',
    pay_frequency: 'monthly',
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc: '',

    // Government
    pan: '',
    aadhaar: '',

    // Emergency
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [depRes, desRes] = await Promise.all([
          hrmService.getDepartments(),
          hrmService.getDesignations(),
        ]);
        setDepartments(depRes || []);
        setDesignations(desRes || []);
        if (depRes && depRes.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: depRes[0].id }));
        }
        if (desRes && desRes.length > 0) {
          setFormData((prev) => ({ ...prev, designation_id: desRes[0].id }));
        }
      } catch (err) {
        console.error('Failed to load HR metadata:', err);
      }
    };
    loadMeta();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.first_name) errors.first_name = 'First name is required.';
    if (!formData.last_name) errors.last_name = 'Last name is required.';
    if (!formData.email) errors.email = 'Valid corporate email is required.';
    if (!formData.employee_code) errors.employee_code = 'Employee code is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setActiveTab('personal');
      return;
    }

    try {
      setLoading(true);
      await hrmService.createEmployee({
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
      });
      navigate('/app/hrm/employees');
    } catch (err) {
      console.error('Failed to onboard employee:', err);
      alert(err.response?.data?.message || 'Error saving employee record. Check email uniqueness.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hrm/employees"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Onboard New Staff Member</h1>
            <p className="text-xs text-slate-500">
              Establish employee identity, departmental assignment, banking details, and statutory identity.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
          { id: 'personal', label: '1. Personal Profile', icon: User },
          { id: 'contact', label: '2. Contact & Address', icon: Mail },
          { id: 'employment', label: '3. Role & Placement', icon: Briefcase },
          { id: 'financial', label: '4. Compensation & Bank', icon: DollarSign },
          { id: 'government', label: '5. Statutory & IDs', icon: Shield },
          { id: 'emergency', label: '6. Emergency Contact', icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: PERSONAL */}
        {activeTab === 'personal' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Staff Bio Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Employee ID / Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
                {formErrors.employee_code && (
                  <p className="text-[10px] text-rose-500 mt-1">{formErrors.employee_code}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white capitalize"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
                {formErrors.first_name && (
                  <p className="text-[10px] text-rose-500 mt-1">{formErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
                {formErrors.last_name && (
                  <p className="text-[10px] text-rose-500 mt-1">{formErrors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 2: CONTACT */}
        {activeTab === 'contact' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Contact Details & Residential Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
                {formErrors.email && (
                  <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Residential Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 3: EMPLOYMENT */}
        {activeTab === 'employment' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Organizational Assignment & Contract</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Designation / Title</label>
                <select
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                >
                  {designations.map((des) => (
                    <option key={des.id} value={des.id}>
                      {des.name} ({des.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contractor</option>
                  <option value="intern">Intern</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Location</label>
                <input
                  type="text"
                  name="work_location"
                  value={formData.work_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Employment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 4: FINANCIAL */}
        {activeTab === 'financial' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Compensation & Direct Deposit Bank</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Base Monthly Salary (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="salary"
                  placeholder="e.g. 85000.00"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pay Frequency</label>
                <select
                  name="pay_frequency"
                  value={formData.pay_frequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  placeholder="e.g. HDFC Bank, ICICI"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  placeholder="e.g. 5010023456789"
                  value={formData.account_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">IFSC / Routing Code</label>
                <input
                  type="text"
                  name="ifsc"
                  placeholder="e.g. HDFC0001234"
                  value={formData.ifsc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white uppercase font-mono"
                />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 5: GOVERNMENT */}
        {activeTab === 'government' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Statutory Tax Identification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  name="pan"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Aadhaar / National ID</label>
                <input
                  type="text"
                  name="aadhaar"
                  placeholder="1234 5678 9012"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-mono"
                />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 6: EMERGENCY */}
        {activeTab === 'emergency' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse, Parent"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link to="/app/hrm/employees">
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="teal" size="sm" loading={loading} icon={Save}>
              Complete Onboarding
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeCreate;
