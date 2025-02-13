import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Expense } from '../contexts/ExpenseContext';

interface Props {
    expenses: Expense[];
}

interface CategoryTotal {
    category: string;
    total: number;
    percentage: number;
}

export default function ExpenseStatistics({ expenses }: Props) {
    const getTotalExpenses = () => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const getCategoryTotals = (): CategoryTotal[] => {
        const total = getTotalExpenses();
        const categoryTotals: { [key: string]: number } = {};

        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                total: amount,
                percentage: (amount / total) * 100
            }))
            .sort((a, b) => b.total - a.total);
    };

    const getRecentTrend = () => {
        if (expenses.length < 2) return 0;

        const sortedExpenses = [...expenses].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const recentTotal = sortedExpenses.slice(0, Math.ceil(expenses.length / 2))
            .reduce((sum, expense) => sum + expense.amount, 0);
        const olderTotal = sortedExpenses.slice(Math.ceil(expenses.length / 2))
            .reduce((sum, expense) => sum + expense.amount, 0);

        return ((recentTotal - olderTotal) / olderTotal) * 100;
    };

    const categoryTotals = getCategoryTotals();
    const totalExpenses = getTotalExpenses();
    const trend = getRecentTrend();

    return (
        <View style={styles.container}>
            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Expenses</Text>
                <Text style={styles.totalAmount}>${totalExpenses.toFixed(2)}</Text>
                {trend !== 0 && (
                    <View style={[styles.trendContainer, trend > 0 ? styles.trendUp : styles.trendDown]}>
                        <MaterialIcons
                            name={trend > 0 ? "trending-up" : "trending-down"}
                            size={16}
                            color={trend > 0 ? "#ff3b30" : "#34c759"}
                        />
                        <Text style={[styles.trendText, trend > 0 ? styles.trendTextUp : styles.trendTextDown]}>
                            {Math.abs(trend).toFixed(1)}% {trend > 0 ? 'increase' : 'decrease'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>Spending by Category</Text>
                {categoryTotals.map(({ category, total, percentage }) => (
                    <View key={category} style={styles.categoryRow}>
                        <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{category}</Text>
                            <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${percentage}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.categoryAmount}>${total.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    trendUp: {
        backgroundColor: '#ffebeb',
    },
    trendDown: {
        backgroundColor: '#e8faea',
    },
    trendText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    trendTextUp: {
        color: '#ff3b30',
    },
    trendTextDown: {
        color: '#34c759',
    },
    categoriesContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    categoryRow: {
        marginBottom: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    categoryName: {
        fontSize: 14,
        color: '#333',
    },
    categoryPercentage: {
        fontSize: 14,
        color: '#666',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    categoryAmount: {
        fontSize: 14,
        color: '#007AFF',
        textAlign: 'right',
    },
}); 