import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useIncomes } from '../../contexts/IncomeContext';
import AddIncomeModal from '../../components/AddIncomeModal';
import IncomeFilters from '../../components/IncomeFilters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableRow from '../../components/SwipeableRow';

interface Income {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
}

export default function IncomeScreen() {
    const { incomes, isLoading, addIncome, deleteIncome, updateIncome, sortIncomes, filterIncomes, sortBy, sortOrder, activeFilter } = useIncomes();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    const categories = ['Salary', 'Freelance', 'Investments', 'Business', 'Other'];

    const handleDelete = async (id: string) => {
        try {
            await deleteIncome(id);
        } catch (error) {
            console.error('Failed to delete income:', error);
        }
    };

    const handleEdit = (income: Income) => {
        setEditingIncome(income);
        setIsModalVisible(true);
    };

    const handleAddOrUpdateIncome = async (incomeData: {
        amount: number;
        description: string;
        category: string;
        date: string;
    }) => {
        if (editingIncome) {
            await updateIncome(editingIncome.id, incomeData);
            setEditingIncome(null);
        } else {
            await addIncome(incomeData);
        }
        setIsModalVisible(false);
    };

    const renderIncomeItem = ({ item }: { item: Income }) => (
        <SwipeableRow
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item)}
            type="income"
            amount={item.amount}
            description={item.description}
        >
            <TouchableOpacity style={styles.incomeItem}>
                <View style={styles.incomeLeft}>
                    <Text style={styles.incomeCategory}>{item.category}</Text>
                    <Text style={styles.incomeDescription}>{item.description}</Text>
                    <Text style={styles.incomeDate}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.incomeRight}>
                    <Text style={styles.incomeAmount}>
                        +${item.amount.toFixed(2)}
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
                        <Text style={styles.title}>Income</Text>
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
                        <ActivityIndicator style={styles.loader} color="#34C759" />
                    ) : incomes.length > 0 ? (
                        <FlatList
                            data={incomes}
                            renderItem={renderIncomeItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="payments" size={64} color="#ccc" />
                            <Text style={styles.emptyStateText}>No income recorded yet</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Tap the + button to add your first income
                            </Text>
                        </View>
                    )}

                    <AddIncomeModal
                        visible={isModalVisible}
                        onClose={() => {
                            setIsModalVisible(false);
                            setEditingIncome(null);
                        }}
                        onSubmit={handleAddOrUpdateIncome}
                        initialIncome={editingIncome}
                    />

                    <IncomeFilters
                        visible={isFilterVisible}
                        onClose={() => setIsFilterVisible(false)}
                        onApplyFilters={filterIncomes}
                        onSort={sortIncomes}
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
        backgroundColor: '#34C759',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    incomeItem: {
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
    incomeLeft: {
        flex: 1,
    },
    incomeCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    incomeDescription: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    incomeDate: {
        fontSize: 12,
        color: '#999',
    },
    incomeRight: {
        justifyContent: 'center',
    },
    incomeAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
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