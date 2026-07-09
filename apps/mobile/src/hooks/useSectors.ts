import { useCallback, useEffect, useState } from 'react';
import { sectorsService, Sector } from '@/services/sectors';

/**
 * Cache em nível de módulo: os setores raramente mudam dentro de uma sessão,
 * então buscamos uma vez e reaproveitamos entre aberturas do seletor.
 */
let sectorsCache: Sector[] | null = null;

/**
 * Hook de dados dos setores (SRP): carrega sob demanda na primeira abertura,
 * reaproveita o cache e expõe um estado de erro explícito.
 *
 * Importante: `sectorsService.getSectors()` captura erros internamente e
 * retorna `[]` em caso de falha — portanto, "vazio após carregar" é tratado
 * como erro (sabemos que existem setores cadastrados), para que o estado
 * vazio nunca mascare uma indisponibilidade.
 */
export function useSectors(enabled: boolean) {
  const [sectors, setSectors] = useState<Sector[]>(sectorsCache ?? []);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(!!sectorsCache);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (sectorsCache) {
      setSectors(sectorsCache);
      setLoaded(true);
      return;
    }
    setLoading(true);
    setError(false);
    const data = await sectorsService.getSectors();
    if (data.length === 0) {
      setError(true);
    } else {
      sectorsCache = data;
      setSectors(data);
    }
    setLoaded(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const reload = useCallback(() => {
    sectorsCache = null;
    setLoaded(false);
    setError(false);
    load();
  }, [load]);

  return { sectors, loading, loaded, error, reload };
}
