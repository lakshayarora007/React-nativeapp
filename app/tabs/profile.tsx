import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      if (!token) {
        router.replace('/login');
        return;
      }

      let userData;

      // Try auth/me API first
      try {
        const res = await fetch('https://dummyjson.com/auth/me', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.ok) {
          userData = await res.json();
        }
      } catch (authError) {
        console.log('Auth API failed');
      }

      // If auth fails, use stored user data
      if (!userData) {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          userData = JSON.parse(storedUser);
        } else {
          // Fallback: fetch by user ID
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            const res = await fetch(`https://dummyjson.com/users/${userId}`);
            userData = await res.json();
          }
        }
      }

      if (!userData) {
        throw new Error('No user data');
      }

      setUser(userData);

    } catch (err) {
      console.log('Profile error', err);
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/login');
          },
        },
      ]
    );
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
          </View>

          {/* INFO CARD */}
          <View style={styles.card}>
            <InfoRow label="Username" value={user.username} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Age" value={String(user.age)} />
            <InfoRow label="Gender" value={user.gender} />
            <InfoRow label="Birth Date" value={user.birthDate} />
            <InfoRow label="Blood Group" value={user.bloodGroup} />
          </View>

          {/* ADDRESS CARD */}
          {user.address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Address</Text>
              <Text style={styles.addressText}>
                {user.address.address}, {user.address.city}
              </Text>
              <Text style={styles.addressText}>
                {user.address.state} - {user.address.postalCode}
              </Text>
            </View>
          )}

          {/* LOGOUT BUTTON */}
          <Pressable style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

/* Reusable Row Component */
const InfoRow = ({ label, value }: any) => (
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    color: COLORS.muted,
    marginTop: 4,
    fontSize: 14,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    color: COLORS.muted,
    fontWeight: '500',
    fontSize: 14,
  },
  value: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  addressText: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 4,
  },

  logout: {
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});