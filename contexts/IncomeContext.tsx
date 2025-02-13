import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Income {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    userId: string;
}

export type SortBy = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

interface IncomeContextType {
    incomes: Income[];
    isLoading: boolean;
    error: string | null;
    addIncome: (income: Omit<Income, 'id' | 'userId'>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;
    updateIncome: (id: string, income: Partial<Omit<Income, 'id' | 'userId'>>) => Promise<void>;
    sortIncomes: (by: SortBy, order: SortOrder) => void;
    filterIncomes: (category: string | null, startDate: Date | null, endDate: Date | null) => void;
    sortBy: SortBy;
    sortOrder: SortOrder;
    activeFilter: {
        category: string | null;
        startDate: Date | null;
        endDate: Date | null;
    };
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

const STORAGE_KEY = '@incomes';

export function IncomeProvider({ children }: { children: React.ReactNode }) {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
    const [activeFilter, setActiveFilter] = useState({
        category: null as string | null,
        startDate: null as Date | null,
        endDate: null as Date | null
    });

    useEffect(() => {
        if (user) {
            loadIncomes();
        } else {
            setIncomes([]);
        }
    }, [user]);

    useEffect(() => {
        const sorted = [...incomes].sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
        });

        const filtered = sorted.filter(income => {
            const matchesCategory = !activeFilter.category || income.category === activeFilter.category;
            const matchesDateRange = (!activeFilter.startDate || new Date(income.date) >= activeFilter.startDate) &&
                (!activeFilter.endDate || new Date(income.date) <= activeFilter.endDate);
            return matchesCategory && matchesDateRange;
        });

        setFilteredIncomes(filtered);
    }, [incomes, sortBy, sortOrder, activeFilter]);

    const loadIncomes = async () => {
        try {
            const storedIncomes = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedIncomes) {
                const allIncomes: Income[] = JSON.parse(storedIncomes);
                const userIncomes = allIncomes.filter(income => income.userId === user?.id);
                setIncomes(userIncomes);
            }
        } catch (err) {
            setError('Failed to load incomes');
            console.error('Error loading incomes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const addIncome = async (incomeData: Omit<Income, 'id' | 'userId'>) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const newIncome: Income = {
                id: Date.now().toString(),
                userId: user.id,
                ...incomeData
            };

            const storedIncomes = await AsyncStorage.getItem(STORAGE_KEY);
            const allIncomes: Income[] = storedIncomes ? JSON.parse(storedIncomes) : [];

            allIncomes.push(newIncome);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allIncomes));

            setIncomes(prev => [...prev, newIncome]);
        } catch (err) {
            setError('Failed to add income');
            throw err;
        }
    };

    const deleteIncome = async (id: string) => {
        try {
            const storedIncomes = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedIncomes) {
                const allIncomes: Income[] = JSON.parse(storedIncomes);
                const updatedIncomes = allIncomes.filter(income => income.id !== id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIncomes));
                setIncomes(prev => prev.filter(income => income.id !== id));
            }
        } catch (err) {
            setError('Failed to delete income');
            throw err;
        }
    };

    const updateIncome = async (id: string, incomeData: Partial<Omit<Income, 'id' | 'userId'>>) => {
        try {
            const storedIncomes = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedIncomes) {
                const allIncomes: Income[] = JSON.parse(storedIncomes);
                const incomeIndex = allIncomes.findIndex(income => income.id === id);

                if (incomeIndex !== -1) {
                    allIncomes[incomeIndex] = {
                        ...allIncomes[incomeIndex],
                        ...incomeData
                    };
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allIncomes));
                    setIncomes(prev => prev.map(income =>
                        income.id === id ? { ...income, ...incomeData } : income
                    ));
                }
            }
        } catch (err) {
            setError('Failed to update income');
            throw err;
        }
    };

    const sortIncomes = (by: SortBy, order: SortOrder) => {
        setSortBy(by);
        setSortOrder(order);
    };

    const filterIncomes = (category: string | null, startDate: Date | null, endDate: Date | null) => {
        setActiveFilter({ category, startDate, endDate });
    };

    return (
        <IncomeContext.Provider value={{
            incomes: filteredIncomes,
            isLoading,
            error,
            addIncome,
            deleteIncome,
            updateIncome,
            sortIncomes,
            filterIncomes,
            sortBy,
            sortOrder,
            activeFilter
        }}>
            {children}
        </IncomeContext.Provider>
    );
}

export const useIncomes = () => {
    const context = useContext(IncomeContext);
    if (context === undefined) {
        throw new Error('useIncomes must be used within an IncomeProvider');
    }
    return context;
}; 