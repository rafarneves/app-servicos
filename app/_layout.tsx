import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="escolher-perfil" />
        <Stack.Screen name="entrar" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="empresa" />
        <Stack.Screen name="nova-oportunidade" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
