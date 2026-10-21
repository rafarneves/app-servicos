import type { CandidaturaStatus, ContratacaoStatus, StatusPagamento, VagaStatus } from './types';

// Formatação de datas, notas e status para exibição nas telas.

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const pad = (n: number) => String(n).padStart(2, '0');

// Data local de hoje como YYYY-MM-DD (mesmo formato do campo `data` da API).
export function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const mesAtualIso = () => hojeIso().slice(0, 7);

function paraData(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function diasAte(data: string) {
  const hoje = paraData(hojeIso());
  return Math.round((paraData(data).getTime() - hoje.getTime()) / 86400000);
}

// "Hoje", "Amanhã", "Ontem" ou "Sex, 16 ago".
export function formatarDia(data: string) {
  const diff = diasAte(data);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  const d = paraData(data);
  return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
}

// "14 AGO"
export function formatarDataCurta(data: string) {
  const d = paraData(data);
  return `${pad(d.getDate())} ${MESES[d.getMonth()].toUpperCase()}`;
}

export const formatarHorario = (inicio: string, fim: string) => `${inicio} – ${fim}`;

// Instante ISO como "14 ago, 06:02".
export function formatarInstante(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatarMesAno(iso: string) {
  const d = new Date(iso);
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export const formatarNota = (nota: number | null) => (nota === null ? 'Novo' : nota.toFixed(1).replace('.', ','));

export const formatarDistancia = (km: number | null) => (km === null ? '' : `${km.toFixed(1).replace('.', ',')} km`);

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  return hora < 18 ? 'Boa tarde' : 'Boa noite';
}

export const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;

// Status

type Tom = 'neutral' | 'success' | 'warning' | 'primary';
type Rotulo = { label: string; tone: Tom };

// Contratação ativa: conta para a regra de um turno por data.
export const turnoAtivo = (status: ContratacaoStatus) =>
  status === 'CONFIRMADA' || status === 'EM_ANDAMENTO' || status === 'AGUARDANDO_CONFIRMACAO';

export const rotuloDoTurno: Record<ContratacaoStatus, Rotulo> = {
  CONFIRMADA: { label: 'Confirmado', tone: 'success' },
  EM_ANDAMENTO: { label: 'Em andamento', tone: 'primary' },
  AGUARDANDO_CONFIRMACAO: { label: 'Aguardando confirmação', tone: 'warning' },
  CONCLUIDA: { label: 'Concluído', tone: 'neutral' },
  CANCELADA: { label: 'Cancelado', tone: 'neutral' },
};

export const rotuloDaCandidatura: Record<CandidaturaStatus, Rotulo> = {
  PENDENTE: { label: 'Aguardando a empresa', tone: 'warning' },
  SELECIONADA: { label: 'Selecionado', tone: 'success' },
  RECUSADA: { label: 'Não selecionado', tone: 'neutral' },
  CANCELADA: { label: 'Cancelada', tone: 'neutral' },
};

export const rotuloDaVaga: Record<VagaStatus, Rotulo> = {
  ABERTA: { label: 'Aberta', tone: 'success' },
  PREENCHIDA: { label: 'Preenchida', tone: 'neutral' },
  CANCELADA: { label: 'Cancelada', tone: 'neutral' },
};

export const rotuloDoPagamento: Record<StatusPagamento, Rotulo> = {
  RETIDO: { label: 'Retido em escrow', tone: 'warning' },
  LIBERADO: { label: 'Liberado', tone: 'success' },
  ESTORNADO: { label: 'Estornado', tone: 'neutral' },
};
