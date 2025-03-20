export type Transaction = {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string | null;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionFormData = {
  amount: number;
  type: string;
  category: string;
  description?: string;
  date: Date;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BudgetFormData = {
  category: string;
  amount: number;
  period: string;
};
