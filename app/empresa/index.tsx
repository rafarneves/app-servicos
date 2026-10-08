import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark, Pill, SectionTitle } from '../components/ui';
import { colors, radius, shadow } from '../lib/theme';

export default function CompanyHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BrandMark compact />
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}><Ionicons name="notifications-outline" size={22} color={colors.ink} /><View style={styles.dot} /></Pressable>
            <Pressable onPress={() => router.replace('/')} style={styles.avatar}><Text style={styles.avatarText}>PA</Text></Pressable>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.greeting}>Olá, Padaria Aurora</Text>
          <Text style={styles.subtitle}>Sua operação de hoje, em um só lugar.</Text>
        </View>

        <Pressable onPress={() => router.push('/nova-oportunidade')} style={({ pressed }) => [styles.createCard, pressed && styles.pressed]}>
          <View style={styles.createIcon}><Ionicons name="add" size={30} color={colors.surface} /></View>
          <View style={styles.createCopy}><Text style={styles.createTitle}>Publicar novo turno</Text><Text style={styles.createText}>Encontre o profissional certo em poucos minutos.</Text></View>
          <Ionicons name="arrow-forward" size={23} color={colors.surface} />
        </Pressable>

        <View style={styles.stats}>
          <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="calendar" size={20} color={colors.primary} /></View><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>turnos ativos</Text></View>
          <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.successSoft }]}><Ionicons name="people" size={20} color={colors.success} /></View><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>candidaturas</Text></View>
          <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.warningSoft }]}><Ionicons name="star" size={20} color={colors.warning} /></View><Text style={styles.statValue}>4,9</Text><Text style={styles.statLabel}>sua nota</Text></View>
        </View>

        <SectionTitle title="Turnos em andamento" action="Ver todos" />
        <View style={styles.shiftCard}>
          <View style={styles.shiftHeader}><Pill label="Profissional confirmado" tone="success" /><Pressable><Ionicons name="ellipsis-horizontal" size={22} color={colors.inkSoft} /></Pressable></View>
          <Text style={styles.role}>Padeiro(a)</Text>
          <View style={styles.meta}><View style={styles.metaItem}><Ionicons name="calendar-outline" size={17} color={colors.inkSoft} /><Text style={styles.metaText}>Amanhã</Text></View><View style={styles.metaItem}><Ionicons name="time-outline" size={17} color={colors.inkSoft} /><Text style={styles.metaText}>06:00 – 12:00</Text></View></View>
          <View style={styles.professional}><View style={styles.professionalAvatar}><Text style={styles.professionalInitials}>RS</Text></View><View style={styles.professionalCopy}><Text style={styles.professionalName}>Rafael Silva</Text><View style={styles.rating}><Ionicons name="star" size={12} color="#F5A623" /><Text style={styles.ratingText}>4,9 • 12 turnos</Text></View></View><Pressable style={styles.chatButton}><Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} /></Pressable></View>
        </View>

        <SectionTitle title="Candidaturas recentes" action="Ver todas" />
        <View style={styles.candidateCard}>
          <View style={styles.candidateAvatar}><Text style={styles.candidateInitials}>MC</Text></View>
          <View style={styles.candidateCopy}><Text style={styles.candidateName}>Mariana Costa</Text><Text style={styles.candidateRole}>Auxiliar de cozinha • 2,1 km</Text><View style={styles.rating}><Ionicons name="star" size={12} color="#F5A623" /><Text style={styles.ratingText}>4,8 • 8 turnos</Text></View></View>
          <Pressable style={styles.viewProfile}><Text style={styles.viewProfileText}>Ver</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, container: { padding: 20, paddingBottom: 35, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, headerActions: { flexDirection: 'row', gap: 9 }, iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, dot: { position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.surface }, avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontSize: 12, fontWeight: '900' },
  welcome: { marginTop: 8 }, greeting: { color: colors.wine, fontSize: 27, fontWeight: '900', letterSpacing: -0.7 }, subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  createCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', ...shadow }, pressed: { opacity: 0.8 }, createIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#D94228', alignItems: 'center', justifyContent: 'center' }, createCopy: { flex: 1, marginHorizontal: 13 }, createTitle: { color: colors.surface, fontSize: 17, fontWeight: '900' }, createText: { color: '#FFE4DD', fontSize: 11, lineHeight: 16, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 9 }, statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 }, statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, statValue: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 10 }, statLabel: { color: colors.inkSoft, fontSize: 9, marginTop: 2 },
  shiftCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.border }, shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, role: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 14 }, meta: { flexDirection: 'row', gap: 17, marginTop: 10 }, metaItem: { flexDirection: 'row', gap: 6, alignItems: 'center' }, metaText: { color: colors.inkSoft, fontSize: 12 }, professional: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16, paddingTop: 15, flexDirection: 'row', alignItems: 'center' }, professionalAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' }, professionalInitials: { color: colors.surface, fontSize: 11, fontWeight: '900' }, professionalCopy: { flex: 1, marginLeft: 10 }, professionalName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }, ratingText: { color: colors.inkSoft, fontSize: 10 }, chatButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  candidateCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 15, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }, candidateAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#EDE8FA', alignItems: 'center', justifyContent: 'center' }, candidateInitials: { color: '#6651A5', fontSize: 12, fontWeight: '900' }, candidateCopy: { flex: 1, marginLeft: 11 }, candidateName: { color: colors.ink, fontSize: 13, fontWeight: '900' }, candidateRole: { color: colors.inkSoft, fontSize: 10, marginTop: 3 }, viewProfile: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9 }, viewProfileText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
});
