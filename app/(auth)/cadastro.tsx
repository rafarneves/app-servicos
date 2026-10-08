import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, Field, Notice, PrimaryButton } from '../../components/ui';
import { registrarEmpresa, registrarPrestador } from '../../lib/auth';
import { mensagemDeErro } from '../../lib/errors';
import { colors, radius } from '../../lib/theme';
import {
  celularValido,
  cnpjValido,
  cpfValido,
  emailValido,
  mascaraCelular,
  mascaraCnpj,
  mascaraCpf,
  SENHA_MINIMA,
} from '../../lib/validacao';

const formularioVazio = {
  nome: '',
  celular: '',
  email: '',
  senha: '',
  estabelecimento: '',
  cnpj: '',
  cidade: '',
  tipoNegocio: '',
  profissao: '',
  experiencia: '',
  cpf: '',
};

type Campo = keyof typeof formularioVazio;

export default function SignUpScreen() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const isCompany = tipo === 'empresa';
  const [step, setStep] = useState(1);
  const progress = useMemo(() => `${step * 50}%` as `${number}%`, [step]);
  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo: Campo, mascara?: (valor: string) => string) => (valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(valor) : valor }));

  const validarEtapa1 = () => ({
    nome: form.nome.trim() ? undefined : 'Informe seu nome.',
    celular: celularValido(form.celular) ? undefined : 'Informe um celular válido com DDD.',
    email: emailValido(form.email) ? undefined : 'Informe um e-mail válido.',
    senha: form.senha.length >= SENHA_MINIMA ? undefined : `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`,
  });

  const validarEtapa2 = () =>
    isCompany
      ? {
          estabelecimento: form.estabelecimento.trim() ? undefined : 'Informe o nome do estabelecimento.',
          cnpj: cnpjValido(form.cnpj) ? undefined : 'Informe um CNPJ válido.',
        }
      : { cpf: cpfValido(form.cpf) ? undefined : 'Informe um CPF válido.' };

  const finish = async () => {
    const novosErros = step === 1 ? validarEtapa1() : validarEtapa2();
    setErros(novosErros);
    setErroEnvio('');
    if (Object.values(novosErros).some(Boolean)) return;
    if (step === 1) {
      setStep(2);
      return;
    }

    setEnviando(true);
    try {
      const comum = { email: form.email.trim(), senha: form.senha, celular: form.celular, cidade: form.cidade.trim() };
      if (isCompany) {
        await registrarEmpresa({
          ...comum,
          nomeResponsavel: form.nome.trim(),
          razaoSocial: form.estabelecimento.trim(),
          cnpj: form.cnpj,
          tipoNegocio: form.tipoNegocio.trim(),
        });
      } else {
        await registrarPrestador({
          ...comum,
          nome: form.nome.trim(),
          cpf: form.cpf,
          funcao: form.profissao.trim(),
          experiencia: form.experiencia.trim(),
        });
      }
      router.replace('/otp');
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  const voltar = () => {
    setErroEnvio('');
    if (step === 2) setStep(1);
    else router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackButton onPress={voltar} />
            <Text style={styles.stepText}>Etapa {step} de 2</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressValue, { width: progress }]} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>{isCompany ? 'CONTA DA EMPRESA' : 'CONTA PROFISSIONAL'}</Text>
            <Text style={styles.title}>
              {step === 1 ? 'Vamos começar pelo básico.' : isCompany ? 'Conte sobre o seu negócio.' : 'Conte sobre seu trabalho.'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Leva menos de dois minutos.' : 'Isso ajuda o Chama a fazer conexões melhores.'}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              <>
                <Field label={isCompany ? 'Seu nome' : 'Nome completo'} icon="person-outline" placeholder="Como podemos te chamar?" autoCapitalize="words" autoComplete="name" value={form.nome} onChangeText={alterar('nome')} error={erros.nome} />
                <Field label="Celular" icon="call-outline" placeholder="(00) 00000-0000" keyboardType="phone-pad" autoComplete="tel" value={form.celular} onChangeText={alterar('celular', mascaraCelular)} error={erros.celular} />
                <Field label="E-mail" icon="mail-outline" placeholder="seuemail@exemplo.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={form.email} onChangeText={alterar('email')} error={erros.email} />
                <Field label="Crie uma senha" icon="lock-closed-outline" placeholder={`Mínimo de ${SENHA_MINIMA} caracteres`} secureTextEntry autoComplete="new-password" value={form.senha} onChangeText={alterar('senha')} error={erros.senha} />
              </>
            ) : isCompany ? (
              <>
                <Field label="Nome do estabelecimento" icon="storefront-outline" placeholder="Ex.: Padaria Aurora" value={form.estabelecimento} onChangeText={alterar('estabelecimento')} error={erros.estabelecimento} />
                <Field label="CNPJ" icon="document-text-outline" placeholder="00.000.000/0000-00" keyboardType="number-pad" value={form.cnpj} onChangeText={alterar('cnpj', mascaraCnpj)} error={erros.cnpj} />
                <Field label="Cidade (opcional)" icon="location-outline" placeholder="Onde está o negócio?" value={form.cidade} onChangeText={alterar('cidade')} />
                <Field label="Tipo de negócio (opcional)" icon="restaurant-outline" placeholder="Ex.: Restaurante, padaria..." value={form.tipoNegocio} onChangeText={alterar('tipoNegocio')} />
              </>
            ) : (
              <>
                <Field label="Profissão principal (opcional)" icon="restaurant-outline" placeholder="Ex.: Cozinheiro, padeiro..." value={form.profissao} onChangeText={alterar('profissao')} />
                <Field label="Cidade (opcional)" icon="location-outline" placeholder="Onde você trabalha?" value={form.cidade} onChangeText={alterar('cidade')} />
                <Field label="Tempo de experiência (opcional)" icon="briefcase-outline" placeholder="Ex.: 3 anos" value={form.experiencia} onChangeText={alterar('experiencia')} />
                <Field label="CPF" icon="document-text-outline" placeholder="000.000.000-00" keyboardType="number-pad" value={form.cpf} onChangeText={alterar('cpf', mascaraCpf)} error={erros.cpf} />
              </>
            )}
          </View>

          <View style={styles.footer}>
            {erroEnvio ? <Notice text={erroEnvio} /> : null}
            <PrimaryButton label={step === 1 ? 'Continuar' : 'Concluir cadastro'} icon="arrow-forward" onPress={finish} loading={enviando} />
            <Text style={styles.legal}>Ao criar sua conta, você aceita os Termos de Uso e a Política de Privacidade do Chama.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 22, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepText: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 5, borderRadius: radius.pill, backgroundColor: colors.border, marginTop: 22, overflow: 'hidden' },
  progressValue: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  intro: { marginTop: 37, gap: 8 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.wine, fontSize: 32, lineHeight: 37, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.inkSoft, fontSize: 15 },
  form: { gap: 17, marginTop: 29 },
  footer: { marginTop: 27, gap: 14 },
  legal: { color: colors.tabInactive, textAlign: 'center', fontSize: 10, lineHeight: 14, paddingHorizontal: 18 },
});
