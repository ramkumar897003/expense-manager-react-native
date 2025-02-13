import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Income } from '@/contexts/IncomeContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (income: {
        amount: number;
        description: string;
        category: string;
        date: string;
    }) => Promise<void>;
    initialIncome?: Income | null;
}

const categories = ['Salary', 'Freelance', 'Investments', 'Business', 'Other'];

export default function AddIncomeModal({ visible, onClose, onSubmit, initialIncome }: Props) {
    const [amount, setAmount] = useState(initialIncome?.amount.toString() || '');
    const [description, setDescription] = useState(initialIncome?.description || '');
    const [category, setCategory] = useState(initialIncome?.category || '');
    const [date, setDate] = useState(initialIncome ? new Date(initialIncome.date) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        amount: '',
        description: '',
        category: '',
    });

    useEffect(() => {
        if (visible) {
            setAmount(initialIncome?.amount.toString() || '');
            setDescription(initialIncome?.description || '');
            setCategory(initialIncome?.category || '');
            setDate(initialIncome ? new Date(initialIncome.date) : new Date());
        }
    }, [visible, initialIncome]);

    const handleSubmit = async () => {
        const newErrors = {
            amount: !amount ? 'Amount is required' : '',
            description: !description ? 'Description is required' : '',
            category: !category ? 'Category is required' : '',
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit({
                amount: parseFloat(amount),
                description,
                category,
                date: date.toISOString(),
            });
            handleClose();
        } catch (error) {
            console.error('Failed to add income:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date());
        setErrors({
            amount: '',
            description: '',
            category: '',
        });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {initialIncome ? 'Edit Income' : 'Add Income'}
                            </Text>
                            <TouchableOpacity onPress={handleClose}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}

                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                        />
                        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        category === cat && styles.categoryChipSelected
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            category === cat && styles.categoryChipTextSelected
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {date.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Income</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
        maxHeight: '90%',
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    categoryChipSelected: {
        backgroundColor: '#34C759',
    },
    categoryChipText: {
        color: '#666',
        fontSize: 14,
    },
    categoryChipTextSelected: {
        color: 'white',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 