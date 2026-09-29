import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Maximize2,
  Minimize2,
  MousePointer,
  EyeOff,
  MoveRight,
  MoveLeft,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

export const LayoutSettingsPage = () => {
  const { preset } = useParams();
  const navigate = useNavigate();
  const {
    sidebarMode,
    contentWidth,
    direction,
    setSidebarMode,
    setContentWidth,
    setDirection,
    applyPreset,
    resetLayout,
    loading,
  } = useLayout();

  // If accessed via sub-route like /app/layouts/mini-sidebar, activate that preset automatically
  useEffect(() => {
    if (preset) {
      applyPreset(preset);
    }
  }, [preset, applyPreset]);

  const layoutCards = [
    {
      id: 'mini',
      routeKey: 'mini-sidebar',
      name: 'Mini Sidebar',
      category: 'Sidebar Mode',
      description: 'Streamlined 72px icon-only navigation. Perfect for power users maximizing horizontal space.',
      isActive: sidebarMode === 'mini',
      action: () => applyPreset('mini'),
      // Visual Mini Preview
      renderPreview: (active) => (
        <div className="w-full h-32 bg-slate-100 rounded-lg p-2.5 flex gap-2 border border-slate-200/80 overflow-hidden relative select-none">
          {/* Mini Sidebar Preview */}
          <div className="w-6 h-full bg-[#1E293B] rounded flex flex-col items-center py-2 gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded bg-teal-500" />
            <div className="w-2.5 h-2.5 rounded bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded bg-slate-600" />
          </div>
          {/* Content Preview */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="w-full h-4 bg-white rounded border border-slate-200 flex items-center px-1.5">
              <div className="w-8 h-1.5 bg-slate-300 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              <div className="bg-white rounded border border-slate-200 p-1.5 flex flex-col justify-between">
                <div className="w-6 h-1 bg-slate-300 rounded" />
                <div className="w-10 h-2 bg-teal-500/20 rounded" />
              </div>
              <div className="bg-white rounded border border-slate-200 p-1.5 flex flex-col justify-between">
                <div className="w-6 h-1 bg-slate-300 rounded" />
                <div className="w-10 h-2 bg-blue-500/20 rounded" />
              </div>
              <div className="bg-white rounded border border-slate-200 p-1.5 flex flex-col justify-between">
                <div className="w-6 h-1 bg-slate-300 rounded" />
                <div className="w-10 h-2 bg-emerald-500/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'hover',
      routeKey: 'hover-view',
      name: 'Hover View',
      category: 'Sidebar Mode',
      description: 'Compact icon-only navigation by default that auto-expands seamlessly when your cursor hovers over it.',
      isActive: sidebarMode === 'hover',
      action: () => applyPreset('hover'),
      renderPreview: (active) => (
        <div className="w-full h-32 bg-slate-100 rounded-lg p-2.5 flex gap-2 border border-slate-200/80 overflow-hidden relative select-none">
          {/* Hover Expanded Sidebar Preview */}
          <div className="w-20 h-full bg-[#1E293B] rounded flex flex-col py-2 px-1.5 gap-1.5 shrink-0 shadow-md">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-teal-500 shrink-0" />
              <div className="w-10 h-1.5 bg-slate-400 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-slate-600 shrink-0" />
              <div className="w-12 h-1 bg-slate-500 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-slate-600 shrink-0" />
              <div className="w-9 h-1 bg-slate-500 rounded" />
            </div>
          </div>
          {/* Content Preview */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="w-full h-4 bg-white rounded border border-slate-200" />
            <div className="flex-1 bg-white rounded border border-slate-200 p-1.5" />
          </div>
        </div>
      ),
    },
    {
      id: 'hidden',
      routeKey: 'hidden-menu',
      name: 'Hidden Menu',
      category: 'Sidebar Mode',
      description: 'Completely hides the sidebar for a full-screen canvas. Access navigation anytime via the Topbar hamburger button.',
      isActive: sidebarMode === 'hidden',
      action: () => applyPreset('hidden'),
      renderPreview: (active) => (
        <div className="w-full h-32 bg-slate-100 rounded-lg p-2.5 flex flex-col gap-1.5 border border-slate-200/80 overflow-hidden relative select-none">
          {/* Topbar with prominent Hamburger */}
          <div className="w-full h-5 bg-white rounded border border-slate-200 flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-2.5 rounded bg-teal-600 flex flex-col justify-between py-0.5 px-0.5">
                <div className="w-full h-[1px] bg-white" />
                <div className="w-full h-[1px] bg-white" />
              </div>
              <div className="w-12 h-1.5 bg-slate-300 rounded" />
            </div>
            <div className="w-3 h-3 rounded-full bg-slate-200" />
          </div>
          {/* Full Canvas Area */}
          <div className="flex-1 grid grid-cols-4 gap-1.5">
            <div className="bg-white rounded border border-slate-200" />
            <div className="bg-white rounded border border-slate-200" />
            <div className="bg-white rounded border border-slate-200" />
            <div className="bg-white rounded border border-slate-200" />
          </div>
        </div>
      ),
    },
    {
      id: 'full-width',
      routeKey: 'full-width',
      name: 'Full Width',
      category: 'Content Layout',
      description: 'Removes maximum container boundaries, letting data tables, kanban boards, and charts stretch across 100% of your screen.',
      isActive: contentWidth === 'full',
      action: () => applyPreset('full-width'),
      renderPreview: (active) => (
        <div className="w-full h-32 bg-slate-100 rounded-lg p-2.5 flex gap-2 border border-slate-200/80 overflow-hidden relative select-none">
          {/* Normal sidebar */}
          <div className="w-10 h-full bg-[#1E293B] rounded flex flex-col py-1.5 px-1 gap-1 shrink-0" />
          {/* 100% Stretch Content */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="w-full h-4 bg-white rounded border border-slate-200" />
            <div className="flex-1 grid grid-cols-5 gap-1">
              <div className="bg-white rounded border border-slate-200" />
              <div className="bg-white rounded border border-slate-200" />
              <div className="bg-white rounded border border-slate-200" />
              <div className="bg-white rounded border border-slate-200" />
              <div className="bg-white rounded border border-slate-200" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rtl',
      routeKey: 'rtl',
      name: 'RTL (Right-to-Left)',
      category: 'Text & Layout Direction',
      description: 'Full bidirectional support for Arabic and Hebrew locales. Inverts sidebar position, tables, and form alignments.',
      isActive: direction === 'rtl',
      action: () => applyPreset('rtl'),
      renderPreview: (active) => (
        <div className="w-full h-32 bg-slate-100 rounded-lg p-2.5 flex flex-row-reverse gap-2 border border-slate-200/80 overflow-hidden relative select-none">
          {/* Sidebar Placed on Right */}
          <div className="w-14 h-full bg-[#1E293B] rounded flex flex-col py-2 px-1.5 gap-1.5 shrink-0">
            <div className="flex flex-row-reverse items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-teal-500 shrink-0" />
              <div className="w-8 h-1 bg-slate-400 rounded" />
            </div>
            <div className="flex flex-row-reverse items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-slate-600 shrink-0" />
              <div className="w-6 h-1 bg-slate-500 rounded" />
            </div>
          </div>
          {/* Content aligned to right */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="w-full h-4 bg-white rounded border border-slate-200 flex flex-row-reverse items-center px-1.5">
              <div className="w-10 h-1.5 bg-slate-300 rounded" />
            </div>
            <div className="flex-1 bg-white rounded border border-slate-200 p-2 flex flex-col items-end gap-1">
              <div className="w-20 h-1.5 bg-slate-300 rounded" />
              <div className="w-14 h-1.5 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Layout Settings</h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure your enterprise workspace ergonomics, sidebar behaviors, content width, and text orientation
          </p>
        </div>

        {/* Global Reset Action */}
        <button
          onClick={resetLayout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* 5 Layout Selector Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Layout Configuration Preset
          </h2>
          <span className="text-[11px] text-teal-600 font-semibold">
            Changes apply instantly & persist to MySQL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {layoutCards.map((card) => {
            const active = card.isActive;

            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 relative group ${
                  active
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Visual Preview */}
                <div className="mb-4">
                  {card.renderPreview(active)}
                </div>

                {/* Details */}
                <div className="space-y-1 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {card.category}
                    </span>
                    {active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{card.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {card.description}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    card.action();
                    navigate(`/app/layouts/${card.routeKey}`, { replace: true });
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {active ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Current Layout</span>
                    </>
                  ) : (
                    <span>Activate {card.name}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Fine-Grained Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Advanced Ergonomics</h3>
        <p className="text-xs text-slate-500 mb-6">
          Individually toggle layout traits and layout engine properties
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Direction toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Directionality</span>
              <span className="text-[11px] text-slate-500 block mb-3">
                Current: <strong>{direction.toUpperCase()}</strong> ({direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection('ltr')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  direction === 'ltr'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                LTR
              </button>
              <button
                onClick={() => setDirection('rtl')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  direction === 'rtl'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                RTL
              </button>
            </div>
          </div>

          {/* Content Width toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Content Width</span>
              <span className="text-[11px] text-slate-500 block mb-3">
                Current: <strong>{contentWidth === 'full' ? '100% Fluid Width' : 'Boxed (Max-7XL)'}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setContentWidth('default')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  contentWidth === 'default'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Boxed
              </button>
              <button
                onClick={() => setContentWidth('full')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  contentWidth === 'full'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Full Width
              </button>
            </div>
          </div>

          {/* Sidebar Mode direct select */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Sidebar Mode</span>
              <span className="text-[11px] text-slate-500 block mb-3 capitalize">
                Current: <strong>{sidebarMode}</strong>
              </span>
            </div>
            <select
              value={sidebarMode}
              onChange={(e) => setSidebarMode(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold cursor-pointer"
            >
              <option value="default">Default (Expanded)</option>
              <option value="mini">Mini Sidebar (72px)</option>
              <option value="hover">Hover View</option>
              <option value="hidden">Hidden Menu (Drawer)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutSettingsPage;
