export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}