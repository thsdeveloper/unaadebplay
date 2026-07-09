export interface DatePickerTriggerProps {
  value?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}