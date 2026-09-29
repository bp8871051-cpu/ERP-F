import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Target, Briefcase, Tag, X, ArrowRight, Loader2 } from 'lucide-react';
import crmService from '../../services/crmService';

export const CrmSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await crmService.searchCrm(query);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search CRM Contacts, Leads, Deals, Customers, Campaigns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!results && !loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all CRM entities.
            </div>
          )}

          {results && (
            <>
              {/* Contacts */}
              {results.contacts?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    Contacts ({results.contacts.length})
                  </h4>
                  <div className="space-y-1">
                    {results.contacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(`/app/crm/contacts/${c.id}`)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-teal-50/60 flex items-center justify-between text-xs group cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 group-hover:text-teal-700">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {c.company_name ? `• ${c.company_name}` : ''} {c.email ? `• ${c.email}` : ''}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads */}
              {results.leads?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Leads ({results.leads.length})
                  </h4>
                  <div className="space-y-1">
                    {results.leads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleSelect(`/app/crm/leads/${l.id}`)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center justify-between text-xs group cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                            {l.name}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {l.company_name ? `• ${l.company_name}` : ''} • Score: {l.score}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deals */}
              {results.deals?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    Deals ({results.deals.length})
                  </h4>
                  <div className="space-y-1">
                    {results.deals.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(`/app/crm/deals/${d.id}`)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/60 flex items-center justify-between text-xs group cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 group-hover:text-amber-700">
                            {d.name}
                          </span>
                          <span className="text-slate-400 ml-2">
                            • {d.currency === 'INR' ? '₹' : '$'}{Number(d.value).toLocaleString()} • {d.stage?.name || 'Stage'}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaigns */}
              {results.campaigns?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    Campaigns ({results.campaigns.length})
                  </h4>
                  <div className="space-y-1">
                    {results.campaigns.map((camp) => (
                      <button
                        key={camp.id}
                        onClick={() => handleSelect(`/app/crm/campaigns/${camp.id}`)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-purple-50/60 flex items-center justify-between text-xs group cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 group-hover:text-purple-700">
                            {camp.name}
                          </span>
                          <span className="text-slate-400 ml-2">
                            • {camp.type} • Status: {camp.status}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!results.contacts?.length && !results.leads?.length && !results.deals?.length && !results.campaigns?.length) && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No records found matching "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrmSearchModal;
