import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 👇 Splash FIRST */}
        <Stack.Screen name="index" />

        {/* Auth */}
        <Stack.Screen name="login" />

        {/* Tabs */}
        <Stack.Screen name="tabs" />
      </Stack>
    </>
  );
}
