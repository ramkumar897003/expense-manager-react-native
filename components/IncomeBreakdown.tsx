import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { Income } from '../contexts/IncomeContext';

interface Props {
    incomes: Income[];
}

interface CategoryData {
    name: string;
    amount: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

const CATEGORY_COLORS = {
    Salary: '#34C759',
    Freelance: '#007AFF',
    Investments: '#5856D6',
    Business: '#FF9500',
    Other: '#8E8E93',
};

export default function IncomeBreakdown({ incomes }: Props) {
    const getCategoryData = (): CategoryData[] => {
        const categoryTotals: { [key: string]: number } = {};

        incomes.forEach(income => {
            categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount;
        });

        return Object.entries(categoryTotals)
            .map(([name, amount]) => ({
                name,
                amount,
                color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#8E8E93',
                legendFontColor: '#666',
                legendFontSize: 12,
            }))
            .sort((a, b) => b.amount - a.amount);
    };

    const chartData = getCategoryData();
    const totalIncome = chartData.reduce((sum, item) => sum + item.amount, 0);
    const chartWidth = Dimensions.get('window').width - 64;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialIcons name="pie-chart" size={24} color="#34C759" />
                    <Text style={styles.title}>Income Breakdown</Text>
                </View>
            </View>

            {chartData.length > 0 ? (
                <>
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={chartData}
                            width={chartWidth}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[chartWidth / 4, 0]}
                            hasLegend={false}
                            absolute
                        />
                    </View>

                    <View style={styles.legendContainer}>
                        {chartData.map((item) => (
                            <View key={item.name} style={styles.legendItem}>
                                <View style={styles.legendLeft}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendText}>{item.name}</Text>
                                </View>
                                <View style={styles.legendRight}>
                                    <Text style={styles.legendAmount}>
                                        ${item.amount.toFixed(2)}
                                    </Text>
                                    <Text style={styles.legendPercentage}>
                                        {((item.amount / totalIncome) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <MaterialIcons name="show-chart" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>No income to analyze</Text>
                </View>
            )}
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
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
        paddingRight: 15,
    },
    legendContainer: {
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 14,
        color: '#1C1C1E',
    },
    legendRight: {
        alignItems: 'flex-end',
    },
    legendAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34C759',
    },
    legendPercentage: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
}); 