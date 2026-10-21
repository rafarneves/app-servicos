import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, Field, LoadingState, Notice, PrimaryButton } from '../../components/ui';
import { listarCategorias } from '../../lib/categorias';
import { mensagemDeErro } from '../../lib/errors';
import { hojeIso } from '../../lib/formato';
import { formatarMoeda, resumoDoTurno } from '../../lib/precos';
import { colors, radius } from '../../lib/theme';
import { useDados } from '../../lib/useDados';
import { dataBrParaIso, horaValida, mascaraData, mascaraHora, somenteDigitos } from '../../lib/validacao';
import { criarVaga } from '../../lib/vagas';

type Campo = 'titulo' | 'data' | 'horaInicio' | 'horaFim' | 'quantidade';

export default function NewOpportunityScreen() {
  const categorias = useDados(listarCategorias);
  const [categoriaId, setCategoriaId] = useState<string>();
  const [form, setForm] = useState({ titulo: '', data: '', horaInicio: '', horaFim: '', quantidade: '1', descricao: '' });
  const [erros, setErros] = useState<Partial<Record<Campo | 'categoria', string>>>({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const categoria = categorias.dados?.find((c) => c.id === categoriaId);
  const quantidade = Number(somenteDigitos(form.quantidade)) || 0;
  // Só exibição: o valor vem da categoria e o servidor recalcula. O app nunca envia preço.
  const resumo = categoria ? resumoDoTurno(categoria.valorMedioSugerido) : null;

  const alterar = (campo: keyof typeof form, mascara?: (valor: string) => string) => (valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: mascara ? mascara(valor) : valor }));

  const escolherCategoria = (id: string, nome: string) => {
    setCategoriaId(id);
    // Sugere o título pela categoria enquanto o campo não foi personalizado.
    setForm((atual) => (atual.titulo && categorias.dados?.every((c) => c.nome !== atual.titulo) ? atual : { ...atual, titulo: nome }));
  };

  const validar = () => {
    const data = dataBrParaIso(form.data);
    const novosErros = {
      categoria: categoria ? undefined : 'Escolha a categoria do turno.',
      titulo: form.titulo.trim() ? undefined : 'Informe a função.',
      data: !data ? 'Informe uma data válida (DD/MM/AAAA).' : data < hojeIso() ? 'A data deve ser a partir de hoje.' : undefined,
      horaInicio: horaValida(form.horaInicio) ? undefined : 'Use HH:MM.',
      horaFim: !horaValida(form.horaFim) ? 'Use HH:MM.' : form.horaFim === form.horaInicio ? 'Diferente do início.' : undefined,
      quantidade: quantidade >= 1 && quantidade <= 20 ? undefined : 'De 1 a 20.',
    };
    setErros(novosErros);
    return Object.values(novosErros).some(Boolean) ? null : data;
  };

  const publicar = async (data: string) => {
    setEnviando(true);
    setErroEnvio('');
    try {
      const vaga = await criarVaga({
        categoriaId: categoriaId!,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        data,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        vagasDisponiveis: quantidade,
      });
      Alert.alert('Turno publicado!', 'Profissionais próximos já podem se candidatar.', [
        { text: 'Ver vaga', onPress: () => router.replace(`/vaga/${vaga.id}`) },
        { text: 'Fechar', style: 'cancel', onPress: () => router.back() },
      ]);
    } catch (erro) {
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  const revisar = () => {
    const data = validar();
    if (!data || !resumo) return;
    const linhas = [
      `${form.titulo.trim()} • ${form.data}, ${form.horaInicio} – ${form.horaFim}`,
      `Valor do turno: ${formatarMoeda(resumo.valorTurno)}`,
      `Taxa da plataforma (10%): ${formatarMoeda(resumo.taxaPlataforma)}`,
      `Total por profissional: ${formatarMoeda(resumo.valorTotal)}`,
      quantidade > 1 ? `Total para ${quantidade} profissionais: ${formatarMoeda(resumo.valorTotal * quantidade)}` : null,
      '\nO valor só é retido em escrow quando você selecionar o profissional.',
    ].filter(Boolean);
    Alert.alert('Revisar turno', linhas.join('\n'), [
      { text: 'Editar', style: 'cancel' },
      { text: 'Publicar', onPress: () => void publicar(data) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Fechar"><Ionicons name="close" size={24} color={colors.ink} /></Pressable><Text style={styles.headerTitle}>Novo turno</Text><View style={styles.spacer} /></View>
          <View style={styles.intro}><Text style={styles.title}>Quem você precisa?</Text><Text style={styles.subtitle}>Preencha os detalhes para encontrar o profissional ideal.</Text></View>

          {!categorias.dados ? (
            categorias.erro ? <ErrorState text={categorias.erro} onRetry={categorias.recarregar} /> : <LoadingState />
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roles}>{categorias.dados.map((c) => { const active = c.id === categoriaId; return <Pressable key={c.id} onPress={() => escolherCategoria(c.id, c.nome)} style={[styles.role, active && styles.roleActive]}><Text style={[styles.roleText, active && styles.roleTextActive]}>{c.nome}</Text></Pressable>; })}</ScrollView>
                {erros.categoria ? <Text style={styles.error}>{erros.categoria}</Text> : null}
                <Field label="Função" icon="briefcase-outline" placeholder="Ex.: Padeiro(a)" value={form.titulo} onChangeText={alterar('titulo')} error={erros.titulo} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quando?</Text>
                <Field label="Data" icon="calendar-outline" placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} value={form.data} onChangeText={alterar('data', mascaraData)} error={erros.data} />
                <View style={styles.fieldRow}>
                  <View style={styles.half}><Field label="Início" icon="time-outline" placeholder="06:00" keyboardType="number-pad" maxLength={5} value={form.horaInicio} onChangeText={alterar('horaInicio', mascaraHora)} error={erros.horaInicio} /></View>
                  <View style={styles.half}><Field label="Término" icon="time-outline" placeholder="12:00" keyboardType="number-pad" maxLength={5} value={form.horaFim} onChangeText={alterar('horaFim', mascaraHora)} error={erros.horaFim} /></View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pagamento e vagas</Text>
                <View style={styles.fieldRow}>
                  <View style={styles.half}>
                    <Text style={styles.label}>Valor do turno</Text>
                    <View style={styles.readOnly}><Ionicons name="cash-outline" size={20} color={colors.inkSoft} /><Text style={styles.readOnlyText}>{resumo ? formatarMoeda(resumo.valorTurno) : 'Escolha a categoria'}</Text></View>
                  </View>
                  <View style={styles.half}><Field label="Quantidade" icon="people-outline" placeholder="1" keyboardType="number-pad" maxLength={2} value={form.quantidade} onChangeText={alterar('quantidade', somenteDigitos)} error={erros.quantidade} /></View>
                </View>
                <View style={styles.feeInfo}><Ionicons name="shield-checkmark" size={19} color={colors.success} /><Text style={styles.feeText}>O valor é definido pela categoria e é o que o profissional recebe. A taxa de 10% da plataforma é somada no total.</Text></View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalhes</Text>
                <Field label="Observações" icon="reader-outline" placeholder="Ex.: experiência com forno lastro, uniforme branco..." multiline value={form.descricao} onChangeText={alterar('descricao')} />
              </View>

              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryLabel}>TOTAL ESTIMADO{quantidade > 1 ? ` (${quantidade} PROFISSIONAIS)` : ''}</Text>
                  <Text style={styles.summaryValue}>{resumo ? formatarMoeda(resumo.valorTotal * Math.max(quantidade, 1)) : '–'}</Text>
                </View>
                {resumo ? <Text style={styles.summaryHint}>{formatarMoeda(resumo.valorTurno)} + {formatarMoeda(resumo.taxaPlataforma)} de taxa</Text> : null}
              </View>
              {erroEnvio ? <View style={styles.notice}><Notice text={erroEnvio} /></View> : null}
              <PrimaryButton label="Revisar e publicar" icon="arrow-forward" onPress={revisar} loading={enviando} />
              <Text style={styles.legal}>Você revisa o custo total antes da publicação.</Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream }, flex: { flex: 1 }, container: { padding: 20, paddingBottom: 34 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, close: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, spacer: { width: 44 },
  intro: { marginTop: 35 }, title: { color: colors.wine, fontSize: 31, fontWeight: '900', letterSpacing: -0.9 }, subtitle: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, marginTop: 7 },
  section: { marginTop: 27, gap: 15 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, label: { color: colors.ink, fontSize: 14, fontWeight: '700' }, roles: { gap: 8, paddingRight: 20 }, role: { borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, paddingVertical: 10 }, roleActive: { backgroundColor: colors.wine, borderColor: colors.wine }, roleText: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' }, roleTextActive: { color: colors.surface }, error: { color: colors.danger, fontSize: 12, fontWeight: '700', marginTop: -6 },
  fieldRow: { flexDirection: 'row', gap: 10 }, half: { flex: 1, gap: 8 }, readOnly: { minHeight: 55, borderRadius: radius.md, borderWidth: 1.2, borderColor: colors.border, backgroundColor: colors.muted, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 }, readOnlyText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '800' },
  feeInfo: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: colors.successSoft, borderRadius: 15, padding: 13 }, feeText: { flex: 1, color: '#2D6552', fontSize: 11, lineHeight: 16 },
  summary: { marginTop: 30, marginBottom: 17, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 15, gap: 4 }, summaryLabel: { color: colors.tabInactive, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 }, summaryValue: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 5 }, summaryHint: { color: colors.inkSoft, fontSize: 11 },
  notice: { marginBottom: 14 }, legal: { color: colors.tabInactive, fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 11, paddingHorizontal: 22 },
});
