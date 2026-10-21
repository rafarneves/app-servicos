import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, ErrorState, LoadingState, Notice, Pill, PrimaryButton, ScreenHeader, SecondaryButton, SectionTitle, Stars, ValueRow } from '../../components/ui';
import { listarAvaliacoesDaEmpresa } from '../../lib/avaliacoes';
import { candidatar, desistirDaCandidatura, listarCandidatosDaVaga, listarMinhasCandidaturas } from '../../lib/candidaturas';
import { listarMinhasContratacoes } from '../../lib/contratacoes';
import { mensagemDeErro } from '../../lib/errors';
import { formatarDia, formatarDistancia, formatarHorario, formatarNota, hojeIso, iniciais, plural, rotuloDaCandidatura, rotuloDaVaga } from '../../lib/formato';
import { formatarMoeda, resumoDoTurno } from '../../lib/precos';
import { useSessao } from '../../lib/session';
import { colors, radius } from '../../lib/theme';
import type { Avaliacao, Candidatura, Contratacao, Vaga } from '../../lib/types';
import { useDados } from '../../lib/useDados';
import { buscarVaga } from '../../lib/vagas';

type Detalhe = {
  vaga: Vaga;
  candidatos: Candidatura[];
  contratacoes: Contratacao[];
  minhaCandidatura?: Candidatura;
  avaliacoes: Avaliacao[];
};

