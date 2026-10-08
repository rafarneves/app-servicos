import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { buscarUsuarioAtual } from '../lib/auth';
import type { UsuarioAtual } from '../lib/types';
import { Notice } from './ui';

// Aviso de modo limitado enquanto o cadastro está em análise. Some sozinho quando aprovado.
export function BannerVerificacao() {
  const [usuario, setUsuario] = useState<UsuarioAtual | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      buscarUsuarioAtual()
        .then((dados) => ativo && setUsuario(dados))
        .catch(() => undefined); // Aviso não é crítico: em caso de erro, apenas não aparece.
      return () => {
        ativo = false;
      };
    }, []),
  );

  if (usuario?.statusVerificacao !== 'PENDENTE') return null;

  const texto =
    usuario.role === 'EMPRESA'
      ? 'Seu cadastro está em análise. Você já pode explorar o app, mas só poderá publicar vagas e selecionar profissionais depois da aprovação.'
      : 'Seu cadastro está em análise. Você já pode ver as vagas, mas só poderá se candidatar depois da aprovação.';

  return <Notice tone="warning" text={texto} />;
}
