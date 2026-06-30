import { useState, useCallback, useContext } from 'react';
import { getItems } from '@/services/items';
import { CongressType } from '@/types/CongressType';
import { handleErrors } from '@/utils/directus';
import AlertContext from '@/contexts/AlertContext';
import { UseCongressDataReturn } from '../types';

export const useCongressData = (): UseCongressDataReturn => {
  const [congress, setCongress] = useState<CongressType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const alert = useContext(AlertContext);

  const loadCongress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Tabela 'congressos' (plural) no Supabase; poster é uma coluna de texto (path do Storage).
      const response = await getItems<CongressType[]>('congressos', {
        sort: ['-date_start'],
      });

      setCongress(response ?? []);
    } catch (err: any) {
      const message = err?.message || 'Erro ao carregar dados';
      setError(message);
      alert.error(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  return {
    congress,
    isLoading,
    error,
    loadCongress
  };
};