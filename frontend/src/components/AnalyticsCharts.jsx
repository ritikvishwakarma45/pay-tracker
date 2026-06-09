import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function AnalyticsCharts({ transactions }) {
  const [timeRange, setTimeRange] = useState('ALL'); // '6M' or 'ALL'

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Data Prep: Category Doughnut Chart
  const categoryTotals = transactions.reduce((acc, curr) => {
    const cat = curr.category || 'Others';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const totalSpentAllTime = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

  const categoryColorMap = {
    'Food': '#006c49',          // secondary
    'Bills': '#151c27',         // primary (charcoal)
    'Education': '#5B21B6',     // indigo
    'Entertainment': '#6cf8bb', // secondary container (light green)
    'Shopping': '#F59E0B',      // amber/orange
    'Others': '#94A3B8'         // gray
  };

  const categoryData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat],
    percentage: Math.round((categoryTotals[cat] / totalSpentAllTime) * 100),
    color: categoryColorMap[cat] || '#94A3B8'
  })).sort((a, b) => b.value - a.value);

  // 2. Data Prep: Monthly Trend Line/Area Chart
  // Group transactions by Month
  const monthlyTotals = transactions.reduce((acc, curr) => {
    const d = new Date(curr.date);
    // e.g. "2026-06"
    const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    const sortKey = d.getFullYear() * 100 + d.getMonth();
    
    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthKey, amount: 0, sortKey };
    }
    acc[monthKey].amount += curr.amount;
    return acc;
  }, {});

  // Convert to sorted array
  let trendData = Object.values(monthlyTotals).sort((a, b) => a.sortKey - b.sortKey);
  
  if (timeRange === '6M') {
    trendData = trendData.slice(-6);
  }

  // Custom tooltip components
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
          <p className="font-semibold">{data.name}</p>
          <p className="mt-1 font-bold">{formatCurrency(data.value)} ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs">
          <p className="font-semibold text-gray-400">{payload[0].payload.name}</p>
          <p className="mt-1 font-bold text-accent">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Breakdown Card (Span 5) */}
      <section className="lg:col-span-5 bg-white rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col items-center">
        <h3 className="font-title-lg text-[18px] font-semibold text-primary w-full mb-6">Category Breakdown</h3>
        
        {categoryData.length > 0 ? (
          <>
            <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Centered Total Text */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider">Total spent</span>
                <span className="font-headline-md text-[22px] font-bold text-primary mt-0.5">
                  {formatCurrency(totalSpentAllTime)}
                </span>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="font-body-md text-[13px] text-on-surface-variant flex-1 truncate">{item.name}</span>
                  <span className="font-label-md text-[13px] text-primary font-bold">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-[14px]">
            No data available. Scan a receipt to populate!
          </div>
        )}
      </section>

      {/* Trend Area Chart Card (Span 7) */}
      <section className="lg:col-span-7 bg-white rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-title-lg text-[18px] font-semibold text-primary">Expense Trends</h3>
          <div className="flex gap-1 bg-[#F1F5F9] rounded-lg p-1">
            <button 
              onClick={() => setTimeRange('6M')}
              className={`font-label-md text-[12px] px-3 py-1 rounded-md transition-all ${
                timeRange === '6M' 
                  ? 'bg-white shadow-sm text-primary font-semibold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              6M
            </button>
            <button 
              onClick={() => setTimeRange('ALL')}
              className={`font-label-md text-[12px] px-3 py-1 rounded-md transition-all ${
                timeRange === 'ALL' 
                  ? 'bg-white shadow-sm text-primary font-semibold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {trendData.length > 0 ? (
          <div className="flex-1 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006c49" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#006c49" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#46474a', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#46474a', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#006c49" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-[14px]">
            No transaction trends available.
          </div>
        )}
      </section>
    </div>
  );
}
