import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSessao } from '../lib/session';
import { colors } from '../lib/theme';

// Proteção de rotas: cada área só existe para quem pode vê-la. Quando a sessão muda (login, OTP,
// logout, sessão expirada), o Stack.Protected leva sozinho para a primeira tela disponível.
export default function RootLayout() {
  const sessao = useSessao();

  // Lendo a sessão salva no secure-store.
  if (sessao === undefined) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  const liberado = !!sessao && sessao.celularVerificado;
  const role = liberado ? sessao.role : null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Protected guard={!sessao}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        {/* Sem sessão: login e cadastro. Com sessão e celular não verificado: só o OTP (ver (auth)/_layout). */}
        <Stack.Protected guard={!liberado}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={role === 'PRESTADOR'}>
          <Stack.Screen name="(profissional)" />
        </Stack.Protected>
        <Stack.Protected guard={role === 'EMPRESA'}>
          <Stack.Screen name="empresa" />
          <Stack.Screen name="vaga/nova" options={{ presentation: 'modal' }} />
          <Stack.Screen name="selecao/[candidaturaId]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={liberado}>
          <Stack.Screen name="vaga/[id]" />
          <Stack.Screen name="profissional/[id]" />
          <Stack.Screen name="turno/[id]" />
          <Stack.Screen name="avaliacao/[turnoId]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
