import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Expense } from '../contexts/ExpenseContext';

interface Props {
    expenses: Expense[];
}

interface MonthlyTotal {
    month: string;
    total: number;
}

export default function MonthlyComparison({ expenses }: Props) {
    const getMonthlyTotals = (): MonthlyTotal[] => {
        const monthlyTotals: { [key: string]: number } = {};
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        for (let i = 0; i < 6; i++) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = month.toLocaleString('default', { month: 'short' });
            monthlyTotals[monthKey] = 0;
        }

        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate >= sixMonthsAgo) {
                const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
            }
        });

        return Object.entries(monthlyTotals)
            .map(([month, total]) => ({ month, total }))
            .reverse();
    };

    const monthlyData = getMonthlyTotals();
    const chartData = {
        labels: monthlyData.map(item => item.month),
        datasets: [{
            data: monthlyData.map(item => item.total)
        }]
    };

    const chartWidth = Dimensions.get('window').width - 64;

    const calculatePercentageChange = (current: number, previous: number): string => {
        if (previous === 0) {
            return current > 0 ? '+100%' : '0%';
        }

        const percentageChange = ((current - previous) / previous) * 100;
        const sign = percentageChange > 0 ? '+' : '';
        return `${sign}${percentageChange.toFixed(1)}%`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Spending</Text>
            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#007AFF'
                        },
                        propsForLabels: {
                            fontSize: 12,
                        }
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={false}
                />
            </View>
            <View style={styles.statsContainer}>
                {monthlyData.map((item, index) => (
                    <View key={item.month} style={styles.statItem}>
                        <Text style={styles.statMonth}>{item.month}</Text>
                        <Text style={styles.statAmount}>${item.total.toFixed(2)}</Text>
                        {index > 0 && (
                            <Text style={[
                                styles.statChange,
                                { color: item.total >= monthlyData[index - 1].total ? '#ff3b30' : '#34c759' }
                            ]}>
                                {calculatePercentageChange(item.total, monthlyData[index - 1].total)}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    statsContainer: {
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statMonth: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    statAmount: {
        flex: 1,
        fontSize: 14,
        color: '#007AFF',
        textAlign: 'right',
    },
    statChange: {
        flex: 1,
        fontSize: 14,
        textAlign: 'right',
    },
}); 