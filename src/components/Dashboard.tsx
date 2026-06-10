/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Menu, 
  User, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronRight,
  ShoppingCart,
  Car,
  DollarSign,
  Utensils,
  Film,
  Activity,
  Plus,
  Compass,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Transaction, Category, Budget } from '../types';

interface DashboardProps {
  balance: number;
  transactions: Transaction[];
  budgets: Budget[];
  setActiveTab: (tab: 'dashboard' | 'history' | 'add' | 'budgets') => void;
  onOpenAddTransaction: () => void;
}

export default function Dashboard({
  balance,
  transactions,
  budgets,
  setActiveTab,
  onOpenAddTransaction,
}: DashboardProps) {
  // Let's grab the latest 4 transactions
  const testTransactions = transactions.slice(0, 4);

  // Map category to Lucide icon & bg color
  const getCategoryIcon = (category: Category, payee: string) => {
    const isIncome = payee.toLowerCase().includes('salary') || payee.toLowerCase().includes('deposit');
    if (isIncome) {
      return {
        icon: <Briefcase className="w-5 h-5" />,
        color: 'text-brand-secondary bg-brand-secondary-container',
      };
    }

    switch (category) {
      case Category.FOOD:
        return {
          icon: <Utensils className="w-5 h-5" />,
          color: 'text-orange-700 bg-orange-100',
        };
      case Category.TRANSPORT:
        return {
          icon: <Car className="w-5 h-5" />,
          color: 'text-cyan-700 bg-cyan-100',
        };
      case Category.HOUSING:
        return {
          icon: <Compass className="w-5 h-5" />,
          color: 'text-emerald-700 bg-emerald-100',
        };
      case Category.FUN:
        return {
          icon: <Film className="w-5 h-5" />,
          color: 'text-pink-700 bg-pink-100',
        };
      case Category.HEALTH:
        return {
          icon: <Activity className="w-5 h-5" />,
          color: 'text-red-700 bg-red-100',
        };
      default:
        return {
          icon: <CreditCard className="w-5 h-5" />,
          color: 'text-brand-on-primary-container bg-brand-primary-container/20',
        };
    }
  };

  // Safe computation of total groceries used for Weekly Limit card
  const groceryBudget = budgets.find((b) => b.category === Category.FOOD) || {
    spent: 850.0,
    limit: 1000.0,
  };
  const usedPercent = Math.min(
    100,
    Math.round((groceryBudget.spent / groceryBudget.limit) * 100)
  );

  return (
    <div className="space-y-6 relative select-none">
      {/* TopAppBar - only visible on Mobile */}
      <header className="flex md:hidden items-center justify-between h-16 w-full mb-2">
        <div className="flex items-center gap-4">
          <button className="p-2 text-brand-on-surface-variant hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-80">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">Balance</h1>
        </div>
        <div className="flex items-center">
          <button className="p-2 text-brand-on-surface-variant hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-80">
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Hero Card & Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Total Balance Card */}
        <div className="md:col-span-8 bg-gradient-to-br from-brand-primary-container to-brand-primary p-8 rounded-[28px] text-white relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-sm">
          <div className="z-10 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-sm font-semibold uppercase tracking-widest text-brand-on-primary-container opacity-90">Total Balance</span>
              <p className="text-4xl md:text-5xl font-bold tracking-tight text-white mt-1">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-brand-secondary-fixed" />
              <span className="text-xs font-semibold text-brand-secondary-fixed tracking-wide">Fiscal Precision</span>
            </div>
          </div>
          <div className="z-10 flex gap-4 items-center mt-6">
            <div className="flex items-center gap-1 text-brand-secondary-fixed text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+2.4% this month</span>
            </div>
            <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-brand-secondary-fixed w-3/4 rounded-full"></div>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-brand-primary rounded-full blur-[80px] opacity-40"></div>
          <div className="absolute right-12 top-4 w-32 h-32 bg-brand-secondary-fixed-dim rounded-full blur-[60px] opacity-20"></div>
        </div>

        {/* Weekly Limit Insight Card */}
        <div className="md:col-span-4 bg-brand-surface-container-low rounded-[28px] p-6 flex flex-col justify-between shadow-sm border border-brand-outline-variant/30">
          <div>
            <h3 className="text-lg font-bold text-brand-on-surface mb-3">Weekly Limit</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold py-1 px-2.5 rounded-full text-brand-on-tertiary-container bg-brand-tertiary-fixed border border-brand-on-tertiary-container/10">
                    {usedPercent}% Used
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-tertiary">
                    ${groceryBudget.spent.toLocaleString('en-US')} / ${groceryBudget.limit.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-brand-outline-variant">
                <div 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-on-tertiary-container transition-all duration-500 rounded-full" 
                  style={{ width: `${usedPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-brand-on-surface-variant italic mt-2">
            "You're approaching your limit for Groceries. Consider eating in today."
          </p>
        </div>
      </div>

      {/* Charts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart Section */}
        <div className="lg:col-span-7 bg-brand-surface-container-low rounded-[28px] p-6 border border-brand-outline-variant/30 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-on-surface">Weekly Spending</h3>
            <div className="flex gap-1.5 p-1 bg-brand-surface-container rounded-full">
              <button className="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-brand-on-surface shadow-sm transition-all">Week</button>
              <button className="px-3.5 py-1 rounded-full text-xs font-bold text-brand-on-surface-variant hover:text-brand-on-surface transition-colors">Month</button>
            </div>
          </div>
          
          <div className="relative h-60 w-full flex items-end justify-between px-2 pt-4">
            {/* Embedded High Fidelity SVG Chart Graphic */}
            <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a237e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1a237e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                className="text-brand-primary" 
                d="M 10 170 Q 70 120 130 140 T 250 80 T 310 120 T 390 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4"
                strokeLinecap="round"
              ></path>
              <path 
                d="M 10 170 Q 70 120 130 140 T 250 80 T 310 120 T 390 40 L 390 200 L 10 200 Z" 
                fill="url(#chartGradient)"
              ></path>
              {/* Dynamic Coordinate Highlights */}
              <circle className="text-brand-primary" cx="130" cy="140" fill="white" r="6" stroke="currentColor" strokeWidth="2.5"></circle>
              <circle className="text-brand-primary" cx="250" cy="80" fill="white" r="6" stroke="currentColor" strokeWidth="2.5"></circle>
              <circle className="text-brand-primary" cx="390" cy="40" fill="white" r="6" stroke="currentColor" strokeWidth="2.5"></circle>
            </svg>
            
            {/* Days coordinate labels */}
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx} className="z-10 flex flex-col items-center">
                <span className="h-40 w-1 bg-transparent"></span>
                <span className="text-xs font-semibold text-brand-on-surface-variant mt-2">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Widget */}
        <div className="lg:col-span-5 bg-brand-surface-container-low rounded-[28px] p-6 border border-brand-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-brand-on-surface animate-fade-in">Recent Transactions</h3>
              <button 
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-brand-primary hover:text-brand-primary-light flex items-center gap-0.5 hover:underline"
              >
                See All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
              {testTransactions.map((tx) => {
                const iconMeta = getCategoryIcon(tx.category, tx.payee);
                const isExpense = tx.amount < 0;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-brand-surface-container-high transition-all border border-brand-outline-variant/10 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${iconMeta.color}`}>
                        {iconMeta.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-on-surface line-clamp-1">{tx.payee}</p>
                        <p className="text-xs text-brand-on-surface-variant mt-0.5">
                          {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)} • {tx.date === '2026-06-10' ? 'Today' : tx.date === '2026-06-09' ? 'Yesterday' : 'Recent'}, {tx.time}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold whitespace-nowrap ${isExpense ? 'text-brand-error' : 'text-brand-secondary'}`}>
                      {isExpense ? '' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button inside screen container - Hidden on desktop */}
      <button 
        onClick={onOpenAddTransaction}
        id="dashboard-fab"
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-primary hover:bg-brand-primary-light text-white rounded-[20px] shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 group hover:bg-indigo-900 border border-indigo-950 md:hidden"
      >
        <Plus className="w-8 h-8 md:w-9 md:h-9" />
      </button>
    </div>
  );
}
