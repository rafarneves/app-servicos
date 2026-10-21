import { Stack } from 'expo-router';
import { useSessao } from '../../lib/session';
import { colors } from '../../lib/theme';

export default function AuthLayout() {
  const sessao = useSessao();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Protected guard={!sessao}>
        <Stack.Screen name="escolher-perfil" />
        <Stack.Screen name="entrar" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="recuperar-senha" />
      </Stack.Protected>
      {/* Logado com o celular ainda não verificado. */}
      <Stack.Protected guard={!!sessao}>
        <Stack.Screen name="otp" />
      </Stack.Protected>
    </Stack>
  );
}
