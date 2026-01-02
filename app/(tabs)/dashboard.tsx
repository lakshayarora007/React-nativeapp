import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEMO_MODE = true;

const COLORS = {
  primary: '#2563eb',
  bg: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  danger: '#ef4444',
};

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      // 🔐 AUTH MODE (only if demo OFF)
      if (!DEMO_MODE && token && userId) {
        const userRes = await fetch('https://dummyjson.com/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error('Auth failed');

        const userData = await userRes.json();

        const todoRes = await fetch(
          `https://dummyjson.com/todos/user/${userId}`
        );
        const todoData = await todoRes.json();

        const productRes = await fetch(
          'https://dummyjson.com/products?limit=4'
        );
        const productData = await productRes.json();

        setUser(userData);
        setTodos(todoData.todos);
        setProducts(productData.products);
        return;
      }

      // 🟡 DEMO MODE (stable)
      const userRes = await fetch('https://dummyjson.com/users/1');
      const userData = await userRes.json();

      const todoRes = await fetch(
        `https://dummyjson.com/todos/user/${userData.id}`
      );
      const todoData = await todoRes.json();

      const productRes = await fetch(
        'https://dummyjson.com/products?limit=4'
      );
      const productData = await productRes.json();

      setUser(userData);
      setTodos(todoData.todos);
      setProducts(productData.products);
    } catch (err) {
      console.log('Dashboard error', err);
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.length - completed;

  return (
      <SafeAreaView style={styles.safe}>
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>Dashboard</Text>
        {DEMO_MODE && <Text style={styles.badge}>Demo Mode</Text>}
      </View>

      {/* USER CARD */}
      <View style={styles.card}>
        <Image source={{ uri: user.image }} style={styles.avatar} />
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* TASK STATS */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* PRODUCTS */}
      <Text style={styles.section}>Featured Products</Text>

      {products.map((p) => (
        <View key={p.id} style={styles.productCard}>
          <Image source={{ uri: p.thumbnail }} style={styles.productImg} />
          <View style={{ flex: 1 }}>
            <Text style={styles.productTitle}>{p.title}</Text>
            <Text style={styles.price}>₹ {p.price}</Text>
          </View>
        </View>
      ))}
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
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBox: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  badge: {
    marginTop: 6,
    backgroundColor: '#fff',
    color: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    textAlign: 'center',
    color: COLORS.muted,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    color: COLORS.muted,
  },

  section: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 4,
  },
  productImg: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
  },
  productTitle: {
    fontWeight: '600',
  },
  price: {
    color: COLORS.muted,
  },
});
