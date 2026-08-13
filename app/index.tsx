import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark, PrimaryButton } from '../components/ui';
import { colors, radius } from '../lib/theme';

const roles = [
  { icon: 'restaurant-outline' as const, label: 'Cozinha' },
  { icon: 'pizza-outline' as const, label: 'Pizzaria' },
  { icon: 'cafe-outline' as const, label: 'Cafeteria' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <BrandMark compact />
          <Pressable onPress={() => router.push('/entrar')} hitSlop={8}>
            <Text style={styles.enterLink}>Entrar</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.illustration}>
            <View style={styles.glowOne} />
            <View style={styles.glowTwo} />
            <View style={styles.shiftCardBack} />
            <View style={styles.shiftCard}>
              <View style={styles.shiftTop}>
                <View style={styles.companyIcon}>
                  <Ionicons name="storefront" size={25} color={colors.primary} />
                </View>
                <View style={styles.shiftCopy}>
                  <Text style={styles.companyName}>Padaria Aurora</Text>
                  <Text style={styles.distance}>1,2 km de você</Text>
                </View>
                <View style={styles.liveDot} />
              </View>
              <View style={styles.divider} />
              <Text style={styles.jobTitle}>Padeiro(a)</Text>
              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={17} color={colors.inkSoft} />
                  <Text style={styles.metaText}>Amanhã</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={17} color={colors.inkSoft} />
                  <Text style={styles.metaText}>06h–12h</Text>
                </View>
              </View>
              <View style={styles.shiftBottom}>
                <Text style={styles.value}>R$ 180</Text>
                <View style={styles.acceptBadge}>
                  <Ionicons name="checkmark" size={16} color={colors.surface} />
                  <Text style={styles.acceptText}>Aceitar turno</Text>
                </View>
              </View>
            </View>
            <View style={styles.floatingBadge}>
              <Ionicons name="flash" size={18} color={colors.warning} />
              <Text style={styles.floatingText}>Pagamento seguro</Text>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.eyebrow}>TRABALHO QUE ENCAIXA NA SUA ROTINA</Text>
            <Text style={styles.title}>O turno certo, na hora certa.</Text>
            <Text style={styles.subtitle}>
              Conectamos talentos da gastronomia a negócios que precisam de gente boa para hoje.
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.roleRow}>
            {roles.map((role) => (
              <View key={role.label} style={styles.roleItem}>
                <Ionicons name={role.icon} size={18} color={colors.primary} />
                <Text style={styles.roleText}>{role.label}</Text>
              </View>
            ))}
          </View>
          <PrimaryButton label="Começar agora" icon="arrow-forward" onPress={() => router.push('/escolher-perfil')} />
          <Text style={styles.terms}>Ao continuar, você concorda com nossos Termos e Política de Privacidade.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { flex: 1, paddingHorizontal: 22, paddingBottom: 10 },
  topBar: { paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  enterLink: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  hero: { flex: 1, justifyContent: 'center', gap: 28 },
  illustration: { height: 275, justifyContent: 'center', alignItems: 'center' },
  glowOne: { position: 'absolute', width: 255, height: 255, borderRadius: 140, backgroundColor: '#FFE0D4', right: -25, top: 5 },
  glowTwo: { position: 'absolute', width: 115, height: 115, borderRadius: 60, backgroundColor: '#F7D9C7', left: -35, bottom: 10 },
  shiftCardBack: { position: 'absolute', width: '82%', height: 185, borderRadius: radius.lg, backgroundColor: colors.wine, transform: [{ rotate: '-5deg' }] },
  shiftCard: { width: '88%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, transform: [{ rotate: '1.5deg' }], shadowColor: colors.wine, shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 7 },
  shiftTop: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  shiftCopy: { flex: 1, marginLeft: 11 },
  companyName: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  distance: { color: colors.inkSoft, fontSize: 11, marginTop: 3 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.success },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 13 },
  jobTitle: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  jobMeta: { flexDirection: 'row', gap: 18, marginTop: 8 },
  metaItem: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  metaText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  shiftBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  value: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  acceptBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  acceptText: { color: colors.surface, fontSize: 11, fontWeight: '800' },
  floatingBadge: { position: 'absolute', bottom: 3, left: 6, borderRadius: radius.pill, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 9, elevation: 5, shadowColor: colors.wine, shadowOpacity: 0.12, shadowRadius: 12 },
  floatingText: { fontSize: 11, color: colors.ink, fontWeight: '800' },
  copyBlock: { gap: 9 },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.wine, fontSize: 38, lineHeight: 41, fontWeight: '900', letterSpacing: -1.5, maxWidth: 330 },
  subtitle: { color: colors.inkSoft, fontSize: 15, lineHeight: 22, maxWidth: 350 },
  bottomArea: { gap: 13 },
  roleRow: { flexDirection: 'row', justifyContent: 'center', gap: 9 },
  roleItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.inkSoft },
  terms: { color: colors.tabInactive, fontSize: 10, lineHeight: 14, textAlign: 'center', paddingHorizontal: 25 },
});
