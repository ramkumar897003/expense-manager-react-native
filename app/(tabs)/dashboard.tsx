import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useIncomes } from '../../contexts/IncomeContext';
import { useSavings } from '../../contexts/SavingsContext';
import ExpenseStatistics from '../../components/ExpenseStatistics';
import MonthlyComparison from '../../components/MonthlyComparison';
import FinancialOverview from '../../components/FinancialOverview';
import MonthlyBudget from '../../components/MonthlyBudget';
import SavingsGoal from '../../components/SavingsGoal';
import ExpenseBreakdown from '../../components/ExpenseBreakdown';
import IncomeBreakdown from '../../components/IncomeBreakdown';
import AddToSavingsModal from '../../components/AddToSavingsModal';

export default function DashboardScreen() {
    const { expenses } = useExpenses();
    const { incomes } = useIncomes();
    const { addToSavings } = useSavings();
    const [isSavingsModalVisible, setIsSavingsModalVisible] = useState(false);

    const handleAddToSavings = async (amount: number) => {
        try {
            await addToSavings(amount);
        } catch (error) {
            console.error('Failed to add to savings:', error);
            // You might want to show an error toast/alert here
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <FinancialOverview
                    expenses={expenses}
                    incomes={incomes}
                />
                <MonthlyBudget expenses={expenses} />
                <SavingsGoal expenses={expenses} onAddToSavings={() => setIsSavingsModalVisible(true)} />
                <IncomeBreakdown incomes={incomes} />
                <ExpenseBreakdown expenses={expenses} />
                <ExpenseStatistics expenses={expenses} />
                <MonthlyComparison expenses={expenses} />
            </ScrollView>

            <AddToSavingsModal
                visible={isSavingsModalVisible}
                onClose={() => setIsSavingsModalVisible(false)}
                onSubmit={handleAddToSavings}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        paddingBottom: 20,
    },
}); 