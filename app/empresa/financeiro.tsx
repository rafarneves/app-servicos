import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState, Pill, SectionTitle } from '../../components/ui';
import { buscarFinanceiroDaEmpresa } from '../../lib/financeiro';
import { formatarDia, rotuloDoPagamento } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import { useDados } from '../../lib/useDados';

export default function CompanyFinanceScreen() {
  const { dados, erro, recarregar } = useDados(buscarFinanceiroDaEmpresa);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Financeiro</Text>
        <Text style={styles.subtitle}>Extrato, valores retidos e pagamentos.</Text>
        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : (
          <>
            <View style={styles.balanceCard}>
              <View style={styles.balanceTop}><Text style={styles.balanceLabel}>RETIDO EM ESCROW</Text><Ionicons name="lock-closed" size={15} color="#C9F2E5" /></View>
              <Text style={styles.balance}>{formatarMoeda(dados.valorRetido)}</Text>
              <Text style={styles.balanceHint}>Liberado ao profissional quando você confirma a conclusão do turno.</Text>
              <View style={styles.balanceFooter}><Text style={styles.footerLabel}>PAGO NESTE MÊS</Text><Text style={styles.footerValue}>{formatarMoeda(dados.pagoNoMes)}</Text></View>
            </View>
            <SectionTitle title="Movimentações" />
            {dados.movimentacoes.length === 0 ? (
              <EmptyState icon="wallet-outline" title="Sem movimentações" text="Os valores retidos em escrow e os pagamentos liberados aparecem aqui." />
            ) : (
              <View style={styles.transactions}>
                {dados.movimentacoes.map((m, index) => {
                  const rotulo = rotuloDoPagamento[m.status];
                  return (
                    <View key={m.id}>
                      <Pressable onPress={() => router.push(`/turno/${m.contratacaoId}`)} style={styles.transaction}>
                        <View style={styles.transactionCopy}>
                          <Text style={styles.transactionTitle}>{m.descricao}</Text>
                          <Text style={styles.transactionDate}>{formatarDia(m.data)}</Text>
                          <View style={styles.transactionPill}><Pill label={rotulo.label} tone={rotulo.tone} /></View>
                        </View>
                        <Text style={styles.transactionValue}>- {formatarMoeda(m.valor)}</Text>
                      </Pressable>
                      {index < dados.movimentacoes.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            )}
            <Text style={styles.legal}>Valores incluem a taxa de 10% da plataforma.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35, gap: 20 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: -15 },
  balanceCard: { backgroundColor: colors.wine, borderRadius: radius.lg, padding: 20 },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#CBBFC1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  balance: { color: colors.surface, fontSize: 37, fontWeight: '900', letterSpacing: -1, marginTop: 13 },
  balanceHint: { color: '#CBBFC1', fontSize: 11, lineHeight: 16, marginTop: 6 },
  balanceFooter: { borderTopWidth: 1, borderTopColor: '#684650', marginTop: 18, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { color: '#A99398', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  footerValue: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  transactions: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border },
  transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  transactionCopy: { flex: 1 },
  transactionTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  transactionDate: { color: colors.inkSoft, fontSize: 11, marginTop: 4 },
  transactionPill: { marginTop: 7 },
  transactionValue: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border },
  legal: { color: colors.tabInactive, fontSize: 11, textAlign: 'center' },
});
