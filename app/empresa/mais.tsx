import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, avisarEmBreve, confirmarSaida } from '../../components/ui';
import { buscarUsuarioAtual } from '../../lib/auth';
import { iniciais } from '../../lib/formato';
import { colors, radius } from '../../lib/theme';
import { useDados } from '../../lib/useDados';

const menu = [
  { icon: 'storefront-outline' as const, label: 'Dados da empresa' },
  { icon: 'business-outline' as const, label: 'Unidades' },
  { icon: 'people-outline' as const, label: 'Equipe' },
  { icon: 'heart-outline' as const, label: 'Profissionais favoritos' },
  { icon: 'help-circle-outline' as const, label: 'Ajuda e suporte' },
];

export default function CompanyMoreScreen() {
  // Só o cabeçalho depende dos dados; o menu e o "Sair" funcionam mesmo sem eles.
  const { dados: usuario } = useDados(buscarUsuarioAtual);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mais</Text>
        {usuario ? (
          <View style={styles.accountCard}>
            <Avatar initials={iniciais(usuario.nome)} size={54} />
            <View style={styles.accountCopy}>
              <Text style={styles.accountName}>{usuario.nome}</Text>
              <Text style={styles.accountEmail}>{usuario.email}</Text>
            </View>
          </View>
        ) : null}
        <View style={styles.menu}>
          {menu.map((item, index) => (
            <View key={item.label}>
              <Pressable onPress={() => avisarEmBreve(`"${item.label}"`)} style={styles.menuItem}>
                <View style={styles.menuIcon}><Ionicons name={item.icon} size={20} color={colors.primary} /></View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={19} color={colors.tabInactive} />
              </Pressable>
              {index < menu.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
        <Pressable onPress={confirmarSaida} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.primary} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35, gap: 18 },
  title: { color: colors.wine, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  accountCopy: { flex: 1, marginLeft: 13 },
  accountName: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  accountEmail: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  menu: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 },
  menuItem: { minHeight: 61, flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, marginLeft: 12, color: colors.ink, fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
  logout: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 12 },
  logoutText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
});
