import React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  UserPlus,
  Clock,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';

export const ActivityTimeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        No activity records logged yet.
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'task':
        return <CheckSquare className="w-3.5 h-3.5 text-teal-600" />;
      case 'deal':
      case 'deal_stage':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'invoice':
      case 'payment':
        return <Receipt className="w-3.5 h-3.5 text-green-600" />;
      case 'lead_converted':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-600" />;
      case 'note':
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'call':
        return 'bg-blue-50 border-blue-200';
      case 'email':
        return 'bg-purple-50 border-purple-200';
      case 'meeting':
        return 'bg-amber-50 border-amber-200';
      case 'task':
        return 'bg-teal-50 border-teal-200';
      case 'deal':
      case 'deal_stage':
        return 'bg-emerald-50 border-emerald-200';
      case 'invoice':
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'lead_converted':
        return 'bg-indigo-50 border-indigo-200';
      case 'note':
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act, index) => {
        const dateStr = act.created_at || act.date || act.due_at;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return (
          <div key={act.id || index} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${getBg(
                act.type
              )}`}
            >
              {getIcon(act.type)}
            </div>

            {/* Content card */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  {act.subject || act.title || `${act.type?.toUpperCase()} Activity`}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">
                    {act.type}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{formattedDate}</span>
                </div>
              </div>

              {act.description && (
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                  {act.description}
                </p>
              )}

              {act.content && (
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                  {act.content}
                </p>
              )}

              {/* Extra metadata tags if available */}
              {(act.duration_minutes || act.outcome || act.user?.name || act.created_by) && (
                <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  {act.duration_minutes && <span>Duration: {act.duration_minutes}m</span>}
                  {act.outcome && <span className="capitalize">Outcome: {act.outcome}</span>}
                  {(act.user?.name || act.created_by) && (
                    <span>By: {act.user?.name || act.created_by}</span>
                  )}
                  {act.status && (
                    <span className="font-semibold text-teal-700 capitalize">
                      Status: {act.status}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
