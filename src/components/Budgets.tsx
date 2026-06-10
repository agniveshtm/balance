/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  User, 
  Wallet, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  SlidersHorizontal,
  ChevronRight,
  Tv,
  Home,
  Utensils,
  Plane,
  Plus,
  Compass,
  X,
  PlusCircle,
  FolderPlus,
  Film
} from 'lucide-react';
import { Budget, Category } from '../types';

interface BudgetsProps {
  budgets: Budget[];
  transactions: any[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
}

export default function Budgets({
  budgets,
  transactions,
  onAddBudget,
}: BudgetsProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Custom states for new budget form
  const [newCategory, setNewCategory] = useState<Category>(Category.FOOD);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Map category code to aesthetic icon
  const getBudgetIcon = (category: Category, name: string) => {
    if (name.toLowerCase().includes('trip') || name.toLowerCase().includes('travel')) {
      return <Plane className="w-5 h-5 text-indigo-700" />;
    }
    switch (category) {
      case Category.FOOD:
        return <Utensils className="w-5 h-5 text-orange-700" />;
      case Category.HOUSING:
        return <Home className="w-5 h-5 text-emerald-700" />;
      case Category.FUN:
        return <Film className="w-5 h-5 text-pink-700" />;
      default:
        return <Compass className="w-5 h-5 text-amber-700" />;
    }
  };

  // Safe dynamically computed total expenses and budgets
  const activeTargetsCount = budgets.length;
  
  const criticalCount = useMemo(() => {
    return budgets.filter((b) => (b.spent / b.limit) >= 0.85).length;
  }, [budgets]);

  const totalRemainingBudget = useMemo(() => {
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    return Math.max(0, totalLimit - totalSpent);
  }, [budgets]);

  const handleAddNewBudget = () => {
    const limitNum = parseFloat(newLimit);
    if (!newName.trim()) {
      alert('Please enter a budget target name.');
      return;
    }
    if (isNaN(limitNum) || limitNum <= 0) {
      alert('Please enter a valid target spending limit.');
      return;
    }

    onAddBudget({
      category: newCategory,
      name: newName.trim(),
      limit: limitNum,
      spent: 0,
      status: 'healthy',
      notes: newNotes.trim() || undefined,
    });

    // Reset Form
    setIsAddingNew(false);
    setNewName('');
    setNewLimit('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 relative select-none">
      {/* Top Header Navigation - only visible on Mobile */}
      <header className="flex md:hidden items-center justify-between h-16 w-full">
        <div className="flex items-center gap-4">
          <button className="p-2 text-brand-primary hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-85">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-brand-primary">Balance</h1>
        </div>
        <div className="flex items-center">
          <button className="p-2 text-brand-primary hover:bg-brand-surface-container-low transition-colors rounded-full transition-opacity active:opacity-85">
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Summary Bento Stats Block Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Total Remaining Card */}
        <div className="md:col-span-8 bg-brand-primary-container p-6 rounded-3xl text-white flex flex-col justify-between min-h-[180px] relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-brand-on-primary-container uppercase tracking-wider opacity-90">
              Total Remaining Budget
            </span>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
              ${totalRemainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2 mt-4 text-xs font-semibold text-brand-secondary-fixed">
            <TrendingUp className="w-4 h-4" />
            <span>12% more efficient than last month</span>
          </div>

          {/* Abstract decor background icon */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
        </div>

        {/* Dynamic Quick stats sidebar */}
        <div className="md:col-span-4 grid grid-cols-1 gap-4">
          <div className="bg-brand-surface-container-low p-4 rounded-2xl flex items-center justify-between border-l-4 border-brand-secondary-fixed border-brand-secondary shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Active Budgets</p>
              <p className="text-lg font-extrabold text-brand-on-surface mt-0.5">{activeTargetsCount} Targets</p>
            </div>
            <CheckCircle className="w-6 h-6 text-brand-secondary" />
          </div>

          <div className="bg-brand-surface-container-low p-4 rounded-2xl flex items-center justify-between border-l-4 border-brand-error shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Critical Limit</p>
              <p className="text-lg font-extrabold text-brand-on-surface mt-0.5">{criticalCount} Budgets</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-brand-error" />
          </div>
        </div>
      </section>

      {/* Active Budgets lists section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-on-surface">Active Budgets</h2>
          <button className="bg-brand-surface-container-high px-4 py-2 rounded-full text-xs font-bold text-brand-on-surface-variant flex items-center gap-2 hover:bg-brand-surface-container transition-colors shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Modal-like Overlay to add new spending targets */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-brand-surface-container border border-brand-outline-variant rounded-2xl p-5 overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
                  <FolderPlus className="w-4.5 h-4.5" />
                  Define Fast Budget
                </span>
                <button 
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 hover:bg-brand-surface-container-highest rounded-full"
                >
                  <X className="w-4 h-4 text-brand-on-surface-variant" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-on-surface-variant">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  >
                    <option value={Category.FOOD}>Food & Groceries</option>
                    <option value={Category.TRANSPORT}>Transport & Fuel</option>
                    <option value={Category.HOUSING}>Utilities & Rent</option>
                    <option value={Category.FUN}>Entertainment & Fun</option>
                    <option value={Category.HEALTH}>Health & Wellness</option>
                    <option value={Category.OTHERS}>Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-on-surface-variant">Limit Name</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Weekly Organic Food"
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none placeholder:text-brand-outline-variant"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-on-surface-variant">Limit Target ($)</label>
                  <input 
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none placeholder:text-brand-outline-variant"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-on-surface-variant">Advice Note</label>
                  <input 
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Try to cook more this week"
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none placeholder:text-brand-outline-variant"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddNewBudget}
                className="w-full bg-brand-primary text-white text-xs font-bold py-3 mt-4 rounded-xl shadow-sm hover:scale-[1.01] transition-transform active:scale-95 border border-indigo-950"
              >
                Create Target Spending Limit
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isCircularShape = b.name === 'Groceries' || b.name === 'Summer Trip';
            const usedPercent = Math.min(100, Math.round((b.spent / b.limit) * 100));
            const isCritical = usedPercent >= 85;

            // Simple circular stroke mathematical calculation
            const radius = 56;
            const strokeCircumference = 2 * Math.PI * radius; // Approx 351.85
            const strokeOffset = strokeCircumference - (usedPercent / 100) * strokeCircumference;

            if (isCircularShape) {
              return (
                <div 
                  key={b.id}
                  className="bg-brand-surface-container-low p-6 rounded-3xl flex flex-col items-center text-center transition-transform hover:scale-[1.02] cursor-pointer group border border-brand-outline-variant/30 shadow-sm"
                >
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4 select-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        className="text-brand-surface-container-high" 
                        cx="64" 
                        cy="64" 
                        fill="transparent" 
                        r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8"
                      ></circle>
                      <circle 
                        className={`circular-progress transition-all duration-700 ${isCritical ? 'text-brand-error' : 'text-brand-on-tertiary-container'}`} 
                        cx="64" 
                        cy="64" 
                        fill="transparent" 
                        r={radius} 
                        stroke="currentColor" 
                        strokeDasharray={strokeCircumference} 
                        strokeDashoffset={strokeOffset} 
                        strokeWidth="8"
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-brand-on-surface">{usedPercent}%</span>
                      <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Used</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-brand-on-surface">{b.name}</h3>
                    <p className="text-xs text-brand-on-surface-variant font-medium">
                      ${Math.max(0, b.limit - b.spent).toLocaleString('en-US')} left of ${b.limit.toLocaleString('en-US')}
                    </p>
                  </div>
                  
                  <div className="mt-6 w-full pt-4 border-t border-brand-outline-variant/40 flex justify-between items-center opacity-65 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-bold text-brand-on-surface-variant">
                      {b.name === 'Groceries' ? 'Next reset in 4 days' : 'Saving phase'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-brand-on-surface-variant" />
                  </div>
                </div>
              );
            } else {
              // Linear Card Type representation
              const isHealthy = usedPercent < 70;
              return (
                <div 
                  key={b.id} 
                  className="bg-brand-surface-container-low p-6 rounded-3xl space-y-5 transition-transform hover:scale-[1.02] cursor-pointer group border border-brand-outline-variant/30 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                      isHealthy 
                        ? 'bg-brand-secondary-container text-brand-on-secondary-container' 
                        : 'bg-brand-tertiary-container text-brand-on-tertiary-container'
                    }`}>
                      {getBudgetIcon(b.category, b.name)}
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${
                      isHealthy 
                        ? 'bg-brand-secondary-fixed text-brand-on-secondary-fixed border-brand-brand-secondary/10' 
                        : 'bg-brand-error-container text-brand-error border-brand-brand-error/10'
                    }`}>
                      {isHealthy ? 'Healthy' : 'Critical'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-brand-on-surface">{b.name}</h3>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-brand-on-surface-variant">
                        <span>Used: ${b.spent.toLocaleString('en-US')}</span>
                        <span>Limit: ${b.limit.toLocaleString('en-US')}</span>
                      </div>
                      <div className="mt-2 w-full h-2.5 bg-brand-surface-container-high rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${isHealthy ? 'bg-brand-secondary' : 'bg-brand-error'}`} 
                          style={{ width: `${usedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {b.notes && (
                    <p className={`text-[12px] italic ${isHealthy ? 'text-brand-on-surface-variant' : 'text-brand-error'}`}>
                      "{b.notes}"
                    </p>
                  )}
                </div>
              );
            }
          })}

          {/* Dotted empty state budget box triggering Add Budget Modal */}
          <div 
            onClick={() => setIsAddingNew(true)}
            className="bg-brand-surface-container-lowest border-2 border-dashed border-brand-outline-variant p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-brand-surface-container transition-all group cursor-pointer h-full min-h-[240px]"
          >
            <div className="w-12 h-12 rounded-full bg-brand-surface-container-high flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-brand-on-surface-variant" />
            </div>
            <h3 className="text-sm font-bold text-brand-on-surface">Add New Budget</h3>
            <p className="text-xs text-brand-on-surface-variant mt-1.5 max-w-[180px]">
              Define a new spending limit to keep your finances precise.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Action Button inside budgets tab to prompt expansion - Hide on desktop */}
      <button 
        onClick={() => setIsAddingNew(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all z-40 group hover:bg-slate-900 border border-slate-950 md:hidden"
      >
        <Plus className="w-7 h-7" />
        <span className="absolute right-full mr-3.5 bg-brand-on-surface text-brand-surface text-[11px] font-extrabold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Add Budget
        </span>
      </button>
    </div>
  );
}
