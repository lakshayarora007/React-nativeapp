import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEMO_MODE = true;

const COLORS = {
  primary: '#2563eb',
  secondary: '#e0e7ff',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  danger: '#ef4444',
};

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        const res = await fetch('https://dummyjson.com/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        return;
      }

      if (DEMO_MODE) {
        const res = await fetch('https://dummyjson.com/users/1');
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.log('Profile error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading || !user ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <Image source={{ uri: user.image }} style={styles.avatar} />
            <Text style={styles.name}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.email}>{user.email}</Text>

            {DEMO_MODE && <Text style={styles.badge}>Demo Account</Text>}
          </View>

          {/* INFO CARD */}
          <View style={styles.card}>
            <Info label="Username" value={user.username} />
            <Info label="Phone" value={user.phone} />
            <Info label="Age" value={String(user.age)} />
            <Info label="Gender" value={user.gender} />
          </View>

          {/* LOGOUT */}
          <Pressable style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

/* 🔹 Reusable Row */
const Info = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    color: COLORS.muted,
    marginTop: 4,
  },
  badge: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: COLORS.muted,
    fontWeight: '500',
  },
  value: {
    color: COLORS.text,
    fontWeight: '600',
  },

  logout: {
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
