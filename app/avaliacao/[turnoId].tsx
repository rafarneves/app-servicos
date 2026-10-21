import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, Field, LoadingState, Notice, PrimaryButton, Stars } from '../../components/ui';
import { avaliarContratacao } from '../../lib/avaliacoes';
import { buscarContratacao } from '../../lib/contratacoes';
import { mensagemDeErro } from '../../lib/errors';
import { formatarDia } from '../../lib/formato';
import { useSessao } from '../../lib/session';
import { colors, radius } from '../../lib/theme';
import { useDados } from '../../lib/useDados';

const LIMITE_COMENTARIO = 500;
const RESUMO_DA_NOTA = ['', 'Muito ruim', 'Ruim', 'Ok', 'Bom', 'Excelente'];

// Avaliação bilateral (modal): a empresa avalia o profissional e o profissional avalia a empresa.
export default function AvaliacaoScreen() {
  const { turnoId } = useLocalSearchParams<{ turnoId: string }>();
  const ehEmpresa = useSessao()?.role === 'EMPRESA';
  const { dados: turno, erro, recarregar } = useDados(() => buscarContratacao(turnoId), turnoId);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const avaliado = turno ? (ehEmpresa ? turno.prestador.nome : turno.vaga.empresa.nome) : '';
  const jaAvaliado = turno ? (ehEmpresa ? turno.avaliadoPelaEmpresa : turno.avaliadoPeloPrestador) : false;

  const enviar = async () => {
    if (nota === 0) {
      setErroEnvio('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }
    setEnviando(true);
    setErroEnvio('');
    try {
      await avaliarContratacao(turnoId, { nota, comentario: comentario.trim() });
      Alert.alert('Avaliação enviada', 'Obrigado! Sua avaliação ajuda toda a comunidade do Chama.', [{ text: 'Ok', onPress: () => router.back() }]);
    } catch (e) {
      setErroEnvio(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Fechar"><Ionicons name="close" size={24} color={colors.ink} /></Pressable>
            <Text style={styles.headerTitle}>Avaliação</Text>
            <View style={styles.spacer} />
          </View>

          {!turno ? (
            erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
          ) : (
            <>
              <View style={styles.intro}>
                <Text style={styles.title}>Como foi com {avaliado}?</Text>
                <Text style={styles.subtitle}>{turno.vaga.titulo} • {formatarDia(turno.vaga.data)}</Text>
              </View>

              {jaAvaliado ? (
                <Notice tone="success" text="Você já avaliou este turno." />
              ) : (
                <>
                  <View style={styles.starsCard}>
                    <Stars value={nota} size={40} onChange={setNota} />
                    <Text style={styles.noteLabel}>{nota ? RESUMO_DA_NOTA[nota] : 'Toque nas estrelas'}</Text>
                  </View>
                  <Field
                    label="Comentário (opcional)"
                    icon="chatbox-ellipses-outline"
                    placeholder={ehEmpresa ? 'Pontualidade, capricho, trabalho em equipe...' : 'Organização, acolhimento, estrutura...'}
                    multiline
                    maxLength={LIMITE_COMENTARIO}
                    value={comentario}
                    onChangeText={setComentario}
                  />
                  <Text style={styles.counter}>{comentario.length}/{LIMITE_COMENTARIO}</Text>
                  {erroEnvio ? <Notice text={erroEnvio} /> : null}
                  <PrimaryButton label="Enviar avaliação" icon="send" onPress={enviar} loading={enviando} />
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 34, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  spacer: { width: 44 },
  intro: { marginTop: 20, gap: 6 },
  title: { color: colors.wine, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14 },
  starsCard: { alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: 24 },
  noteLabel: { color: colors.inkSoft, fontSize: 14, fontWeight: '800' },
  counter: { color: colors.tabInactive, fontSize: 11, textAlign: 'right', marginTop: -8 },
});
