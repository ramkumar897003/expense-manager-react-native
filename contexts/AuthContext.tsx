import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { router } from 'expo-router';

type User = {
    id: string;
    email: string;
    name?: string;
} | null;

type AuthError = {
    code: string;
    message: string;
} | null;

type AuthContextType = {
    user: User;
    error: AuthError;
    signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
    isLoading: boolean;
    clearError: () => void;
    isInitialized: boolean;
    sessionExpiry: number | null;
    updateUserProfile: (updates: { name?: string; email?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
}

const STORAGE_KEY = '@auth_store';
const SALT_KEY = '@auth_salt';

// Add session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SESSION_KEY = '@auth_session';

interface SessionData {
    token: string;
    expiresAt: number;
    userId: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

    // Load persisted auth state on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            // Check for active session first
            const sessionData = await AsyncStorage.getItem(SESSION_KEY);
            if (sessionData) {
                const session: SessionData = JSON.parse(sessionData);

                if (Date.now() < session.expiresAt) {
                    // Valid session exists, load user data
                    const storedAuth = await AsyncStorage.getItem(STORAGE_KEY);
                    if (storedAuth) {
                        const userData = JSON.parse(storedAuth);
                        setUser(userData);
                        setSessionExpiry(session.expiresAt);
                        startSessionTimer(session.expiresAt);
                    }
                } else {
                    // Session expired, clean up
                    await handleSessionExpiration();
                }
            }
        } catch (err) {
            console.error('Failed to load auth state:', err);
            // On error, clean up any potentially corrupted state
            await AsyncStorage.multiRemove([SESSION_KEY, STORAGE_KEY]);
            setUser(null);
            setSessionExpiry(null);
        } finally {
            setIsInitialized(true);
        }
    };

    const startSessionTimer = (expiryTime: number) => {
        const timeUntilExpiry = expiryTime - Date.now();
        if (timeUntilExpiry > 0) {
            setTimeout(handleSessionExpiration, timeUntilExpiry);
        }
    };

    const handleSessionExpiration = async () => {
        await AsyncStorage.multiRemove([SESSION_KEY, STORAGE_KEY]);
        setUser(null);
        setSessionExpiry(null);
        router.replace('/login');
    };

    const createSession = async (userId: string, rememberMe: boolean) => {
        const token = Base64.stringify(SHA256(userId + Date.now().toString()));
        const expiresAt = Date.now() + (rememberMe ? SESSION_DURATION : 24 * 60 * 60 * 1000); // 7 days or 24 hours

        const sessionData: SessionData = {
            token,
            expiresAt,
            userId
        };

        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setSessionExpiry(expiresAt);
        startSessionTimer(expiresAt);
    };

    const clearError = () => setError(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const generateSalt = () => {
        return Base64.stringify(SHA256(Date.now().toString()));
    };

    const hashPassword = (password: string, salt: string) => {
        return Base64.stringify(SHA256(password + salt));
    };

    const signUp = async (email: string, password: string, name: string) => {
        clearError();

        if (!email || !password || !name) {
            setError({ code: 'auth/missing-fields', message: 'All fields are required' });
            return;
        }

        if (!validateEmail(email)) {
            setError({ code: 'auth/invalid-email', message: 'Please enter a valid email address' });
            return;
        }

        if (password.length < 6) {
            setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        try {
            const existingUsers = await AsyncStorage.getItem('registered_users');
            const users: StoredUser[] = existingUsers ? JSON.parse(existingUsers) : [];

            if (users.some(u => u.email === email)) {
                throw new Error('User already exists');
            }

            // Generate user ID first
            const userId = Date.now().toString();

            // Generate and store salt
            const salt = generateSalt();
            console.log('Storing salt for user:', userId); // Debug log
            await AsyncStorage.setItem(`${SALT_KEY}_${userId}`, salt);

            // Verify salt was stored
            const storedSalt = await AsyncStorage.getItem(`${SALT_KEY}_${userId}`);
            if (!storedSalt) {
                throw new Error('Failed to store salt');
            }

            const newUser: StoredUser = {
                id: userId,
                email,
                name,
                passwordHash: hashPassword(password, salt)
            };

            // Store user
            users.push(newUser);
            await AsyncStorage.setItem('registered_users', JSON.stringify(users));

            // Set as current user (excluding password hash)
            const { passwordHash: _, ...userWithoutHash } = newUser;
            setUser(userWithoutHash);

            // Create session and navigate
            await createSession(newUser.id, true);
            router.replace('/(tabs)/dashboard');

        } catch (err) {
            console.error('Registration error:', err); // Debug log
            if (err instanceof Error && err.message === 'User already exists') {
                setError({
                    code: 'auth/email-already-in-use',
                    message: 'An account with this email already exists'
                });
            } else {
                setError({
                    code: 'auth/registration-failed',
                    message: 'Registration failed. Please try again.'
                });
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string, rememberMe: boolean) => {
        clearError();

        if (!email || !password) {
            setError({ code: 'auth/missing-fields', message: 'Email and password are required' });
            return;
        }

        if (!validateEmail(email)) {
            setError({ code: 'auth/invalid-email', message: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        try {
            const registeredUsers = await AsyncStorage.getItem('registered_users');
            if (!registeredUsers) {
                throw new Error('User not found');
            }

            const users: StoredUser[] = JSON.parse(registeredUsers);
            const foundUser = users.find(u => u.email === email);

            if (!foundUser) {
                throw new Error('User not found');
            }

            // Debug logs
            console.log('Attempting to find salt for user:', foundUser.id);
            const allKeys = await AsyncStorage.getAllKeys();
            console.log('All storage keys:', allKeys);

            const salt = await AsyncStorage.getItem(`${SALT_KEY}_${foundUser.id}`);
            let backupSalt: string | undefined;  // Declare backupSalt outside the if block
            if (!salt) {
                console.error('No salt found for user:', foundUser.id);
                backupSalt = generateSalt();
                await AsyncStorage.setItem(`${SALT_KEY}_${foundUser.id}`, backupSalt);

                // Update user's password hash with new salt
                const newHash = hashPassword(password, backupSalt);
                foundUser.passwordHash = newHash;

                // Update user in storage
                const updatedUsers = users.map(u =>
                    u.id === foundUser.id ? foundUser : u
                );
                await AsyncStorage.setItem('registered_users', JSON.stringify(updatedUsers));

                console.log('Generated new salt and updated password hash');
            }

            // Rest of the sign in process...
            const hashedPassword = hashPassword(password, salt || backupSalt!);
            if (hashedPassword !== foundUser.passwordHash) {
                throw new Error('Invalid password');
            }

            // Create user object without sensitive data
            const userWithoutSensitiveData = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            };

            // Create session and store user data
            await createSession(foundUser.id, rememberMe);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutSensitiveData));
            setUser(userWithoutSensitiveData);

            // Navigate to dashboard after successful sign-in
            router.replace('/(tabs)/dashboard');

        } catch (err) {
            console.error('Sign in error:', err);
            if (err instanceof Error) {
                switch (err.message) {
                    case 'User not found':
                        setError({
                            code: 'auth/user-not-found',
                            message: 'No account found with this email'
                        });
                        break;
                    case 'Invalid password':
                        setError({
                            code: 'auth/wrong-password',
                            message: 'Incorrect password'
                        });
                        break;
                    default:
                        setError({
                            code: 'auth/unknown',
                            message: 'Failed to sign in. Please try again.'
                        });
                }
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            // Only remove session data, not the salt
            await AsyncStorage.multiRemove([SESSION_KEY, STORAGE_KEY]);
            setUser(null);
            setSessionExpiry(null);
            router.replace('/login');
        } catch (err) {
            setError({
                code: 'auth/sign-out-failed',
                message: 'Failed to sign out. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const requestPasswordReset = async (email: string) => {
        clearError();
        setIsLoading(true);

        try {
            const registeredUsers = await AsyncStorage.getItem('registered_users');
            const users: StoredUser[] = registeredUsers ? JSON.parse(registeredUsers) : [];
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('User not found');
            }

            // Generate a 6-digit code
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Store the code with expiration (5 minutes)
            await AsyncStorage.setItem(
                `reset_code_${email}`,
                JSON.stringify({
                    code: resetCode,
                    expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
                })
            );

            // TODO: In production, send this code via email
            console.log('Reset code:', resetCode);

        } catch (err) {
            if (err instanceof Error && err.message === 'User not found') {
                setError({
                    code: 'auth/user-not-found',
                    message: 'No account found with this email'
                });
            } else {
                setError({
                    code: 'auth/reset-failed',
                    message: 'Failed to initiate password reset'
                });
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string, code: string, newPassword: string) => {
        clearError();
        setIsLoading(true);

        try {
            const resetDataStr = await AsyncStorage.getItem(`reset_code_${email}`);
            if (!resetDataStr) {
                throw new Error('No reset code found');
            }

            const resetData = JSON.parse(resetDataStr);
            if (Date.now() > resetData.expiry) {
                throw new Error('Reset code expired');
            }

            if (resetData.code !== code) {
                throw new Error('Invalid code');
            }

            // Update user's password
            const registeredUsers = await AsyncStorage.getItem('registered_users');
            const users: StoredUser[] = registeredUsers ? JSON.parse(registeredUsers) : [];
            const userIndex = users.findIndex(u => u.email === email);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            const salt = generateSalt();
            const passwordHash = hashPassword(newPassword, salt);

            users[userIndex].passwordHash = passwordHash;
            await AsyncStorage.setItem('registered_users', JSON.stringify(users));
            await AsyncStorage.setItem(`${SALT_KEY}_${users[userIndex].id}`, salt);
            await AsyncStorage.removeItem(`reset_code_${email}`);

        } catch (err) {
            if (err instanceof Error) {
                switch (err.message) {
                    case 'No reset code found':
                        setError({
                            code: 'auth/no-reset-code',
                            message: 'Please request a new reset code'
                        });
                        break;
                    case 'Reset code expired':
                        setError({
                            code: 'auth/code-expired',
                            message: 'Reset code has expired'
                        });
                        break;
                    case 'Invalid code':
                        setError({
                            code: 'auth/invalid-code',
                            message: 'Invalid reset code'
                        });
                        break;
                    default:
                        setError({
                            code: 'auth/reset-failed',
                            message: 'Failed to reset password'
                        });
                }
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (updates: { name?: string; email?: string }) => {
        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            const registeredUsers = await AsyncStorage.getItem('registered_users');
            if (!registeredUsers) {
                throw new Error('No users found');
            }

            const users: StoredUser[] = JSON.parse(registeredUsers);
            const userIndex = users.findIndex(u => u.id === user.id);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            users[userIndex] = {
                ...users[userIndex],
                ...updates
            };

            await AsyncStorage.setItem('registered_users', JSON.stringify(users));
            setUser(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            console.error('Failed to update profile:', err);
            throw new Error('Failed to update profile');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            signUp,
            signOut,
            requestPasswordReset,
            resetPassword,
            isLoading,
            error,
            clearError,
            isInitialized,
            sessionExpiry,
            updateUserProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 