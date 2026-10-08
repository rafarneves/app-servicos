import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, BrandMark, Field, Notice, PrimaryButton, SecondaryButton } from '../../components/ui';
import { login } from '../../lib/auth';
import { mensagemDeErro } from '../../lib/errors';
import { destinoAposAutenticar } from '../../lib/rotas';
import { colors } from '../../lib/theme';
import { emailValido } from '../../lib/validacao';

export default function LoginScreen() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const isCompany = tipo === 'empresa';
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleLogin = async () => {
    const novosErros = {
      email: emailValido(email) ? undefined : 'Informe um e-mail válido.',
      senha: senha ? undefined : 'Informe sua senha.',
    };
    setErros(novosErros);
    setErroEnvio('');
    if (novosErros.email || novosErros.senha) return;

    setEnviando(true);
    try {
      await login({ email: email.trim(), senha });
      router.replace(await destinoAposAutenticar());
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  const handleSocial = () => Alert.alert('Em breve', 'O login com Apple e Google ainda não está disponível. Use seu e-mail e senha.');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} />
            <BrandMark compact />
            <View style={styles.spacer} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>{isCompany ? 'ACESSO DA EMPRESA' : 'ACESSO DO PROFISSIONAL'}</Text>
            <Text style={styles.title}>Que bom ter você de volta.</Text>
            <Text style={styles.subtitle}>
              {isCompany ? 'Entre para gerenciar seus turnos e sua equipe.' : 'Entre para encontrar seu próximo turno.'}
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label="E-mail"
              icon="mail-outline"
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={erros.email}
              returnKeyType="next"
            />
            <Field
              label="Senha"
              icon="lock-closed-outline"
              placeholder="Digite sua senha"
              secureTextEntry={!showPassword}
              autoComplete="password"
              value={senha}
              onChangeText={setSenha}
              error={erros.senha}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              right={(
                <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10} accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.inkSoft} />
                </Pressable>
              )}
            />
            <Pressable style={styles.forgotButton} onPress={() => router.push({ pathname: '/recuperar-senha', params: { email: email.trim() } })}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </Pressable>
            {erroEnvio ? <Notice text={erroEnvio} /> : null}
            <PrimaryButton label="Entrar" icon="arrow-forward" onPress={handleLogin} loading={enviando} />
          </View>

          <View style={styles.orRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socials}>
            <SecondaryButton label="Apple" icon="logo-apple" onPress={handleSocial} />
            <SecondaryButton label="Google" icon="logo-google" onPress={handleSocial} />
          </View>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpCopy}>Ainda não tem uma conta? </Text>
            <Pressable onPress={() => router.push({ pathname: '/cadastro', params: { tipo: isCompany ? 'empresa' : 'profissional' } })}>
              <Text style={styles.signUpLink}>Criar conta</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.replace({ pathname: '/entrar', params: { tipo: isCompany ? 'profissional' : 'empresa' } })}
            style={styles.switchProfile}
          >
            <Ionicons name={isCompany ? 'person-outline' : 'storefront-outline'} size={17} color={colors.inkSoft} />
            <Text style={styles.switchText}>{isCompany ? 'Entrar como profissional' : 'Entrar como empresa'}</Text>
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
  header: { paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spacer: { width: 44 },
  intro: { marginTop: 45, gap: 8 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.wine, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.1, maxWidth: 340 },
  subtitle: { color: colors.inkSoft, fontSize: 15, lineHeight: 21 },
  form: { marginTop: 31, gap: 17 },
  forgotButton: { alignSelf: 'flex-end', marginTop: -5 },
  forgotText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.tabInactive, fontSize: 12 },
  socials: { flexDirection: 'row', gap: 10 },
  signUpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 27 },
  signUpCopy: { color: colors.inkSoft, fontSize: 14 },
  signUpLink: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  switchProfile: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 7, marginTop: 21, padding: 8 },
  switchText: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' },
});
