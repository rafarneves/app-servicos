import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, BrandMark } from '../components/ui';
import { colors, radius, shadow } from '../lib/theme';

const profiles = [
  {
    type: 'profissional',
    icon: 'person' as const,
    label: 'Quero trabalhar',
    description: 'Encontre turnos perto de você e receba com segurança.',
    detail: 'Para profissionais',
  },
  {
    type: 'empresa',
    icon: 'storefront' as const,
    label: 'Quero contratar',
    description: 'Publique uma necessidade e encontre profissionais disponíveis.',
    detail: 'Para empresas',
  },
];

export default function ChooseProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <BrandMark compact />
          <View style={styles.spacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.step}>PRIMEIRO PASSO</Text>
          <Text style={styles.title}>Como você quer usar o Chama?</Text>
          <Text style={styles.subtitle}>Escolha seu perfil. Você poderá alterar isso mais tarde.</Text>
        </View>

        <View style={styles.cards}>
          {profiles.map((profile, index) => (
            <Pressable
              key={profile.type}
              onPress={() => router.push({ pathname: '/entrar', params: { tipo: profile.type } })}
              style={({ pressed }) => [styles.card, index === 0 && styles.cardFeatured, pressed && styles.cardPressed]}
            >
              {index === 0 ? <Text style={styles.recommended}>MAIS ESCOLHIDO</Text> : null}
              <View style={[styles.iconBox, index === 0 && styles.iconBoxFeatured]}>
                <Ionicons name={profile.icon} size={30} color={index === 0 ? colors.surface : colors.primary} />
              </View>
              <Text style={styles.cardDetail}>{profile.detail}</Text>
              <Text style={styles.cardTitle}>{profile.label}</Text>
              <Text style={styles.cardDescription}>{profile.description}</Text>
              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={19} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark" size={19} color={colors.success} />
          <Text style={styles.trustText}>Seus dados são protegidos e nunca serão vendidos.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { flexGrow: 1, padding: 22, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spacer: { width: 44 },
  intro: { marginTop: 48, marginBottom: 28, gap: 9 },
  step: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.wine, fontSize: 34, lineHeight: 39, letterSpacing: -1.2, fontWeight: '900', maxWidth: 340 },
  subtitle: { color: colors.inkSoft, fontSize: 15, lineHeight: 22, maxWidth: 340 },
  cards: { gap: 15 },
  card: { borderWidth: 1.2, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: 20, ...shadow },
  cardFeatured: { borderColor: '#F4AA99' },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  recommended: { position: 'absolute', right: 16, top: 16, borderRadius: radius.pill, backgroundColor: colors.primarySoft, color: colors.primaryDark, paddingHorizontal: 9, paddingVertical: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.6, overflow: 'hidden' },
  iconBox: { width: 58, height: 58, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  iconBoxFeatured: { backgroundColor: colors.primary },
  cardDetail: { color: colors.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  cardTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 5, letterSpacing: -0.5 },
  cardDescription: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 300 },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 17 },
  cardActionText: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  trustRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 'auto', paddingTop: 32 },
  trustText: { color: colors.inkSoft, fontSize: 11 },
});
