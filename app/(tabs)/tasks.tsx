import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Tasks() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const res = await fetch('https://dummyjson.com/todos/user/1');
    const data = await res.json();
    setTodos(data.todos);
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.todo}</Text>
          <Text
            style={{
              color: item.completed ? 'green' : 'red',
              marginTop: 4,
            }}
          >
            {item.completed ? 'Completed' : 'Pending'}
          </Text>
        </View>
      )}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
  flex: 1,
  backgroundColor: '#f1f5f9',
},
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
});
