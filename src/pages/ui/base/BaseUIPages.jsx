import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
  ChevronDown,
  User,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  MoreVertical,
  ArrowRight,
  Maximize2,
  Copy,
  Check,
  Loader2,
  Eye,
  Sliders,
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';
import UIDemoCard from '../../../components/ui/interface/UIDemoCard';

// 1. ALERTS PAGE
export const AlertsPage = () => {
  const [alerts, setAlerts] = useState({
    success: true,
    info: true,
    warning: true,
    error: true,
    dismissible: true,
  });

  const dismiss = (key) => setAlerts((prev) => ({ ...prev, [key]: false }));
  const resetAll = () => setAlerts({ success: true, info: true, warning: true, error: true, dismissible: true });

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Alerts"
        description="Provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages."
        actions={
          <button
            type="button"
            onClick={resetAll}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            Reset All Alerts
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard
          title="Contextual Alerts"
          subtitle="Alerts are available for any length of text, as well as an optional dismiss button."
          code={`<div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
  <span>Success alert: Database migrations executed successfully!</span>
</div>`}
        >
          <div className="space-y-3">
            {alerts.success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Success!</strong> All 140+ database tables synchronized cleanly.</span>
                </div>
                <button type="button" onClick={() => dismiss('success')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {alerts.info && (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start justify-between gap-3 text-xs text-sky-800">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <span><strong>Notice:</strong> Sanctum API session expires in 120 minutes.</span>
                </div>
                <button type="button" onClick={() => dismiss('info')} className="text-sky-600 hover:text-sky-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {alerts.warning && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-800">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Warning:</strong> Low stock alert for warehouse inventory SKU #489.</span>
                </div>
                <button type="button" onClick={() => dismiss('warning')} className="text-amber-600 hover:text-amber-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {alerts.error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>Error:</strong> Failed to connect to third-party webhook gateway.</span>
                </div>
                <button type="button" onClick={() => dismiss('error')} className="text-rose-600 hover:text-rose-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </UIDemoCard>

        <UIDemoCard
          title="Dismissible Alert with Custom Actions"
          subtitle="Interactive banner alerts with affirmative response buttons."
        >
          {alerts.dismissible ? (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/90 text-teal-900 text-xs">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-teal-950">System Maintenance Notice</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Zero-downtime database optimization is scheduled tonight at 02:00 UTC. Background jobs will be queued.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => dismiss('dismissible')}
                      className="px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 cursor-pointer"
                    >
                      Acknowledge
                    </button>
                    <button
                      type="button"
                      onClick={() => dismiss('dismissible')}
                      className="px-3 py-1 rounded-lg border border-teal-300 text-teal-800 font-semibold text-xs hover:bg-teal-100/60 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">Alert dismissed. Click below to restore.</p>
              <button
                type="button"
                onClick={() => setAlerts((prev) => ({ ...prev, dismissible: true }))}
                className="mt-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold hover:bg-teal-100 cursor-pointer"
              >
                Restore Alert
              </button>
            </div>
          )}
        </UIDemoCard>
      </div>
    </div>
  );
};

// 2. ACCORDION PAGE
export const AccordionPage = () => {
  const [openItems, setOpenItems] = useState([1]);

  const toggle = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const faq = [
    { id: 1, title: 'What is Falcon ERP Architecture?', content: 'Falcon ERP uses a decoupled React 19 frontend, Laravel 12 API backend, MySQL 8 database, and FilamentPHP v5 administration panel with Sanctum token authentication.' },
    { id: 2, title: 'How does Multi-Tenant Company Isolation work?', content: 'Each company record is scoped by company_id foreign key constraints and validated across all service-layer repositories and audit logging handlers.' },
    { id: 3, title: 'Can multiple accordions remain open at once?', content: 'Yes! The independent state array permits multiple items to remain expanded simultaneously without closing sibling sections.' },
    { id: 4, title: 'How do I export Data Table records?', content: 'Click the Export CSV button in the Data Table header to trigger the backend streaming CSV generator directly from MySQL.' },
  ];

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Accordion"
        description="Build vertically collapsing accordions with custom icons, independent multi-open states, and animated height transitions."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Multi-Open Enterprise Accordion" subtitle="Allows one or more items to be expanded simultaneously.">
          <div className="space-y-2">
            {faq.map((item) => {
              const isOpen = openItems.includes(item.id);
              return (
                <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                  >
                    <span>{item.title}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-teal-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </UIDemoCard>

        <UIDemoCard title="Flush Borderless Accordion" subtitle="Clean minimalist accordion with soft left borders for documentation.">
          <div className="space-y-3">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-4 rounded-xl bg-slate-50 border-l-4 border-teal-500">
                <h4 className="text-xs font-bold text-slate-800">Module Specification #{num}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enterprise-grade response format with structured JSON payloads, metadata pagination, and audit logs.
                </p>
              </div>
            ))}
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 3. AVATAR PAGE
export const AvatarPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Avatar"
        description="Display user profile images, alphanumeric initials, presence status indicators, and stacked avatar groups."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Avatar Sizes" subtitle="Available in xs, sm, md, lg, xl and 2xl diameters.">
          <div className="flex flex-wrap items-center gap-4">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar XS" className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-100" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar SM" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar MD" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar LG" className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Avatar XL" className="w-18 h-18 rounded-full object-cover ring-2 ring-teal-500/50 shadow-md" />
          </div>
        </UIDemoCard>

        <UIDemoCard title="Status Presence Indicators" subtitle="Displays live presence: Online, Away, Busy, Offline.">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120" alt="User" className="w-12 h-12 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
            </div>

            <div className="relative">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" alt="User" className="w-12 h-12 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-white" title="Away" />
            </div>

            <div className="relative">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120" alt="User" className="w-12 h-12 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white" title="Busy" />
            </div>

            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                AW
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 ring-2 ring-white" title="Offline" />
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Avatar Stack / Group" subtitle="Overlap team members with total remaining counter.">
          <div className="flex -space-x-3 overflow-hidden py-2">
            {['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1494790108377-be9c29b29330', '1500648767791-00dcc994a43e'].map((id, idx) => (
              <img
                key={idx}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                src={`https://images.unsplash.com/photo-${id}?w=100`}
                alt="Stack member"
              />
            ))}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-white text-xs font-bold ring-2 ring-white">
              +18
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Alphanumeric Initials & Shapes" subtitle="Square with rounded corners and contrasting background gradients.">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              FE
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              HR
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              PO
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              CR
            </div>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 4. BADGES PAGE
export const BadgesPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Badges"
        description="Documentation and examples for badges, small count and labeling components."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Solid Contextual Badges" subtitle="Primary, Secondary, Success, Warning, Danger, Info.">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-white">Primary</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-600 text-white">Secondary / Teal</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white">Success</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white">Warning</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white">Danger</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-600 text-white">Info</span>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Soft / Light Pill Badges" subtitle="Pastel background with high-contrast text and rounded pill border.">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">Default</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Active</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending Review</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Suspended</span>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Dot Indicator Badges" subtitle="Compact badge paired with an animated or solid status dot.">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Server
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Syncing
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Delayed
            </span>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 5. BUTTONS PAGE
export const ButtonsPage = () => {
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Buttons"
        description="Custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and icons."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Standard Variant Buttons" subtitle="Primary, Secondary, Success, Warning, Danger.">
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
              Primary Navy
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
              Secondary Teal
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
              Success
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
              Warning
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
              Danger
            </button>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Outline & Ghost Buttons" subtitle="Minimalist outline and transparent hover backgrounds.">
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-800 font-semibold text-xs transition-all cursor-pointer">
              Outline Dark
            </button>
            <button type="button" className="px-4 py-2 rounded-xl border border-teal-500 text-teal-600 hover:bg-teal-50 font-semibold text-xs transition-all cursor-pointer">
              Outline Teal
            </button>
            <button type="button" className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-all cursor-pointer">
              Outline Danger
            </button>
            <button type="button" className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-all cursor-pointer">
              Ghost Button
            </button>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Loading State & Disabled" subtitle="Interactive spinner state and disabled opacity rules.">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={simulateLoading}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Processing Order...' : 'Click for Loading State'}</span>
            </button>

            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-400 font-semibold text-xs cursor-not-allowed"
            >
              Disabled Action
            </button>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Button Sizes" subtitle="Small, Medium, and Large padding scales.">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-[11px] font-semibold">
              Small (sm)
            </button>
            <button type="button" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
              Medium (md)
            </button>
            <button type="button" className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold">
              Large (lg)
            </button>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 6. BUTTON GROUP PAGE
export const ButtonGroupPage = () => {
  const [selectedView, setSelectedView] = useState('month');

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Button Group"
        description="Group a series of buttons together on a single line or stack them in a vertical column."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Horizontal Segmented Control" subtitle="Single selection view switcher.">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            {['day', 'week', 'month', 'year'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedView(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedView === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">Currently active: <strong>{selectedView}</strong> view</p>
        </UIDemoCard>

        <UIDemoCard title="Connected Action Group" subtitle="Buttons joined with shared borders.">
          <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-slate-200">
            <button type="button" className="px-4 py-2 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer">
              Left
            </button>
            <button type="button" className="px-4 py-2 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer">
              Middle
            </button>
            <button type="button" className="px-4 py-2 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Right
            </button>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 7. BREADCRUMB PAGE
export const BreadcrumbPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Breadcrumb"
        description="Indicate the current page location within a navigational hierarchy that automatically adds separators."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Chevron Separator" subtitle="Standard modern enterprise navigation crumb.">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer">Home</span>
            <span className="text-slate-400">/</span>
            <span className="hover:text-slate-800 cursor-pointer">Inventory</span>
            <span className="text-slate-400">/</span>
            <span className="hover:text-slate-800 cursor-pointer">Products</span>
            <span className="text-slate-400">/</span>
            <span className="text-teal-600 font-semibold">SKU #82910</span>
          </nav>
        </UIDemoCard>

        <UIDemoCard title="Icon Breadcrumb with Background Pill" subtitle="Enclosed container breadcrumb styling.">
          <nav className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-600">
            <span>Falcon ERP</span>
            <span className="text-slate-400">&gt;</span>
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-teal-600 font-bold">General Ledger</span>
          </nav>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 8. CARD PAGE
export const CardPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Cards"
        description="Flexible and extensible content container with options for headers, footers, wide content varieties, and contextual background colors."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800">Basic Card</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Minimal container with standard padding, clean border radius, and subtle shadow.
          </p>
          <button type="button" className="mt-4 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs cursor-pointer">
            Explore
          </button>
        </div>

        {/* Image Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500"
            alt="Enterprise Office"
            className="w-full h-36 object-cover"
          />
          <div className="p-5">
            <h3 className="font-bold text-sm text-slate-800">Visual Image Card</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Featuring a high-resolution banner image with descriptive body text.
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400">Total Net Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-white">$4,892,100</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-700/60">
            Automated sync with Stripe & Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

// 9. COLORS PAGE
export const ColorsPage = () => {
  const [copiedColor, setCopiedColor] = useState(null);

  const colors = [
    { name: 'Primary Dark Navy', hex: '#1E293B', bg: 'bg-[#1E293B]', text: 'text-white' },
    { name: 'Secondary Teal', hex: '#0F8B7A', bg: 'bg-[#0F8B7A]', text: 'text-white' },
    { name: 'Teal Accent 500', hex: '#14B8A6', bg: 'bg-teal-500', text: 'text-white' },
    { name: 'Accent Blue', hex: '#2563EB', bg: 'bg-blue-600', text: 'text-white' },
    { name: 'Success Emerald', hex: '#059669', bg: 'bg-emerald-600', text: 'text-white' },
    { name: 'Warning Amber', hex: '#D97706', bg: 'bg-amber-600', text: 'text-white' },
    { name: 'Danger Rose', hex: '#E11D48', bg: 'bg-rose-600', text: 'text-white' },
    { name: 'Canvas Slate 50', hex: '#F8FAFC', bg: 'bg-slate-100', text: 'text-slate-800' },
  ];

  const copy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Colors"
        description="Theme color palette tokens utilized throughout the Falcon ERP design system. Click any swatch to copy HEX code."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {colors.map((c) => (
          <div
            key={c.hex}
            onClick={() => copy(c.hex)}
            className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs cursor-pointer hover:shadow-md transition-all group"
          >
            <div className={`h-24 ${c.bg} flex items-center justify-center`}>
              {copiedColor === c.hex && (
                <span className="px-2 py-1 rounded bg-black/60 text-white text-[10px] font-bold">
                  Copied!
                </span>
              )}
            </div>
            <div className="p-3">
              <h4 className="text-xs font-bold text-slate-800">{c.name}</h4>
              <p className="text-[11px] font-mono text-slate-400 group-hover:text-teal-600 transition-colors">
                {c.hex}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. COLLAPSE PAGE
export const CollapsePage = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Collapse"
        description="Toggle the visibility of content across your project with a few classes and reactive hooks."
      />

      <UIDemoCard title="Interactive Content Toggle" subtitle="Click the trigger button below to show and hide content dynamically.">
        <div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            {collapsed ? 'Expand Content' : 'Collapse Content'}
          </button>

          {!collapsed && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-1">Dynamic Collapsible Container</h4>
              This container is rendered reactively. It supports complex layouts, nested grids, and forms without disrupting neighboring document layout flow.
            </div>
          )}
        </div>
      </UIDemoCard>
    </div>
  );
};

// 11. DROPDOWNS PAGE
export const DropdownsPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Dropdowns"
        description="Toggle contextual overlays for displaying lists of links and more with responsive positioning."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Action Dropdown Menu" subtitle="Standard click-to-open popover menu.">
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <span>Manage Entity</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {open && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-20 text-xs text-slate-700">
                <button type="button" onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  Edit Record
                </button>
                <button type="button" onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Duplicate
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button type="button" onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 12. GRID PAGE
export const GridPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Grid"
        description="Responsive 12-column layout grid system powered by Tailwind CSS CSS-Grid and Flexbox."
      />

      <UIDemoCard title="12-Column Responsive Layout Showcase" subtitle="Visual preview of multi-column span ratios.">
        <div className="space-y-3 text-center text-xs font-mono font-semibold">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl">col-span-12</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl">col-span-6</div>
            <div className="col-span-6 p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl">col-span-6</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl">col-span-4</div>
            <div className="col-span-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl">col-span-4</div>
            <div className="col-span-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl">col-span-4</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">col-span-3</div>
            <div className="col-span-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">col-span-3</div>
            <div className="col-span-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">col-span-3</div>
            <div className="col-span-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">col-span-3</div>
          </div>
        </div>
      </UIDemoCard>
    </div>
  );
};

// 13. IMAGES PAGE
export const ImagesPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Images"
        description="Documentation and examples for opting images into responsive behavior, rounded corners, and thumbnail borders."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <UIDemoCard title="Rounded Corners" subtitle="rounded-2xl border radius">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"
            alt="Architecture"
            className="w-full h-44 object-cover rounded-2xl shadow-xs"
          />
        </UIDemoCard>

        <UIDemoCard title="Circle Crop" subtitle="rounded-full circle shape">
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
              alt="Portrait"
              className="w-36 h-36 object-cover rounded-full shadow-md ring-4 ring-teal-500/20"
            />
          </div>
        </UIDemoCard>

        <UIDemoCard title="Thumbnail Frame" subtitle="Framed with subtle padding">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400"
            alt="Office"
            className="w-full h-44 object-cover rounded-xl p-1 bg-white border border-slate-200 shadow-xs"
          />
        </UIDemoCard>
      </div>
    </div>
  );
};

// 14. MODALS PAGE
export const ModalsPage = () => {
  const [basicModal, setBasicModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Modals"
        description="Use modal dialogs to add dialog prompts to your site for user notifications or completely custom content."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Interactive Form Modal" subtitle="Modal dialog with backdrop and form controls.">
          <button
            type="button"
            onClick={() => setBasicModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 cursor-pointer shadow-xs"
          >
            Launch Form Modal
          </button>
        </UIDemoCard>

        <UIDemoCard title="Confirm / Destructive Modal" subtitle="Warning dialog requiring positive affirmation.">
          <button
            type="button"
            onClick={() => setConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
          >
            Launch Delete Confirmation
          </button>
        </UIDemoCard>
      </div>

      {/* Basic Form Modal */}
      {basicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add New Department</h3>
              <button type="button" onClick={() => setBasicModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input type="text" placeholder="e.g. Artificial Intelligence R&D" className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setBasicModal(false)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => setBasicModal(false)} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer">
                Save Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button type="button" onClick={() => setConfirmModal(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => setConfirmModal(false)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer">
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 15. OFFCANVAS PAGE
export const OffcanvasPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Offcanvas"
        description="Build hidden sidebars into your project for navigation, shopping carts, filters, and more."
      />

      <UIDemoCard title="Right Slide-in Offcanvas Drawer" subtitle="Useful for detailed inspection and filters.">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
        >
          Open Right Drawer
        </button>
      </UIDemoCard>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer" />
          <div className="relative w-80 max-w-[80vw] h-full bg-white shadow-2xl p-6 z-10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">Offcanvas Drawer</h3>
                <button type="button" onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                This drawer can host filtering widgets, customer profiles, audit history, or configuration preferences without leaving the current view.
              </p>
            </div>
            <button type="button" onClick={() => setDrawerOpen(false)} className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer">
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 16. PAGINATION PAGE
export const PaginationPage = () => {
  const [page, setPage] = useState(3);

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Pagination"
        description="Provide pagination links for your site or app with the multi-page pagination component."
      />

      <UIDemoCard title="Interactive Page Numbers" subtitle="Click on page numbers to observe active state shifts.">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                page === num ? 'bg-teal-600 text-white shadow-xs' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={page === 5}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </UIDemoCard>
    </div>
  );
};

// 17. POPOVERS PAGE
export const PopoversPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Popovers"
        description="Displays rich content in a portal next to target elements upon click or hover."
      />

      <UIDemoCard title="Directional Tooltip / Popover Positions" subtitle="Hover or click buttons to view popover orientations.">
        <div className="flex flex-wrap gap-4 py-4">
          <div className="relative group">
            <button type="button" className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
              Popover Top
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg text-center">
              Top oriented popup
            </div>
          </div>

          <div className="relative group">
            <button type="button" className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
              Popover Bottom
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-40 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg text-center">
              Bottom oriented popup
            </div>
          </div>
        </div>
      </UIDemoCard>
    </div>
  );
};

// 18. PROGRESS PAGE
export const ProgressPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Progress"
        description="Documentation and examples for using custom progress bars featuring support for stacked bars, animated backgrounds, and text labels."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Linear Progress Bars" subtitle="Standard progress bars with percentage indicators.">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Database Sync</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Storage Quota</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[82%]" />
              </div>
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Striped & Animated Progress" subtitle="Animated background gradient for long-running batch jobs.">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Payroll Computation Batch</span>
                <span className="text-teal-600 font-bold">Processing</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                <div className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 h-full w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 19. TABS PAGE
export const TabsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Tabs"
        description="Takes the basic nav and adds dynamic tabbed interfaces with interactive switching."
      />

      <UIDemoCard title="Interactive Tabbed Content" subtitle="Click between tabs to load corresponding views.">
        <div>
          <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
            {['overview', 'specifications', 'audit_logs'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="pt-4 text-xs text-slate-600 leading-relaxed">
            {activeTab === 'overview' && <p>Displaying high-level executive dashboard summary and operational KPI telemetry.</p>}
            {activeTab === 'specifications' && <p>REST API payload schema conforming to OpenAPI 3.0 specification with OAuth2 tokens.</p>}
            {activeTab === 'audit_logs' && <p>Immutable audit entries recorded with UTC timestamps, user agent hashes, and IP addresses.</p>}
          </div>
        </div>
      </UIDemoCard>
    </div>
  );
};

// 20. TYPOGRAPHY PAGE
export const TypographyPage = () => {
  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Base UI"
        title="Typography"
        description="Documentation and examples for typography, including headings, body text, lists, and inline code elements."
      />

      <UIDemoCard title="Heading Hierarchy (H1 - H6)" subtitle="Proportional font scale from 2.25rem down to 0.75rem.">
        <div className="space-y-2 text-slate-900 font-sans">
          <h1 className="text-3xl font-extrabold tracking-tight">H1 Enterprise Heading (3xl)</h1>
          <h2 className="text-2xl font-bold tracking-tight">H2 Section Heading (2xl)</h2>
          <h3 className="text-xl font-bold">H3 Component Subheading (xl)</h3>
          <h4 className="text-base font-semibold">H4 Card Title (base)</h4>
          <h5 className="text-sm font-semibold">H5 Widget Label (sm)</h5>
          <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">H6 Meta Category (xs)</h6>
        </div>
      </UIDemoCard>

      <UIDemoCard title="Paragraphs, Lead Text & Code" subtitle="Body text weights, blockquotes, and inline code tags.">
        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
          <p className="text-sm text-slate-700 font-medium">
            Lead Paragraph: Falcon ERP streamlines enterprise workflows across multi-company deployments.
          </p>
          <blockquote className="pl-4 border-l-4 border-teal-500 italic text-slate-500">
            &ldquo;Autonomous architecture guarantees data consistency across inventory, POS, and financial ledgers.&rdquo;
          </blockquote>
          <p>
            Use <code className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-700 font-mono text-[11px]">useAuth()</code> hook to access user session and company scope.
          </p>
        </div>
      </UIDemoCard>
    </div>
  );
};
