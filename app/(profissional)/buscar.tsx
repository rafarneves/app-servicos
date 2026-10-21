import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerVerificacao } from '../../components/BannerVerificacao';
import { avisarEmBreve, EmptyState, ErrorState, LoadingState, Pill, SectionTitle } from '../../components/ui';
import { buscarUsuarioAtual } from '../../lib/auth';
import { listarCategorias } from '../../lib/categorias';
import { listarMinhasContratacoes } from '../../lib/contratacoes';
import { buscarCarteira } from '../../lib/financeiro';
import { diasAte, formatarDia, formatarDistancia, formatarHorario, formatarNota, mesAtualIso, saudacao } from '../../lib/formato';
import { formatarMoeda } from '../../lib/precos';
import { buscarPrestador } from '../../lib/prestadores';
import { colors, radius, shadow } from '../../lib/theme';
import { useDados } from '../../lib/useDados';
import { listarVagas } from '../../lib/vagas';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const visualDaCategoria: Record<string, { icon: IconName; tone: string }> = {
  Padaria: { icon: 'storefront', tone: '#FFF0EB' },
  Cozinha: { icon: 'restaurant', tone: '#EEF7F3' },
  Salão: { icon: 'wine', tone: '#FFF5DF' },
  Sushi: { icon: 'fish', tone: '#F1EFFB' },
  Caixa: { icon: 'cash', tone: '#EEF7F3' },
  Entrega: { icon: 'bicycle', tone: '#F1EFFB' },
};

export default function ProfessionalHome() {
  const [available, setAvailable] = useState(true);
  const [categoriaId, setCategoriaId] = useState<string>();
  const [favoritas, setFavoritas] = useState<string[]>([]);

  const resumo = useDados(async () => {
    const usuario = await buscarUsuarioAtual();
    const [perfil, carteira, turnos] = await Promise.all([
      buscarPrestador(usuario.prestadorId ?? ''),
      buscarCarteira(),
      listarMinhasContratacoes(),
    ]);
    const mes = mesAtualIso();
    return {
      nome: usuario.nome.split(' ')[0],
      cidade: perfil.cidade,
      aReceber: carteira.aReceber,
      turnosNoMes: turnos.filter((t) => t.status !== 'CANCELADA' && t.vaga.data.startsWith(mes)).length,
    };
  });
  const categorias = useDados(listarCategorias);
  const vagas = useDados(() => listarVagas({ categoriaId }), categoriaId ?? 'todas');

  const alternarFavorita = (id: string) =>
    setFavoritas((atual) => (atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id]));

  const chips = [{ id: undefined, nome: 'Todos' }, ...(categorias.dados ?? [])];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{saudacao()}{resumo.dados ? `, ${resumo.dados.nome}` : ''} 👋</Text>
            {resumo.dados?.cidade ? (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={15} color={colors.primary} />
                <Text style={styles.location}>{resumo.dados.cidade}</Text>
              </View>
            ) : null}
          </View>
          <Pressable style={styles.notificationButton} onPress={() => avisarEmBreve('As notificações')} accessibilityLabel="Notificações">
            <Ionicons name="notifications-outline" size={23} color={colors.ink} />
          </Pressable>
        </View>

        <BannerVerificacao />

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
          <Pressable style={styles.summaryCard} onPress={() => router.push('/turnos')}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="calendar-outline" size={19} color={colors.primary} /></View>
            <Text style={styles.summaryValue}>{resumo.dados ? resumo.dados.turnosNoMes : '–'}</Text>
            <Text style={styles.summaryLabel}>turnos este mês</Text>
          </Pressable>
          <Pressable style={styles.summaryCard} onPress={() => router.push('/carteira')}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}><Ionicons name="wallet-outline" size={19} color={colors.success} /></View>
            <Text style={styles.summaryValue}>{resumo.dados ? formatarMoeda(resumo.dados.aReceber) : '–'}</Text>
            <Text style={styles.summaryLabel}>a receber</Text>
          </Pressable>
        </View>

        <SectionTitle title="Oportunidades perto de você" action="Ver mapa" onAction={() => avisarEmBreve('O mapa de vagas')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {chips.map((category) => {
            const active = categoriaId === category.id;
            return (
              <Pressable key={category.nome} onPress={() => setCategoriaId(category.id)} style={[styles.category, active && styles.categoryActive]}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category.nome}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!vagas.dados ? (
          vagas.erro ? <ErrorState text={vagas.erro} onRetry={vagas.recarregar} /> : <LoadingState text="Buscando turnos..." />
        ) : vagas.dados.length === 0 ? (
          <EmptyState icon="search-outline" title="Nenhum turno por aqui" text="Ainda não há vagas abertas nesta categoria. Tente outra ou volte mais tarde." />
        ) : (
          <View style={styles.opportunityList}>
            {vagas.dados.map((item) => {
              const visual = visualDaCategoria[item.categoria.nome] ?? { icon: 'briefcase' as const, tone: colors.primarySoft };
              const favorita = favoritas.includes(item.id);
              const abrir = () => router.push(`/vaga/${item.id}`);
              return (
                <Pressable key={item.id} onPress={abrir} style={({ pressed }) => [styles.opportunityCard, pressed && styles.cardPressed]}>
                  <View style={styles.cardTop}>
                    <View style={[styles.companyIcon, { backgroundColor: visual.tone }]}><Ionicons name={visual.icon} size={24} color={colors.primary} /></View>
                    <View style={styles.companyCopy}>
                      <Text style={styles.companyName}>{item.empresa.nome}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={colors.star} /><Text style={styles.ratingText}>{formatarNota(item.empresa.notaMedia)}</Text><Text style={styles.dot}>•</Text><Text style={styles.distance}>{formatarDistancia(item.distanciaKm)}</Text>
                      </View>
                    </View>
                    <Pressable hitSlop={9} onPress={() => alternarFavorita(item.id)} accessibilityLabel={favorita ? 'Remover dos favoritos' : 'Favoritar'}>
                      <Ionicons name={favorita ? 'heart' : 'heart-outline'} size={23} color={favorita ? colors.primary : colors.inkSoft} />
                    </Pressable>
                  </View>
                  <View style={styles.roleLine}>
                    <Text style={styles.roleTitle}>{item.titulo}</Text>
                    {diasAte(item.data) <= 1 ? <Pill label="Começa logo" tone="primary" /> : null}
                  </View>
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}><Ionicons name="calendar-outline" size={17} color={colors.inkSoft} /><Text style={styles.detailText}>{formatarDia(item.data)}</Text></View>
                    <View style={styles.detailItem}><Ionicons name="time-outline" size={17} color={colors.inkSoft} /><Text style={styles.detailText}>{formatarHorario(item.horaInicio, item.horaFim)}</Text></View>
                  </View>
                  <View style={styles.cardFooter}>
                    <View><Text style={styles.price}>{formatarMoeda(item.valorTurno)}</Text><Text style={styles.payment}>Pagamento pelo Chama</Text></View>
                    <Pressable onPress={abrir} style={styles.viewButton}><Text style={styles.viewButtonText}>Ver turno</Text><Ionicons name="arrow-forward" size={16} color={colors.surface} /></Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
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
