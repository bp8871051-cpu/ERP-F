import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
  MapPin,
  Calendar,
  CreditCard,
  HeartHandshake,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';

export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    // Employee Identity
    employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '1995-05-15',

    // Contact Details
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',

    // Employment & Placement
    department_id: '',
    designation_id: '',
    joining_date: new Date().toISOString().slice(0, 10),
    employment_type: 'full_time',
    work_location: 'Headquarters',
    status: 'active',

    // User Account & Credentials
    create_user_account: true,
    role: 'Employee',
    password: '',
    password_confirmation: '',

    // Compensation & Banking
    salary: '',
    pay_frequency: 'monthly',
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc: '',

    // Statutory IDs
    pan: '',
    aadhaar: '',

    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadMeta = async () => {
      try {
        const [depRes, desRes, roleRes] = await Promise.all([
          hrmService.getDepartments().catch(() => []),
          hrmService.getDesignations().catch(() => []),
          hrmService.getRoles().catch(() => []),
        ]);

        if (!isMounted) return;

        const deps = Array.isArray(depRes) ? depRes : (Array.isArray(depRes?.data) ? depRes.data : []);
        const des = Array.isArray(desRes) ? desRes : (Array.isArray(desRes?.data) ? desRes.data : []);
        const rls = Array.isArray(roleRes) ? roleRes : (Array.isArray(roleRes?.data) ? roleRes.data : []);

        setDepartments(deps);
        setDesignations(des);
        setRoles(rls);

        if (!isEditing) {
          setFormData((prev) => ({
            ...prev,
            department_id: prev.department_id || (deps.length > 0 ? deps[0].id : ''),
            designation_id: prev.designation_id || (des.length > 0 ? des[0].id : ''),
            role: prev.role || (rls.find((r) => r.name === 'Employee')?.name || (rls[0]?.name || 'Employee')),
          }));
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      } finally {
        if (!isEditing && isMounted) setInitialLoading(false);
      }
    };

    loadMeta();
    return () => {
      isMounted = false;
    };
  }, [isEditing]);

  // Load existing employee data if editing
  useEffect(() => {
    let isMounted = true;
    if (isEditing) {
      const fetchEmployee = async () => {
        try {
          setInitialLoading(true);
          const emp = await hrmService.getEmployee(id);
          if (emp && isMounted) {
            setFormData((prev) => ({
              ...prev,
              ...emp,
              salary: emp.salary || '',
              department_id: emp.department_id || '',
              designation_id: emp.designation_id || '',
              role: emp.user?.role || 'Employee',
              password: '',
              password_confirmation: '',
            }));
          }
        } catch (err) {
          console.error('Failed to load employee for edit:', err);
          if (isMounted) showToast('Failed to load employee record', 'error');
        } finally {
          if (isMounted) setInitialLoading(false);
        }
      };
      fetchEmployee();
    }
    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // If user selected Department, intelligently auto-suggest corresponding ERP role
      if (name === 'department_id' && value) {
        const selectedDept = departments.find((d) => String(d.id) === String(value));
        if (selectedDept) {
          const dName = (selectedDept.name || '').toLowerCase();
          let matchedRole = '';
          if (dName.includes('hr') || dName.includes('human')) matchedRole = 'HR Manager';
          else if (dName.includes('store') || dName.includes('warehouse')) matchedRole = 'Store Executive';
          else if (dName.includes('service')) matchedRole = 'Service Engineer';
          else if (dName.includes('engineer') || dName.includes('tech')) matchedRole = 'Project Engineer';
          else if (dName.includes('quality') || dName.includes('qc')) matchedRole = 'Quality Control Manager';
          else if (dName.includes('sales')) matchedRole = 'Sales Manager';
          else if (dName.includes('license') || dName.includes('licens')) matchedRole = 'Licensing Manager';
          else if (dName.includes('doc') || dName.includes('file')) matchedRole = 'Document Manager';

          if (matchedRole) {
            // Verify if matchedRole exists in roles list or fallback
            const roleExists = roles.some((r) => (r.name || r) === matchedRole);
            if (roleExists || roles.length === 0) {
              updated.role = matchedRole;
            }
          }
        }
      }

      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name || !formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name || !formData.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!formData.email || !formData.email.trim()) errors.email = 'Corporate email is required.';
    if (!formData.employee_code || !formData.employee_code.trim()) errors.employee_code = 'Employee code is required.';
    if (!formData.phone || !formData.phone.trim()) errors.phone = 'Primary phone is required.';
    if (!formData.joining_date) errors.joining_date = 'Joining date is required.';

    if (!isEditing && formData.create_user_account) {
      if (!formData.password) {
        errors.password = 'Password is required to create User login.';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix required fields marked in red.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
      };

      if (isEditing) {
        await hrmService.updateEmployee(id, payload);
        showToast('Employee updated successfully');
      } else {
        await hrmService.createEmployee(payload);
        showToast('Employee onboarded & User created successfully!');
      }

      setTimeout(() => {
        navigate('/app/hrm/employees');
      }, 900);
    } catch (err) {
      console.error('Failed to save employee:', err);
      const resData = err.response?.data;
      let msg = resData?.message || 'Error saving employee. Verify email is unique.';
      
      // If there are specific validation error messages from backend, show the exact reason
      if (resData?.errors) {
        const errorKeys = Object.keys(resData.errors);
        if (errorKeys.length > 0) {
          const firstErrList = resData.errors[errorKeys[0]];
          if (Array.isArray(firstErrList) && firstErrList.length > 0) {
            msg = firstErrList[0];
          }
          // Highlight in formErrors
          const newErrors = {};
          errorKeys.forEach((key) => {
            newErrors[key] = resData.errors[key][0];
          });
          setFormErrors((prev) => ({ ...prev, ...newErrors }));
        }
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading employee onboarding details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hrm/employees"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Back to Employees"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Employee Profile' : 'Onboard New Staff Member'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                Single Page Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Establish employee identity, departmental assignment, system user login, and direct compensation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/hrm/employees"
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Changes' : 'Complete Onboarding'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: SYSTEM USER ACCOUNT & LOGIN CREDENTIALS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">System User Account & Login Credentials</h2>
                <p className="text-[11px] text-slate-500">
                  Sets User ID and login password for Falcon ERP. Displays in System &gt; User Management.
                </p>
              </div>
            </div>
            {!isEditing && (
              <label className="text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="create_user_account"
                  checked={formData.create_user_account}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>Create User Account</span>
              </label>
            )}
          </div>

          {(formData.create_user_account || isEditing) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* User ID / Corporate Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corporate Email (User ID) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="user@falconerp.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
                  />
                </div>
                {formErrors.email && <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>}
              </div>

              {/* Department Option in Credentials Section */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800 font-medium"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password {!isEditing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={isEditing ? 'Leave blank to retain password' : 'Min. 6 characters'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-[11px] text-rose-500 mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm Password {!isEditing && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    placeholder="Repeat new password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password_confirmation && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.password_confirmation}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: PERSONAL BIO INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information &amp; Bio</h2>
              <p className="text-[11px] text-slate-500">Employee legal name, employee code, gender, and date of birth.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="employee_code"
                required
                value={formData.employee_code}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono text-slate-800 font-semibold"
              />
              {formErrors.employee_code && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.employee_code}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                required
                placeholder="e.g. Rahul"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
              {formErrors.first_name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.first_name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                placeholder="e.g. Kumar"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                required
                placeholder="e.g. Sharma"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
              {formErrors.last_name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.last_name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none bg-white text-slate-800"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                />
              </div>
              {formErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alternate Phone</label>
              <input
                type="tel"
                name="alternate_phone"
                placeholder="Optional"
                value={formData.alternate_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CONTACT DETAILS & RESIDENTIAL ADDRESS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Residential Address &amp; Location</h2>
              <p className="text-[11px] text-slate-500">Street address, city, state, postal code, and country.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Residential Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="House No., Building, Street Name, Area"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
              />
              {formErrors.address && <p className="text-[11px] text-rose-500 mt-1">{formErrors.address}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Ahmedabad, Mumbai"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.city && <p className="text-[11px] text-rose-500 mt-1">{formErrors.city}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                State / Province <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Gujarat, Maharashtra"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.state && <p className="text-[11px] text-rose-500 mt-1">{formErrors.state}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code (PIN)</label>
              <input
                type="text"
                name="postal_code"
                placeholder="e.g. 380015"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: EMPLOYMENT & ORGANIZATIONAL PLACEMENT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Employment &amp; Department Placement</h2>
              <p className="text-[11px] text-slate-500">Designation, assigned ERP role, joining date, and employment type.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned ERP Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800 font-medium"
                >
                  {roles.length > 0 ? (
                    roles.map((r) => (
                      <option key={r.id || r.name} value={r.name}>
                        {r.display_name || r.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Employee">Employee</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Store Executive">Store Executive</option>
                      <option value="Service Engineer">Service Engineer</option>
                      <option value="Project Engineer">Project Engineer</option>
                      <option value="Quality Control Manager">Quality Control Manager</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Licensing Manager">Licensing Manager</option>
                      <option value="Document Manager">Document Manager</option>
                      <option value="Super Admin">Super Admin</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <select
                name="designation_id"
                required
                value={formData.designation_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800 font-medium"
              >
                <option value="">Select Designation...</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title || d.name}
                  </option>
                ))}
              </select>
              {formErrors.designation_id && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.designation_id}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Joining Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="joining_date"
                required
                value={formData.joining_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              >
                <option value="full_time">Full-Time Regular</option>
                <option value="part_time">Part-Time</option>
                <option value="contract">Contractor / Consultant</option>
                <option value="intern">Internship</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
              <input
                type="text"
                name="work_location"
                placeholder="Headquarters / Site Office"
                value={formData.work_location}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800 font-medium"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="probation">Probationary</option>
                <option value="resigned">Resigned</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 5: COMPENSATION & DIRECT DEPOSIT BANK DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compensation &amp; Direct Deposit Bank Details</h2>
              <p className="text-[11px] text-slate-500">Monthly CTC, bank account information, and statutory tax IDs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monthly Gross / CTC (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                required
                placeholder="e.g. 50000"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 font-semibold"
              />
              {formErrors.salary && <p className="text-[11px] text-rose-500 mt-1">{formErrors.salary}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pay Frequency <span className="text-rose-500">*</span>
              </label>
              <select
                name="pay_frequency"
                required
                value={formData.pay_frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800 font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="bi_weekly">Bi-Weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="bank_name"
                required
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.bank_name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.bank_name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="account_holder"
                required
                placeholder="Full name as in bank passbook"
                value={formData.account_holder}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.account_holder && <p className="text-[11px] text-rose-500 mt-1">{formErrors.account_holder}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="account_number"
                required
                placeholder="e.g. 5010023948291"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none font-mono text-slate-800"
              />
              {formErrors.account_number && <p className="text-[11px] text-rose-500 mt-1">{formErrors.account_number}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="ifsc"
                required
                placeholder="e.g. HDFC0000128"
                value={formData.ifsc}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none font-mono uppercase text-slate-800"
              />
              {formErrors.ifsc && <p className="text-[11px] text-rose-500 mt-1">{formErrors.ifsc}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                PAN Card Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="pan"
                required
                placeholder="e.g. ABCDE1234F"
                value={formData.pan}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none font-mono uppercase text-slate-800"
              />
              {formErrors.pan && <p className="text-[11px] text-rose-500 mt-1">{formErrors.pan}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aadhaar Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="aadhaar"
                required
                placeholder="e.g. 2341 5678 9012"
                value={formData.aadhaar}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none font-mono text-slate-800"
              />
              {formErrors.aadhaar && <p className="text-[11px] text-rose-500 mt-1">{formErrors.aadhaar}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 6: EMERGENCY CONTACT INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Emergency Contact Person</h2>
              <p className="text-[11px] text-slate-500">Contact person details in case of medical or site emergency.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                required
                placeholder="e.g. Rajesh Sharma"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.emergency_contact_name && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.emergency_contact_name}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Relationship <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="emergency_contact_relationship"
                required
                placeholder="e.g. Spouse / Father / Brother"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.emergency_contact_relationship && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.emergency_contact_relationship}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Emergency Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="emergency_contact_phone"
                required
                placeholder="+91 98765 43210"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl outline-none text-slate-800"
              />
              {formErrors.emergency_contact_phone && (
                <p className="text-[11px] text-rose-500 mt-1">{formErrors.emergency_contact_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Link
            to="/app/hrm/employees"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Onboarding Employee &amp; Creating User...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Changes' : 'Complete Onboarding & Create User Account'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeCreate;
