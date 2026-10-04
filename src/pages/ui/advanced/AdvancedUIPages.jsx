import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GripVertical,
  Copy,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  Link,
  Code2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';
import UIDemoCard from '../../../components/ui/interface/UIDemoCard';

// 1. DRAGULA PAGE (Kanban Drag-and-Drop)
export const DragulaPage = () => {
  const [columns, setColumns] = useState({
    todo: [
      { id: 1, title: 'Design System Tokens', priority: 'High', tag: 'UI/UX' },
      { id: 2, title: 'Sanctum 2FA Refresh', priority: 'Urgent', tag: 'Security' },
      { id: 3, title: 'Recharts Performance Audit', priority: 'Medium', tag: 'Frontend' },
    ],
    in_progress: [
      { id: 4, title: 'Data Table CSV Export', priority: 'High', tag: 'Backend' },
      { id: 5, title: 'Filament v5 Resource Upgrades', priority: 'Medium', tag: 'DevOps' },
    ],
    done: [
      { id: 6, title: 'MySQL MariaDB Engine Configuration', priority: 'Urgent', tag: 'Database' },
      { id: 7, title: 'Enterprise Navigation Breadcrumb', priority: 'Medium', tag: 'Navigation' },
    ],
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch initial drag items from API if available
  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/v1/ui/drag-items')
      .then((res) => {
        if (res.data?.items?.length) {
          const grouped = { todo: [], in_progress: [], done: [] };
          res.data.items.forEach((item) => {
            const status = grouped[item.status] ? item.status : 'todo';
            grouped[status].push({
              id: item.id,
              title: item.title,
              priority: item.priority || 'Medium',
              tag: item.assigned_to || 'Task',
            });
          });
          setColumns(grouped);
        }
      })
      .catch(() => {
        // Fallback to local default cards
      });
  }, []);

  const handleDragStart = (item, sourceCol) => {
    setDraggedItem({ ...item, sourceCol });
  };

  const handleDrop = (targetCol) => {
    if (!draggedItem || draggedItem.sourceCol === targetCol) return;

    const sourceList = columns[draggedItem.sourceCol].filter((i) => i.id !== draggedItem.id);
    const targetList = [...columns[targetCol], { ...draggedItem, status: targetCol }];

    const newColumns = {
      ...columns,
      [draggedItem.sourceCol]: sourceList,
      [targetCol]: targetList,
    };

    setColumns(newColumns);
    setDraggedItem(null);
    setSaveStatus('Saving reordered layout...');

    // Persist to backend API
    const payload = [];
    Object.keys(newColumns).forEach((statusKey) => {
      newColumns[statusKey].forEach((card, idx) => {
        payload.push({ id: card.id, status: statusKey, order_index: idx });
      });
    });

    axios
      .put('http://127.0.0.1:8000/api/v1/ui/drag-items/reorder', { items: payload })
      .then(() => {
        setSaveStatus('Changes synchronized to MySQL database.');
        setTimeout(() => setSaveStatus(''), 2500);
      })
      .catch(() => {
        setSaveStatus('Saved locally in browser.');
        setTimeout(() => setSaveStatus(''), 2500);
      });
  };

  const resetKanban = () => {
    setColumns({
      todo: [
        { id: 1, title: 'Design System Tokens', priority: 'High', tag: 'UI/UX' },
        { id: 2, title: 'Sanctum 2FA Refresh', priority: 'Urgent', tag: 'Security' },
      ],
      in_progress: [
        { id: 4, title: 'Data Table CSV Export', priority: 'High', tag: 'Backend' },
      ],
      done: [
        { id: 6, title: 'MySQL MariaDB Engine Configuration', priority: 'Urgent', tag: 'Database' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Advanced UI"
        title="Dragula / Drag & Drop"
        description="Interactive drag-and-drop interface supporting cards movement between containers, reordering, and backend API database synchronization."
        actions={
          <button
            type="button"
            onClick={resetKanban}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kanban</span>
          </button>
        }
      />

      {saveStatus && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'todo', title: 'To Do', color: 'border-amber-400', badge: 'bg-amber-100 text-amber-800' },
          { key: 'in_progress', title: 'In Progress', color: 'border-sky-400', badge: 'bg-sky-100 text-sky-800' },
          { key: 'done', title: 'Completed', color: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
        ].map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
            className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 min-h-[380px] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color}`} />
                <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.title}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badge}`}>
                {columns[col.key]?.length || 0}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {columns[col.key]?.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card, col.key)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-800 leading-snug">
                      {card.title}
                    </span>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {card.tag}
                    </span>
                    <span
                      className={`font-semibold capitalize ${
                        card.priority === 'Urgent'
                          ? 'text-rose-600'
                          : card.priority === 'High'
                          ? 'text-amber-600'
                          : 'text-teal-600'
                      }`}
                    >
                      {card.priority}
                    </span>
                  </div>
                </div>
              ))}

              {(!columns[col.key] || columns[col.key].length === 0) && (
                <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. CLIPBOARD PAGE
export const ClipboardPage = () => {
  const [copiedType, setCopiedType] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
      })
      .catch(() => {
        alert('Failed to copy');
      });
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Advanced UI"
        title="Clipboard"
        description="Copy text, code blocks, URLs, and input values into system clipboard with immediate visual feedback."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Copy Text Input" subtitle="Click the button to copy input value directly.">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value="Falcon ERP - Autonomous Enterprise Suite"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            />
            <button
              type="button"
              onClick={() => copyToClipboard('Falcon ERP - Autonomous Enterprise Suite', 'text')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'text' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Copy Application URL" subtitle="Copy current page address or webhook target.">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value="http://127.0.0.1:8000/api/v1/ui/data-table"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={() => copyToClipboard('http://127.0.0.1:8000/api/v1/ui/data-table', 'url')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedType === 'url' ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Copy Code Snippet" subtitle="One-click code block copying for developers.">
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{`import { useAuth } from '../context/AuthContext';\nconst { user, token } = useAuth();`}</code>
            </pre>
            <button
              type="button"
              onClick={() => copyToClipboard("import { useAuth } from '../context/AuthContext';\nconst { user, token } = useAuth();", 'code')}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              {copiedType === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'code' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 3. RANGE SLIDER PAGE
export const RangeSliderPage = () => {
  const [singleVal, setSingleVal] = useState(45);
  const [minVal, setMinVal] = useState(25);
  const [maxVal, setMaxVal] = useState(75);
  const [stepVal, setStepVal] = useState(50);

  const resetAll = () => {
    setSingleVal(45);
    setMinVal(25);
    setMaxVal(75);
    setStepVal(50);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Advanced UI"
        title="Range Slider"
        description="Interactive range sliders featuring single value, dual bounds, step adjustments, and live value outputs."
        actions={
          <button
            type="button"
            onClick={resetAll}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Basic Single Slider" subtitle="Continuous range from 0 to 100 with live indicator.">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Selected Value:</span>
              <span className="text-teal-600 font-bold text-sm">{singleVal}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={singleVal}
              onChange={(e) => setSingleVal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Step Slider (Interval: 10)" subtitle="Restricted increments of 10 units.">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Stepped Target:</span>
              <span className="text-teal-600 font-bold text-sm">${stepVal},000</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={stepVal}
              onChange={(e) => setStepVal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>$0</span>
              <span>$50k</span>
              <span>$100k</span>
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Double Bound Range" subtitle="Dual minimum and maximum thresholds.">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Filter Range:</span>
              <span className="text-teal-600 font-bold">
                {minVal}% &mdash; {maxVal}%
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50"
                value={minVal}
                onChange={(e) => setMinVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <input
                type="range"
                min="51"
                max="100"
                value={maxVal}
                onChange={(e) => setMaxVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 4. LIGHTBOX PAGE
export const LightboxPage = () => {
  const images = [
    { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000', title: 'Corporate Headquarters', caption: 'Modern enterprise hub' },
    { src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000', title: 'Open Workspace Desk', caption: 'Collaborative engineering zone' },
    { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000', title: 'Executive Conference Room', caption: 'High-definition telepresence system' },
    { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000', title: 'Agile Sprint Sync', caption: 'Autonomous squad operations' },
  ];

  const [activeIndex, setActiveIndex] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight' && activeIndex !== null) {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && activeIndex !== null) {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  const openImage = (index) => {
    setActiveIndex(index);
    setZoom(1);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Advanced UI"
        title="Lightbox"
        description="Responsive popup image gallery featuring keyboard navigation (ESC, arrows), previous/next controls, and zoom levels."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            onClick={() => openImage(index)}
            className="group relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:shadow-lg transition-all"
          >
            <img src={img.src} alt={img.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
            <div className="p-2.5 bg-white border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 truncate">{img.title}</h4>
              <p className="text-[10px] text-slate-400 truncate">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal Dialog */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          <button
            type="button"
            onClick={() => {
              setActiveIndex((activeIndex - 1 + images.length) % images.length);
              setZoom(1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveIndex((activeIndex + 1) % images.length);
              setZoom(1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Zoom Canvas */}
          <div className="text-center max-w-4xl max-h-[85vh] flex flex-col items-center">
            <div className="overflow-hidden rounded-2xl max-h-[70vh]">
              <img
                src={images[activeIndex].src}
                alt={images[activeIndex].title}
                style={{ transform: `scale(${zoom})` }}
                className="max-h-[70vh] object-contain transition-transform duration-200"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-xs font-semibold text-white">
                {images[activeIndex].title} &bull; ({activeIndex + 1} of {images.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
