import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Expense } from '../contexts/ExpenseContext';
import { Income } from '../contexts/IncomeContext';

interface Props {
    expenses: Expense[];
    incomes: Income[];
}

interface OverviewCard {
    title: string;
    amount: number;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    backgroundColor: string;
    trend?: number;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 32 - 12) / 2;

export default function FinancialOverview({ expenses, incomes }: Props) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthlyData = (data: (Expense | Income)[], month: number, year: number) => {
        return data.filter(item => {
            const date = new Date(item.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });
    };

    const currentMonthExpenses = getMonthlyData(expenses, currentMonth, currentYear);
    const lastMonthExpenses = getMonthlyData(expenses, lastMonth, lastMonthYear);
    const currentMonthIncomes = getMonthlyData(incomes, currentMonth, currentYear);
    const lastMonthIncomes = getMonthlyData(incomes, lastMonth, lastMonthYear);

    const calculateTotal = (items: (Expense | Income)[]) =>
        items.reduce((sum, item) => sum + item.amount, 0);

    const currentMonthExpenseTotal = calculateTotal(currentMonthExpenses);
    const lastMonthExpenseTotal = calculateTotal(lastMonthExpenses);
    const currentMonthIncomeTotal = calculateTotal(currentMonthIncomes);
    const lastMonthIncomeTotal = calculateTotal(lastMonthIncomes);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const expenseTrend = calculateTrend(currentMonthExpenseTotal, lastMonthExpenseTotal);
    const incomeTrend = calculateTrend(currentMonthIncomeTotal, lastMonthIncomeTotal);

    const netIncome = currentMonthIncomeTotal - currentMonthExpenseTotal;
    const lastMonthNetIncome = lastMonthIncomeTotal - lastMonthExpenseTotal;
    const netIncomeTrend = calculateTrend(netIncome, lastMonthNetIncome);

    const savingsRate = currentMonthIncomeTotal > 0
        ? ((currentMonthIncomeTotal - currentMonthExpenseTotal) / currentMonthIncomeTotal) * 100
        : 0;

    const overviewCards: OverviewCard[] = [
        {
            title: 'Net Income',
            amount: netIncome,
            icon: 'account-balance-wallet',
            color: '#007AFF',
            backgroundColor: '#E3F2FF',
            trend: netIncomeTrend,
        },
        {
            title: 'Monthly Income',
            amount: currentMonthIncomeTotal,
            icon: 'trending-up',
            color: '#34C759',
            backgroundColor: '#E8FAE9',
            trend: incomeTrend,
        },
        {
            title: 'Monthly Expenses',
            amount: currentMonthExpenseTotal,
            icon: 'trending-down',
            color: '#FF3B30',
            backgroundColor: '#FFE5E5',
            trend: expenseTrend,
        },
        {
            title: 'Savings Rate',
            amount: savingsRate,
            icon: 'savings',
            color: '#FF9500',
            backgroundColor: '#FFF4E5',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Financial Overview</Text>
            <View style={styles.grid}>
                {overviewCards.map((card) => (
                    <View key={card.title} style={[styles.card, { backgroundColor: card.backgroundColor }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                                <MaterialIcons
                                    name={card.icon}
                                    size={20}
                                    color={card.color}
                                />
                            </View>
                            {card.trend !== undefined && (
                                <View style={[
                                    styles.trendContainer,
                                    { backgroundColor: card.trend >= 0 ? '#34C75920' : '#FF3B3020' }
                                ]}>
                                    <MaterialIcons
                                        name={card.trend >= 0 ? 'arrow-upward' : 'arrow-downward'}
                                        size={12}
                                        color={card.trend >= 0 ? '#34C759' : '#FF3B30'}
                                    />
                                    <Text style={[
                                        styles.trendText,
                                        { color: card.trend >= 0 ? '#34C759' : '#FF3B30' }
                                    ]}>
                                        {Math.abs(card.trend).toFixed(1)}%
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.cardAmount}>
                            {card.title === 'Savings Rate' ?
                                `${card.amount.toFixed(1)}%` :
                                `$${card.amount.toFixed(2)}`
                            }
                        </Text>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                    </View>
                ))}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: '#1C1C1E',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    card: {
        width: cardWidth,
        padding: 16,
        borderRadius: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    cardAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 2,
    },
    addToSavingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#34C759',
        borderRadius: 12,
        marginTop: 16,
    },
    addToSavingsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
        marginLeft: 8,
    },
}); 