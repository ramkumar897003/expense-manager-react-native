import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Expense } from '../contexts/ExpenseContext';
import { useSavings } from '../contexts/SavingsContext';
import { useState } from 'react';
import EditSavingsGoalModal from './EditSavingsGoalModal';

interface Props {
    expenses: Expense[];
    onAddToSavings: () => void;
}

export default function SavingsGoal({ onAddToSavings }: Props) {
    const { currentSavings, savingsGoal, setSavingsGoal } = useSavings();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const progressPercentage = (currentSavings / savingsGoal) * 100;
    const remainingAmount = savingsGoal - currentSavings;

    const getStatusColor = () => {
        if (progressPercentage >= 100) return '#34C759';
        if (progressPercentage >= 75) return '#007AFF';
        if (progressPercentage >= 50) return '#FF9500';
        return '#FF3B30';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialIcons name="savings" size={24} color="#007AFF" />
                    <Text style={styles.title}>Savings Goal</Text>
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditModalVisible(true)}
                >
                    <MaterialIcons name="edit" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.goalContainer}>
                <Text style={styles.goalAmount}>${savingsGoal.toFixed(2)}</Text>
                <Text style={styles.goalLabel}>Target</Text>
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
                    {progressPercentage.toFixed(1)}% achieved
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Current Savings</Text>
                    <Text style={[styles.statValue, { color: '#007AFF' }]}>
                        ${currentSavings.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Remaining</Text>
                    <Text style={[styles.statValue, { color: '#666' }]}>
                        ${remainingAmount.toFixed(2)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={onAddToSavings}
            >
                <MaterialIcons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add to Savings</Text>
            </TouchableOpacity>

            <EditSavingsGoalModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                onSubmit={setSavingsGoal}
                currentGoal={savingsGoal}
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
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    goalContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    goalAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#007AFF',
    },
    goalLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
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
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        marginBottom: 16,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 