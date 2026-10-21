import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, avisarEmBreve, ErrorState, LoadingState, Notice, Pill, PrimaryButton, ScreenHeader, SecondaryButton, ValueRow } from '../../components/ui';
import { buscarContratacao, confirmarConclusao, fazerCheckIn, fazerCheckOut } from '../../lib/contratacoes';
import { mensagemDeErro } from '../../lib/errors';
import { formatarDia, formatarHorario, formatarInstante, formatarNota, hojeIso, iniciais, plural, rotuloDoPagamento, rotuloDoTurno } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { useSessao } from '../../lib/session';
import { colors, radius } from '../../lib/theme';
import type { Contratacao } from '../../lib/types';
import { useDados } from '../../lib/useDados';

// Detalhe do turno confirmado: check-in e check-out (profissional) e confirmação da conclusão (empresa).
export default function TurnoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ehEmpresa = useSessao()?.role === 'EMPRESA';
  const { dados: turno, erro, recarregar, setDados } = useDados(() => buscarContratacao(id), id);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const executar = async (acao: () => Promise<Contratacao>) => {
    setEnviando(true);
    setErroAcao('');
    try {
      setDados(await acao());
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const confirmar = (titulo: string, texto: string, botao: string, acao: () => Promise<Contratacao>) =>
    Alert.alert(titulo, texto, [
      { text: 'Voltar', style: 'cancel' },
      { text: botao, onPress: () => void executar(acao) },
    ]);

  if (!turno) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader title="Turno" onBack={() => router.back()} />
          {erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />}
        </View>
      </SafeAreaView>
    );
  }

  const rotulo = rotuloDoTurno[turno.status];
  const pagamento = rotuloDoPagamento[turno.statusPagamento];
  const ehHoje = turno.vaga.data === hojeIso();
  const jaAvaliei = ehEmpresa ? turno.avaliadoPelaEmpresa : turno.avaliadoPeloPrestador;
  const abrirRota = () =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(turno.vaga.endereco)}`).catch(() =>
      Alert.alert('Não foi possível abrir o mapa', turno.vaga.endereco),
    );

  const etapas = [
    { label: 'Turno confirmado', quando: turno.criadoEm },
    { label: 'Check-in', quando: turno.checkInEm },
    { label: 'Check-out', quando: turno.checkOutEm },
    { label: 'Conclusão confirmada e pagamento liberado', quando: turno.concluidoEm },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Turno"
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => avisarEmBreve('O chat do turno')} style={styles.chatButton} accessibilityLabel="Conversar">
              <Ionicons name="chatbubble-ellipses-outline" size={21} color={colors.primary} />
            </Pressable>
          }
        />

        <View style={styles.card}>
          <Pill label={rotulo.label} tone={rotulo.tone} />
          <Text style={styles.role}>{turno.vaga.titulo}</Text>
          <Text style={styles.company}>{turno.vaga.empresa.nome}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>DATA</Text><Text style={styles.infoValue}>{formatarDia(turno.vaga.data)}</Text></View></View>
            <View style={styles.infoItem}><Ionicons name="time-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>HORÁRIO</Text><Text style={styles.infoValue}>{formatarHorario(turno.vaga.horaInicio, turno.vaga.horaFim)}</Text></View></View>
          </View>
          {turno.vaga.endereco ? (
            <Pressable onPress={abrirRota} style={styles.addressRow}>
              <Ionicons name="location-outline" size={19} color={colors.inkSoft} />
              <Text style={styles.address}>{turno.vaga.endereco}</Text>
              {ehEmpresa ? null : <Text style={styles.link}>Ver rota</Text>}
            </Pressable>
          ) : null}
        </View>

        {ehEmpresa ? (
          <Pressable onPress={() => router.push(`/profissional/${turno.prestador.id}`)} style={styles.person}>
            <Avatar initials={iniciais(turno.prestador.nome)} size={46} />
            <View style={styles.flex}>
              <Text style={styles.personName}>{turno.prestador.nome}</Text>
              <Text style={styles.muted}>{formatarNota(turno.prestador.notaMedia)} ★ • {plural(turno.prestador.turnosConcluidos, 'turno concluído', 'turnos concluídos')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.tabInactive} />
          </Pressable>
        ) : null}

        <View style={styles.card}>
          <View style={styles.payTop}>
            <Text style={styles.sectionTitle}>Pagamento</Text>
            <Pill label={pagamento.label} tone={pagamento.tone} />
          </View>
          {ehEmpresa ? (
            <View style={styles.values}>
              <ValueRow label="Valor do turno" value={formatarMoeda(turno.valorTurno)} />
              <ValueRow label="Taxa da plataforma (10%)" value={formatarMoeda(turno.taxaPlataforma)} />
              <View style={styles.divider} />
              <ValueRow label="Total" value={formatarMoeda(turno.valorTotal)} strong />
            </View>
          ) : (
            <View style={styles.values}>
              <ValueRow label="Você recebe" value={formatarMoeda(turno.valorTurno)} strong />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Andamento</Text>
          <View style={styles.timeline}>
            {etapas.map((etapa, index) => {
              const feita = !!etapa.quando;
              return (
                <View key={etapa.label} style={styles.step}>
                  <View style={styles.stepMarker}>
                    <View style={[styles.stepDot, feita && styles.stepDotDone]}>{feita ? <Ionicons name="checkmark" size={13} color={colors.surface} /> : null}</View>
                    {index < etapas.length - 1 ? <View style={[styles.stepLine, feita && styles.stepLineDone]} /> : null}
                  </View>
                  <View style={styles.stepCopy}>
                    <Text style={[styles.stepLabel, !feita && styles.stepPending]}>{etapa.label}</Text>
                    {etapa.quando ? <Text style={styles.stepTime}>{formatarInstante(etapa.quando)}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {erroAcao ? <Notice text={erroAcao} /> : null}

        <View style={styles.actions}>
          {ehEmpresa ? (
            <>
              {turno.status === 'CONFIRMADA' ? <Notice tone="warning" icon="time" text="Aguardando o check-in do profissional no dia do turno." /> : null}
              {turno.status === 'EM_ANDAMENTO' && turno.checkInEm ? <Notice tone="success" icon="walk" text={`Profissional em turno desde ${formatarInstante(turno.checkInEm)}.`} /> : null}
              {turno.status === 'AGUARDANDO_CONFIRMACAO' ? (
                <PrimaryButton
                  label="Confirmar conclusão e pagar"
                  icon="checkmark-done"
                  loading={enviando}
                  onPress={() =>
                    confirmar(
                      'Confirmar a conclusão?',
                      `Isso libera ${formatarMoeda(turno.valorTurno)} para ${turno.prestador.nome}. O valor retido de ${formatarMoeda(turno.valorTotal)} será debitado.`,
                      'Confirmar',
                      () => confirmarConclusao(turno.id),
                    )
                  }
                />
              ) : null}
            </>
          ) : (
            <>
              {turno.status === 'CONFIRMADA' ? (
                ehHoje ? (
                  <PrimaryButton label="Fazer check-in" icon="log-in-outline" loading={enviando} onPress={() => void executar(() => fazerCheckIn(turno.id))} />
                ) : (
                  <Notice tone="warning" icon="information-circle" text={`O check-in fica disponível no dia do turno (${formatarDia(turno.vaga.data).toLowerCase()}).`} />
                )
              ) : null}
              {turno.status === 'EM_ANDAMENTO' ? (
                <PrimaryButton
                  label="Fazer check-out"
                  icon="log-out-outline"
                  loading={enviando}
                  onPress={() => confirmar('Encerrar o turno?', 'Faça o check-out só quando terminar o trabalho.', 'Fazer check-out', () => fazerCheckOut(turno.id))}
                />
              ) : null}
              {turno.status === 'AGUARDANDO_CONFIRMACAO' ? (
                <Notice tone="warning" icon="hourglass" text="Check-out feito! Seu pagamento é liberado assim que a empresa confirmar a conclusão." />
              ) : null}
              {turno.status === 'CONFIRMADA' || turno.status === 'EM_ANDAMENTO' ? (
                <SecondaryButton label="Ver rota" icon="navigate-outline" onPress={abrirRota} />
              ) : null}
            </>
          )}

          {turno.status === 'CONCLUIDA' ? (
            jaAvaliei ? (
              <Notice tone="success" text="Turno concluído e avaliado. Obrigado!" />
            ) : (
              <PrimaryButton
                label={ehEmpresa ? `Avaliar ${turno.prestador.nome.split(' ')[0]}` : `Avaliar ${turno.vaga.empresa.nome}`}
                icon="star"
                onPress={() => router.push(`/avaliacao/${turno.id}`)}
              />
            )
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 40, gap: 16 },
  flex: { flex: 1 },
  chatButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 18 },
  role: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.5, marginTop: 13 },
  company: { color: colors.inkSoft, fontSize: 13, marginTop: 4 },
  infoGrid: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: 17, padding: 14, marginTop: 16, gap: 16 },
  infoItem: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  infoValue: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 15 },
  address: { flex: 1, color: colors.inkSoft, fontSize: 12 },
  link: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 },
  personName: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  muted: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  payTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  values: { gap: 10, marginTop: 14 },
  divider: { height: 1, backgroundColor: colors.border },
  timeline: { marginTop: 14 },
  step: { flexDirection: 'row', gap: 12 },
  stepMarker: { alignItems: 'center', width: 22 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepLine: { width: 2, flex: 1, minHeight: 18, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.success },
  stepCopy: { flex: 1, paddingBottom: 16 },
  stepLabel: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 2 },
  stepPending: { color: colors.tabInactive },
  stepTime: { color: colors.inkSoft, fontSize: 11, marginTop: 3 },
  actions: { gap: 12 },
});
