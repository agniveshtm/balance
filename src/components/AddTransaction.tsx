/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HelpCircle, 
  Utensils, 
  Car, 
  Home, 
  Ticket, 
  Activity, 
  MoreHorizontal,
  Calendar,
  FileText,
  Wallet,
  CheckCircle,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Category, Transaction } from '../types';

interface AddTransactionProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  setActiveTab: (tab: 'dashboard' | 'history' | 'add' | 'budgets') => void;
}

export default function AddTransaction({
  onAddTransaction,
  setActiveTab,
}: AddTransactionProps) {
  const [amount, setAmount] = useState('0.00');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(() => {
    // Current date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [notes, setNotes] = useState('');
  const [account, setAccount] = useState('Main Checking');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid numeric amount greater than zero');
      return;
    }

    // Capture hours & minutes pretty formatting for now
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12 instead of 0
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    onAddTransaction({
      payee: notes.trim() !== '' ? notes.trim() : (selectedCategory === Category.INCOME ? 'Regular Profit' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Item`),
      category: selectedCategory,
      amount: transactionType === 'expense' ? -numericAmount : numericAmount,
      type: transactionType,
      date: date,
      time: timeStr,
      notes: notes.trim() !== '' ? notes.trim() : `Spent from ${account}`,
      account: account,
    });

    // Reset inputs
    setAmount('0.00');
    setNotes('');
    
    // Redirect user to dashboard instant
    setActiveTab('dashboard');
  };

  const handleAmountChange = (val: string) => {
    // Sanitize input
    if (val === '') {
      setAmount('0.00');
      return;
    }
    setAmount(val);
  };

  // Pre-configured category list
  const categories = [
    { type: Category.FOOD, label: 'Food', icon: <Utensils className="w-5 h-5" /> },
    { type: Category.TRANSPORT, label: 'Transport', icon: <Car className="w-5 h-5 text-cyan-600" /> },
    { type: Category.HOUSING, label: 'Housing', icon: <Home className="w-5 h-5 text-emerald-600" /> },
    { type: Category.FUN, label: 'Fun', icon: <Ticket className="w-5 h-5 text-pink-600" /> },
    { type: Category.HEALTH, label: 'Health', icon: <Activity className="w-5 h-5 text-red-600" /> },
    { type: Category.INCOME, label: 'Income', icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar - Visible on Mobile Only */}
      <header className="sticky top-0 bg-brand-surface z-50 flex md:hidden items-center justify-between h-16 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="text-brand-primary active:opacity-80 transition-opacity p-2 hover:bg-brand-surface-container-low transition-colors rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-brand-primary">Add Transaction</h1>
        </div>
        <button className="text-brand-primary active:opacity-80 transition-opacity p-2 hover:bg-brand-surface-container-low transition-colors rounded-full">
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto py-4 space-y-8 animate-fade-in-up">
        {/* Income / Expense Segments Toggle */}
        <div className="flex p-1.5 bg-brand-surface-container-low border border-brand-outline-variant/30 rounded-2xl">
          <button 
            onClick={() => {
              setTransactionType('expense');
              if (selectedCategory === Category.INCOME) setSelectedCategory(Category.FOOD);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              transactionType === 'expense' 
                ? 'bg-brand-primary text-white shadow-sm' 
                : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            Expense (-)
          </button>
          <button 
            onClick={() => {
              setTransactionType('income');
              setSelectedCategory(Category.INCOME);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              transactionType === 'income' 
                ? 'bg-brand-secondary text-white shadow-sm' 
                : 'text-brand-on-surface-variant hover:text-brand-on-surface'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Enter Amount Input Area */}
        <section className="flex flex-col items-center select-none pb-2">
          <label className="text-xs font-bold text-brand-on-surface-variant tracking-wider mb-2">ENTER AMOUNT</label>
          <div className="relative flex items-center justify-center max-w-[280px]">
            <span className={`text-4xl md:text-5xl font-extrabold mr-1 ${transactionType === 'expense' ? 'text-brand-primary' : 'text-brand-secondary'}`}>$</span>
            <input 
              ref={amountInputRef}
              value={amount === '0.00' ? '' : amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00" 
              step="0.01" 
              type="number"
              className={`w-full bg-transparent border-none text-center text-4xl md:text-5xl font-extrabold focus:ring-0 p-0 outline-none ${transactionType === 'expense' ? 'text-brand-primary placeholder:text-brand-primary-light/30' : 'text-brand-secondary placeholder:text-brand-secondary/30'}`}
            />
          </div>
          <div className={`h-0.5 w-48 rounded-full mt-2 transition-colors ${transactionType === 'expense' ? 'bg-brand-primary' : 'bg-brand-secondary'}`}></div>
        </section>

        {/* Category Selection Grid Grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-brand-on-surface tracking-wide">Category</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories
              .filter(cat => transactionType === 'income' ? cat.type === Category.INCOME : cat.type !== Category.INCOME)
              .map((cat) => {
                const isSelected = selectedCategory === cat.type;
                return (
                  <button 
                    key={cat.type}
                    onClick={() => setSelectedCategory(cat.type)}
                    className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] border ${
                      isSelected 
                        ? 'bg-brand-secondary-container text-brand-on-secondary-container border-brand-secondary' 
                        : 'bg-brand-surface-container-low hover:bg-brand-surface-container border-brand-outline-variant/30 text-brand-on-surface-variant'
                    }`}
                  >
                    <div className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
                      isSelected 
                        ? 'bg-brand-on-secondary-container text-white opacity-100' 
                        : 'bg-brand-surface-container-high text-brand-on-surface-variant group-hover:scale-105'
                    }`}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                );
              })}

            {/* Custom generic fallbacks if expense is selected but others is needed */}
            {transactionType === 'expense' && (
              <button 
                onClick={() => setSelectedCategory(Category.OTHERS)}
                className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] border ${
                  selectedCategory === Category.OTHERS 
                    ? 'bg-brand-secondary-container text-brand-on-secondary-container border-brand-secondary' 
                    : 'bg-brand-surface-container-low hover:bg-brand-surface-container border-brand-outline-variant/30 text-brand-on-surface-variant'
                }`}
              >
                <div className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
                  selectedCategory === Category.OTHERS 
                    ? 'bg-brand-on-secondary-container text-white' 
                    : 'bg-brand-surface-container-high text-brand-on-surface-variant group-hover:scale-105'
                }`}>
                  <MoreHorizontal className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Others</span>
              </button>
            )}
          </div>
        </section>

        {/* Modular Material Style Form Details */}
        <section className="space-y-5">
          {/* Date Picker Input Group */}
          <div className="relative group">
            <span className="absolute -top-2 left-3 px-1.5 bg-brand-surface text-[11px] font-extrabold text-brand-primary z-10 select-none">
              Date
            </span>
            <div className="flex items-center gap-3 p-4 border border-brand-outline/40 hover:border-brand-primary rounded-xl bg-brand-surface-container-low focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors">
              <Calendar className="w-5 h-5 text-brand-on-surface-variant" />
              <input 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-brand-on-surface" 
                type="date"
              />
            </div>
          </div>

          {/* Notes description Text Field */}
          <div className="relative group">
            <span className="absolute -top-2 left-3 px-1.5 bg-brand-surface text-[11px] font-extrabold text-brand-primary z-10 select-none">
              Notes / Payee
            </span>
            <div className="flex items-center gap-3 p-4 border border-brand-outline/40 hover:border-brand-primary rounded-xl bg-brand-surface-container-low focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors">
              <FileText className="w-5 h-5 text-brand-on-surface-variant" />
              <input 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={transactionType === 'income' ? 'e.g., Monthly Salary, Consulting' : 'e.g., Whole Foods Market'} 
                type="text"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-brand-on-surface placeholder:text-brand-on-surface-variant/50"
              />
            </div>
          </div>

          {/* Account Selector Dropdown Box */}
          <div className="relative group">
            <span className="absolute -top-2 left-3 px-1.5 bg-brand-surface text-[11px] font-extrabold text-brand-primary z-10 select-none">
              Account
            </span>
            <div className="flex items-center gap-3 p-4 border border-brand-outline/40 hover:border-brand-primary rounded-xl bg-brand-surface-container-low focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors">
              <Wallet className="w-5 h-5 text-brand-on-surface-variant" />
              <select 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-brand-on-surface cursor-pointer select-none"
              >
                <option value="Main Checking">Main Checking</option>
                <option value="Savings">Savings Pool</option>
                <option value="Credit Card">Core Credit Card</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save CTA Trigger Section */}
        <section className="pt-6 text-center space-y-3">
          <button 
            onClick={handleSave}
            className="w-full bg-brand-primary hover:bg-brand-primary-light active:scale-[0.98] text-white py-4 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/15 border border-indigo-950"
          >
            <CheckCircle className="w-5 h-5 fill-brand-secondary text-brand-on-secondary-container" />
            <span>Save Transaction</span>
          </button>
          <p className="text-xs text-brand-on-surface-variant px-4">
            This transaction will be recorded and updated in your Dashboard instantly.
          </p>
        </section>
      </main>
    </div>
  );
}
