import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    userId: string;
}

export type SortBy = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

interface ExpenseContextType {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
    addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'userId'>>) => Promise<void>;
    sortExpenses: (by: SortBy, order: SortOrder) => void;
    filterExpenses: (category: string | null, startDate: Date | null, endDate: Date | null) => void;
    sortBy: SortBy;
    sortOrder: SortOrder;
    activeFilter: {
        category: string | null;
        startDate: Date | null;
        endDate: Date | null;
    };
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = '@expenses';

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [activeFilter, setActiveFilter] = useState({
        category: null as string | null,
        startDate: null as Date | null,
        endDate: null as Date | null
    });

    useEffect(() => {
        if (user) {
            loadExpenses();
        } else {
            setExpenses([]);
        }
    }, [user]);

    useEffect(() => {
        const sorted = [...expenses].sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
        });

        const filtered = sorted.filter(expense => {
            const matchesCategory = !activeFilter.category || expense.category === activeFilter.category;
            const matchesDateRange = (!activeFilter.startDate || new Date(expense.date) >= activeFilter.startDate) &&
                (!activeFilter.endDate || new Date(expense.date) <= activeFilter.endDate);
            return matchesCategory && matchesDateRange;
        });

        setFilteredExpenses(filtered);
    }, [expenses, sortBy, sortOrder, activeFilter]);

    const loadExpenses = async () => {
        try {
            const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedExpenses) {
                const allExpenses: Expense[] = JSON.parse(storedExpenses);
                // Filter expenses for current user
                const userExpenses = allExpenses.filter(expense => expense.userId === user?.id);
                setExpenses(userExpenses);
            }
        } catch (err) {
            setError('Failed to load expenses');
            console.error('Error loading expenses:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId'>) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const newExpense: Expense = {
                id: Date.now().toString(),
                userId: user.id,
                ...expenseData
            };

            const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
            const allExpenses: Expense[] = storedExpenses ? JSON.parse(storedExpenses) : [];

            allExpenses.push(newExpense);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allExpenses));

            setExpenses(prev => [...prev, newExpense]);
        } catch (err) {
            setError('Failed to add expense');
            throw err;
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedExpenses) {
                const allExpenses: Expense[] = JSON.parse(storedExpenses);
                const updatedExpenses = allExpenses.filter(expense => expense.id !== id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
                setExpenses(prev => prev.filter(expense => expense.id !== id));
            }
        } catch (err) {
            setError('Failed to delete expense');
            throw err;
        }
    };

    const updateExpense = async (id: string, expenseData: Partial<Omit<Expense, 'id' | 'userId'>>) => {
        try {
            const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedExpenses) {
                const allExpenses: Expense[] = JSON.parse(storedExpenses);
                const expenseIndex = allExpenses.findIndex(expense => expense.id === id);

                if (expenseIndex !== -1) {
                    allExpenses[expenseIndex] = {
                        ...allExpenses[expenseIndex],
                        ...expenseData
                    };
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allExpenses));
                    setExpenses(prev => prev.map(expense =>
                        expense.id === id ? { ...expense, ...expenseData } : expense
                    ));
                }
            }
        } catch (err) {
            setError('Failed to update expense');
            throw err;
        }
    };

    const sortExpenses = (by: SortBy, order: SortOrder) => {
        setSortBy(by);
        setSortOrder(order);
    };

    const filterExpenses = (category: string | null, startDate: Date | null, endDate: Date | null) => {
        setActiveFilter({ category, startDate, endDate });
    };

    return (
        <ExpenseContext.Provider value={{
            expenses: filteredExpenses,
            isLoading,
            error,
            addExpense,
            deleteExpense,
            updateExpense,
            sortExpenses,
            filterExpenses,
            sortBy,
            sortOrder,
            activeFilter
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
}; 