import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PasswordValidation } from '../utils/passwordUtils';

interface Props {
    validation: PasswordValidation;
}

export default function PasswordStrengthIndicator({ validation }: Props) {
    const getColor = (isValid: boolean) => isValid ? '#4CAF50' : '#FF5252';
    const strengthColors = {
        weak: '#FF5252',
        medium: '#FFC107',
        strong: '#4CAF50'
    };

    return (
        <View style={styles.container}>
            <View style={styles.strengthBar}>
                <View
                    style={[
                        styles.strengthIndicator,
                        {
                            width: '33%',
                            backgroundColor: strengthColors[validation.strength]
                        }
                    ]}
                />
                {validation.strength !== 'weak' && (
                    <View
                        style={[
                            styles.strengthIndicator,
                            {
                                width: '33%',
                                backgroundColor: strengthColors[validation.strength]
                            }
                        ]}
                    />
                )}
                {validation.strength === 'strong' && (
                    <View
                        style={[
                            styles.strengthIndicator,
                            {
                                width: '34%',
                                backgroundColor: strengthColors.strong
                            }
                        ]}
                    />
                )}
            </View>

            <Text style={styles.strengthText}>{validation.message}</Text>

            <View style={styles.requirementsList}>
                <RequirementItem
                    isValid={validation.hasMinLength}
                    text="At least 8 characters"
                />
                <RequirementItem
                    isValid={validation.hasUpperCase}
                    text="One uppercase letter"
                />
                <RequirementItem
                    isValid={validation.hasLowerCase}
                    text="One lowercase letter"
                />
                <RequirementItem
                    isValid={validation.hasNumber}
                    text="One number"
                />
                <RequirementItem
                    isValid={validation.hasSpecialChar}
                    text="One special character"
                />
            </View>
        </View>
    );
}

function RequirementItem({ isValid, text }: { isValid: boolean; text: string }) {
    return (
        <View style={styles.requirementItem}>
            <MaterialIcons
                name={isValid ? "check-circle" : "cancel"}
                size={16}
                color={isValid ? '#4CAF50' : '#FF5252'}
            />
            <Text style={[styles.requirementText, { color: isValid ? '#4CAF50' : '#666' }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 15,
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 8,
    },
    strengthIndicator: {
        height: '100%',
    },
    strengthText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    requirementsList: {
        marginTop: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    requirementText: {
        marginLeft: 8,
        fontSize: 12,
    },
}); 