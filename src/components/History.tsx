/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  MoreVertical, 
  Search, 
  Calendar,
  Layers,
  Wallet,
  Utensils,
  Car,
  Compass,
  Film,
  Activity,
  CreditCard,
  TrendingDown,
  Trash2,
  Briefcase
} from 'lucide-react';
import { Transaction, Category } from '../types';

interface HistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  setActiveTab: (tab: 'dashboard' | 'history' | 'add' | 'budgets') => void;
}

export default function History({
  transactions,
  onDeleteTransaction,
  setActiveTab,
}: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'groceries' | 'transport' | 'fun' | 'income'>('all');
  const [isThisMonthOnly, setIsThisMonthOnly] = useState(false);

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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search text match
      const textMatch = 
        tx.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!textMatch) return false;

      // Horizontal Quick filter match
      if (activeFilter === 'groceries' && tx.category !== Category.FOOD) return false;
      if (activeFilter === 'transport' && tx.category !== Category.TRANSPORT) return false;
      if (activeFilter === 'fun' && tx.category !== Category.FUN) return false;
      if (activeFilter === 'income' && tx.type !== 'income') return false;

      // Month filter
      if (isThisMonthOnly) {
        // Simple check since our mock dates are mostly June 2026/2023
        return tx.date.startsWith('2026-06');
      }

      return true;
    });
  }, [transactions, searchQuery, activeFilter, isThisMonthOnly]);

  // Group transactions by Date Label
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    filteredTransactions.forEach((tx) => {
      let label = tx.date;
      if (tx.date === '2026-06-10') {
        label = 'Today';
      } else if (tx.date === '2026-06-09') {
        label = 'Yesterday';
      } else {
        // Pretty formatting for older dates like "2026-06-01" or "2026-06-05"
        const [, m, d] = tx.date.split('-');
        if (m === '06') {
          label = `June ${parseInt(d)}, 2026`;
        } else if (tx.date === '2026-06-01') {
          label = 'June 1, 2026';
        } else {
          label = 'July 12, 2023';
        }
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  // Compute stats for the Analysis header
  const totalSpend = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => t.amount < 0 && t.date.startsWith('2026-06'))
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }, [transactions]);

  const monthlyBudgetLimit = 4000.0;
  const progressPercentage = Math.min(100, Math.round((totalSpend / monthlyBudgetLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <header className="flex items-center justify-between h-16 w-full mb-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-brand-on-surface hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-brand-on-surface">History</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-brand-on-surface hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-80">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <button className="p-2 text-brand-on-surface hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-80">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Section */}
      <section className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-brand-on-surface-variant" />
        </div>
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-brand-surface-container-high border-none rounded-full h-14 pl-12 pr-4 text-base focus:ring-2 focus:ring-brand-primary transition-all placeholder:text-brand-on-surface-variant text-brand-on-surface" 
          placeholder="Search transactions" 
          type="search"
        />
      </section>

      {/* Horizontal Filter Chips */}
      <section className="flex gap-2 overflow-x-auto scroll-hide pb-2 custom-scrollbar">
        <button 
          onClick={() => setIsThisMonthOnly(!isThisMonthOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap active:scale-95 ${
            isThisMonthOnly 
              ? 'bg-brand-secondary-container text-brand-on-secondary-container border border-brand-secondary/20' 
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          This Month
        </button>
        
        <button 
          onClick={() => setActiveFilter(activeFilter === 'all' ? 'all' : 'all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeFilter === 'all' 
              ? 'bg-brand-primary text-white' 
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          All Categories
        </button>

        <button 
          onClick={() => setActiveFilter(activeFilter === 'groceries' ? 'all' : 'groceries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeFilter === 'groceries' 
              ? 'bg-brand-primary text-white'
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          Groceries (Food)
        </button>

        <button 
          onClick={() => setActiveFilter(activeFilter === 'transport' ? 'all' : 'transport')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeFilter === 'transport' 
              ? 'bg-brand-primary text-white' 
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          Transport
        </button>

        <button 
          onClick={() => setActiveFilter(activeFilter === 'fun' ? 'all' : 'fun')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeFilter === 'fun' 
              ? 'bg-brand-primary text-white' 
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          Fun / Tickets
        </button>

        <button 
          onClick={() => setActiveFilter(activeFilter === 'income' ? 'all' : 'income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
            activeFilter === 'income' 
              ? 'bg-brand-primary text-white' 
              : 'border border-brand-outline hover:bg-brand-surface-container-low text-brand-on-surface-variant'
          }`}
        >
          Incomes Only
        </button>
      </section>

      {/* Dynamic Date Groups */}
      <div className="space-y-5">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Layers className="w-12 h-12 mx-auto text-brand-outline opacity-40" />
            <p className="font-semibold text-brand-on-surface">No transactions found</p>
            <p className="text-xs text-brand-on-surface-variant">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <section key={dateLabel} className="space-y-2">
              <h2 className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider ml-1">
                {dateLabel}
              </h2>
              <div className="bg-brand-surface-container-low rounded-2xl overflow-hidden border border-brand-outline-variant/30 shadow-sm divide-y divide-brand-surface-variant/40">
                {groupedTransactions[dateLabel].map((tx) => {
                  const iconMeta = getCategoryIcon(tx.category, tx.payee);
                  const isExpense = tx.amount < 0;
                  return (
                    <div 
                      key={tx.id} 
                      className="group flex items-center justify-between p-4 hover:bg-brand-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${iconMeta.color}`}>
                          {iconMeta.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-on-surface leading-tight">{tx.payee}</p>
                          <p className="text-xs text-brand-on-surface-variant mt-0.5">
                            {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)} • {tx.time} {tx.account && `• ${tx.account}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-bold ${isExpense ? 'text-brand-tertiary' : 'text-brand-on-secondary-container'}`}>
                          {isExpense ? '' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-brand-outline opacity-0 group-hover:opacity-100 hover:text-brand-error p-1.5 hover:bg-brand-error-container/40 rounded-full transition-all focus:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Insights Preview Card / Monthly Analysis Card */}
      <section className="mt-8">
        <div className="relative overflow-hidden rounded-[24px] p-6 bg-brand-primary text-white shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-container opacity-20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Monthly Analysis</h3>
                <p className="text-xs text-brand-primary-fixed opacity-85 mt-0.5">You spent 12% less than last month.</p>
              </div>
              <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <TrendingDown className="w-5 h-5 text-brand-secondary-fixed" />
              </div>
            </div>
            
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-secondary-fixed rounded-full transition-all duration-700" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs font-semibold text-brand-primary-fixed">
              <span>${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })} spent</span>
              <span>${monthlyBudgetLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })} budget</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
