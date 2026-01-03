import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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
  success: '#10b981',
  border: '#e5e7eb',
};

export default function Tasks() {
  const router = useRouter();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/login');
        return;
      }

      let userId = await AsyncStorage.getItem('userId');

      // If no userId, try to get from auth/me
      if (!userId) {
        try {
          const userRes = await fetch('https://dummyjson.com/auth/me', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            userId = String(userData.id);
          }
        } catch (err) {
          console.log('Could not fetch user');
        }
      }

      if (!userId) {
        throw new Error('No user ID found');
      }

      // Fetch user's todos
      const todoRes = await fetch(
        `https://dummyjson.com/todos/user/${userId}`
      );
      const todoData = await todoRes.json();
      setTodos(todoData.todos || []);

    } catch (err) {
      console.log('Tasks error:', err);
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTodos();
  };

  if (loading) {
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
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            ✅ {completed} completed  •  ⏳ {pending} pending
          </Text>
        </View>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.taskRow}>
              <Ionicons
                name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={item.completed ? COLORS.success : COLORS.muted}
              />
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.taskCompleted,
                  ]}
                >
                  {item.todo}
                </Text>
                <Text style={styles.status}>
                  {item.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={60} color={COLORS.muted} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  stats: {
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: COLORS.muted,
  },

  list: {
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.muted,
  },
  status: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.muted,
  },
});