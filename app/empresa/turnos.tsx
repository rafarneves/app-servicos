import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, ErrorState, LoadingState, Notice, Pill, Segmented } from '../../components/ui';
import { listarMinhasContratacoes } from '../../lib/contratacoes';
import { formatarDia, formatarHorario, iniciais, plural, rotuloDoTurno, turnoAtivo } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import type { Contratacao } from '../../lib/types';
import { useDados } from '../../lib/useDados';

// Turnos que pedem ação da empresa primeiro, depois por data.
const prioridade = (t: Contratacao) => (t.status === 'AGUARDANDO_CONFIRMACAO' ? 0 : 1);

export default function CompanyShiftsScreen() {
  const [tab, setTab] = useState<'abertos' | 'historico'>('abertos');
  const { dados, erro, recarregar } = useDados(listarMinhasContratacoes);

  const abertos = (dados ?? [])
    .filter((t) => turnoAtivo(t.status))
    .sort((a, b) => prioridade(a) - prioridade(b) || `${a.vaga.data}${a.vaga.horaInicio}`.localeCompare(`${b.vaga.data}${b.vaga.horaInicio}`));
  const historico = (dados ?? []).filter((t) => !turnoAtivo(t.status));
  const aConfirmar = abertos.filter((t) => t.status === 'AGUARDANDO_CONFIRMACAO').length;
  const lista = tab === 'abertos' ? abertos : historico;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Turnos</Text>
        <Text style={styles.subtitle}>Confirmados, check-ins para validar e histórico.</Text>
        <View style={styles.segment}>
          <Segmented options={[{ value: 'abertos', label: 'Em aberto' }, { value: 'historico', label: 'Histórico' }]} value={tab} onChange={setTab} />
        </View>
        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : lista.length === 0 ? (
          tab === 'abertos' ? (
            <EmptyState icon="calendar-outline" title="Nenhum turno confirmado" text="Quando você selecionar um profissional, o turno aparece aqui para acompanhar o check-in e confirmar a conclusão." />
          ) : (
            <EmptyState icon="receipt-outline" title="Nenhum turno concluído" text="Turnos concluídos e pagos ficam aqui." />
          )
        ) : (
          <View style={styles.list}>
            {tab === 'abertos' && aConfirmar > 0 ? (
              <Notice tone="warning" icon="checkmark-done" text={`${plural(aConfirmar, 'turno aguarda', 'turnos aguardam')} sua confirmação para liberar o pagamento.`} />
            ) : null}
            {lista.map((turno) => {
              const rotulo = rotuloDoTurno[turno.status];
              return (
                <Pressable key={turno.id} onPress={() => router.push(`/turno/${turno.id}`)} style={({ pressed }) => [styles.card, turno.status === 'AGUARDANDO_CONFIRMACAO' && styles.cardAction, pressed && styles.pressed]}>
                  <View style={styles.cardTop}>
                    <Pill label={turno.status === 'CONCLUIDA' && !turno.avaliadoPelaEmpresa ? 'Avalie o profissional' : rotulo.label} tone={turno.status === 'CONCLUIDA' && !turno.avaliadoPelaEmpresa ? 'primary' : rotulo.tone} />
                    <Text style={styles.value}>{formatarMoeda(turno.valorTotal)}</Text>
                  </View>
                  <Text style={styles.role}>{turno.vaga.titulo}</Text>
                  <View style={styles.meta}>
                    <View style={styles.metaItem}><Ionicons name="calendar-outline" size={16} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarDia(turno.vaga.data)}</Text></View>
                    <View style={styles.metaItem}><Ionicons name="time-outline" size={16} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarHorario(turno.vaga.horaInicio, turno.vaga.horaFim)}</Text></View>
                  </View>
                  <View style={styles.professional}>
                    <Avatar initials={iniciais(turno.prestador.nome)} size={38} />
                    <Text style={styles.professionalName}>{turno.prestador.nome}</Text>
                    <Ionicons name="chevron-forward" size={19} color={colors.tabInactive} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  segment: { marginTop: 22 },
  list: { marginTop: 18, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 17 },
  cardAction: { borderColor: colors.warning },
  pressed: { opacity: 0.8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  role: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 12 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 9 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  professional: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 13 },
  professionalName: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: '800' },
});
