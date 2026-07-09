import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'home', name: 'Início', icon: 'home', route: '/(tabs)/(home)', isActive: true },
  { id: 'congress', name: 'O Congresso', icon: 'fire', route: '/(tabs)/(home)', screen: '(congresso)', badge: 2 },
  { id: 'contribute', name: 'Contribua', icon: 'hands-helping', route: '/(tabs)/(home)/contribua', isPremium: true },
  { id: 'events', name: 'Eventos', icon: 'calendar-alt', route: '/(tabs)/(events)', badge: 5 },
  { id: 'news', name: 'Notícias', icon: 'newspaper', route: '/(tabs)/(posts)' },
  { id: 'profile', name: 'Meu Perfil', icon: 'user-alt', route: '/(tabs)/(settings)' },
  { id: 'members', name: 'Membros', icon: 'users', route: 'users', screen: 'users' },
];

export const ANIMATION_CONFIG = {
  duration: 300,
  damping: 20,
  stiffness: 100,
};

export const SEARCH_DEBOUNCE_MS = 300;