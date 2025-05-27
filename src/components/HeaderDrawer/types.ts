import { IconName } from '@expo/vector-icons/FontAwesome5';
import { Href } from 'expo-router';

export interface MenuItem {
  id: string;
  name: string;
  icon: IconName;
  route: Href<any>;
  screen?: string;
  isActive?: boolean;
  badge?: number;
  isPremium?: boolean;
  disabled?: boolean;
}

export interface UserProfileData {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  lastAccess?: string;
  role?: string;
  isOnline?: boolean;
  isPremium?: boolean;
}

export interface QuickAction {
  id: string;
  icon: IconName;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface HeaderDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}