import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenHeader, SectionTitle, Stars } from '../../components/ui';
import { listarAvaliacoesDoPrestador } from '../../lib/avaliacoes';
import { listarCandidatosDaVaga } from '../../lib/candidaturas';
import { formatarMesAno, formatarNota, iniciais, plural } from '../../lib/formato';
import { buscarPrestador } from '../../lib/prestadores';
import { useSessao } from '../../lib/session';
import { colors, radius } from '../../lib/theme';
import { useDados } from '../../lib/useDados';

// Perfil público do profissional. Vindo de uma candidatura (candidaturaId + vagaId), a empresa pode selecioná-lo daqui.
export default function ProfissionalScreen() {
  const { id, candidaturaId, vagaId } = useLocalSearchParams<{ id: string; candidaturaId?: string; vagaId?: string }>();
  const ehEmpresa = useSessao()?.role === 'EMPRESA';

  const { dados, erro, recarregar } = useDados(async () => {
    const [perfil, avaliacoes, candidatos] = await Promise.all([
      buscarPrestador(id),
      listarAvaliacoesDoPrestador(id),
      ehEmpresa && candidaturaId && vagaId ? listarCandidatosDaVaga(vagaId) : Promise.resolve([]),
    ]);
    return { perfil, avaliacoes, candidatura: candidatos.find((c) => c.id === candidaturaId) };
  }, id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Perfil do profissional" onBack={() => router.back()} />
        {!dados ? (
          erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />
        ) : (
          <>
            <View style={styles.profileCard}>
              <Avatar initials={iniciais(dados.perfil.nome)} size={72} />
              <Text style={styles.name}>{dados.perfil.nome}</Text>
              <Text style={styles.role}>{[dados.perfil.funcao, dados.perfil.cidade].filter(Boolean).join(' • ') || 'Profissional'}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={15} color={colors.star} />
                <Text style={styles.ratingText}>{formatarNota(dados.perfil.notaMedia)}</Text>
                <Text style={styles.muted}>• {plural(dados.perfil.totalAvaliacoes, 'avaliação', 'avaliações')}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Stat valor={String(dados.perfil.turnosConcluidos)} label="turnos concluídos" />
              <Stat valor={dados.perfil.experiencia || '–'} label="de experiência" />
              <Stat valor={formatarMesAno(dados.perfil.membroDesde)} label="no Chama desde" />
            </View>

            {dados.perfil.sobre ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Sobre</Text>
                <Text style={styles.blockText}>{dados.perfil.sobre}</Text>
              </View>
            ) : null}

            {dados.perfil.habilidades.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Habilidades</Text>
                <View style={styles.chips}>{dados.perfil.habilidades.map((h) => <View key={h} style={styles.chip}><Text style={styles.chipText}>{h}</Text></View>)}</View>
              </View>
            ) : null}

            {dados.perfil.empresasAtendidas.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Já trabalhou com</Text>
                <Text style={styles.blockText}>{dados.perfil.empresasAtendidas.join(', ')}</Text>
              </View>
            ) : null}

            <SectionTitle title="Avaliações das empresas" />
            {dados.avaliacoes.length === 0 ? (
              <EmptyState icon="star-outline" title="Ainda sem avaliações" text="As avaliações aparecem aqui depois dos primeiros turnos concluídos." />
            ) : (
              dados.avaliacoes.map((avaliacao) => (
                <View key={avaliacao.id} style={styles.review}>
                  <View style={styles.reviewTop}><Text style={styles.reviewAuthor}>{avaliacao.autorNome}</Text><Stars value={avaliacao.nota} size={12} /></View>
                  {avaliacao.comentario ? <Text style={styles.reviewText}>{avaliacao.comentario}</Text> : null}
                </View>
              ))
            )}

            {dados.candidatura?.status === 'PENDENTE' ? (
              <PrimaryButton
                label="Selecionar para o turno"
                icon="checkmark"
                onPress={() => router.push({ pathname: '/selecao/[candidaturaId]', params: { candidaturaId: dados.candidatura!.id, vagaId: vagaId! } })}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 40, gap: 18 },
  profileCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 22 },
  name: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: 14 },
  role: { color: colors.inkSoft, fontSize: 13, marginTop: 4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 9 },
  ratingText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  muted: { color: colors.inkSoft, fontSize: 12 },
  stats: { flexDirection: 'row', gap: 9 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12 },
  statValue: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  statLabel: { color: colors.inkSoft, fontSize: 10, marginTop: 3 },
  block: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 15, gap: 8 },
  blockTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  blockText: { color: colors.inkSoft, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  reviewText: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 7 },
});
