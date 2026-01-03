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

    if (!username || !password) {
      setError('Username aur password required');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error('Invalid credentials');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userId', String(data.id));

      router.replace('/(tabs)/dashboard');

    } catch (err) {
      setError('Login failed. Dummy API may reject credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 🟡 DEMO LOGIN
  const handleDemoLogin = async () => {
    await AsyncStorage.clear();
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back 👋</Text>
          <Text style={styles.sub}>Login to continue</Text>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
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

          {/* DEMO BUTTON */}
          <Pressable
            style={styles.demoButton}
            onPress={handleDemoLogin}
          >
            <Text style={styles.demoText}>Continue as Demo</Text>
          </Pressable>

          <Text style={styles.helper}>
            DummyJSON auth unstable — demo mode recommended
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
  },
  error: {
    color: COLORS.danger,
    marginBottom: 10,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  demoButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
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
  },
});
