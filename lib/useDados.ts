import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { mensagemDeErro } from './errors';

// Carrega os dados de uma tela e recarrega sempre que ela volta ao foco (ex.: depois de uma ação
// feita em outra tela). `chave` identifica os parâmetros da busca: quando muda (ex.: filtro de
// categoria), os dados antigos são descartados e a tela volta ao estado de loading.
export function useDados<T>(carregar: () => Promise<T>, chave = '') {
  const [dados, setDados] = useState<T>();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const carregarRef = useRef(carregar);
  carregarRef.current = carregar;
  const ultimaChamada = useRef(0);
  const ultimaChave = useRef(chave);

  const recarregar = useCallback(async () => {
    const chamada = ++ultimaChamada.current;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await carregarRef.current();
      if (chamada === ultimaChamada.current) setDados(resultado);
    } catch (e) {
      if (chamada === ultimaChamada.current) setErro(mensagemDeErro(e));
    } finally {
      if (chamada === ultimaChamada.current) setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (ultimaChave.current !== chave) {
        ultimaChave.current = chave;
        setDados(undefined);
      }
      void recarregar();
    }, [recarregar, chave]),
  );

  return { dados, erro, carregando, recarregar, setDados };
}
