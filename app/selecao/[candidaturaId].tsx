import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, ErrorState, LoadingState, Notice, PrimaryButton, SecondaryButton, ValueRow } from '../../components/ui';
import { listarCandidatosDaVaga, selecionarCandidato } from '../../lib/candidaturas';
import { mensagemDeErro } from '../../lib/errors';
import { formatarDia, formatarHorario, formatarNota, iniciais, plural } from '../../lib/formato';
import { formatarMoeda, resumoDoTurno } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import type { Contratacao } from '../../lib/types';
import { useDados } from '../../lib/useDados';

// Modal da empresa: resumo do valor retido em escrow antes de confirmar o profissional.
export default function SelecaoScreen() {
  const { candidaturaId, vagaId } = useLocalSearchParams<{ candidaturaId: string; vagaId: string }>();
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [contratacao, setContratacao] = useState<Contratacao>();

  const { dados: candidatura, erro, recarregar } = useDados(async () => {
    const candidatos = await listarCandidatosDaVaga(vagaId);
    const encontrada = candidatos.find((c) => c.id === candidaturaId);
    if (!encontrada) throw new Error('Candidatura não encontrada.');
    return encontrada;
  }, candidaturaId);
  // Só exibição: o servidor recalcula o valor ao selecionar.
  const resumo = candidatura ? resumoDoTurno(candidatura.vaga.valorTurno) : null;

  const confirmar = async () => {
    setEnviando(true);
    setErroEnvio('');
    try {
      setContratacao(await selecionarCandidato(candidaturaId));
    } catch (e) {
      setErroEnvio(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Fechar"><Ionicons name="close" size={24} color={colors.ink} /></Pressable>
      <Text style={styles.headerTitle}>Confirmar profissional</Text>
      <View style={styles.spacer} />
    </View>
  );

  if (contratacao) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {header}
          <View style={styles.success}>
            <View style={styles.successIcon}><Ionicons name="checkmark" size={44} color={colors.surface} /></View>
            <Text style={styles.successTitle}>Turno confirmado!</Text>
            <Text style={styles.successText}>
              {contratacao.prestador.nome} está confirmado(a) para {formatarDia(contratacao.vaga.data).toLowerCase()}, {formatarHorario(contratacao.vaga.horaInicio, contratacao.vaga.horaFim)}. {formatarMoeda(contratacao.valorTotal)} ficou retido em escrow até você confirmar a conclusão.
            </Text>
          </View>
          <View style={styles.footer}>
            <PrimaryButton label="Ver turno" icon="arrow-forward" onPress={() => router.replace(`/turno/${contratacao.id}`)} />
            <SecondaryButton label="Voltar para a vaga" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {header}
        {!candidatura ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <Avatar initials={iniciais(candidatura.prestador.nome)} size={52} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{candidatura.prestador.nome}</Text>
                  <Text style={styles.muted}>{candidatura.prestador.funcao || 'Profissional'}</Text>
                  <View style={styles.ratingRow}><Ionicons name="star" size={12} color={colors.star} /><Text style={styles.muted}>{formatarNota(candidatura.prestador.notaMedia)} • {plural(candidatura.prestador.turnosConcluidos, 'turno concluído', 'turnos concluídos')}</Text></View>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.role}>{candidatura.vaga.titulo}</Text>
              <Text style={styles.muted}>{formatarDia(candidatura.vaga.data)} • {formatarHorario(candidatura.vaga.horaInicio, candidatura.vaga.horaFim)}</Text>
            </View>

            <View style={styles.card}>
              <ValueRow label="Valor do turno" value={formatarMoeda(resumo!.valorTurno)} />
              <ValueRow label="Taxa da plataforma (10%)" value={formatarMoeda(resumo!.taxaPlataforma)} />
              <View style={styles.divider} />
              <ValueRow label="Total retido em escrow" value={formatarMoeda(resumo!.valorTotal)} strong />
            </View>

            <View style={styles.escrow}>
              <Ionicons name="lock-closed" size={20} color={colors.success} />
              <Text style={styles.escrowText}>O valor fica retido com segurança e só é liberado ao profissional depois que você confirmar a conclusão do turno.</Text>
            </View>

            {candidatura.status !== 'PENDENTE' ? <Notice tone="warning" text="Esta candidatura não está mais pendente." /> : null}
            {erroEnvio ? <Notice text={erroEnvio} /> : null}
            <PrimaryButton
              label={`Confirmar e reter ${formatarMoeda(resumo!.valorTotal)}`}
              icon="checkmark"
              onPress={confirmar}
              loading={enviando}
              disabled={candidatura.status !== 'PENDENTE'}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { flexGrow: 1, padding: 20, paddingBottom: 34, gap: 16 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  close: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  spacer: { width: 44 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 17, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  muted: { color: colors.inkSoft, fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  role: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border },
  escrow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.successSoft, borderRadius: radius.md, padding: 14 },
  escrowText: { flex: 1, color: '#2D6552', fontSize: 12, lineHeight: 18 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  successIcon: { width: 86, height: 86, borderRadius: 30, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: colors.wine, fontSize: 28, fontWeight: '900', marginTop: 22 },
  successText: { color: colors.inkSoft, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  footer: { gap: 10 },
});
