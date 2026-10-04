import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers, CheckCircle2, ArrowRight, CornerDownRight,
  FolderTree, ExternalLink, Sparkles, Compass
} from 'lucide-react';
import UIPageHeader from '../../components/ui/interface/UIPageHeader';

// Reusable MultiLevel Page Container
export const MultiLevelPageView = ({
  levelNumber,
  itemCode,
  itemLabel,
  currentRoute,
  parentHierarchy,
  description
}) => {
  const treeNodes = [
    {
      code: 'root',
      label: 'Multi Level',
      level: 1,
      route: null,
      children: [
        { code: '1', label: 'Multilevel 1', level: 2, route: '/help/multilevel/1' },
        {
          code: '2',
          label: 'Multilevel 2',
          level: 2,
          route: null,
          children: [
            { code: '2.1', label: 'Multilevel 2.1', level: 3, route: '/help/multilevel/2/1' },
            {
              code: '2.2',
              label: 'Multilevel 2.2',
              level: 3,
              route: null,
              children: [
                { code: '2.2.1', label: 'Multilevel 2.2.1', level: 4, route: '/help/multilevel/2/2/1' },
                { code: '2.2.2', label: 'Multilevel 2.2.2', level: 4, route: '/help/multilevel/2/2/2' }
              ]
            }
          ]
        },
        { code: '3', label: 'Multilevel 3', level: 2, route: '/help/multilevel/3' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <UIPageHeader
        title={itemLabel}
        description={description}
        breadcrumbs={[
          { label: 'Help', path: '/help/documentation' },
          { label: 'Multi Level' },
          ...parentHierarchy,
          { label: itemLabel }
        ]}
      />

      {/* Main Status & Verification Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 lg:p-8 space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-xs">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{itemLabel}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                  Level {levelNumber} Active
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Route: {currentRoute}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={14} /> Nested Route Synchronized
            </span>
          </div>
        </div>

        {/* Tree Representation */}
        <div>
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <FolderTree size={16} className="text-teal-600" />
            Interactive Hierarchical Navigation Map
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Click any node below to test instantaneous navigation and verify sidebar auto-expansion behavior.
          </p>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-2">
            {/* Multi Level Root */}
            <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <Layers size={14} className="text-teal-600" />
              <span>Multi Level (Root Parent)</span>
            </div>

            {/* Level 2: Multilevel 1 */}
            <div className="pl-6 flex items-center gap-2">
              <CornerDownRight size={13} className="text-slate-400" />
              <NavLink
                to="/help/multilevel/1"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  itemCode === '1'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                • Multilevel 1 (Page)
              </NavLink>
            </div>

            {/* Level 2: Multilevel 2 */}
            <div className="pl-6 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <CornerDownRight size={13} className="text-slate-400" />
              <span>• Multilevel 2 (Submenu Container)</span>
            </div>

            {/* Level 3: Multilevel 2.1 */}
            <div className="pl-12 flex items-center gap-2">
              <CornerDownRight size={13} className="text-slate-400" />
              <NavLink
                to="/help/multilevel/2/1"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  itemCode === '2.1'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                • Multilevel 2.1 (Page)
              </NavLink>
            </div>

            {/* Level 3: Multilevel 2.2 */}
            <div className="pl-12 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <CornerDownRight size={13} className="text-slate-400" />
              <span>• Multilevel 2.2 (Submenu Container)</span>
            </div>

            {/* Level 4: Multilevel 2.2.1 */}
            <div className="pl-18 flex items-center gap-2">
              <CornerDownRight size={13} className="text-slate-400" />
              <NavLink
                to="/help/multilevel/2/2/1"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  itemCode === '2.2.1'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                • Multilevel 2.2.1 (Deepest Nested Page)
              </NavLink>
            </div>

            {/* Level 4: Multilevel 2.2.2 */}
            <div className="pl-18 flex items-center gap-2">
              <CornerDownRight size={13} className="text-slate-400" />
              <NavLink
                to="/help/multilevel/2/2/2"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  itemCode === '2.2.2'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                • Multilevel 2.2.2 (Deepest Nested Page)
              </NavLink>
            </div>

            {/* Level 2: Multilevel 3 */}
            <div className="pl-6 flex items-center gap-2">
              <CornerDownRight size={13} className="text-slate-400" />
              <NavLink
                to="/help/multilevel/3"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  itemCode === '3'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                • Multilevel 3 (Page)
              </NavLink>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80">
          <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 mb-3">
            Quick Multi-Level Jumps
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Multilevel 1', route: '/help/multilevel/1', level: 'Level 2' },
              { label: 'Multilevel 2.1', route: '/help/multilevel/2/1', level: 'Level 3' },
              { label: 'Multilevel 2.2.1', route: '/help/multilevel/2/2/1', level: 'Level 4' },
              { label: 'Multilevel 2.2.2', route: '/help/multilevel/2/2/2', level: 'Level 4' },
              { label: 'Multilevel 3', route: '/help/multilevel/3', level: 'Level 2' }
            ].map((node) => (
              <NavLink
                key={node.route}
                to={node.route}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  currentRoute === node.route
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{node.level}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    {node.label}
                  </span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. MULTILEVEL 1 PAGE (/help/multilevel/1)
// ==========================================
export const MultiLevel1Page = () => (
  <MultiLevelPageView
    levelNumber={2}
    itemCode="1"
    itemLabel="Multilevel 1"
    currentRoute="/help/multilevel/1"
    parentHierarchy={[]}
    description="Level 2 navigation page directly under the Multi Level root parent. Demonstrates basic child node routing."
  />
);

// ==========================================
// 2. MULTILEVEL 2.1 PAGE (/help/multilevel/2/1)
// ==========================================
export const MultiLevel21Page = () => (
  <MultiLevelPageView
    levelNumber={3}
    itemCode="2.1"
    itemLabel="Multilevel 2.1"
    currentRoute="/help/multilevel/2/1"
    parentHierarchy={[{ label: 'Multilevel 2' }]}
    description="Level 3 nested navigation page under Multilevel 2. Verifies that parent Multilevel 2 and root Multi Level expand automatically."
  />
);

// ==========================================
// 3. MULTILEVEL 2.2.1 PAGE (/help/multilevel/2/2/1)
// ==========================================
export const MultiLevel221Page = () => (
  <MultiLevelPageView
    levelNumber={4}
    itemCode="2.2.1"
    itemLabel="Multilevel 2.2.1"
    currentRoute="/help/multilevel/2/2/1"
    parentHierarchy={[{ label: 'Multilevel 2' }, { label: 'Multilevel 2.2' }]}
    description="Level 4 deep nested child page. Confirms full 4-tier hierarchy expansion without closing siblings or ancestors."
  />
);

// ==========================================
// 4. MULTILEVEL 2.2.2 PAGE (/help/multilevel/2/2/2)
// ==========================================
export const MultiLevel222Page = () => (
  <MultiLevelPageView
    levelNumber={4}
    itemCode="2.2.2"
    itemLabel="Multilevel 2.2.2"
    currentRoute="/help/multilevel/2/2/2"
    parentHierarchy={[{ label: 'Multilevel 2' }, { label: 'Multilevel 2.2' }]}
    description="Level 4 deep nested sibling of 2.2.1. Confirms sibling stability and accurate active route highlighting."
  />
);

// ==========================================
// 5. MULTILEVEL 3 PAGE (/help/multilevel/3)
// ==========================================
export const MultiLevel3Page = () => (
  <MultiLevelPageView
    levelNumber={2}
    itemCode="3"
    itemLabel="Multilevel 3"
    currentRoute="/help/multilevel/3"
    parentHierarchy={[]}
    description="Level 2 navigation page positioned after expandable Multilevel 2. Verifies that sibling order is preserved regardless of expansion states."
  />
);
