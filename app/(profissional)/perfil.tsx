import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../../lib/theme';

const menu = [
  { icon: 'person-outline' as const, label: 'Dados pessoais' },
  { icon: 'briefcase-outline' as const, label: 'Experiência e habilidades' },
  { icon: 'document-text-outline' as const, label: 'Documentos' },
  { icon: 'notifications-outline' as const, label: 'Notificações' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacidade e segurança' },
  { icon: 'help-circle-outline' as const, label: 'Ajuda e suporte' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.top}><Text style={styles.title}>Meu perfil</Text><Pressable style={styles.settings}><Ionicons name="settings-outline" size={22} color={colors.ink} /></Pressable></View>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>RS</Text><View style={styles.verified}><Ionicons name="checkmark" size={12} color={colors.surface} /></View></View>
          <View style={styles.profileCopy}><Text style={styles.name}>Rafael Silva</Text><Text style={styles.role}>Padeiro • São Paulo</Text><View style={styles.rating}><Ionicons name="star" size={14} color="#F5A623" /><Text style={styles.ratingText}>4,9</Text><Text style={styles.reviews}>• 12 avaliações</Text></View></View>
        </View>
        <View style={styles.completion}><View style={styles.completionTop}><Text style={styles.completionTitle}>Seu perfil está quase pronto</Text><Text style={styles.completionValue}>80%</Text></View><View style={styles.track}><View style={styles.value} /></View><Text style={styles.completionText}>Adicione suas certificações para ganhar mais destaque.</Text></View>
        <View style={styles.menu}>{menu.map((item, index) => <View key={item.label}><Pressable style={styles.menuItem}><View style={styles.menuIcon}><Ionicons name={item.icon} size={20} color={colors.primary} /></View><Text style={styles.menuText}>{item.label}</Text><Ionicons name="chevron-forward" size={19} color={colors.tabInactive} /></Pressable>{index < menu.length - 1 ? <View style={styles.divider} /> : null}</View>)}</View>
        <Pressable onPress={() => router.replace('/')} style={styles.logout}><Ionicons name="log-out-outline" size={20} color={colors.primary} /><Text style={styles.logoutText}>Sair da conta</Text></Pressable>
        <Text style={styles.version}>Chama para iOS • versão 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, container: { padding: 20, paddingBottom: 35, gap: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 }, settings: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.border }, avatar: { width: 67, height: 67, borderRadius: 23, backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontSize: 22, fontWeight: '900' }, verified: { position: 'absolute', right: -3, bottom: -3, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, profileCopy: { marginLeft: 15 }, name: { color: colors.ink, fontSize: 19, fontWeight: '900' }, role: { color: colors.inkSoft, fontSize: 12, marginTop: 4 }, rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 }, ratingText: { color: colors.ink, fontSize: 12, fontWeight: '800' }, reviews: { color: colors.inkSoft, fontSize: 10 },
  completion: { backgroundColor: colors.wine, borderRadius: radius.md, padding: 16 }, completionTop: { flexDirection: 'row', justifyContent: 'space-between' }, completionTitle: { color: colors.surface, fontSize: 13, fontWeight: '800' }, completionValue: { color: '#FF9E88', fontSize: 13, fontWeight: '900' }, track: { height: 6, borderRadius: 4, backgroundColor: '#684650', marginTop: 12, overflow: 'hidden' }, value: { width: '80%', height: '100%', backgroundColor: colors.primary, borderRadius: 4 }, completionText: { color: '#CBBFC1', fontSize: 10, marginTop: 9 },
  menu: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 }, menuItem: { minHeight: 61, flexDirection: 'row', alignItems: 'center' }, menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, menuText: { flex: 1, marginLeft: 12, color: colors.ink, fontSize: 13, fontWeight: '700' }, divider: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
  logout: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 12 }, logoutText: { color: colors.primary, fontSize: 13, fontWeight: '900' }, version: { color: colors.tabInactive, textAlign: 'center', fontSize: 10 },
});
