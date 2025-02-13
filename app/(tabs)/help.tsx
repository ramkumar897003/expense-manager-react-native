import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How do I add an expense?",
        answer: "Tap the Expenses tab, then tap the + button in the top right. Fill in the expense details and tap Save."
    },
    {
        question: "How do I track my savings?",
        answer: "View your savings progress in the Dashboard tab. You can set savings goals and track your progress towards them."
    },
    {
        question: "Can I edit or delete transactions?",
        answer: "Yes! Swipe left on any transaction to reveal edit and delete options."
    },
    {
        question: "How do I change my password?",
        answer: "Go to Profile > Security > Change Password to update your password."
    }
];

export default function HelpScreen() {
    const handleContact = () => {
        Linking.openURL('mailto:support@example.com');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <View style={styles.faqContainer}>
                        {faqs.map((faq, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.faqItem,
                                    index === faqs.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <Text style={styles.question}>{faq.question}</Text>
                                <Text style={styles.answer}>{faq.answer}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContact}
                    >
                        <MaterialIcons name="email" size={24} color="#007AFF" />
                        <Text style={styles.contactButtonText}>Email Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 32,
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        flex: 1,
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
    faqContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    faqItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 8,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
}); 