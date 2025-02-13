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
import { Expense } from '@/contexts/ExpenseContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (expense: {
        amount: number;
        description: string;
        category: string;
        date: string;
    }) => Promise<void>;
    initialExpense?: Expense | null;
}

const categories = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'
];

export default function AddExpenseModal({ visible, onClose, onSubmit, initialExpense }: Props) {
    const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
    const [description, setDescription] = useState(initialExpense?.description || '');
    const [category, setCategory] = useState(initialExpense?.category || '');
    const [date, setDate] = useState(initialExpense ? new Date(initialExpense.date) : new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        amount: '',
        description: '',
        category: ''
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (visible) {
            setAmount(initialExpense?.amount.toString() || '');
            setDescription(initialExpense?.description || '');
            setCategory(initialExpense?.category || '');
            setDate(initialExpense ? new Date(initialExpense.date) : new Date());
        }
    }, [visible, initialExpense]);

    const handleSubmit = async () => {
        const newErrors = {
            amount: '',
            description: '',
            category: ''
        };

        if (!amount || isNaN(Number(amount))) {
            newErrors.amount = 'Please enter a valid amount';
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!category) {
            newErrors.category = 'Please select a category';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error !== '')) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit({
                amount: Number(amount),
                description: description.trim(),
                category,
                date: date.toISOString(),
            });
            handleClose();
        } catch (error) {
            console.error('Failed to add expense:', error);
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
            category: ''
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
                                {initialExpense ? 'Edit Expense' : 'Add Expense'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Amount ($)</Text>
                            <TextInput
                                style={[styles.input, errors.amount && styles.inputError]}
                                value={amount}
                                onChangeText={text => {
                                    setAmount(text.replace(/[^0-9.]/g, ''));
                                    setErrors(prev => ({ ...prev, amount: '' }));
                                }}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                editable={!isLoading}
                            />
                            {errors.amount ? (
                                <Text style={styles.errorText}>{errors.amount}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, errors.description && styles.inputError]}
                                value={description}
                                onChangeText={text => {
                                    setDescription(text);
                                    setErrors(prev => ({ ...prev, description: '' }));
                                }}
                                placeholder="What did you spend on?"
                                editable={!isLoading}
                            />
                            {errors.description ? (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoriesContainer}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            category === cat && styles.categoryChipSelected
                                        ]}
                                        onPress={() => {
                                            setCategory(cat);
                                            setErrors(prev => ({ ...prev, category: '' }));
                                        }}
                                        disabled={isLoading}
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
                            {errors.category ? (
                                <Text style={styles.errorText}>{errors.category}</Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Expense</Text>
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
    closeButton: {
        padding: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
    },
    categoryChipText: {
        color: '#666',
        fontSize: 14,
    },
    categoryChipTextSelected: {
        color: 'white',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#007AFF80',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 