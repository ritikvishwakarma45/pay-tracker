import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function Insights() {
  const { transactions } = useOutletContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Analytics & Insights</h2>
        <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">
          Inspect categories and trends over time.
        </p>
      </div>
      <AnalyticsCharts transactions={transactions} />
    </div>
  );
}
