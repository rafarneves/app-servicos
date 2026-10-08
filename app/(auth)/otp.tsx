import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark, Field, Notice, PrimaryButton } from '../../components/ui';
import { logout, reenviarOtp, verificarOtp } from '../../lib/auth';
import { mensagemDeErro } from '../../lib/errors';
import { destinoAposAutenticar } from '../../lib/rotas';
import { colors } from '../../lib/theme';
import { somenteDigitos } from '../../lib/validacao';

const ESPERA_REENVIO_S = 30;

export default function OtpScreen() {
  const [codigo, setCodigo] = useState('');
  const [erroCampo, setErroCampo] = useState('');
  const [erroEnvio, setErroEnvio] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO_S);

  useEffect(() => {
    if (espera <= 0) return;
    const timer = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [espera]);

  const verificar = async () => {
    setErroEnvio('');
    setAviso('');
    if (codigo.length !== 6) {
      setErroCampo('Digite os 6 números do código.');
      return;
    }
    setErroCampo('');
    setEnviando(true);
    try {
      await verificarOtp({ codigo });
      router.replace(await destinoAposAutenticar());
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setErroEnvio('');
    setAviso('');
    try {
      await reenviarOtp();
      setAviso('Enviamos um novo código.');
      setEspera(ESPERA_REENVIO_S);
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    }
  };

  const sair = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BrandMark compact />
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>VERIFICAÇÃO DO CELULAR</Text>
            <Text style={styles.title}>Confirme seu número.</Text>
            <Text style={styles.subtitle}>Enviamos um código de 6 dígitos por SMS para o celular do seu cadastro.</Text>
          </View>

          <View style={styles.form}>
            <Field
              label="Código"
              icon="keypad-outline"
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              value={codigo}
              onChangeText={(valor) => setCodigo(somenteDigitos(valor))}
              error={erroCampo}
              returnKeyType="done"
              onSubmitEditing={verificar}
            />
            {__DEV__ ? <Text style={styles.devHint}>Ambiente de teste: use o código 123456.</Text> : null}
            {erroEnvio ? <Notice text={erroEnvio} /> : null}
            {aviso ? <Notice text={aviso} tone="success" /> : null}
            <PrimaryButton label="Verificar" icon="checkmark" onPress={verificar} loading={enviando} />
          </View>

          <Pressable onPress={reenviar} disabled={espera > 0} style={styles.linkButton}>
            <Text style={[styles.linkText, espera > 0 && styles.linkDisabled]}>
              {espera > 0 ? `Reenviar código em ${espera}s` : 'Reenviar código'}
            </Text>
          </Pressable>

          <Pressable onPress={sair} style={styles.linkButton}>
            <Text style={styles.mutedLink}>Sair e usar outra conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 28 },
  header: { paddingTop: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 44 },
  intro: { marginTop: 45, gap: 8 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.wine, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.1, maxWidth: 340 },
  subtitle: { color: colors.inkSoft, fontSize: 15, lineHeight: 21 },
  form: { marginTop: 31, gap: 17 },
  devHint: { color: colors.inkSoft, fontSize: 12, marginTop: -8 },
  linkButton: { alignSelf: 'center', padding: 8, marginTop: 18 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  linkDisabled: { color: colors.tabInactive },
  mutedLink: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' },
});
