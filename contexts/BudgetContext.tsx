import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BudgetContextType {
    monthlyBudget: number;
    setMonthlyBudget: (amount: number) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
    const [monthlyBudget, setMonthlyBudgetState] = useState(0);

    useEffect(() => {
        loadBudget();
    }, []);

    const loadBudget = async () => {
        try {
            const savedBudget = await AsyncStorage.getItem('monthlyBudget');
            if (savedBudget) {
                setMonthlyBudgetState(Number(savedBudget));
            }
        } catch (error) {
            console.error('Failed to load budget:', error);
        }
    };

    const setMonthlyBudget = useCallback(async (amount: number) => {
        try {
            await AsyncStorage.setItem('monthlyBudget', amount.toString());
            setMonthlyBudgetState(amount);
        } catch (error) {
            console.error('Failed to set budget:', error);
            throw new Error('Failed to set budget');
        }
    }, []);

    return (
        <BudgetContext.Provider value={{ monthlyBudget, setMonthlyBudget }}>
            {children}
        </BudgetContext.Provider>
    );
}

export function useBudget() {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
} 