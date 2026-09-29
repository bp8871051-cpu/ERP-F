import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available for this view.',
  action,
}) => {
  return (
    <div className="py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-medium text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
