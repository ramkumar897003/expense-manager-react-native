import { useState } from 'react';
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

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => Promise<void>;
    currentBudget: number;
}

export default function EditBudgetModal({ visible, onClose, onSubmit, currentBudget }: Props) {
    const [amount, setAmount] = useState(currentBudget.toString());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount))) {
            setError('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(Number(amount));
            handleClose();
        } catch (error) {
            console.error('Failed to update budget:', error);
            setError('Failed to update budget');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAmount(currentBudget.toString());
        setError('');
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
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Set Monthly Budget</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Budget Amount</Text>
                            <TextInput
                                style={[styles.input, error && styles.inputError]}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="Enter amount"
                            />
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Save</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        position: 'absolute',
        left: 0,
        padding: 4,
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 