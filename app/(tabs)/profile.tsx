import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import PersonalInfo from '../../components/PersonalInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

interface SettingItemProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
}

function SettingItem({ icon, title, subtitle, onPress, showChevron, value, onValueChange }: SettingItemProps) {
    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress && !onValueChange}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(icon)}20` }]}>
                <MaterialIcons name={icon} size={24} color={getIconColor(icon)} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {showChevron && <MaterialIcons name="chevron-right" size={24} color="#666" />}
            {onValueChange && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#ddd', true: '#34C759' }}
                />
            )}
        </TouchableOpacity>
    );
}

function getIconColor(icon: keyof typeof MaterialIcons.glyphMap): string {
    const colors: { [key in keyof typeof MaterialIcons.glyphMap]?: string } = {
        'account-circle': '#007AFF',
        'notifications': '#FF9500',
        'lock': '#5856D6',
        'color-lens': '#FF2D55',
        'language': '#34C759',
        'help': '#64D2FF',
        'logout': '#FF3B30'
    };
    return colors[icon] || '#666';
}

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem(`profile_image_${user?.id}`);
            if (savedImage) {
                setProfileImage(savedImage);
            }
        } catch (error) {
            console.error('Error loading profile image:', error);
        } finally {
            setIsLoadingImage(false);
        }
    };

    const saveProfileImage = async (imageUri: string) => {
        try {
            await AsyncStorage.setItem(`profile_image_${user?.id}`, imageUri);
            setProfileImage(imageUri);
        } catch (error) {
            console.error('Error saving profile image:', error);
            alert('Failed to save profile image');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to update your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                await saveProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Failed to pick image');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
        </View>
    );

    return (
        <>
            <StatusBar style="dark" backgroundColor="white" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        stickyHeaderIndices={[0]}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderHeader()}

                        <View style={styles.profileSection}>
                            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                                {isLoadingImage ? (
                                    <View style={styles.avatarPlaceholder}>
                                        <ActivityIndicator color="#007AFF" />
                                    </View>
                                ) : profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <MaterialIcons name="account-circle" size={80} color="#E1E1E1" />
                                    </View>
                                )}
                                <View style={styles.editOverlay}>
                                    <MaterialIcons name="camera-alt" size={20} color="white" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>

                        <PersonalInfo />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>App Settings</Text>
                            <View style={styles.settingsContainer}>
                                <SettingItem
                                    icon="notifications"
                                    title="Notifications"
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                />
                                <SettingItem
                                    icon="color-lens"
                                    title="Dark Mode"
                                    value={darkModeEnabled}
                                    onValueChange={setDarkModeEnabled}
                                />
                                <SettingItem
                                    icon="language"
                                    title="Language"
                                    subtitle="English"
                                    showChevron
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Support</Text>
                            <View style={styles.settingsContainer}>
                                <SettingItem
                                    icon="help"
                                    title="Help & Support"
                                    subtitle="FAQ, contact us"
                                    showChevron
                                    onPress={() => router.push('/help')}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={handleSignOut}
                        >
                            <MaterialIcons name="logout" size={24} color="#FF3B30" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 32,
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        backgroundColor: '#f8f8f8',
        overflow: 'hidden',
        position: 'relative',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 36,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        marginLeft: 4,
    },
    settingsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: '#FFF1F0',
        borderRadius: 12,
    },
    signOutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
}); 