import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState, Pill, Segmented } from '../../components/ui';
import { listarMinhasCandidaturas } from '../../lib/candidaturas';
import { listarMinhasContratacoes } from '../../lib/contratacoes';
import { formatarDataCurta, formatarDia, formatarHorario, rotuloDaCandidatura, rotuloDoTurno, turnoAtivo } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import type { Contratacao } from '../../lib/types';
import { useDados } from '../../lib/useDados';

const porDataAsc = (a: Contratacao, b: Contratacao) =>
  `${a.vaga.data}${a.vaga.horaInicio}`.localeCompare(`${b.vaga.data}${b.vaga.horaInicio}`);

export default function ShiftsScreen() {
  const [tab, setTab] = useState<'proximos' | 'historico'>('proximos');
  const { dados, erro, recarregar } = useDados(async () => {
    const [turnos, candidaturas] = await Promise.all([listarMinhasContratacoes(), listarMinhasCandidaturas()]);
    return {
      proximos: turnos.filter((t) => turnoAtivo(t.status)).sort(porDataAsc),
      historico: turnos.filter((t) => !turnoAtivo(t.status)),
      pendentes: candidaturas.filter((c) => c.status === 'PENDENTE'),
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meus turnos</Text>
        <Text style={styles.subtitle}>Acompanhe sua agenda e seus trabalhos.</Text>
        <View style={styles.segment}>
          <Segmented
            options={[{ value: 'proximos', label: 'Próximos' }, { value: 'historico', label: 'Histórico' }]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : tab === 'proximos' ? (
          dados.proximos.length === 0 && dados.pendentes.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Nenhum turno agendado" text="Encontre uma vaga em Buscar e candidate-se. Seus turnos confirmados aparecem aqui." />
          ) : (
            <>
              {dados.proximos.map((turno) => (
                <View key={turno.id}>
                  <View style={styles.dateHeader}><Text style={styles.dateTitle}>{formatarDia(turno.vaga.data).toUpperCase()}</Text><Text style={styles.dateNumber}>{formatarDataCurta(turno.vaga.data)}</Text></View>
                  <Pressable onPress={() => router.push(`/turno/${turno.id}`)} style={styles.shiftCard}>
                    <View style={styles.cardHeader}><View style={styles.flex}><Pill label={rotuloDoTurno[turno.status].label} tone={rotuloDoTurno[turno.status].tone} /><Text style={styles.role}>{turno.vaga.titulo}</Text><Text style={styles.company}>{turno.vaga.empresa.nome}</Text></View><View style={styles.iconBox}><Ionicons name="storefront" size={25} color={colors.primary} /></View></View>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}><Ionicons name="time-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>HORÁRIO</Text><Text style={styles.infoValue}>{formatarHorario(turno.vaga.horaInicio, turno.vaga.horaFim)}</Text></View></View>
                      <View style={styles.infoItem}><Ionicons name="cash-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>VALOR</Text><Text style={styles.infoValue}>{formatarMoeda(turno.valorTurno)}</Text></View></View>
                    </View>
                    <View style={styles.addressRow}><Ionicons name="location-outline" size={19} color={colors.inkSoft} /><Text style={styles.address}>{turno.vaga.endereco}</Text></View>
                    <View style={styles.routeButton}><Ionicons name="navigate-outline" size={18} color={colors.surface} /><Text style={styles.routeText}>Ver rota e detalhes</Text></View>
                  </Pressable>
                </View>
              ))}
              {dados.proximos.some((t) => t.status === 'CONFIRMADA') ? (
                <View style={styles.tipCard}><Ionicons name="information-circle" size={22} color={colors.warning} /><Text style={styles.tipText}>O check-in fica disponível no dia do turno, nos detalhes do turno.</Text></View>
              ) : null}

              {dados.pendentes.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>CANDIDATURAS ENVIADAS</Text>
                  {dados.pendentes.map((candidatura) => (
                    <Pressable key={candidatura.id} onPress={() => router.push(`/vaga/${candidatura.vaga.id}`)} style={styles.compactCard}>
                      <View style={styles.flex}>
                        <Text style={styles.compactTitle}>{candidatura.vaga.titulo}</Text>
                        <Text style={styles.compactText}>{candidatura.vaga.empresa.nome} • {formatarDia(candidatura.vaga.data)}, {formatarHorario(candidatura.vaga.horaInicio, candidatura.vaga.horaFim)}</Text>
                        <View style={styles.compactPill}><Pill label={rotuloDaCandidatura.PENDENTE.label} tone={rotuloDaCandidatura.PENDENTE.tone} /></View>
                      </View>
                      <Ionicons name="chevron-forward" size={19} color={colors.tabInactive} />
                    </Pressable>
                  ))}
                </>
              ) : null}
            </>
          )
        ) : dados.historico.length === 0 ? (
          <EmptyState icon="receipt-outline" title="Seu histórico aparecerá aqui" text="Turnos concluídos, avaliações e recibos ficam organizados neste espaço." />
        ) : (
          <View style={styles.history}>
            {dados.historico.map((turno) => (
              <Pressable key={turno.id} onPress={() => router.push(`/turno/${turno.id}`)} style={styles.compactCard}>
                <View style={styles.flex}>
                  <Text style={styles.compactTitle}>{turno.vaga.titulo}</Text>
                  <Text style={styles.compactText}>{turno.vaga.empresa.nome} • {formatarDia(turno.vaga.data)}</Text>
                  <View style={styles.compactPill}>
                    {turno.status === 'CONCLUIDA' && !turno.avaliadoPeloPrestador ? (
                      <Pill label="Avalie a empresa" tone="primary" />
                    ) : (
                      <Pill label={rotuloDoTurno[turno.status].label} tone={rotuloDoTurno[turno.status].tone} />
                    )}
                  </View>
                </View>
                <Text style={styles.compactValue}>{formatarMoeda(turno.valorTurno)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35 },
  flex: { flex: 1 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  segment: { marginTop: 25 },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 27, marginBottom: 10 },
  dateTitle: { color: colors.inkSoft, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  dateNumber: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  shiftCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  role: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 13 },
  company: { color: colors.inkSoft, fontSize: 13, marginTop: 4 },
  iconBox: { width: 52, height: 52, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoGrid: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: 17, padding: 14, marginTop: 18, gap: 20 },
  infoItem: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  infoValue: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 17 },
  address: { flex: 1, color: colors.inkSoft, fontSize: 12 },
  routeButton: { minHeight: 49, backgroundColor: colors.primary, borderRadius: 15, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  routeText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.warningSoft, borderRadius: 17, padding: 15, marginTop: 14 },
  tipText: { flex: 1, color: '#745225', fontSize: 12, lineHeight: 18 },
  sectionLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 27, marginBottom: 10 },
  history: { marginTop: 20, gap: 10 },
  compactCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 15, marginBottom: 10 },
  compactTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  compactText: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  compactPill: { marginTop: 9 },
  compactValue: { color: colors.ink, fontSize: 14, fontWeight: '900' },
});
