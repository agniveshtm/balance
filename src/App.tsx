/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PlusCircle, 
  PieChart,
  CheckCircle2,
  Bell,
  TrendingUp
} from 'lucide-react';

import { Transaction, Budget, Category } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './data';

import Dashboard from './components/Dashboard';
import History from './components/History';
import AddTransaction from './components/AddTransaction';
import Budgets from './components/Budgets';
import Reports from './components/Reports';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add' | 'budgets' | 'reports'>('dashboard');
  
  // Persisted state indicators
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('balance_transactions');
    return cached ? JSON.parse(cached) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const cached = localStorage.getItem('balance_budgets');
    return cached ? JSON.parse(cached) : INITIAL_BUDGETS;
  });

  const [balance, setBalance] = useState<number>(() => {
    const cached = localStorage.getItem('balance_total');
    return cached ? parseFloat(cached) : 42850.12;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('balance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('balance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('balance_total', balance.toString());
  }, [balance]);

  // Display clean success toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add a new transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `t-${Date.now()}`,
    };

    // Prepend to transaction list
    setTransactions((prev) => [tx, ...prev]);

    // Update main total balance
    setBalance((prev) => prev + tx.amount);

    // If transaction corresponds to an active budget categories expense, automatically update the spent value!
    if (tx.amount < 0) {
      setBudgets((prevBudgets) => 
        prevBudgets.map((b) => {
          if (b.category === tx.category) {
            const updatedSpent = b.spent + Math.abs(tx.amount);
            return {
              ...b,
              spent: updatedSpent,
              status: (updatedSpent / b.limit) >= 0.85 ? 'critical' : 'healthy',
            };
          }
          return b;
        })
      );
    }

    triggerToast('Transaction saved successfully!');
  };

  // Delete an existing transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Remove from array list
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert balance calculation
    setBalance((prev) => prev - tx.amount);

    // If it was an expense category, reduce the spent budget value!
    if (tx.amount < 0) {
      setBudgets((prevBudgets) => 
        prevBudgets.map((b) => {
          if (b.category === tx.category) {
            const updatedSpent = Math.max(0, b.spent - Math.abs(tx.amount));
            return {
              ...b,
              spent: updatedSpent,
              status: (updatedSpent / b.limit) >= 0.85 ? 'critical' : 'healthy',
            };
          }
          return b;
        })
      );
    }

    triggerToast('Transaction completed successfully deleted.');
  };

  // Dynamic add new budget target limit
  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budget: Budget = {
      ...newBudget,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, budget]);
    triggerToast('New budget limit category created!');
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-on-surface">
      {/* Responsive layout wrapper */}
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row relative">
        
        {/* Sidebar Navigation - only visible on Desktop/Tablets */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-outline-variant/25 p-6 space-y-8 min-h-screen sticky top-0 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary-container flex items-center justify-center text-brand-primary">
              <span className="font-extrabold text-blue-100 text-xl">B</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-primary leading-none">Balance</h2>
              <span className="text-[10px] font-semibold text-brand-on-surface-variant uppercase tracking-wider">Fiscal Precision</span>
            </div>
          </div>

          <div className="space-y-1.5 flex-grow">
            <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider px-3 block mb-2">Navigation</span>
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container shadow-sm' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 animate-pulse" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container shadow-sm' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <ReceiptText className="w-5 h-5" />
              <span>History</span>
            </button>

            <button 
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'add' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container shadow-sm' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Transaction</span>
            </button>

            <button 
              onClick={() => setActiveTab('budgets')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'budgets' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container shadow-sm' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span>Budgets</span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container shadow-sm' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Reports</span>
            </button>
          </div>

          {/* User Profile Widget */}
          <div className="pt-4 border-t border-brand-outline-variant/20 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-primary-container/20 flex items-center justify-center text-brand-primary">
              <span className="font-bold text-sm">AM</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-brand-on-surface truncate">Agnivesh M.</p>
              <p className="text-[10px] text-brand-on-surface-variant truncate">agniveshtm2724@gmail.com</p>
            </div>
          </div>
        </aside>

        {/* Main Content Pane Area */}
        <div className="flex-grow bg-white md:bg-transparent min-h-screen flex flex-col justify-between max-w-full md:px-8 md:py-6 relative overflow-x-hidden">
          <div className="flex-1 px-4 md:px-0 pt-2 pb-24 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    balance={balance}
                    transactions={transactions}
                    budgets={budgets}
                    setActiveTab={setActiveTab}
                    onOpenAddTransaction={() => setActiveTab('add')}
                  />
                )}

                {activeTab === 'history' && (
                  <History 
                    transactions={transactions}
                    onDeleteTransaction={handleDeleteTransaction}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'add' && (
                  <AddTransaction 
                    onAddTransaction={handleAddTransaction}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'budgets' && (
                  <Budgets 
                    budgets={budgets}
                    transactions={transactions}
                    onAddBudget={handleAddBudget}
                  />
                )}

                {activeTab === 'reports' && (
                  <Reports 
                    transactions={transactions}
                    setActiveTab={setActiveTab}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Global Toast Message Feedback Module */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 30, x: '-50%' }}
                className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 z-[100] border border-neutral-800"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-secondary-fixed-dim" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beautiful MD3 BottomNavigationBar Tab Bar - Mobile only */}
          <nav className="fixed bottom-0 left-0 right-0 w-full z-45 flex justify-around items-center py-2.5 bg-brand-surface-container-low border-t border-brand-outline-variant/30 backdrop-blur-md select-none md:hidden max-w-md mx-auto rounded-t-3xl shadow-lg">
            {/* Dashboard Tab Button */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container rounded-full px-4 py-1.5' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface px-2.5 py-1.5'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Dashboard</span>
            </button>

            {/* History Tab Button */}
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container rounded-full px-4 py-1.5' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface px-2.5 py-1.5'
              }`}
            >
              <ReceiptText className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">History</span>
            </button>

            {/* Add Tab Button */}
            <button 
              onClick={() => setActiveTab('add')}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'add' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container rounded-full px-4 py-1.5' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface px-2.5 py-1.5'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Add</span>
            </button>

            {/* Budgets Tab Button */}
            <button 
              onClick={() => setActiveTab('budgets')}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'budgets' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container rounded-full px-4 py-1.5' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface px-2.5 py-1.5'
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Budgets</span>
            </button>

            {/* Reports Tab Button */}
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container rounded-full px-4 py-1.5' 
                  : 'text-brand-on-surface-variant hover:text-brand-on-surface px-2.5 py-1.5'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Reports</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
