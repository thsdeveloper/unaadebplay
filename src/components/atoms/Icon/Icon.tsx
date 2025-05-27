import React from 'react';
import { ViewStyle } from 'react-native';
import { 
  MaterialIcons, 
  FontAwesome5, 
  Ionicons, 
  Feather,
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
  Zocial
} from '@expo/vector-icons';

export type IconFamily = 
  | 'MaterialIcons'
  | 'FontAwesome5'
  | 'Ionicons'
  | 'Feather'
  | 'AntDesign'
  | 'Entypo'
  | 'FontAwesome'
  | 'MaterialCommunityIcons'
  | 'SimpleLineIcons'
  | 'Octicons'
  | 'Foundation'
  | 'EvilIcons'
  | 'Zocial';

interface IconProps {
  family?: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const iconFamilies = {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Feather,
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
  SimpleLineIcons,
  Octicons,
  Foundation,
  EvilIcons,
  Zocial,
};

export const Icon: React.FC<IconProps> = React.memo(({
  family = 'MaterialIcons',
  name,
  size = 24,
  color = 'white',
  style,
}) => {
  const IconComponent = iconFamilies[family] as any;

  if (!IconComponent) {
    console.warn(`Icon family "${family}" not found`);
    return null;
  }

  return (
    <IconComponent
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
});

Icon.displayName = 'Icon';