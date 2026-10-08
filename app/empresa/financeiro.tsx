import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function CompanyFinanceScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Financeiro</Text>
        <Text style={styles.subtitle}>Extrato, valores retidos e relatórios.</Text>
        <EmptyState icon="wallet-outline" title="Sem movimentações" text="Os valores retidos em escrow e os pagamentos liberados aparecem aqui." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
});
