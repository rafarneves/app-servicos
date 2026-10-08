import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function CompanyShiftsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Turnos</Text>
        <Text style={styles.subtitle}>Confirmados, check-ins para validar e histórico.</Text>
        <EmptyState icon="calendar-outline" title="Nenhum turno confirmado" text="Quando você selecionar um profissional, o turno aparece aqui para acompanhar o check-in e confirmar a conclusão." />
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
