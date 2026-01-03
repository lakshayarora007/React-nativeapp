import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2563eb',
  bg: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/login');
        return;
      }

      let userData;

      // Try to get user from auth/me API first
      try {
        const userRes = await fetch('https://dummyjson.com/auth/me', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (userRes.ok) {
          userData = await userRes.json();
        }
      } catch (authError) {
        console.log('Auth API failed, using stored data');
      }

      // If auth/me fails, use stored user data
      if (!userData) {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          userData = JSON.parse(storedUser);
        } else {
          // Fallback: fetch user by ID
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            const userRes = await fetch(`https://dummyjson.com/users/${userId}`);
            userData = await userRes.json();
          }
        }
      }

      if (!userData) {
        throw new Error('No user data found');
      }

      setUser(userData);

      // Fetch user's todos
      const todoRes = await fetch(
        `https://dummyjson.com/todos/user/${userData.id}`
      );
      const todoData = await todoRes.json();
      setTodos(todoData.todos || []);

      // Fetch products
      const productRes = await fetch(
        'https://dummyjson.com/products?limit=5'
      );
      const productData = await productRes.json();
      setProducts(productData.products || []);

    } catch (err) {
      console.log('Dashboard error:', err);
      // Token invalid, logout user
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.length - completed;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.headerBox}>
          <View>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.title}>{user.firstName} {user.lastName}</Text>
          </View>
          <Image source={{ uri: user.image }} style={styles.headerAvatar} />
        </View>

        {/* USER INFO CARD */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={18} color={COLORS.muted} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={18} color={COLORS.muted} />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
        </View>

        {/* TASK STATS */}
        <Text style={styles.sectionTitle}>Tasks Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="time" size={32} color={COLORS.warning} />
            <Text style={styles.statNumber}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
            <Ionicons name="list" size={32} color={COLORS.primary} />
            <Text style={styles.statNumber}>{todos.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* FEATURED PRODUCTS */}
        <Text style={styles.sectionTitle}>Featured Products</Text>
        {products.map((p) => (
          <View key={p.id} style={styles.productCard}>
            <Image source={{ uri: p.thumbnail }} style={styles.productImg} />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={styles.productBrand}>{p.brand}</Text>
              <Text style={styles.price}>${p.price}</Text>
            </View>
          </View>
        ))}

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/tabs/profile')}
        >
          <Ionicons name="person" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>View Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
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
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  headerAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.text,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  productImg: {
    width: 70,
    height: 70,
    marginRight: 12,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
  },
  price: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});