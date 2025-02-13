import { Animated, StyleSheet, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmationDialog from './ConfirmationDialog';
import { useState } from 'react';

interface Props {
    children: React.ReactNode;
    onDelete: () => Promise<void>;
    onEdit: () => void;
    type: 'income' | 'expense';
    amount: number;
    description: string;
}

export default function SwipeableRow({ children, onDelete, onEdit, type, amount, description }: Props) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    let swipeableRef: Swipeable | null = null;

    const getConfirmationContent = () => {
        const formattedAmount = `$${amount.toFixed(2)}`;

        if (type === 'income') {
            return {
                title: 'Delete Income Entry',
                message: `Are you sure you want to delete this income entry of ${formattedAmount} for "${description}"? This action cannot be undone.`,
                icon: 'payments'
            };
        }

        return {
            title: 'Delete Expense',
            message: `Are you sure you want to delete this expense of ${formattedAmount} for "${description}"? This action cannot be undone.`,
            icon: 'receipt-long'
        };
    };

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const translateX = dragX.interpolate({
            inputRange: [-140, 0],
            outputRange: [0, 140],
        });

        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
        });

        const opacity = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
        });

        return (
            <View style={styles.rightActionsContainer}>
                <Animated.View style={[
                    styles.actionContainer,
                    { transform: [{ translateX }, { scale }], opacity }
                ]}>
                    <RectButton style={styles.editAction} onPress={handleEdit}>
                        <View style={styles.actionContent}>
                            <MaterialIcons name="edit" size={22} color="white" />
                            <Animated.Text style={styles.actionText}>
                                Edit
                            </Animated.Text>
                        </View>
                    </RectButton>
                    <RectButton
                        style={styles.deleteAction}
                        onPress={() => setShowConfirmation(true)}
                    >
                        <View style={styles.actionContent}>
                            <MaterialIcons name="delete" size={22} color="white" />
                            <Animated.Text style={styles.actionText}>
                                Delete
                            </Animated.Text>
                        </View>
                    </RectButton>
                </Animated.View>
            </View>
        );
    };

    const handleDelete = async () => {
        try {
            await onDelete();
        } finally {
            swipeableRef?.close();
            setShowConfirmation(false);
        }
    };

    const handleEdit = () => {
        swipeableRef?.close();
        onEdit();
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        swipeableRef?.close();
    };

    return (
        <>
            <Swipeable
                ref={ref => swipeableRef = ref}
                friction={2}
                rightThreshold={40}
                renderRightActions={renderRightActions}
                overshootRight={false}
                containerStyle={styles.swipeableContainer}
            >
                {children}
            </Swipeable>

            <ConfirmationDialog
                visible={showConfirmation}
                title={getConfirmationContent().title}
                message={getConfirmationContent().message}
                onConfirm={handleDelete}
                onCancel={handleCancel}
                confirmText="Delete"
                type="danger"
                icon={getConfirmationContent().icon as keyof typeof MaterialIcons.glyphMap}
            />
        </>
    );
}

const styles = StyleSheet.create({
    swipeableContainer: {
        backgroundColor: '#f8f9fa',
    },
    rightActionsContainer: {
        width: 140,
        flexDirection: 'row',
    },
    actionContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    editAction: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    actionContent: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: 10,
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
}); 