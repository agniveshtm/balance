/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Category {
  FOOD = 'food',
  TRANSPORT = 'transport',
  HOUSING = 'housing',
  FUN = 'fun',
  HEALTH = 'health',
  OTHERS = 'others',
  INCOME = 'income',
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  payee: string;
  category: Category;
  amount: number; // positive for income, negative for expense
  type: TransactionType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  notes: string;
  account: string;
}

export interface Budget {
  id: string;
  category: Category;
  name: string;
  limit: number;
  spent: number;
  status: 'healthy' | 'critical' | 'saving';
  notes?: string;
}
