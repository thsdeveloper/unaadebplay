import { useEffect, useState } from 'react';
import { sectorsService } from '@/services/sectors';

/**
 * Mapa `id → nome` dos setores, carregado uma única vez. Resolve o UUID opaco de
 * `profile.sector` (o RPC do diretório devolve só o id) para um rótulo legível,
 * sem acoplar cada linha a um fetch. Falha em silêncio (retorna mapa vazio).
 */
export function useSectorMap(): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    sectorsService
      .getSectors()
      .then((list) => {
        if (!alive) return;
        const next: Record<string, string> = {};
        for (const sec of list) next[sec.id] = sec.title;
        setMap(next);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return map;
}
