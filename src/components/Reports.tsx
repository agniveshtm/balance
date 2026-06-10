/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  Menu, 
  User, 
  Calendar, 
  PieChart as LucidePieChart, 
  Layers, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend,
  Cell
} from 'recharts';
import { Transaction, Category } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  setActiveTab: (tab: 'dashboard' | 'history' | 'add' | 'budgets' | 'reports') => void;
}

export default function Reports({ transactions, setActiveTab }: ReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const monthNames: Record<string, string> = {
    '2026-01': 'January',
    '2026-02': 'February',
    '2026-03': 'March',
    '2026-04': 'April',
    '2026-05': 'May',
    '2026-06': 'June',
  };

  const monthKeys = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

  // Aggregate monthly spending patterns dynamically from transactions history
  const chartData = useMemo(() => {
    return monthKeys.map((key) => {
      const monthTxs = transactions.filter((t) => t.date.startsWith(key));
      
      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const expenses = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const food = monthTxs.filter((t) => t.category === Category.FOOD).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const transport = monthTxs.filter((t) => t.category === Category.TRANSPORT).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const housing = monthTxs.filter((t) => t.category === Category.HOUSING).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const fun = monthTxs.filter((t) => t.category === Category.FUN).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const health = monthTxs.filter((t) => t.category === Category.HEALTH).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const others = monthTxs.filter((t) => t.category === Category.OTHERS).reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        key,
        name: monthNames[key].slice(0, 3),
        fullName: monthNames[key],
        Income: parseFloat(income.toFixed(2)),
        Expenses: parseFloat(expenses.toFixed(2)),
        Savings: parseFloat(Math.max(0, income - expenses).toFixed(2)),
        [Category.FOOD]: parseFloat(food.toFixed(2)),
        [Category.TRANSPORT]: parseFloat(transport.toFixed(2)),
        [Category.HOUSING]: parseFloat(housing.toFixed(2)),
        [Category.FUN]: parseFloat(fun.toFixed(2)),
        [Category.HEALTH]: parseFloat(health.toFixed(2)),
        [Category.OTHERS]: parseFloat(others.toFixed(2)),
      };
    });
  }, [transactions]);

  // Calculations for quick descriptive stats cards
  const summaryStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let maxExpenseMonth = { name: '', amount: 0 };
    let funTrends: { month: string; amount: number }[] = [];

    chartData.forEach((d) => {
      totalIncome += d.Income;
      totalExpense += d.Expenses;
      funTrends.push({ month: d.fullName, amount: d[Category.FUN] });

      if (d.Expenses > maxExpenseMonth.amount) {
        maxExpenseMonth = { name: d.fullName, amount: d.Expenses };
      }
    });

    const averageSavingsPercent = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
    
    // Sort to spot the peak seasonal month for FUN categories
    const sortedFun = [...funTrends].sort((a, b) => b.amount - a.amount);
    const peakFunMonth = sortedFun[0] || { month: 'N/A', amount: 0 };

    return {
      totalIncome,
      totalExpense,
      averageSavingsPercent,
      maxExpenseMonth,
      peakFunMonth,
    };
  }, [chartData]);

  // Color mappings matching our high fidelity design palette
  const categoryMeta: Record<Category | 'others', { label: string; color: string }> = {
    [Category.FOOD]: { label: 'Food & Groceries', color: '#ff9800' },
    [Category.TRANSPORT]: { label: 'Transport', color: '#00bcd4' },
    [Category.HOUSING]: { label: 'Housing & Utilities', color: '#4caf50' },
    [Category.FUN]: { label: 'Entertainment & Fun', color: '#e91e63' },
    [Category.HEALTH]: { label: 'Health & Medical', color: '#f44336' },
    [Category.OTHERS]: { label: 'Others', color: '#9e9e9e' },
    [Category.INCOME]: { label: 'Income', color: '#1b6d24' }
  };

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: '#f8f9fc',
      border: '1px solid #c6c5d4',
      borderRadius: '16px',
      fontSize: '12px',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'bold',
      color: '#191c1e',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }
  };

  return (
    <div className="space-y-6 relative select-none pb-8">
      {/* Top Header - Mobile Only */}
      <header className="flex md:hidden items-center justify-between h-16 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-brand-primary hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-85"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-brand-primary">Reports</h1>
        </div>
        <div className="flex items-center">
          <button className="p-2 text-brand-primary hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-85">
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Title - Desktop Only */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-brand-primary">Financial Reports & Trends</h1>
        <p className="text-sm text-brand-on-surface-variant mt-1">Identify seasonal spending patterns and analyze caching savings rates over the past 6 months.</p>
      </div>

      {/* Summary Stats Overview Bento Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-surface-container-low p-5 rounded-[24px] border border-brand-outline-variant/30 shadow-sm">
          <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider block mb-1">6-Month Net Income</span>
          <div className="text-2xl font-extrabold text-brand-primary">
            ${summaryStats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-green-700 font-semibold flex items-center gap-1 mt-2 bg-green-100 px-2 py-0.5 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            +100% stable input
          </span>
        </div>

        <div className="bg-brand-surface-container-low p-5 rounded-[24px] border border-brand-outline-variant/30 shadow-sm">
          <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider block mb-1">6-Month Total Spending</span>
          <div className="text-2xl font-extrabold text-brand-primary">
            ${summaryStats.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-brand-on-tertiary-container font-semibold flex items-center gap-1 mt-2 bg-brand-tertiary-fixed px-2 py-0.5 rounded-full w-fit">
            <TrendingDown className="w-3.5 h-3.5" />
            Peak outflow in {summaryStats.maxExpenseMonth.name}
          </span>
        </div>

        <div className="bg-brand-surface-container-low p-5 rounded-[24px] border border-brand-outline-variant/30 shadow-sm">
          <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider block mb-1">Average Savings Margin</span>
          <div className="text-2xl font-extrabold text-brand-primary">
            {summaryStats.averageSavingsPercent}%
          </div>
          <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-2 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Saving healthy reserve
          </span>
        </div>
      </div>

      {/* Chart Panel 1: Income vs Expenses Trajectory */}
      <section className="bg-brand-surface-container-low rounded-[28px] p-6 border border-brand-outline-variant/30 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-brand-on-surface">Income & Spending Trajectory</h3>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">Dual area curves comparing cash flows over time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-3 h-3 rounded-full bg-brand-secondary"></span>
              <span className="text-brand-on-surface-variant">Income</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#3b0900]"></span>
              <span className="text-brand-on-surface-variant">Expense</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-76 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b6d24" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1b6d24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8a1010" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8a1010" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8eb" />
              <XAxis dataKey="name" stroke="#767683" fontSize={11} fontWeight="bold" dy={8} tickLine={false} />
              <YAxis stroke="#767683" fontSize={11} fontWeight="semibold" dx={-4} tickLine={false} axisLine={false} />
              <Tooltip {...customTooltipStyle} formatter={(val: number) => [`$${val.toLocaleString()}`]} />
              <Area type="monotone" dataKey="Income" stroke="#1b6d24" strokeWidth={3} fillOpacity={1} fill="url(#incomeColor)" />
              <Area type="monotone" dataKey="Expenses" stroke="#ba1a1a" strokeWidth={3} fillOpacity={1} fill="url(#expenseColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chart Panel 2: Seasonal Category Explorer */}
      <section className="bg-brand-surface-container-low rounded-[28px] p-6 border border-brand-outline-variant/30 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-brand-on-surface">Seasonal Spending Allocation</h3>
            <p className="text-xs text-brand-on-surface-variant mt-0.5">Visualize specific category behaviors across past seasons.</p>
          </div>
          
          {/* Quick Select Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-on-surface-variant">Focus:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              className="bg-white border border-brand-outline-variant/40 rounded-full px-3.5 py-1.5 text-xs font-bold text-brand-on-surface focus:outline-none focus:ring-1 focus:ring-brand-primary pr-8"
            >
              <option value="all">All Combined Outflows</option>
              <option value={Category.FOOD}>Food & Groceries</option>
              <option value={Category.FUN}>Entertainment & Fun</option>
              <option value={Category.HOUSING}>Rent & Housing</option>
              <option value={Category.TRANSPORT}>Transport & Fuel</option>
              <option value={Category.HEALTH}>Health & Wellness</option>
            </select>
          </div>
        </div>

        <div className="h-68 sm:h-76 w-full">
          {selectedCategory === 'all' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8eb" />
                <XAxis dataKey="name" stroke="#767683" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#767683" fontSize={11} fontWeight="semibold" tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val: number) => [`$${val.toLocaleString()}`]} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                <Bar dataKey="food" name="Food" fill={categoryMeta[Category.FOOD].color} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="housing" name="Housing" fill={categoryMeta[Category.HOUSING].color} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="transport" name="Transport" fill={categoryMeta[Category.TRANSPORT].color} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fun" name="Entertainment" fill={categoryMeta[Category.FUN].color} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="health" name="Health" fill={categoryMeta[Category.HEALTH].color} stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8eb" />
                <XAxis dataKey="name" stroke="#767683" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#767683" fontSize={11} fontWeight="semibold" tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} formatter={(val: number) => [`$${val.toLocaleString()}`]} />
                <Bar 
                  dataKey={selectedCategory as string} 
                  name={categoryMeta[selectedCategory].label} 
                  fill={categoryMeta[selectedCategory].color} 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry[selectedCategory] > summaryStats.totalExpense / 12 ? categoryMeta[selectedCategory].color : `${categoryMeta[selectedCategory].color}b0`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Seasonal Insights Card */}
      <section className="bg-gradient-to-br from-indigo-900 via-brand-primary to-indigo-950 p-6 rounded-[28px] text-white overflow-hidden shadow-xl border border-indigo-950 relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary-light/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#8690ee]/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex gap-4">
          <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-brand-secondary-fixed" />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Seasonal Spending Diagnostic</h3>
              <p className="text-xs text-[#8690ee] italic mt-0.5">Automated visual diagnostics based on 6-month transaction ratios.</p>
            </div>

            <div className="space-y-3.5 pt-1 text-sm text-blue-50/90 font-medium">
              <div className="flex gap-2.5 items-start">
                <div className="p-0.5 mt-0.5 rounded bg-white/10"><Info className="w-3.5 h-3.5 text-brand-secondary-fixed" /></div>
                <p>
                  <strong>Peak Outdoor Leisure:</strong> Your <span className="text-brand-secondary-fixed">Entertainment & Fun</span> category peaked in <strong>{summaryStats.peakFunMonth.month}</strong> with an outflow of <strong>${summaryStats.peakFunMonth.amount.toLocaleString()}</strong> (due to spring & early summer events/devices).
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="p-0.5 mt-0.5 rounded bg-white/10"><Info className="w-3.5 h-3.5 text-brand-secondary-fixed" /></div>
                <p>
                  <strong>Fixed Base Rent:</strong> Rent and utilities consistently cost <strong>$2,350.00</strong> monthly (representing {Math.round(2350 / (summaryStats.totalExpense / 6))}% of your monthly expenses). Fixed categories show perfect stability.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="p-0.5 mt-0.5 rounded bg-white/10"><Info className="w-3.5 h-3.5 text-brand-secondary-fixed" /></div>
                <p>
                  <strong>Savings Performance:</strong> Average savings margin is <strong>{summaryStats.averageSavingsPercent}%</strong>. This is extremely healthy, representing net assets generated since January.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
