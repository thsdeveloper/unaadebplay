export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Onde o seletor abre quando ainda não há valor escolhido.
   * Para data de nascimento, passe uma data ~18 anos atrás para o usuário
   * não precisar rolar décadas a partir de hoje.
   */
  initialPickerDate?: Date;
  /** Exibe a idade calculada na prévia (útil para data de nascimento). */
  showAge?: boolean;
}
