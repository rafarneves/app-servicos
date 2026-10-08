import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, FloatingButton } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function CompanyJobsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Minhas vagas</Text>
        <Text style={styles.subtitle}>Turnos publicados e seus candidatos.</Text>
        <EmptyState icon="briefcase-outline" title="Nenhuma vaga por aqui" text="As vagas que você publicar aparecem aqui, com os candidatos de cada uma." />
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
});
