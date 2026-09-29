import React from 'react';

export const LoadingSkeleton = ({ type = 'dashboard' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/4" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-56 bg-slate-50 rounded" />
        </div>
        <div className="h-80 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="w-48 h-48 mx-auto rounded-full border-8 border-slate-100" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/4" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
