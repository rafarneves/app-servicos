import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { avisarEmBreve, EmptyState, ErrorState, LoadingState, Pill, SectionTitle } from '../../components/ui';
import { buscarCarteira } from '../../lib/financeiro';
import { formatarDia, mesAtualIso, plural, rotuloDoPagamento } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import type { Movimentacao } from '../../lib/types';
import { useDados } from '../../lib/useDados';

const LIMITE_INICIAL = 4;

export default function WalletScreen() {
  const [verTodas, setVerTodas] = useState(false);
  const { dados, erro, recarregar } = useDados(buscarCarteira);

  const doMes = dados?.movimentacoes.filter((m) => m.data.startsWith(mesAtualIso())) ?? [];
  const ganhosDoMes = doMes.filter((m) => m.status === 'LIBERADO').reduce((total, m) => total + m.valor, 0);
  const agendados = doMes.filter((m) => m.status === 'RETIDO').length;
  const movimentacoes = verTodas ? dados?.movimentacoes ?? [] : (dados?.movimentacoes ?? []).slice(0, LIMITE_INICIAL);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Carteira</Text>
        <Text style={styles.subtitle}>Seus ganhos, sempre transparentes.</Text>
        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : (
          <>
            <View style={styles.balanceCard}>
              <View style={styles.balanceTop}><Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text><View style={styles.secure}><Ionicons name="shield-checkmark" size={15} color="#C9F2E5" /><Text style={styles.secureText}>Seguro</Text></View></View>
              <Text style={styles.balance}>{formatarMoeda(dados.saldoDisponivel)}</Text>
              <View style={styles.balanceFooter}>
                <View><Text style={styles.nextLabel}>A RECEBER (EM ESCROW)</Text><Text style={styles.nextValue}>{formatarMoeda(dados.aReceber)}</Text></View>
                <Pressable onPress={() => avisarEmBreve('O saque via Pix')} style={styles.pixButton}><Ionicons name="flash" size={17} color={colors.wine} /><Text style={styles.pixText}>Sacar via Pix</Text></Pressable>
              </View>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statLabel}>ESTE MÊS</Text><Text style={styles.statValue}>{formatarMoeda(ganhosDoMes)}</Text><Text style={styles.positive}>liberados</Text></View>
              <View style={styles.stat}><Text style={styles.statLabel}>TURNOS</Text><Text style={styles.statValue}>{doMes.length}</Text><Text style={styles.statMuted}>{plural(agendados, 'agendado', 'agendados')}</Text></View>
            </View>
            <SectionTitle
              title="Movimentações"
              action={dados.movimentacoes.length > LIMITE_INICIAL ? (verTodas ? 'Ver menos' : 'Ver todas') : undefined}
              onAction={() => setVerTodas((v) => !v)}
            />
            {movimentacoes.length === 0 ? (
              <EmptyState icon="wallet-outline" title="Nenhuma movimentação" text="Os valores dos seus turnos aparecem aqui assim que você for selecionado." />
            ) : (
              <View style={styles.transactions}>
                {movimentacoes.map((m, index) => (
                  <View key={m.id}>
                    <Transaction movimentacao={m} />
                    {index < movimentacoes.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <Pressable onPress={() => avisarEmBreve('O suporte financeiro')} style={styles.help}><Ionicons name="help-buoy-outline" size={22} color={colors.primary} /><View style={styles.helpCopy}><Text style={styles.helpTitle}>Precisa de ajuda com um pagamento?</Text><Text style={styles.helpText}>Fale com nosso suporte financeiro</Text></View><Ionicons name="chevron-forward" size={20} color={colors.inkSoft} /></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Transaction({ movimentacao }: { movimentacao: Movimentacao }) {
  const liberado = movimentacao.status === 'LIBERADO';
  const rotulo = rotuloDoPagamento[movimentacao.status];
  return (
    <Pressable onPress={() => router.push(`/turno/${movimentacao.contratacaoId}`)} style={styles.transaction}>
      <View style={styles.transactionIcon}><Ionicons name="storefront" size={20} color={colors.primary} /></View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{movimentacao.descricao}</Text>
        <Text style={styles.transactionDate}>{formatarDia(movimentacao.data)}</Text>
        {liberado ? null : <View style={styles.transactionPill}><Pill label={rotulo.label} tone={rotulo.tone} /></View>}
      </View>
      <Text style={[styles.transactionValue, !liberado && styles.transactionPending]}>+ {formatarMoeda(movimentacao.valor)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, container: { padding: 20, paddingBottom: 35, gap: 20 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 }, subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: -15 },
  balanceCard: { backgroundColor: colors.wine, borderRadius: radius.lg, padding: 20 }, balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, balanceLabel: { color: '#CBBFC1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  secure: { flexDirection: 'row', gap: 4, alignItems: 'center' }, secureText: { color: '#C9F2E5', fontSize: 10, fontWeight: '700' }, balance: { color: colors.surface, fontSize: 37, fontWeight: '900', letterSpacing: -1, marginTop: 13 },
  balanceFooter: { borderTopWidth: 1, borderTopColor: '#684650', marginTop: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, nextLabel: { color: '#A99398', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 }, nextValue: { color: colors.surface, fontSize: 13, fontWeight: '800', marginTop: 4 },
  pixButton: { backgroundColor: colors.surface, flexDirection: 'row', gap: 5, alignItems: 'center', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10 }, pixText: { color: colors.wine, fontSize: 11, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 11 }, stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 15 }, statLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 }, statValue: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 9 }, positive: { color: colors.success, fontSize: 10, fontWeight: '700', marginTop: 4 }, statMuted: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  transactions: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }, transaction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }, transactionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, transactionCopy: { flex: 1, marginLeft: 11 }, transactionTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, transactionDate: { color: colors.inkSoft, fontSize: 10, marginTop: 4 }, transactionPill: { marginTop: 6 }, transactionValue: { color: colors.success, fontSize: 13, fontWeight: '900' }, transactionPending: { color: colors.inkSoft }, divider: { height: 1, backgroundColor: colors.border },
  help: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 15 }, helpCopy: { flex: 1 }, helpTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, helpText: { color: colors.inkSoft, fontSize: 10, marginTop: 3 },
});
