import type { ReactNode } from 'react';

export interface SelectTriggerProps {
  /** Texto do valor selecionado (exibido em destaque). */
  value?: string;
  /** Placeholder quando nada está selecionado. */
  placeholder?: string;
  /** Rótulo acima do campo. */
  label?: string;
  /** Mensagem de erro (acende a borda e mostra o texto abaixo). */
  error?: string;
  /** Ícone à esquerda (ex.: <Building2 />). */
  leftIcon?: ReactNode;
  /** Abre o seletor. */
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  /** Dica de acessibilidade lida pelo leitor de tela. */
  accessibilityHint?: string;
}
