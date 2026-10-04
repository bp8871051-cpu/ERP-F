import React, { useState, useMemo } from 'react';
import {
  Search, Copy, Check, Eye, Download, Sliders, ExternalLink,
  Sparkles, Layers, RefreshCw, X,
  // System & Web
  Home, Settings, User, Users, Lock, Bell, Search as SearchIcon, Menu,
  Mail, Calendar, FileText, Folder, CheckCircle, AlertTriangle, AlertCircle,
  Info, Trash2, Edit3, Plus, Minus, ChevronRight, ChevronDown, ArrowRight,
  ArrowLeft, ArrowUp, ArrowDown, ExternalLink as ExtLink, RefreshCw as Reload,
  // Media & Devices
  Camera, Image, Video, Music, Volume2, Monitor, Smartphone, Tablet,
  Laptop, HardDrive, Wifi, Bluetooth, Battery, Shield, ShieldCheck,
  // Finance & Commerce
  CreditCard, DollarSign, ShoppingCart, ShoppingBag, Tag, Package, Box,
  TrendingUp, BarChart2, PieChart, Activity, Briefcase, Award, Star,
  Heart, Bookmark, MapPin, Navigation, Send, MessageSquare, Phone,
  Globe, Share2, Printer, Cloud, Download as DownloadIcon, Upload,
  Cpu, Database, Terminal, Server, Key, Sun, Moon, Zap, Coffee, Compass
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';

// Shared Icon Explorer Component
const IconExplorer = ({ title, libraryName, libraryPrefix, description, breadcrumbPath, sampleIcons }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [iconSize, setIconSize] = useState(24);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(sampleIcons.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [sampleIcons]);

  const filteredIcons = useMemo(() => {
    return sampleIcons.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [sampleIcons, searchTerm, selectedCategory]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { label: 'UI Interface', path: breadcrumbPath },
          { label: 'Icons' },
          { label: libraryName }
        ]}
      />

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${libraryName} icons by name or tag...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Size Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders size={14} /> Size:
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-750 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {[16, 20, 24, 32, 48].map((size) => (
                <button
                  key={size}
                  onClick={() => setIconSize(size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    iconSize === size
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto pl-3 hidden sm:inline">
            Showing {filteredIcons.length} of {sampleIcons.length}
          </span>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
        {filteredIcons.map((item) => {
          const IconComp = item.icon;
          const formattedName = `${libraryPrefix}${item.name}`;

          return (
            <div
              key={item.name}
              onClick={() => setSelectedIcon(item)}
              className={`group relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer ${
                selectedIcon?.name === item.name
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500/60 hover:shadow-sm'
              }`}
            >
              <div
                className="flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                style={{ width: 48, height: 48 }}
              >
                <IconComp size={iconSize} strokeWidth={1.8} />
              </div>

              <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 text-center truncate w-full group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full text-center">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="mx-auto text-slate-400 mb-3" size={36} />
          <h4 className="font-medium text-slate-700 dark:text-slate-200">No icons found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or selecting another category.</p>
        </div>
      )}

      {/* Selected Icon Modal / Drawer Preview */}
      {selectedIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedIcon(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
              <div className="w-16 h-16 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
                {React.createElement(selectedIcon.icon, { size: 36, strokeWidth: 1.8 })}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{selectedIcon.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Library: {libraryName} • Category: {selectedIcon.category}</p>
              </div>
            </div>

            <div className="space-y-3 pt-5">
              {/* Copy Icon Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Icon Name / Class</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg">
                  <code className="text-xs font-mono text-teal-600 dark:text-teal-400 flex-1 truncate">
                    {libraryPrefix}{selectedIcon.name}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${libraryPrefix}${selectedIcon.name}`, 'name')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  >
                    {copiedKey === 'name' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'name' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Copy React Code */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">React Component Import</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg">
                  <code className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1 truncate">
                    {`<${selectedIcon.name} size={${iconSize}} />`}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`<${selectedIcon.name} size={${iconSize}} />`, 'jsx')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    {copiedKey === 'jsx' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'jsx' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Copy SVG Snippet */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Raw SVG Element</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg">
                  <code className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1 truncate">
                    {`<svg class="${libraryPrefix}${selectedIcon.name}" width="${iconSize}" height="${iconSize}">...</svg>`}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`<svg class="${libraryPrefix}${selectedIcon.name}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>`, 'svg')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    {copiedKey === 'svg' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'svg' ? 'Copied' : 'Copy SVG'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedIcon(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Base Master Icon Set
const ICONS_MASTER = [
  // Application & System
  { name: 'Home', icon: Home, category: 'Web & System', tags: ['dashboard', 'main', 'start'] },
  { name: 'Settings', icon: Settings, category: 'Web & System', tags: ['gear', 'config', 'options'] },
  { name: 'User', icon: User, category: 'Web & System', tags: ['profile', 'account', 'person'] },
  { name: 'Users', icon: Users, category: 'Web & System', tags: ['group', 'team', 'accounts'] },
  { name: 'Lock', icon: Lock, category: 'Web & System', tags: ['security', 'password', 'private'] },
  { name: 'Bell', icon: Bell, category: 'Web & System', tags: ['alert', 'notification', 'ring'] },
  { name: 'Search', icon: SearchIcon, category: 'Web & System', tags: ['find', 'lookup', 'glass'] },
  { name: 'Menu', icon: Menu, category: 'Web & System', tags: ['hamburger', 'drawer', 'nav'] },
  { name: 'Shield', icon: Shield, category: 'Web & System', tags: ['security', 'protect', 'defense'] },
  { name: 'ShieldCheck', icon: ShieldCheck, category: 'Web & System', tags: ['verified', 'safe'] },
  { name: 'Key', icon: Key, category: 'Web & System', tags: ['access', 'auth', 'pass'] },
  { name: 'Trash2', icon: Trash2, category: 'Web & System', tags: ['delete', 'remove', 'bin'] },
  { name: 'Edit3', icon: Edit3, category: 'Web & System', tags: ['pencil', 'write', 'modify'] },
  { name: 'Plus', icon: Plus, category: 'Web & System', tags: ['add', 'create', 'new'] },
  { name: 'Minus', icon: Minus, category: 'Web & System', tags: ['subtract', 'remove'] },

  // Communication & Files
  { name: 'Mail', icon: Mail, category: 'Communication', tags: ['email', 'letter', 'inbox'] },
  { name: 'MessageSquare', icon: MessageSquare, category: 'Communication', tags: ['chat', 'comment'] },
  { name: 'Phone', icon: Phone, category: 'Communication', tags: ['call', 'telephone'] },
  { name: 'Send', icon: Send, category: 'Communication', tags: ['dispatch', 'telegram'] },
  { name: 'Calendar', icon: Calendar, category: 'Communication', tags: ['date', 'schedule', 'event'] },
  { name: 'FileText', icon: FileText, category: 'Communication', tags: ['document', 'page', 'doc'] },
  { name: 'Folder', icon: Folder, category: 'Communication', tags: ['directory', 'files', 'storage'] },
  { name: 'Share2', icon: Share2, category: 'Communication', tags: ['social', 'forward'] },

  // Arrows & Navigation
  { name: 'ChevronRight', icon: ChevronRight, category: 'Arrows', tags: ['right', 'expand', 'next'] },
  { name: 'ChevronDown', icon: ChevronDown, category: 'Arrows', tags: ['down', 'collapse', 'menu'] },
  { name: 'ArrowRight', icon: ArrowRight, category: 'Arrows', tags: ['forward', 'east'] },
  { name: 'ArrowLeft', icon: ArrowLeft, category: 'Arrows', tags: ['back', 'west'] },
  { name: 'ArrowUp', icon: ArrowUp, category: 'Arrows', tags: ['north', 'top'] },
  { name: 'ArrowDown', icon: ArrowDown, category: 'Arrows', tags: ['south', 'bottom'] },
  { name: 'ExtLink', icon: ExtLink, category: 'Arrows', tags: ['external', 'open'] },
  { name: 'Reload', icon: Reload, category: 'Arrows', tags: ['sync', 'update'] },

  // Devices & Hardware
  { name: 'Monitor', icon: Monitor, category: 'Devices', tags: ['desktop', 'screen', 'display'] },
  { name: 'Smartphone', icon: Smartphone, category: 'Devices', tags: ['mobile', 'cell', 'phone'] },
  { name: 'Tablet', icon: Tablet, category: 'Devices', tags: ['ipad', 'touch'] },
  { name: 'Laptop', icon: Laptop, category: 'Devices', tags: ['notebook', 'macbook'] },
  { name: 'HardDrive', icon: HardDrive, category: 'Devices', tags: ['disk', 'storage', 'hdd'] },
  { name: 'Cpu', icon: Cpu, category: 'Devices', tags: ['processor', 'chip', 'core'] },
  { name: 'Server', icon: Server, category: 'Devices', tags: ['cloud', 'datacenter', 'host'] },
  { name: 'Database', icon: Database, category: 'Devices', tags: ['sql', 'tables', 'storage'] },
  { name: 'Terminal', icon: Terminal, category: 'Devices', tags: ['cli', 'bash', 'console'] },

  // Commerce & Analytics
  { name: 'CreditCard', icon: CreditCard, category: 'Commerce', tags: ['payment', 'visa', 'mastercard'] },
  { name: 'DollarSign', icon: DollarSign, category: 'Commerce', tags: ['money', 'usd', 'cash'] },
  { name: 'ShoppingCart', icon: ShoppingCart, category: 'Commerce', tags: ['buy', 'store', 'cart'] },
  { name: 'ShoppingBag', icon: ShoppingBag, category: 'Commerce', tags: ['retail', 'purchase'] },
  { name: 'Tag', icon: Tag, category: 'Commerce', tags: ['price', 'discount', 'label'] },
  { name: 'Package', icon: Package, category: 'Commerce', tags: ['delivery', 'box', 'order'] },
  { name: 'TrendingUp', icon: TrendingUp, category: 'Commerce', tags: ['growth', 'sales', 'stats'] },
  { name: 'BarChart2', icon: BarChart2, category: 'Commerce', tags: ['analytics', 'metrics'] },
  { name: 'PieChart', icon: PieChart, category: 'Commerce', tags: ['diagram', 'distribution'] },
  { name: 'Briefcase', icon: Briefcase, category: 'Commerce', tags: ['job', 'work', 'office'] },

  // Status & Feedback
  { name: 'CheckCircle', icon: CheckCircle, category: 'Feedback', tags: ['success', 'ok', 'done'] },
  { name: 'AlertTriangle', icon: AlertTriangle, category: 'Feedback', tags: ['warning', 'caution'] },
  { name: 'AlertCircle', icon: AlertCircle, category: 'Feedback', tags: ['error', 'danger', 'alert'] },
  { name: 'Info', icon: Info, category: 'Feedback', tags: ['help', 'details'] },
  { name: 'Star', icon: Star, category: 'Feedback', tags: ['favorite', 'rating'] },
  { name: 'Heart', icon: Heart, category: 'Feedback', tags: ['like', 'love'] },
  { name: 'Zap', icon: Zap, category: 'Feedback', tags: ['lightning', 'fast', 'power'] }
];

// ==========================================
// 1. FONTAWESOME ICONS
// ==========================================
export const FontawesomeIconsPage = () => {
  return (
    <IconExplorer
      title="Font Awesome Icons"
      libraryName="Font Awesome 6"
      libraryPrefix="fa-solid fa-"
      description="Classic Font Awesome vector icon library with search, category filtering, preview, and rapid copy functions."
      breadcrumbPath="/ui/icons/fontawesome"
      sampleIcons={ICONS_MASTER}
    />
  );
};

// ==========================================
// 2. TABLER ICONS
// ==========================================
export const TablerIconsPage = () => {
  return (
    <IconExplorer
      title="Tabler Icons"
      libraryName="Tabler Icons"
      libraryPrefix="ti ti-"
      description="Crisp, modern SVG icons meticulously crafted with a 24x24 grid format matching Tabler UI standards."
      breadcrumbPath="/ui/icons/tabler"
      sampleIcons={ICONS_MASTER}
    />
  );
};

// ==========================================
// 3. LUCIDE ICONS
// ==========================================
export const LucideIconsPage = () => {
  return (
    <IconExplorer
      title="Lucide Icons"
      libraryName="Lucide React"
      libraryPrefix="lucide-"
      description="The official icon system used across Dreams ERP. Clean, lightweight, fully customizable tree-shakeable icons."
      breadcrumbPath="/ui/icons/lucide"
      sampleIcons={ICONS_MASTER}
    />
  );
};

// ==========================================
// 4. PHOSPHOR ICONS
// ==========================================
export const PhosphorIconsPage = () => {
  return (
    <IconExplorer
      title="Phosphor Icons"
      libraryName="Phosphor Icons"
      libraryPrefix="ph ph-"
      description="Flexible icon family for interfaces, diagrams, presentations, and everything in between."
      breadcrumbPath="/ui/icons/phosphor"
      sampleIcons={ICONS_MASTER}
    />
  );
};
