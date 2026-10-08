import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(profissional)" />
        <Stack.Screen name="empresa" />
        <Stack.Screen name="vaga/nova" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
