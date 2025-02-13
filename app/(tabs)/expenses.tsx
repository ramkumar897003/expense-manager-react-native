import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AddExpenseModal from '../../components/AddExpenseModal';
import { useExpenses, Expense } from '../../contexts/ExpenseContext';
import ExpenseFilters from '../../components/ExpenseFilters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableRow from '../../components/SwipeableRow';

export default function ExpensesScreen() {
    const { expenses, isLoading, addExpense, deleteExpense, updateExpense, sortExpenses, filterExpenses, sortBy, sortOrder, activeFilter } = useExpenses();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

    const handleDelete = async (id: string) => {
        try {
            await deleteExpense(id);
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalVisible(true);
    };

    const handleAddOrUpdateExpense = async (expenseData: {
        amount: number;
        description: string;
        category: string;
        date: string;
    }) => {
        if (editingExpense) {
            await updateExpense(editingExpense.id, expenseData);
            setEditingExpense(null);
        } else {
            await addExpense(expenseData);
        }
        setIsModalVisible(false);
    };

    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <SwipeableRow
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item)}
            type="expense"
            amount={item.amount}
            description={item.description}
        >
            <TouchableOpacity style={styles.expenseItem}>
                <View style={styles.expenseLeft}>
                    <Text style={styles.expenseCategory}>{item.category}</Text>
                    <Text style={styles.expenseDescription}>{item.description}</Text>
                    <Text style={styles.expenseDate}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>
                        ${item.amount.toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>
        </SwipeableRow>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Expenses</Text>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => setIsFilterVisible(true)}
                            >
                                <MaterialIcons name="filter-list" size={24} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <MaterialIcons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator style={styles.loader} color="#007AFF" />
                    ) : expenses.length > 0 ? (
                        <FlatList
                            data={expenses}
                            renderItem={renderExpenseItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt-long" size={64} color="#ccc" />
                            <Text style={styles.emptyStateText}>No expenses yet</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Tap the + button to add your first expense
                            </Text>
                        </View>
                    )}

                    <AddExpenseModal
                        visible={isModalVisible}
                        onClose={() => {
                            setIsModalVisible(false);
                            setEditingExpense(null);
                        }}
                        onSubmit={handleAddOrUpdateExpense}
                        initialExpense={editingExpense}
                    />

                    <ExpenseFilters
                        visible={isFilterVisible}
                        onClose={() => setIsFilterVisible(false)}
                        onApplyFilters={filterExpenses}
                        onSort={sortExpenses}
                        categories={categories}
                        currentSort={{ by: sortBy, order: sortOrder }}
                        currentFilter={activeFilter}
                    />
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    expenseLeft: {
        flex: 1,
    },
    expenseCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    expenseDescription: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 12,
        color: '#999',
    },
    expenseRight: {
        justifyContent: 'center',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    loader: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
}); 