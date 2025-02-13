import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Expense } from '../contexts/ExpenseContext';
import { useBudget } from '../contexts/BudgetContext';
import { useState } from 'react';
import EditBudgetModal from './EditBudgetModal';

interface Props {
    expenses: Expense[];
}

export default function MonthlyBudget({ expenses }: Props) {
    const { monthlyBudget, setMonthlyBudget } = useBudget();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const getCurrentMonthExpenses = () => {
        return expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
    };

    const monthlyExpenses = getCurrentMonthExpenses();
    const progressPercentage = (monthlyExpenses / monthlyBudget) * 100;
    const remainingBudget = monthlyBudget - monthlyExpenses;
    const isOverBudget = monthlyExpenses > monthlyBudget;

    const getStatusColor = () => {
        if (progressPercentage >= 100) return '#FF3B30';
        if (progressPercentage >= 80) return '#FF9500';
        return '#34C759';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialIcons name="account-balance" size={24} color="#007AFF" />
                    <Text style={styles.title}>Monthly Budget</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditModalVisible(true)}
                    >
                        <MaterialIcons name="edit" size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.budgetAmount}>${monthlyBudget.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(progressPercentage, 100)}%`,
                                backgroundColor: getStatusColor(),
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {progressPercentage.toFixed(1)}% used
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                        ${monthlyExpenses.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Remaining</Text>
                    <Text
                        style={[
                            styles.statValue,
                            { color: isOverBudget ? '#FF3B30' : '#34C759' },
                        ]}
                    >
                        {isOverBudget ? '-' : ''}${Math.abs(remainingBudget).toFixed(2)}
                    </Text>
                </View>
            </View>

            {isOverBudget && (
                <View style={styles.warningContainer}>
                    <MaterialIcons name="warning" size={16} color="#FF3B30" />
                    <Text style={styles.warningText}>
                        You've exceeded your monthly budget
                    </Text>
                </View>
            )}

            <EditBudgetModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onSubmit={setMonthlyBudget}
                currentBudget={monthlyBudget}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    budgetAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    statItem: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#F2F2F7',
        marginHorizontal: 16,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#FF3B30',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
}); 