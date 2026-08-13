import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, Field, PrimaryButton } from '../components/ui';
import { colors, radius } from '../lib/theme';

export default function SignUpScreen() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const isCompany = tipo === 'empresa';
  const [step, setStep] = useState(1);
  const progress = useMemo(() => `${step * 50}%` as `${number}%`, [step]);

  const finish = () => {
    if (step === 1) setStep(2);
    else if (isCompany) router.replace('/empresa');
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackButton onPress={() => (step === 2 ? setStep(1) : router.back())} />
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
                <Field label={isCompany ? 'Seu nome' : 'Nome completo'} icon="person-outline" placeholder="Como podemos te chamar?" autoCapitalize="words" />
                <Field label="Celular" icon="call-outline" placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                <Field label="E-mail" icon="mail-outline" placeholder="seuemail@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
                <Field label="Crie uma senha" icon="lock-closed-outline" placeholder="Mínimo de 8 caracteres" secureTextEntry />
              </>
            ) : isCompany ? (
              <>
                <Field label="Nome do estabelecimento" icon="storefront-outline" placeholder="Ex.: Padaria Aurora" />
                <Field label="CNPJ" icon="document-text-outline" placeholder="00.000.000/0000-00" keyboardType="number-pad" />
                <Field label="Cidade" icon="location-outline" placeholder="Onde está o negócio?" />
                <Field label="Tipo de negócio" icon="restaurant-outline" placeholder="Ex.: Restaurante, padaria..." />
              </>
            ) : (
              <>
                <Field label="Profissão principal" icon="restaurant-outline" placeholder="Ex.: Cozinheiro, padeiro..." />
                <Field label="Cidade" icon="location-outline" placeholder="Onde você trabalha?" />
                <Field label="Tempo de experiência" icon="briefcase-outline" placeholder="Ex.: 3 anos" />
                <Field label="CPF" icon="document-text-outline" placeholder="000.000.000-00" keyboardType="number-pad" />
              </>
            )}
          </View>

          <View style={styles.footer}>
            {step === 2 ? (
              <Pressable style={styles.skipButton} onPress={finish}>
                <Text style={styles.skipText}>Preencher depois</Text>
              </Pressable>
            ) : null}
            <PrimaryButton label={step === 1 ? 'Continuar' : 'Concluir cadastro'} icon="arrow-forward" onPress={finish} />
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
  skipButton: { alignSelf: 'center', padding: 4 },
  skipText: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  legal: { color: colors.tabInactive, textAlign: 'center', fontSize: 10, lineHeight: 14, paddingHorizontal: 18 },
});
