import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { validatePassword } from '../../utils/passwordUtils';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
    const { resetPassword, isLoading, error, clearError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error.message);
            clearError();
        }
    }, [error]);

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordValidation(validatePassword(text));
        setErrors(prev => ({ ...prev, password: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            code: '',
            password: '',
            confirmPassword: ''
        };

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        if (!code.trim()) {
            newErrors.code = 'Reset code is required';
            isValid = false;
        } else if (code.length !== 6) {
            newErrors.code = 'Invalid reset code';
            isValid = false;
        }

        if (!passwordValidation.isValid) {
            newErrors.password = 'Password does not meet requirements';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleReset = async () => {
        if (!validateForm()) return;

        try {
            await resetPassword(email, code, password);
            Alert.alert(
                'Success',
                'Your password has been reset successfully.',
                [{ text: 'OK', onPress: () => router.push('/login') }]
            );
        } catch (error) {
            // Error is handled by the useEffect above
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.code && styles.inputError]}
                    placeholder="Reset Code"
                    value={code}
                    onChangeText={(text) => {
                        setCode(text.replace(/[^0-9]/g, ''));
                        setErrors(prev => ({ ...prev, code: '' }));
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                />
                {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="New Password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                />
                {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                ) : (
                    <PasswordStrengthIndicator validation={passwordValidation} />
                )}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                />
                {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
            </View>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Link href="/forgot-password" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Request New Code</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#007AFF80',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
}); 