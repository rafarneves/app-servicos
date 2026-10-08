import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionTitle } from '../../components/ui';
import { colors, radius } from '../../lib/theme';

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Carteira</Text>
        <Text style={styles.subtitle}>Seus ganhos, sempre transparentes.</Text>
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}><Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text><View style={styles.secure}><Ionicons name="shield-checkmark" size={15} color="#C9F2E5" /><Text style={styles.secureText}>Seguro</Text></View></View>
          <Text style={styles.balance}>R$ 330,00</Text>
          <View style={styles.balanceFooter}><View><Text style={styles.nextLabel}>PRÓXIMO REPASSE</Text><Text style={styles.nextValue}>Segunda-feira, 19 ago</Text></View><View style={styles.pixButton}><Ionicons name="flash" size={17} color={colors.wine} /><Text style={styles.pixText}>Sacar via Pix</Text></View></View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statLabel}>ESTE MÊS</Text><Text style={styles.statValue}>R$ 510</Text><Text style={styles.positive}>+ 18% no período</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>TURNOS</Text><Text style={styles.statValue}>3</Text><Text style={styles.statMuted}>1 agendado</Text></View>
        </View>
        <SectionTitle title="Movimentações" action="Ver todas" />
        <View style={styles.transactions}>
          <Transaction icon="storefront" title="Padaria Aurora" date="12 ago • Padeiro(a)" value="+ R$ 180,00" />
          <View style={styles.divider} />
          <Transaction icon="restaurant" title="Bistrô da Praça" date="08 ago • Auxiliar" value="+ R$ 150,00" />
        </View>
        <View style={styles.help}><Ionicons name="help-buoy-outline" size={22} color={colors.primary} /><View><Text style={styles.helpTitle}>Precisa de ajuda com um pagamento?</Text><Text style={styles.helpText}>Fale com nosso suporte financeiro</Text></View><Ionicons name="chevron-forward" size={20} color={colors.inkSoft} /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Transaction({ icon, title, date, value }: { icon: 'storefront' | 'restaurant'; title: string; date: string; value: string }) {
  return <View style={styles.transaction}><View style={styles.transactionIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View><View style={styles.transactionCopy}><Text style={styles.transactionTitle}>{title}</Text><Text style={styles.transactionDate}>{date}</Text></View><Text style={styles.transactionValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, container: { padding: 20, paddingBottom: 35, gap: 20 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 }, subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: -15 },
  balanceCard: { backgroundColor: colors.wine, borderRadius: radius.lg, padding: 20 }, balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, balanceLabel: { color: '#CBBFC1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  secure: { flexDirection: 'row', gap: 4, alignItems: 'center' }, secureText: { color: '#C9F2E5', fontSize: 10, fontWeight: '700' }, balance: { color: colors.surface, fontSize: 37, fontWeight: '900', letterSpacing: -1, marginTop: 13 },
  balanceFooter: { borderTopWidth: 1, borderTopColor: '#684650', marginTop: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, nextLabel: { color: '#A99398', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 }, nextValue: { color: colors.surface, fontSize: 11, fontWeight: '700', marginTop: 4 },
  pixButton: { backgroundColor: colors.surface, flexDirection: 'row', gap: 5, alignItems: 'center', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10 }, pixText: { color: colors.wine, fontSize: 11, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 11 }, stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 15 }, statLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 }, statValue: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 9 }, positive: { color: colors.success, fontSize: 10, fontWeight: '700', marginTop: 4 }, statMuted: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  transactions: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }, transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }, transactionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, transactionCopy: { flex: 1, marginLeft: 11 }, transactionTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, transactionDate: { color: colors.inkSoft, fontSize: 10, marginTop: 4 }, transactionValue: { color: colors.success, fontSize: 13, fontWeight: '900' }, divider: { height: 1, backgroundColor: colors.border },
  help: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 15 }, helpTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, helpText: { color: colors.inkSoft, fontSize: 10, marginTop: 3 },
});
