import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center space-x-3">
          {action}
        </div>
      )}
    </div>
  );
}
