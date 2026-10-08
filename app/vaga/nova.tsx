import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, PrimaryButton } from '../components/ui';
import { colors, radius } from '../lib/theme';

const roles = ['Padeiro(a)', 'Cozinheiro(a)', 'Auxiliar', 'Garçom'];

export default function NewOpportunityScreen() {
  const [selectedRole, setSelectedRole] = useState('Padeiro(a)');
  const publish = () => Alert.alert('Turno publicado!', 'Profissionais próximos já podem receber esta oportunidade.', [{ text: 'Ver painel', onPress: () => router.replace('/empresa') }]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={24} color={colors.ink} /></Pressable><Text style={styles.headerTitle}>Novo turno</Text><View style={styles.spacer} /></View>
          <View style={styles.intro}><Text style={styles.title}>Quem você precisa?</Text><Text style={styles.subtitle}>Preencha os detalhes para encontrar o profissional ideal.</Text></View>

          <View style={styles.section}>
            <Text style={styles.label}>Função</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roles}>{roles.map((role) => { const active = role === selectedRole; return <Pressable key={role} onPress={() => setSelectedRole(role)} style={[styles.role, active && styles.roleActive]}><Text style={[styles.roleText, active && styles.roleTextActive]}>{role}</Text></Pressable>; })}</ScrollView>
            <Pressable style={styles.moreRoles}><Ionicons name="search-outline" size={18} color={colors.primary} /><Text style={styles.moreRolesText}>Ver todas as funções</Text></Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quando?</Text>
            <Field label="Data" icon="calendar-outline" placeholder="14/08/2026" />
            <View style={styles.fieldRow}><View style={styles.half}><Field label="Início" icon="time-outline" placeholder="06:00" /></View><View style={styles.half}><Field label="Término" icon="time-outline" placeholder="12:00" /></View></View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pagamento e vagas</Text>
            <View style={styles.fieldRow}><View style={styles.half}><Field label="Valor do turno" icon="cash-outline" placeholder="R$ 180" keyboardType="decimal-pad" /></View><View style={styles.half}><Field label="Quantidade" icon="people-outline" placeholder="1" keyboardType="number-pad" /></View></View>
            <View style={styles.feeInfo}><Ionicons name="shield-checkmark" size={19} color={colors.success} /><Text style={styles.feeText}>O profissional vê o valor líquido. Taxas e custo total são exibidos antes da confirmação.</Text></View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <Field label="Observações" icon="reader-outline" placeholder="Ex.: experiência com forno lastro..." multiline />
            <Pressable style={styles.requirement}><Ionicons name="shirt-outline" size={20} color={colors.primary} /><View style={styles.requirementCopy}><Text style={styles.requirementTitle}>Uniforme e requisitos</Text><Text style={styles.requirementText}>Informe o que o profissional deve levar</Text></View><Ionicons name="chevron-forward" size={19} color={colors.inkSoft} /></Pressable>
          </View>

          <View style={styles.summary}><View><Text style={styles.summaryLabel}>ESTIMATIVA DO TURNO</Text><Text style={styles.summaryValue}>R$ 180,00</Text></View><Ionicons name="information-circle-outline" size={20} color={colors.inkSoft} /></View>
          <PrimaryButton label="Revisar e publicar" icon="arrow-forward" onPress={publish} />
          <Text style={styles.legal}>Você poderá revisar todas as informações e o custo total antes da publicação.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, flex: { flex: 1 }, container: { padding: 20, paddingBottom: 34 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, close: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, spacer: { width: 44 },
  intro: { marginTop: 35 }, title: { color: colors.wine, fontSize: 31, fontWeight: '900', letterSpacing: -0.9 }, subtitle: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, marginTop: 7 },
  section: { marginTop: 27, gap: 15 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, label: { color: colors.ink, fontSize: 14, fontWeight: '700' }, roles: { gap: 8, paddingRight: 20 }, role: { borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, paddingVertical: 10 }, roleActive: { backgroundColor: colors.wine, borderColor: colors.wine }, roleText: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' }, roleTextActive: { color: colors.surface }, moreRoles: { flexDirection: 'row', gap: 7, alignItems: 'center' }, moreRolesText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  fieldRow: { flexDirection: 'row', gap: 10 }, half: { flex: 1 }, feeInfo: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: colors.successSoft, borderRadius: 15, padding: 13 }, feeText: { flex: 1, color: '#2D6552', fontSize: 10, lineHeight: 15 }, requirement: { minHeight: 63, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, padding: 14, flexDirection: 'row', alignItems: 'center' }, requirementCopy: { flex: 1, marginLeft: 10 }, requirementTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, requirementText: { color: colors.inkSoft, fontSize: 10, marginTop: 3 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 17, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 15 }, summaryLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 }, summaryValue: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 5 }, legal: { color: colors.tabInactive, fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 11, paddingHorizontal: 22 },
});
