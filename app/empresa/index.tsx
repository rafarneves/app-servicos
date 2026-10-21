import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerVerificacao } from '../../components/BannerVerificacao';
import { avisarEmBreve, BrandMark, EmptyState, ErrorState, FloatingButton, LoadingState, Pill, SectionTitle } from '../../components/ui';
import { buscarUsuarioAtual } from '../../lib/auth';
import { listarCandidatosDaVaga } from '../../lib/candidaturas';
import { listarMinhasContratacoes } from '../../lib/contratacoes';
import { formatarDia, formatarHorario, formatarNota, iniciais, plural, rotuloDoTurno, turnoAtivo } from '../../lib/formato';
import { colors, radius, shadow } from '../../lib/theme';
import { useDados } from '../../lib/useDados';
import { listarMinhasVagas } from '../../lib/vagas';

export default function CompanyHomeScreen() {
  const { dados, erro, recarregar } = useDados(async () => {
    const [usuario, vagas, turnos] = await Promise.all([buscarUsuarioAtual(), listarMinhasVagas(), listarMinhasContratacoes()]);
    const abertasComCandidatos = vagas.filter((v) => v.status === 'ABERTA' && v.totalCandidatos > 0);
    const candidatos = (await Promise.all(abertasComCandidatos.map((v) => listarCandidatosDaVaga(v.id)))).flat();
    const ativos = turnos
      .filter((t) => turnoAtivo(t.status))
      .sort((a, b) => `${a.vaga.data}${a.vaga.horaInicio}`.localeCompare(`${b.vaga.data}${b.vaga.horaInicio}`));
    return {
      nome: usuario.nome,
      nota: vagas[0]?.empresa.notaMedia ?? null,
      ativos,
      pendentes: candidatos.filter((c) => c.status === 'PENDENTE').sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BrandMark compact />
          <View style={styles.headerActions}>
            <Pressable onPress={() => avisarEmBreve('As notificações')} style={styles.iconButton} accessibilityLabel="Notificações"><Ionicons name="notifications-outline" size={22} color={colors.ink} /></Pressable>
            <Pressable onPress={() => router.push('/empresa/mais')} style={styles.avatar} accessibilityLabel="Conta da empresa"><Text style={styles.avatarText}>{dados ? iniciais(dados.nome) : ''}</Text></Pressable>
          </View>
        </View>

        <BannerVerificacao />

        <View style={styles.welcome}>
          <Text style={styles.greeting}>Olá{dados ? `, ${dados.nome}` : ''}</Text>
          <Text style={styles.subtitle}>Sua operação de hoje, em um só lugar.</Text>
        </View>

        <Pressable onPress={() => router.push('/vaga/nova')} style={({ pressed }) => [styles.createCard, pressed && styles.pressed]}>
          <View style={styles.createIcon}><Ionicons name="add" size={30} color={colors.surface} /></View>
          <View style={styles.createCopy}><Text style={styles.createTitle}>Publicar novo turno</Text><Text style={styles.createText}>Encontre o profissional certo em poucos minutos.</Text></View>
          <Ionicons name="arrow-forward" size={23} color={colors.surface} />
        </Pressable>

        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : (
          <>
            <View style={styles.stats}>
              <Pressable onPress={() => router.push('/empresa/turnos')} style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="calendar" size={20} color={colors.primary} /></View><Text style={styles.statValue}>{dados.ativos.length}</Text><Text style={styles.statLabel}>turnos ativos</Text></Pressable>
              <Pressable onPress={() => router.push('/empresa/vagas')} style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.successSoft }]}><Ionicons name="people" size={20} color={colors.success} /></View><Text style={styles.statValue}>{dados.pendentes.length}</Text><Text style={styles.statLabel}>candidaturas</Text></Pressable>
              <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: colors.warningSoft }]}><Ionicons name="star" size={20} color={colors.warning} /></View><Text style={styles.statValue}>{formatarNota(dados.nota)}</Text><Text style={styles.statLabel}>sua nota</Text></View>
            </View>

            <SectionTitle title="Turnos em andamento" action="Ver todos" onAction={() => router.push('/empresa/turnos')} />
            {dados.ativos.length === 0 ? (
              <EmptyState icon="calendar-outline" title="Nenhum turno ativo" text="Quando você selecionar um profissional, o turno aparece aqui." />
            ) : (
              dados.ativos.slice(0, 2).map((turno) => (
                <Pressable key={turno.id} onPress={() => router.push(`/turno/${turno.id}`)} style={styles.shiftCard}>
                  <View style={styles.shiftHeader}><Pill label={rotuloDoTurno[turno.status].label} tone={rotuloDoTurno[turno.status].tone} /><Ionicons name="chevron-forward" size={22} color={colors.inkSoft} /></View>
                  <Text style={styles.role}>{turno.vaga.titulo}</Text>
                  <View style={styles.meta}><View style={styles.metaItem}><Ionicons name="calendar-outline" size={17} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarDia(turno.vaga.data)}</Text></View><View style={styles.metaItem}><Ionicons name="time-outline" size={17} color={colors.inkSoft} /><Text style={styles.metaText}>{formatarHorario(turno.vaga.horaInicio, turno.vaga.horaFim)}</Text></View></View>
                  <View style={styles.professional}><View style={styles.professionalAvatar}><Text style={styles.professionalInitials}>{iniciais(turno.prestador.nome)}</Text></View><View style={styles.professionalCopy}><Text style={styles.professionalName}>{turno.prestador.nome}</Text><View style={styles.rating}><Ionicons name="star" size={12} color={colors.star} /><Text style={styles.ratingText}>{formatarNota(turno.prestador.notaMedia)} • {plural(turno.prestador.turnosConcluidos, 'turno', 'turnos')}</Text></View></View><Pressable onPress={() => avisarEmBreve('O chat do turno')} style={styles.chatButton} accessibilityLabel="Conversar"><Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} /></Pressable></View>
                </Pressable>
              ))
            )}

            <SectionTitle title="Candidaturas recentes" action="Ver vagas" onAction={() => router.push('/empresa/vagas')} />
            {dados.pendentes.length === 0 ? (
              <EmptyState icon="people-outline" title="Nenhuma candidatura nova" text="As candidaturas às suas vagas abertas aparecem aqui." />
            ) : (
              dados.pendentes.slice(0, 3).map((candidatura) => (
                <Pressable
                  key={candidatura.id}
                  onPress={() => router.push({ pathname: '/profissional/[id]', params: { id: candidatura.prestador.id, candidaturaId: candidatura.id, vagaId: candidatura.vaga.id } })}
                  style={styles.candidateCard}
                >
                  <View style={styles.candidateAvatar}><Text style={styles.candidateInitials}>{iniciais(candidatura.prestador.nome)}</Text></View>
                  <View style={styles.candidateCopy}><Text style={styles.candidateName}>{candidatura.prestador.nome}</Text><Text style={styles.candidateRole}>{candidatura.vaga.titulo} • {formatarDia(candidatura.vaga.data)}</Text><View style={styles.rating}><Ionicons name="star" size={12} color={colors.star} /><Text style={styles.ratingText}>{formatarNota(candidatura.prestador.notaMedia)} • {plural(candidatura.prestador.turnosConcluidos, 'turno', 'turnos')}</Text></View></View>
                  <View style={styles.viewProfile}><Text style={styles.viewProfileText}>Ver</Text></View>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
      <FloatingButton label="Nova vaga" icon="add" onPress={() => router.push('/vaga/nova')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, container: { padding: 20, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, headerActions: { flexDirection: 'row', gap: 9 }, iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontSize: 12, fontWeight: '900' },
  welcome: { marginTop: 8 }, greeting: { color: colors.wine, fontSize: 27, fontWeight: '900', letterSpacing: -0.7 }, subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  createCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', ...shadow }, pressed: { opacity: 0.8 }, createIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' }, createCopy: { flex: 1, marginHorizontal: 13 }, createTitle: { color: colors.surface, fontSize: 17, fontWeight: '900' }, createText: { color: '#FFE4DD', fontSize: 11, lineHeight: 16, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 9 }, statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 }, statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, statValue: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 10 }, statLabel: { color: colors.inkSoft, fontSize: 9, marginTop: 2 },
  shiftCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.border }, shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, role: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 14 }, meta: { flexDirection: 'row', gap: 17, marginTop: 10 }, metaItem: { flexDirection: 'row', gap: 6, alignItems: 'center' }, metaText: { color: colors.inkSoft, fontSize: 12 }, professional: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16, paddingTop: 15, flexDirection: 'row', alignItems: 'center' }, professionalAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.wine, alignItems: 'center', justifyContent: 'center' }, professionalInitials: { color: colors.surface, fontSize: 11, fontWeight: '900' }, professionalCopy: { flex: 1, marginLeft: 10 }, professionalName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }, ratingText: { color: colors.inkSoft, fontSize: 10 }, chatButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  candidateCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 15, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }, candidateAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#EDE8FA', alignItems: 'center', justifyContent: 'center' }, candidateInitials: { color: '#6651A5', fontSize: 12, fontWeight: '900' }, candidateCopy: { flex: 1, marginLeft: 11 }, candidateName: { color: colors.ink, fontSize: 13, fontWeight: '900' }, candidateRole: { color: colors.inkSoft, fontSize: 10, marginTop: 3 }, viewProfile: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9 }, viewProfileText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
});