// Detalhe da vaga: o profissional se candidata; a empresa dona vê e seleciona os candidatos.
export default function VagaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ehEmpresa = useSessao()?.role === 'EMPRESA';
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const { dados, erro, recarregar } = useDados(async (): Promise<Detalhe> => {
    const vaga = await buscarVaga(id);
    if (ehEmpresa) {
      const [candidatos, contratacoes] = await Promise.all([listarCandidatosDaVaga(id), listarMinhasContratacoes()]);
      return { vaga, candidatos, contratacoes: contratacoes.filter((c) => c.vaga.id === id), avaliacoes: [] };
    }
    const [candidaturas, contratacoes, avaliacoes] = await Promise.all([
      listarMinhasCandidaturas(),
      listarMinhasContratacoes(),
      listarAvaliacoesDaEmpresa(vaga.empresa.id),
    ]);
    return {
      vaga,
      candidatos: [],
      contratacoes: contratacoes.filter((c) => c.vaga.id === id),
      minhaCandidatura: candidaturas.find((c) => c.vaga.id === id && c.status !== 'CANCELADA'),
      avaliacoes: avaliacoes.slice(0, 3),
    };
  }, id);

  const executar = async (acao: () => Promise<unknown>) => {
    setEnviando(true);
    setErroAcao('');
    try {
      await acao();
      await recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const confirmarDesistencia = (candidaturaId: string) =>
    Alert.alert('Desistir da candidatura?', 'A empresa deixará de ver você entre os candidatos desta vaga.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Desistir', style: 'destructive', onPress: () => void executar(() => desistirDaCandidatura(candidaturaId)) },
    ]);

  if (!dados) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScreenHeader title="Turno" onBack={() => router.back()} />
          {erro ? <ErrorState text={erro} onRetry={recarregar} /> : <LoadingState />}
        </View>
      </SafeAreaView>
    );
  }

  const { vaga } = dados;
  const aberta = vaga.status === 'ABERTA' && vaga.data >= hojeIso();
  const rotuloVaga = rotuloDaVaga[vaga.status];
  const resumo = resumoDoTurno(vaga.valorTurno);
  const turnoDoPrestador = (prestadorId: string) => dados.contratacoes.find((c) => c.prestador.id === prestadorId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={ehEmpresa ? 'Sua vaga' : 'Turno'} onBack={() => router.back()} />

        <View style={styles.hero}>
          <View style={styles.companyRow}>
            <View style={styles.companyIcon}><Ionicons name="storefront" size={24} color={colors.primary} /></View>
            <View style={styles.flex}>
              <Text style={styles.companyName}>{vaga.empresa.nome}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.star} />
                <Text style={styles.muted}>{formatarNota(vaga.empresa.notaMedia)} ({plural(vaga.empresa.totalAvaliacoes, 'avaliação', 'avaliações')})</Text>
                {!ehEmpresa && vaga.distanciaKm !== null ? <Text style={styles.muted}>• {formatarDistancia(vaga.distanciaKm)}</Text> : null}
              </View>
            </View>
            <Pill label={rotuloVaga.label} tone={rotuloVaga.tone} />
          </View>
          <Text style={styles.role}>{vaga.titulo}</Text>
          <Text style={styles.category}>{vaga.categoria.nome}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Ionicons name="calendar-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>DATA</Text><Text style={styles.infoValue}>{formatarDia(vaga.data)}</Text></View></View>
            <View style={styles.infoItem}><Ionicons name="time-outline" size={20} color={colors.primary} /><View><Text style={styles.infoLabel}>HORÁRIO</Text><Text style={styles.infoValue}>{formatarHorario(vaga.horaInicio, vaga.horaFim)}</Text></View></View>
          </View>
          {vaga.endereco ? <View style={styles.addressRow}><Ionicons name="location-outline" size={19} color={colors.inkSoft} /><Text style={styles.address}>{vaga.endereco}</Text></View> : null}
          {vaga.descricao ? <Text style={styles.description}>{vaga.descricao}</Text> : null}
        </View>

        {ehEmpresa ? (
          <View style={styles.valueCard}>
            <ValueRow label="Valor do turno" value={formatarMoeda(resumo.valorTurno)} />
            <ValueRow label="Taxa da plataforma (10%)" value={formatarMoeda(resumo.taxaPlataforma)} />
            <View style={styles.divider} />
            <ValueRow label="Total por profissional" value={formatarMoeda(resumo.valorTotal)} strong />
            <Text style={styles.valueHint}>{vaga.status === 'ABERTA' ? plural(vaga.vagasDisponiveis, 'posição aberta', 'posições abertas') : 'Todas as posições foram preenchidas.'}</Text>
          </View>
        ) : (
          <View style={styles.payCard}>
            <View style={styles.flex}>
              <Text style={styles.payLabel}>VOCÊ RECEBE</Text>
              <Text style={styles.payValue}>{formatarMoeda(vaga.valorTurno)}</Text>
              <Text style={styles.payHint}>Pago pelo Chama e liberado assim que a empresa confirmar a conclusão do turno.</Text>
            </View>
            <Ionicons name="shield-checkmark" size={28} color="#C9F2E5" />
          </View>
        )}

        {erroAcao ? <Notice text={erroAcao} /> : null}

        {ehEmpresa ? (
          <>
            <SectionTitle title={`Candidatos (${dados.candidatos.length})`} />
            {dados.candidatos.length === 0 ? (
              <EmptyState icon="people-outline" title="Nenhum candidato ainda" text="Assim que profissionais se candidatarem a esta vaga, eles aparecem aqui." />
            ) : (
              dados.candidatos.map((candidatura) => {
                const rotulo = rotuloDaCandidatura[candidatura.status];
                const turno = turnoDoPrestador(candidatura.prestador.id);
                const podeSelecionar = candidatura.status === 'PENDENTE' && aberta;
                return (
                  <View key={candidatura.id} style={styles.candidateCard}>
                    <View style={styles.candidateTop}>
                      <Avatar initials={iniciais(candidatura.prestador.nome)} size={46} />
                      <View style={styles.flex}>
                        <Text style={styles.candidateName}>{candidatura.prestador.nome}</Text>
                        <Text style={styles.muted}>{candidatura.prestador.funcao || 'Profissional'}</Text>
                        <View style={styles.ratingRow}><Ionicons name="star" size={12} color={colors.star} /><Text style={styles.muted}>{formatarNota(candidatura.prestador.notaMedia)} • {plural(candidatura.prestador.turnosConcluidos, 'turno', 'turnos')}</Text></View>
                      </View>
                      <Pill label={candidatura.status === 'PENDENTE' ? 'Novo' : rotulo.label} tone={candidatura.status === 'PENDENTE' ? 'primary' : rotulo.tone} />
                    </View>
                    <View style={styles.candidateActions}>
                      <Pressable
                        onPress={() => router.push({ pathname: '/profissional/[id]', params: { id: candidatura.prestador.id, candidaturaId: candidatura.id, vagaId: vaga.id } })}
                        style={styles.outlineButton}
                      >
                        <Text style={styles.outlineText}>Ver perfil</Text>
                      </Pressable>
                      {podeSelecionar ? (
                        <Pressable onPress={() => router.push({ pathname: '/selecao/[candidaturaId]', params: { candidaturaId: candidatura.id, vagaId: vaga.id } })} style={styles.fillButton}>
                          <Text style={styles.fillText}>Selecionar</Text>
                        </Pressable>
                      ) : turno ? (
                        <Pressable onPress={() => router.push(`/turno/${turno.id}`)} style={styles.fillButton}>
                          <Text style={styles.fillText}>Ver turno</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <AcaoDoProfissional
              aberta={aberta}
              candidatura={dados.minhaCandidatura}
              turno={dados.contratacoes[0]}
              enviando={enviando}
              onCandidatar={() => void executar(() => candidatar(vaga.id))}
              onDesistir={confirmarDesistencia}
            />
            {dados.avaliacoes.length > 0 ? (
              <>
                <SectionTitle title="O que dizem da empresa" />
                {dados.avaliacoes.map((avaliacao) => (
                  <View key={avaliacao.id} style={styles.review}>
                    <View style={styles.reviewTop}><Text style={styles.reviewAuthor}>{avaliacao.autorNome}</Text><Stars value={avaliacao.nota} size={12} /></View>
                    {avaliacao.comentario ? <Text style={styles.reviewText}>{avaliacao.comentario}</Text> : null}
                  </View>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AcaoDoProfissional({
  aberta,
  candidatura,
  turno,
  enviando,
  onCandidatar,
  onDesistir,
}: {
  aberta: boolean;
  candidatura?: Candidatura;
  turno?: Contratacao;
  enviando: boolean;
  onCandidatar: () => void;
  onDesistir: (candidaturaId: string) => void;
}) {
  if (turno) {
    return (
      <View style={styles.actions}>
        <Notice tone="success" text="Você foi selecionado para este turno!" />
        <PrimaryButton label="Ver meu turno" icon="arrow-forward" onPress={() => router.push(`/turno/${turno.id}`)} />
      </View>
    );
  }
  if (candidatura?.status === 'PENDENTE') {
    return (
      <View style={styles.actions}>
        <Notice tone="warning" text="Candidatura enviada. Agora é com a empresa: o turno aparece em Turnos se você for selecionado." />
        <SecondaryButton label="Desistir da candidatura" icon="close" onPress={() => onDesistir(candidatura.id)} loading={enviando} />
      </View>
    );
  }
  if (candidatura?.status === 'RECUSADA' || !aberta) {
    return <Notice tone="warning" icon="information-circle" text="Esta vaga não está mais aberta para candidaturas." />;
  }
  return (
    <View style={styles.actions}>
      <PrimaryButton label="Quero este turno" icon="checkmark" onPress={onCandidatar} loading={enviando} />
      <Text style={styles.hint}>A empresa escolhe entre os candidatos. Você não paga nada para se candidatar.</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { padding: 20, paddingBottom: 40, gap: 18 },
  flex: { flex: 1 },
  hero: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 18 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  companyIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  companyName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  muted: { color: colors.inkSoft, fontSize: 12 },
  role: { color: colors.ink, fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginTop: 18 },
  category: { color: colors.primaryDark, fontSize: 13, fontWeight: '800', marginTop: 3 },
  infoGrid: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: 17, padding: 14, marginTop: 16, gap: 16 },
  infoItem: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  infoValue: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 15 },
  address: { flex: 1, color: colors.inkSoft, fontSize: 12 },
  description: { color: colors.ink, fontSize: 14, lineHeight: 21, marginTop: 15 },
  payCard: { backgroundColor: colors.wine, borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  payLabel: { color: '#CBBFC1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  payValue: { color: colors.surface, fontSize: 30, fontWeight: '900', marginTop: 6 },
  payHint: { color: '#CBBFC1', fontSize: 11, lineHeight: 16, marginTop: 6 },
  valueCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 17, gap: 10 },
  valueHint: { color: colors.inkSoft, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  actions: { gap: 12 },
  hint: { color: colors.inkSoft, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  candidateCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 15 },
  candidateTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  candidateName: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  candidateActions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  outlineButton: { flex: 1, minHeight: 44, borderRadius: radius.sm, borderWidth: 1.2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  fillButton: { flex: 1, minHeight: 44, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fillText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  reviewText: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 7 },
});
