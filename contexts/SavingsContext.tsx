import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavingsContextType {
    currentSavings: number;
    savingsGoal: number;
    addToSavings: (amount: number) => Promise<void>;
    setSavingsGoal: (amount: number) => Promise<void>;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export function SavingsProvider({ children }: { children: React.ReactNode }) {
    const [currentSavings, setCurrentSavings] = useState(0);
    const [savingsGoal, setSavingsGoalState] = useState(10000);

    useEffect(() => {
        const loadSavingsData = async () => {
            try {
                const savedAmount = await AsyncStorage.getItem('currentSavings');
                const savedGoal = await AsyncStorage.getItem('savingsGoal');

                if (savedAmount) setCurrentSavings(Number(savedAmount));
                if (savedGoal) setSavingsGoalState(Number(savedGoal));
            } catch (error) {
                console.error('Failed to load savings data:', error);
            }
        };

        loadSavingsData();
    }, []);

    const addToSavings = useCallback(async (amount: number) => {
        try {
            const newTotal = currentSavings + amount;
            await AsyncStorage.setItem('currentSavings', newTotal.toString());
            setCurrentSavings(newTotal);
        } catch (error) {
            console.error('Failed to add to savings:', error);
            throw new Error('Failed to add to savings');
        }
    }, [currentSavings]);

    const setSavingsGoal = useCallback(async (amount: number) => {
        try {
            await AsyncStorage.setItem('savingsGoal', amount.toString());
            setSavingsGoalState(amount);
        } catch (error) {
            console.error('Failed to set savings goal:', error);
            throw new Error('Failed to set savings goal');
        }
    }, []);

    return (
        <SavingsContext.Provider value={{
            currentSavings,
            savingsGoal,
            addToSavings,
            setSavingsGoal,
        }}>
            {children}
        </SavingsContext.Provider>
    );
}

export function useSavings() {
    const context = useContext(SavingsContext);
    if (context === undefined) {
        throw new Error('useSavings must be used within a SavingsProvider');
    }
    return context;
} 