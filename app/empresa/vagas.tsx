import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, FloatingButton, LoadingState, Pill, Segmented } from '../../components/ui';
import { formatarDia, formatarHorario, hojeIso, plural, rotuloDaVaga } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import type { Vaga } from '../../lib/types';
import { useDados } from '../../lib/useDados';
import { listarMinhasVagas } from '../../lib/vagas';

const estaAberta = (vaga: Vaga) => vaga.status === 'ABERTA' && vaga.data >= hojeIso();

export default function CompanyJobsScreen() {
  const [tab, setTab] = useState<'abertas' | 'encerradas'>('abertas');
  const { dados, erro, recarregar } = useDados(listarMinhasVagas);
  const lista = (dados ?? []).filter((v) => (tab === 'abertas' ? estaAberta(v) : !estaAberta(v)));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Minhas vagas</Text>
        <Text style={styles.subtitle}>Turnos publicados e seus candidatos.</Text>
        <View style={styles.segment}>
          <Segmented options={[{ value: 'abertas', label: 'Abertas' }, { value: 'encerradas', label: 'Encerradas' }]} value={tab} onChange={setTab} />
        </View>
        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : lista.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title={tab === 'abertas' ? 'Nenhuma vaga aberta' : 'Nenhuma vaga encerrada'}
            text={tab === 'abertas' ? 'Publique um turno pelo botão "Nova vaga". Os candidatos aparecem dentro de cada vaga.' : 'Vagas preenchidas ou com data passada ficam aqui.'}
          />
        ) : (
          <View style={styles.list}>
            {lista.map((vaga) => {
              const rotulo = rotuloDaVaga[vaga.status];
              return (
                <Pressable key={vaga.id} onPress={() => router.push(`/vaga/${vaga.id}`)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                  <View style={styles.cardTop}>
                    <Pill label={rotulo.label} tone={rotulo.tone} />
                    <Text style={styles.category}>{vaga.categoria.nome}</Text>
                  </View>
                  <Text style={styles.role}>{vaga.titulo}</Text>
                  <View style={styles.meta}>
                    <View style={styles.metaItem}><Ionicons name="calendar-outline" size={16} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarDia(vaga.data)}</Text></View>
                    <View style={styles.metaItem}><Ionicons name="time-outline" size={16} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarHorario(vaga.horaInicio, vaga.horaFim)}</Text></View>
                  </View>
                  <View style={styles.footer}>
                    <View style={styles.metaItem}>
                      <Ionicons name="people" size={17} color={vaga.totalCandidatos > 0 ? colors.primary : colors.inkSoft} />
                      <Text style={[styles.candidates, vaga.totalCandidatos > 0 && styles.candidatesActive]}>{plural(vaga.totalCandidatos, 'candidato', 'candidatos')}</Text>
                    </View>
                    <Text style={styles.price}>{formatarMoeda(vaga.valorTurno)}</Text>
                  </View>
                  {vaga.status === 'ABERTA' ? <Text style={styles.remaining}>{plural(vaga.vagasDisponiveis, 'posição aberta', 'posições abertas')}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
      <FloatingButton label="Nova vaga" icon="add" onPress={() => router.push('/vaga/nova')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 100 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  segment: { marginTop: 22 },
  list: { marginTop: 18, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 17 },
  pressed: { opacity: 0.8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' },
  role: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 12 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 9 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 13 },
  candidates: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  candidatesActive: { color: colors.primary },
  price: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  remaining: { color: colors.inkSoft, fontSize: 11, marginTop: 6 },
});
