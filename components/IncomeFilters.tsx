import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    visible: boolean;
    onClose: () => void;
    onApplyFilters: (category: string | null, startDate: Date | null, endDate: Date | null) => void;
    onSort: (by: 'date' | 'amount', order: 'asc' | 'desc') => void;
    categories: string[];
    currentSort: { by: 'date' | 'amount'; order: 'asc' | 'desc' };
    currentFilter: {
        category: string | null;
        startDate: Date | null;
        endDate: Date | null;
    };
}

export default function IncomeFilters({
    visible,
    onClose,
    onApplyFilters,
    onSort,
    categories,
    currentSort,
    currentFilter
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(currentFilter.category);
    const [startDate, setStartDate] = useState<Date | null>(currentFilter.startDate);
    const [endDate, setEndDate] = useState<Date | null>(currentFilter.endDate);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleApply = () => {
        onApplyFilters(selectedCategory, startDate, endDate);
        onClose();
    };

    const handleReset = () => {
        setSelectedCategory(null);
        setStartDate(null);
        setEndDate(null);
        onApplyFilters(null, null, null);
        onClose();
    };

    const toggleSort = (by: 'date' | 'amount') => {
        if (currentSort.by === by) {
            onSort(by, currentSort.order === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(by, 'desc');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter & Sort</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.sortButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        currentSort.by === 'date' && styles.sortButtonActive
                                    ]}
                                    onPress={() => toggleSort('date')}
                                >
                                    <Text style={styles.sortButtonText}>Date</Text>
                                    {currentSort.by === 'date' && (
                                        <MaterialIcons
                                            name={currentSort.order === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                                            size={16}
                                            color="#34C759"
                                        />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        currentSort.by === 'amount' && styles.sortButtonActive
                                    ]}
                                    onPress={() => toggleSort('amount')}
                                >
                                    <Text style={styles.sortButtonText}>Amount</Text>
                                    {currentSort.by === 'amount' && (
                                        <MaterialIcons
                                            name={currentSort.order === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                                            size={16}
                                            color="#34C759"
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Category</Text>
                            <View style={styles.categoryButtons}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryButton,
                                            selectedCategory === cat && styles.categoryButtonActive
                                        ]}
                                        onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryButtonText,
                                                selectedCategory === cat && styles.categoryButtonTextActive
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Date Range</Text>
                            <View style={styles.dateButtons}>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.dateButtonSeparator}>to</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {endDate ? endDate.toLocaleDateString() : 'End Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    setShowStartDatePicker(false);
                                    if (selectedDate) {
                                        setStartDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    setShowEndDatePicker(false);
                                    if (selectedDate) {
                                        setEndDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.resetButton]}
                                onPress={handleReset}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.applyButton]}
                                onPress={handleApply}
                            >
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    sortButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 4,
    },
    sortButtonActive: {
        borderColor: '#34C759',
        backgroundColor: '#F0FFF4',
    },
    sortButtonText: {
        color: '#333',
    },
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    categoryButtonActive: {
        backgroundColor: '#34C759',
    },
    categoryButtonText: {
        color: '#666',
    },
    categoryButtonTextActive: {
        color: 'white',
    },
    dateButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dateButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dateButtonText: {
        color: '#333',
        textAlign: 'center',
    },
    dateButtonSeparator: {
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
    },
    resetButtonText: {
        color: '#666',
    },
    applyButton: {
        backgroundColor: '#34C759',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600',
    },
}); 