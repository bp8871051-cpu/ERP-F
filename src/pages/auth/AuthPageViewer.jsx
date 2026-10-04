import React, { useState } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Layers,
  ArrowLeft,
  RefreshCw,
  Send,
} from 'lucide-react';

export const AuthPageViewer = ({ page: propPage, variant: propVariant }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page and variant from props or pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  // e.g. ['authentication', 'login', 'cover']
  const detectedPage = propPage || (pathParts[1] || 'login');
  const detectedVariant = propVariant || (pathParts[2] || 'basic');

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const titles = {
    login: {
      title: 'Welcome back to Falcon ERP',
      subtitle: 'Sign in to access your enterprise dashboard and operations',
      btnText: 'Sign In to Account',
    },
    register: {
      title: 'Create Enterprise Account',
      subtitle: 'Start your 30-day all-access trial with multi-tenant workspace',
      btnText: 'Create Account',
    },
    'forgot-password': {
      title: 'Reset Account Password',
      subtitle: 'Enter your registered corporate email to receive a recovery link',
      btnText: 'Send Reset Instructions',
    },
    'reset-password': {
      title: 'Set New Password',
      subtitle: 'Ensure your new password has at least 8 characters with numbers',
      btnText: 'Update & Secure Password',
    },
    'email-verification': {
      title: 'Verify Your Email Address',
      subtitle: 'We sent a 6-digit confirmation security code to your work email',
      btnText: 'Verify & Continue',
    },
  };

  const currentInfo = titles[detectedPage] || titles.login;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (detectedPage === 'login') {
        navigate('/app/dashboard');
      }
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Render the core form component
  const renderFormContent = () => (
    <div className="w-full max-w-md mx-auto">
      {/* Page Header */}
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-semibold text-teal-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="capitalize">{detectedPage.replace('-', ' ')}</span> &bull;{' '}
          <span className="capitalize">{detectedVariant} Layout</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {currentInfo.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{currentInfo.subtitle}</p>
      </div>

      {submitted && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {detectedPage === 'login'
              ? 'Login verified! Navigating to your ERP dashboard...'
              : 'Action completed successfully! Check your notifications.'}
          </span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* LOGIN FIELDS */}
        {detectedPage === 'login' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  defaultValue="admin@falconerp.com"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <NavLink
                  to="/authentication/forgot-password/basic"
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot password?
                </NavLink>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span>Remember this workstation</span>
              </label>
            </div>
          </>
        )}

        {/* REGISTER FIELDS */}
        {detectedPage === 'register' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Alexander Wright"
                  defaultValue="Alexander Wright"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alexander@falconerp.com"
                  defaultValue="alexander@falconerp.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Falcon Enterprises Ltd."
                  defaultValue="Falcon Enterprises Ltd."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Create Secure Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  defaultValue="SecurePass2026!"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <input
                type="checkbox"
                defaultChecked
                required
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="text-teal-600 font-semibold underline">
                  Terms of Service
                </a>{' '}
                and Privacy Policy
              </span>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD FIELDS */}
        {detectedPage === 'forgot-password' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  defaultValue="admin@falconerp.com"
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We'll send an authentication recovery link with a token valid for 30 minutes. Check your junk folder if not received.
            </p>
          </>
        )}

        {/* RESET PASSWORD FIELDS */}
        {detectedPage === 'reset-password' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="New password (8+ chars)"
                  defaultValue="NewFalconPass2026!"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Confirm matching password"
                  defaultValue="NewFalconPass2026!"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Password strength */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Password Strength</span>
                <span className="text-teal-600 font-semibold">Strong</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className="h-full w-1/4 bg-teal-500 rounded-full" />
                <div className="h-full w-1/4 bg-teal-500 rounded-full" />
                <div className="h-full w-1/4 bg-teal-500 rounded-full" />
                <div className="h-full w-1/4 bg-teal-500 rounded-full" />
              </div>
            </div>
          </>
        )}

        {/* EMAIL VERIFICATION FIELDS */}
        {detectedPage === 'email-verification' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 text-center">
              Please enter the 6-digit verification code sent to <br />
              <strong className="text-slate-800">admin@falconerp.com</strong>
            </p>

            <div className="flex justify-center gap-2 sm:gap-3 py-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 h-12 text-center text-lg font-bold border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-slate-900 transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 mx-auto cursor-pointer"
                onClick={() => setOtp(['7', '2', '9', '4', '1', '5'])}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fill Demo Code (729415)</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <span>{currentInfo.btnText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Alternate Navigation Links */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {detectedPage !== 'login' ? (
            <NavLink
              to="/authentication/login/basic"
              className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </NavLink>
          ) : (
            <NavLink
              to="/authentication/register/basic"
              className="text-teal-600 hover:text-teal-700 font-semibold"
            >
              Don't have an account? Sign up
            </NavLink>
          )}

          <span className="text-[11px] text-slate-400">Falcon ERP v2.4</span>
        </div>
      </form>
    </div>
  );

  // 1. BASIC VARIANT: Centered Card Layout
  if (detectedVariant === 'basic') {
    return (
      <div className="w-full py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8">
          {renderFormContent()}
        </div>
      </div>
    );
  }

  // 2. COVER VARIANT: Split-Screen Hero & Enterprise Brand Visual
  if (detectedVariant === 'cover') {
    return (
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden my-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Hero Cover */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F8B7A] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xl mb-6 shadow-xs">
                F
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                Enterprise Autonomous Operations
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamlessly unify Supply Chain, Multi-channel POS, Automated Financials, and Smart Human Capital under one SOC-2 compliant platform.
              </p>
            </div>

            {/* Metrics Widget */}
            <div className="my-8 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                  API SLA Reliability
                </span>
                <span className="font-semibold text-teal-300">99.98%</span>
              </div>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full w-[99.98%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Encrypted with AES-256</span>
                <span>Audit Logs Active</span>
              </div>
            </div>

            {/* Testimonial footer */}
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
              &ldquo;Falcon ERP accelerated our quarterly order fulfillment by 340% with zero downtime.&rdquo;
              <p className="text-slate-300 font-semibold mt-1">&mdash; Global Operations Team</p>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-slate-50/50">
            {renderFormContent()}
          </div>
        </div>
      </div>
    );
  }

  // 3. ILLUSTRATION VARIANT: Modern Vector Illustration and Security Badges
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden my-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Illustration Container */}
        <div className="lg:col-span-5 bg-gradient-to-b from-teal-50/70 via-slate-50 to-white p-8 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-slate-200/80 relative">
          {/* Custom Modern SVG Enterprise Illustration */}
          <div className="relative w-64 h-64 mb-6">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="240" height="240" rx="32" fill="#F0FDFA" />
              <circle cx="120" cy="120" r="80" fill="#CCFBF1" fillOpacity="0.6" />
              {/* Central Server / Vault */}
              <rect
                x="60"
                y="70"
                width="120"
                height="100"
                rx="16"
                fill="#1E293B"
                stroke="#0F8B7A"
                strokeWidth="3"
              />
              <rect x="75" y="90" width="90" height="12" rx="4" fill="#334155" />
              <circle cx="85" cy="96" r="3" fill="#14B8A6" />
              <rect x="75" y="112" width="90" height="12" rx="4" fill="#334155" />
              <circle cx="85" cy="118" r="3" fill="#38BDF8" />
              <rect x="75" y="134" width="90" height="12" rx="4" fill="#334155" />
              <circle cx="85" cy="140" r="3" fill="#A855F7" />
              {/* Floating Shield */}
              <g transform="translate(100, 40)">
                <path
                  d="M20 0L40 10V25C40 37.5 31.5 49 20 54C8.5 49 0 37.5 0 25V10L20 0Z"
                  fill="#0F8B7A"
                />
                <path
                  d="M12 26L18 32L30 18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          <h4 className="text-base font-bold text-slate-800">
            Multi-Layer Security Framework
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5">
            Strict tenant isolation, Sanctum session management, and encrypted identity verification protocol.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
              Sanctum 4.0
            </span>
            <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-semibold border border-teal-200">
              Zero-Trust Guard
            </span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex items-center justify-center">
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthPageViewer;
