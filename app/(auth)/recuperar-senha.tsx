import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, BrandMark, Field, Notice, PrimaryButton } from '../../components/ui';
import { redefinirSenha, solicitarRecuperacaoDeSenha } from '../../lib/auth';
import { mensagemDeErro } from '../../lib/errors';
import { colors } from '../../lib/theme';
import { emailValido, SENHA_MINIMA, somenteDigitos } from '../../lib/validacao';

export default function RecoverPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<{ email?: string; codigo?: string; novaSenha?: string; confirmacao?: string }>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (acao: () => Promise<void>) => {
    setErroEnvio('');
    setEnviando(true);
    try {
      await acao();
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  const solicitarCodigo = () => {
    const erroEmail = emailValido(email) ? undefined : 'Informe um e-mail válido.';
    setErros({ email: erroEmail });
    if (erroEmail) return;
    enviar(async () => {
      await solicitarRecuperacaoDeSenha({ email: email.trim() });
      setEtapa('codigo');
    });
  };

  const salvarSenha = () => {
    const novosErros = {
      codigo: codigo.length === 6 ? undefined : 'Digite os 6 números do código.',
      novaSenha: novaSenha.length >= SENHA_MINIMA ? undefined : `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`,
      confirmacao: confirmacao === novaSenha ? undefined : 'As senhas não conferem.',
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;
    enviar(async () => {
      await redefinirSenha({ email: email.trim(), codigo, novaSenha });
      Alert.alert('Senha alterada', 'Entre com a sua nova senha.', [{ text: 'Entrar', onPress: () => router.back() }]);
    });
  };

  const voltar = () => {
    setErroEnvio('');
    if (etapa === 'codigo') setEtapa('email');
    else router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackButton onPress={voltar} />
            <BrandMark compact />
            <View style={styles.spacer} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>RECUPERAR SENHA</Text>
            <Text style={styles.title}>{etapa === 'email' ? 'Esqueceu a senha?' : 'Crie uma nova senha.'}</Text>
            <Text style={styles.subtitle}>
              {etapa === 'email'
                ? 'Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um código.'
                : `Digite o código enviado para ${email.trim()} e escolha a nova senha.`}
            </Text>
          </View>

          <View style={styles.form}>
            {etapa === 'email' ? (
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
                returnKeyType="send"
                onSubmitEditing={solicitarCodigo}
              />
            ) : (
              <>
                <Field
                  label="Código"
                  icon="keypad-outline"
                  placeholder="000000"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChangeText={(valor) => setCodigo(somenteDigitos(valor))}
                  error={erros.codigo}
                />
                {__DEV__ ? <Text style={styles.devHint}>Ambiente de teste: use o código 123456.</Text> : null}
                <Field label="Nova senha" icon="lock-closed-outline" placeholder={`Mínimo de ${SENHA_MINIMA} caracteres`} secureTextEntry autoComplete="new-password" value={novaSenha} onChangeText={setNovaSenha} error={erros.novaSenha} />
                <Field label="Confirme a nova senha" icon="lock-closed-outline" placeholder="Repita a senha" secureTextEntry autoComplete="new-password" value={confirmacao} onChangeText={setConfirmacao} error={erros.confirmacao} />
              </>
            )}
            {erroEnvio ? <Notice text={erroEnvio} /> : null}
            <PrimaryButton
              label={etapa === 'email' ? 'Enviar código' : 'Salvar nova senha'}
              icon="arrow-forward"
              onPress={etapa === 'email' ? solicitarCodigo : salvarSenha}
              loading={enviando}
            />
          </View>
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
  devHint: { color: colors.inkSoft, fontSize: 12, marginTop: -8 },
});
