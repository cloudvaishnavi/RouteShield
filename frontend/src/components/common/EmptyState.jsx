import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Data Available', message = 'No records match your current criteria.', action }) {
  return (
    <div className="p-12 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
        <Inbox className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{message}</p>
      </div>
      {action && (
        <div className="pt-2">{action}</div>
      )}
    </div>
  );
}
