import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Building,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@falconerp.com',
      password: 'password',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setAuthError(null);
      await login(data.email, data.password);
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response || err.code === 'ERR_NETWORK') {
        setAuthError(
          'Cannot connect to backend API (http://localhost:8000). Please start the Laravel backend server and MySQL.'
        );
      } else {
        setAuthError(
          err.response?.data?.message ||
          'Authentication failed. Please verify your credentials.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@falconerp.com' },
    { role: 'HR Manager', email: 'hr@falconerp.com' },
    { role: 'Inventory Mgr', email: 'inventory@falconerp.com' },
    { role: 'CRM Manager', email: 'crm@falconerp.com' },
    { role: 'Finance Mgr', email: 'finance@falconerp.com' },
    { role: 'Sales Manager', email: 'sales@falconerp.com' },
  ];

  return (
    <div className="max-w-md w-full mx-auto px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          F
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Falcon ERP Platform
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enterprise Resource Planning & Autonomous Operations
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8">
        {authError && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                {...register('email')}
                className={`w-full bg-slate-50 border ${
                  errors.email ? 'border-rose-400' : 'border-slate-200'
                } rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                placeholder="name@company.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Demo environment: all passwords are "password"')}
                className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                {...register('password')}
                className={`w-full bg-slate-50 border ${
                  errors.password ? 'border-rose-400' : 'border-slate-200'
                } rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="teal"
              size="lg"
              className="w-full !py-2.5 text-sm font-semibold shadow-sm"
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to ERP
            </Button>
          </div>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            One-Click Demo Roles
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setValue('email', acc.email);
                  setValue('password', 'password');
                }}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 text-[11px] font-medium text-slate-600 transition-colors text-center cursor-pointer truncate"
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

