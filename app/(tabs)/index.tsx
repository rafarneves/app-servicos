import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill, SectionTitle } from '../../components/ui';
import { colors, radius, shadow } from '../../lib/theme';

const opportunities = [
  { id: '1', company: 'Padaria Aurora', role: 'Padeiro(a)', distance: '1,2 km', day: 'Amanhã', time: '06:00 – 12:00', price: 'R$ 180', icon: 'storefront' as const, tone: '#FFF0EB', rating: '4,9', urgent: true },
  { id: '2', company: 'Bistrô da Praça', role: 'Auxiliar de cozinha', distance: '2,8 km', day: 'Sex, 16 ago', time: '17:00 – 23:00', price: 'R$ 150', icon: 'restaurant' as const, tone: '#EEF7F3', rating: '4,8', urgent: false },
  { id: '3', company: 'Nori Sushi Bar', role: 'Sushiman', distance: '4,1 km', day: 'Sáb, 17 ago', time: '18:00 – 00:00', price: 'R$ 240', icon: 'fish' as const, tone: '#F1EFFB', rating: '4,7', urgent: false },
];

export default function ProfessionalHome() {
  const [available, setAvailable] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const categories = ['Todos', 'Cozinha', 'Padaria', 'Salão'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bom dia, Rafael 👋</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={15} color={colors.primary} />
              <Text style={styles.location}>São Paulo, SP</Text>
              <Ionicons name="chevron-down" size={14} color={colors.inkSoft} />
            </View>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={23} color={colors.ink} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityIcon}>
            <Ionicons name="flash" size={25} color={colors.surface} />
          </View>
          <View style={styles.availabilityCopy}>
            <Text style={styles.availabilityTitle}>{available ? 'Você está disponível' : 'Você está indisponível'}</Text>
            <Text style={styles.availabilityText}>{available ? 'Recebendo oportunidades próximas' : 'Ative para receber novos turnos'}</Text>
          </View>
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: available }} onPress={() => setAvailable((value) => !value)} style={[styles.switch, available && styles.switchActive]}>
            <View style={[styles.switchThumb, available && styles.switchThumbActive]} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="calendar-outline" size={19} color={colors.primary} /></View>
            <Text style={styles.summaryValue}>2</Text>
            <Text style={styles.summaryLabel}>turnos este mês</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}><Ionicons name="wallet-outline" size={19} color={colors.success} /></View>
            <Text style={styles.summaryValue}>R$ 330</Text>
            <Text style={styles.summaryLabel}>a receber</Text>
          </View>
        </View>

        <SectionTitle title="Oportunidades perto de você" action="Ver mapa" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.category, active && styles.categoryActive]}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.opportunityList}>
          {opportunities.map((item) => (
            <Pressable key={item.id} style={({ pressed }) => [styles.opportunityCard, pressed && styles.cardPressed]}>
              <View style={styles.cardTop}>
                <View style={[styles.companyIcon, { backgroundColor: item.tone }]}><Ionicons name={item.icon} size={24} color={colors.primary} /></View>
                <View style={styles.companyCopy}>
                  <Text style={styles.companyName}>{item.company}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F5A623" /><Text style={styles.ratingText}>{item.rating}</Text><Text style={styles.dot}>•</Text><Text style={styles.distance}>{item.distance}</Text>
                  </View>
                </View>
                <Pressable hitSlop={9}><Ionicons name="heart-outline" size={23} color={colors.inkSoft} /></Pressable>
              </View>
              <View style={styles.roleLine}>
                <Text style={styles.roleTitle}>{item.role}</Text>
                {item.urgent ? <Pill label="Começa logo" tone="primary" /> : null}
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}><Ionicons name="calendar-outline" size={17} color={colors.inkSoft} /><Text style={styles.detailText}>{item.day}</Text></View>
                <View style={styles.detailItem}><Ionicons name="time-outline" size={17} color={colors.inkSoft} /><Text style={styles.detailText}>{item.time}</Text></View>
              </View>
              <View style={styles.cardFooter}>
                <View><Text style={styles.price}>{item.price}</Text><Text style={styles.payment}>Pagamento pelo Chama</Text></View>
                <View style={styles.viewButton}><Text style={styles.viewButtonText}>Ver turno</Text><Ionicons name="arrow-forward" size={16} color={colors.surface} /></View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 35, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: colors.ink, fontSize: 23, fontWeight: '900', letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  notificationButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.surface },
  availabilityCard: { backgroundColor: colors.wine, borderRadius: radius.lg, padding: 17, flexDirection: 'row', alignItems: 'center' },
  availabilityIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  availabilityCopy: { flex: 1, marginLeft: 12 },
  availabilityTitle: { color: colors.surface, fontSize: 14, fontWeight: '900' },
  availabilityText: { color: '#CBBFC1', fontSize: 11, marginTop: 3 },
  switch: { width: 48, height: 28, borderRadius: 15, backgroundColor: '#71545B', padding: 3 },
  switchActive: { backgroundColor: colors.primary },
  switchThumb: { width: 22, height: 22, borderRadius: 12, backgroundColor: colors.surface },
  switchThumbActive: { alignSelf: 'flex-end' },
  summaryRow: { flexDirection: 'row', gap: 11 },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14 },
  summaryIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  summaryValue: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  summaryLabel: { color: colors.inkSoft, fontSize: 11, marginTop: 3 },
  categories: { gap: 9, paddingRight: 20 },
  category: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryActive: { backgroundColor: colors.wine, borderColor: colors.wine },
  categoryText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  categoryTextActive: { color: colors.surface },
  opportunityList: { gap: 14 },
  opportunityCard: { borderRadius: radius.lg, backgroundColor: colors.surface, padding: 17, borderWidth: 1, borderColor: colors.border, ...shadow },
  cardPressed: { opacity: 0.8 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 47, height: 47, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  companyCopy: { flex: 1, marginLeft: 11 },
  companyName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  dot: { color: colors.tabInactive },
  distance: { color: colors.inkSoft, fontSize: 11 },
  roleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  roleTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  detailsRow: { flexDirection: 'row', gap: 17, marginTop: 11 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  cardFooter: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16, paddingTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  payment: { color: colors.success, fontSize: 9, fontWeight: '700', marginTop: 2 },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 13, paddingHorizontal: 15, paddingVertical: 11 },
  viewButtonText: { color: colors.surface, fontSize: 12, fontWeight: '900' },
});
