import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0f172a',
  light: '#e0e7ff',
};

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');

      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)/dashboard');

        } else {
          router.replace('/login');
        }
      }, 3000); 
    };

    init();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Demo app</Text>
        <Text style={styles.tagline}>React Native Intern Task</Text>

        <ActivityIndicator
          size="large"
          color={COLORS.light}
          style={{ marginTop: 30 }}
        />
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
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.light,
    letterSpacing: 1,
  },
});
