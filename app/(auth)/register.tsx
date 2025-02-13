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
import { MaterialIcons } from '@expo/vector-icons';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });
    const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signUp, isLoading, error, clearError } = useAuth();

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
            password: '',
            confirmPassword: '',
            name: ''
        };

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
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

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            await signUp(email, password, name);
            router.replace('/(tabs)/dashboard');
        } catch (error) {
            // Error is handled by the useEffect above
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="John Doe"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    editable={!isLoading}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="example@email.com"
                    placeholderTextColor="#999"
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
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                        placeholder="Create password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={handlePasswordChange}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility" : "visibility-off"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
                {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                ) : (
                    <PasswordStrengthIndicator validation={passwordValidation} />
                )}
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                        placeholder="Confirm password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                    >
                        <MaterialIcons
                            name={showConfirmPassword ? "visibility" : "visibility-off"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
            </View>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Sign In</Text>
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
        marginTop: 10,
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
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#666',
    },
    linkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        borderWidth: 0,
    },
    passwordToggle: {
        padding: 10,
    },
}); 