import React, { useState } from 'react';
import { TextInput, View, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

const BRAND = '#E51C44';

export interface GlassInputProps {
  icon?: React.ReactNode;
  placeholder: string;
  value?: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string;
  /** Campo de senha: habilita o toggle de visibilidade */
  password?: boolean;
  inputRef?: React.RefObject<TextInput>;
  keyboardType?: any;
  returnKeyType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onSubmitEditing?: () => void;
  rightSlot?: React.ReactNode;
  /** Rótulo de acessibilidade do campo (lido pelo leitor de tela). */
  accessibilityLabel?: string;
}

/**
 * Input "vidro fosco" (glassmorphism) padrão das telas de autenticação:
 * fundo translúcido, borda que acende na cor de marca ao focar, ícone à esquerda,
 * toggle de senha opcional e mensagem de erro.
 */
export const GlassInput: React.FC<GlassInputProps> = ({
  icon, placeholder, value, onChangeText, onBlur, error, password,
  inputRef, keyboardType, returnKeyType, autoCapitalize = 'none', onSubmitEditing, rightSlot,
  accessibilityLabel,
}) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View>
      <View style={[styles.wrap, focused && styles.wrapFocused, !!error && styles.wrapError]}>
        {!!icon && <View style={styles.leading}>{icon}</View>}
        <TextInput
          ref={inputRef}
          style={styles.input}
          accessibilityLabel={accessibilityLabel}
          placeholder={placeholder}
          placeholderTextColor="rgba(226,232,240,0.45)"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          secureTextEntry={password && !show}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor={BRAND}
        />
        {password ? (
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} style={styles.trailing}>
            {show ? <EyeOff size={20} color="rgba(226,232,240,0.6)" /> : <Eye size={20} color="rgba(226,232,240,0.6)" />}
          </Pressable>
        ) : rightSlot}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  wrapFocused: {
    borderColor: 'rgba(229,28,68,0.85)',
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  wrapError: { borderColor: 'rgba(244,63,94,0.7)' },
  leading: { marginRight: 12 },
  trailing: { marginLeft: 8, padding: 2 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 16, height: '100%' },
  errorText: { color: '#FCA5A5', fontSize: 12, marginTop: 6, marginLeft: 4 },
});

export default GlassInput;
