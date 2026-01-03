import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#2563eb',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  danger: '#ef4444',
};

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Try DummyJSON auth API first
      const authResponse = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          expiresInMins: 30,
        }),
      });

      const authData = await authResponse.json();

      // If auth API works, use it
      if (authResponse.ok && authData.token && authData.id) {
        await AsyncStorage.setItem('token', authData.token);
        await AsyncStorage.setItem('userId', String(authData.id));
        router.replace('/tabs/dashboard');
        return;
      }

      // Step 2: If auth API fails, validate against /users API
      const usersResponse = await fetch('https://dummyjson.com/users');
      const usersData = await usersResponse.json();
      
      // Find user with matching username
      const user = usersData.users.find(
        (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!user) {
        throw new Error('User not found. Please check username.');
      }

      // Validate password (in real app, password would be hashed)
      // For demo, we'll check if password matches user's password field
      if (user.password !== password.trim()) {
        throw new Error('Invalid password');
      }

      // Create a mock token and store user data
      const mockToken = `mock_token_${user.id}_${Date.now()}`;
      await AsyncStorage.setItem('token', mockToken);
      await AsyncStorage.setItem('userId', String(user.id));
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      router.replace('/tabs/dashboard');

    } catch (err: any) {
      console.log('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill credentials for testing
  const fillTestCredentials = () => {
    setUsername('emilys');
    setPassword('emilyspass');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back 👋</Text>
          <Text style={styles.sub}>Login to your account</Text>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />

          {/* LOGIN BUTTON */}
          <Pressable
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          {/* TEST CREDENTIALS BUTTON */}
          <Pressable
            style={styles.demoButton}
            onPress={fillTestCredentials}
            disabled={loading}
          >
            <Text style={styles.demoText}>Use Test Credentials</Text>
          </Pressable>

          <Text style={styles.helper}>
            Any user from dummyjson.com/users works!{'\n'}
            Try: emilys / emilyspass
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  sub: {
    color: COLORS.muted,
    marginBottom: 20,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  demoButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  demoText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});