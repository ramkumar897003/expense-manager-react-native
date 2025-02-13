import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import { IncomeProvider } from '../contexts/IncomeContext';
import { SavingsProvider } from '../contexts/SavingsContext';
import { BudgetProvider } from '../contexts/BudgetContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ExpenseProvider>
        <IncomeProvider>
          <SavingsProvider>
            <BudgetProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </BudgetProvider>
          </SavingsProvider>
        </IncomeProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}
