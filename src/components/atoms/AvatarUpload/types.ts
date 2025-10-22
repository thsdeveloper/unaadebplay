export interface AvatarUploadProps {
  value?: string;
  onChange: (uri: string) => void;
  size?: number;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}