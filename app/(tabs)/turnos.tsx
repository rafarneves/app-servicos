import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../components/ui';
import { colors, radius } from '../../lib/theme';

export default function ShiftsScreen() {
  const [tab, setTab] = useState<'proximos' | 'historico'>('proximos');
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meus turnos</Text>
        <Text style={styles.subtitle}>Acompanhe sua agenda e seus trabalhos.</Text>
        <View style={styles.segment}>
          <Pressable onPress={() => setTab('proximos')} style={[styles.segmentItem, tab === 'proximos' && styles.segmentActive]}><Text style={[styles.segmentText, tab === 'proximos' && styles.segmentTextActive]}>Próximos</Text></Pressable>
          <Pressable onPress={() => setTab('historico')} style={[styles.segmentItem, tab === 'historico' && styles.segmentActive]}><Text style={[styles.segmentText, tab === 'historico' && styles.segmentTextActive]}>Histórico</Text></Pressable>
        </View>

        {tab === 'proximos' ? (
          <>
            <View style={styles.dateHeader}><Text style={styles.dateTitle}>AMANHÃ</Text><Text style={styles.dateNumber}>14 AGO</Text></View>
            <View style={styles.shiftCard}>
              <View style={styles.cardHeader}><View><Pill label="Confirmado" tone="success" /><Text style={styles.role}>Padeiro(a)</Text><Text style={styles.company}>Padaria Aurora</Text></View><View style={styles.iconBox}><Ionicons name="storefront" size={25} color={colors.primary} /></View></View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}><Ionicons name="time-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>HORÁRIO</Text><Text style={styles.infoValue}>06:00 – 12:00</Text></View></View>
                <View style={styles.infoItem}><Ionicons name="cash-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>VALOR</Text><Text style={styles.infoValue}>R$ 180</Text></View></View>
              </View>
              <View style={styles.addressRow}><Ionicons name="location-outline" size={19} color={colors.inkSoft} /><Text style={styles.address}>Rua das Flores, 241 • São Paulo</Text></View>
              <Pressable style={styles.routeButton}><Ionicons name="navigate-outline" size={18} color={colors.surface} /><Text style={styles.routeText}>Ver rota e detalhes</Text></Pressable>
            </View>
            <View style={styles.tipCard}><Ionicons name="information-circle" size={22} color={colors.warning} /><Text style={styles.tipText}>O check-in será liberado quando você estiver próximo do local, 15 minutos antes.</Text></View>
          </>
        ) : (
          <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="receipt-outline" size={34} color={colors.primary} /></View><Text style={styles.emptyTitle}>Seu histórico aparecerá aqui</Text><Text style={styles.emptyText}>Turnos concluídos, avaliações e recibos ficam organizados neste espaço.</Text></View>
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
  segment: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 16, padding: 4, marginTop: 25 },
  segmentItem: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  segmentTextActive: { color: colors.ink },
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
  address: { color: colors.inkSoft, fontSize: 12 },
  routeButton: { minHeight: 49, backgroundColor: colors.primary, borderRadius: 15, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  routeText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.warningSoft, borderRadius: 17, padding: 15, marginTop: 14 },
  tipText: { flex: 1, color: '#745225', fontSize: 12, lineHeight: 18 },
  empty: { alignItems: 'center', paddingTop: 75, paddingHorizontal: 30 },
  emptyIcon: { width: 70, height: 70, borderRadius: 25, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 20 },
  emptyText: { color: colors.inkSoft, textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 7 },
});
