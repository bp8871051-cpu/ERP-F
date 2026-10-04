import React, { useState } from 'react';
import { Copy, Check, Code2, Eye } from 'lucide-react';

export const UIDemoCard = ({
  title,
  subtitle,
  children,
  code,
  badge,
  className = '',
}) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all ${className}`}>
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {code && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                showCode
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Code View"
            >
              {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{showCode ? 'Preview' : 'Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Component Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="p-5 sm:p-6">
        {showCode && code ? (
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
            <code>{code}</code>
          </pre>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default UIDemoCard;
