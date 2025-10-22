# Sistema de Temas

Sistema completo de temas (dark/light) implementado seguindo os princípios de Clean Code, SOLID e Atomic Design.

## 🎨 Funcionalidades

- ✅ Tema claro (Light)
- ✅ Tema escuro (Dark)
- ✅ Tema automático (System) - detecta preferência do dispositivo
- ✅ Persistência da preferência do usuário
- ✅ Feedback háptico nas mudanças de tema
- ✅ Otimizado com memoização
- ✅ Integração completa com Gluestack UI

## 📁 Estrutura de Arquivos

### Types
- `src/types/theme.ts` - Tipos TypeScript para o sistema de temas

### Context & Hook
- `src/contexts/ThemeContext.tsx` - Context Provider para gerenciamento de estado
- `src/hooks/useTheme.ts` - Hook customizado para acessar o tema

### Componentes (Atomic Design)

#### Atoms
- `src/components/atoms/ThemeToggle/index.tsx` - Toggle de tema (2 variantes)

#### Organisms
- `src/components/organisms/PreferencesSection/index.tsx` - Seção de preferências

#### Providers
- `src/components/ThemedGluestackProvider.tsx` - Wrapper do Gluestack UI que usa o tema

## 🚀 Como Usar

### 1. Usar o Hook (em qualquer componente)

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { mode, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <View>
      <Text>Tema atual: {resolvedTheme}</Text>
      <Text>Modo selecionado: {mode}</Text>

      {/* Alternar entre light e dark */}
      <Button onPress={toggleTheme}>Toggle Theme</Button>

      {/* Definir tema específico */}
      <Button onPress={() => setTheme('dark')}>Dark Mode</Button>
      <Button onPress={() => setTheme('light')}>Light Mode</Button>
      <Button onPress={() => setTheme('system')}>Auto (System)</Button>
    </View>
  );
}
```

### 2. Usar o Componente ThemeToggle

```tsx
import { ThemeToggle } from '@/components/atoms';

// Versão completa (padrão)
<ThemeToggle variant="full" />

// Versão apenas ícone
<ThemeToggle variant="icon-only" />
```

### 3. Acessar Tema Resolvido

```tsx
const { resolvedTheme } = useTheme();

// resolvedTheme sempre será 'light' ou 'dark', nunca 'system'
// Se o usuário escolheu 'system', resolvedTheme reflete a preferência do dispositivo
```

## 🔧 API do Hook useTheme

```typescript
interface ThemeContextType {
  /** Modo atual: 'light' | 'dark' | 'system' */
  mode: ThemeMode;

  /** Tema resolvido: sempre 'light' ou 'dark' */
  resolvedTheme: 'light' | 'dark';

  /** Define o tema e persiste */
  setTheme: (mode: ThemeMode) => void;

  /** Alterna entre light e dark */
  toggleTheme: () => void;

  /** Indica se está carregando */
  isLoading: boolean;
}
```

## 💾 Persistência

O tema escolhido pelo usuário é automaticamente salvo no AsyncStorage com a chave `@unaadebplay:theme` e carregado na próxima sessão.

## 📱 Modo System

Quando o usuário seleciona `'system'`:
- O app detecta automaticamente a preferência de tema do dispositivo
- Atualiza automaticamente quando o usuário muda o tema do sistema
- `resolvedTheme` sempre reflete o tema atual

## ⚡ Performance

- **Memoização**: Todos os valores e callbacks são memoizados
- **Re-renders mínimos**: Componentes só re-renderizam quando o tema muda
- **Persistência async**: Salvamento no storage não bloqueia a UI

## 🎯 Princípios Aplicados

### SOLID
- **Single Responsibility**: ThemeContext apenas gerencia tema
- **Open/Closed**: Extensível via props e context
- **Dependency Inversion**: Usa abstrações (context, hooks)

### Clean Code
- Código auto-documentado
- Nomes descritivos
- Funções pequenas e focadas
- Separação de responsabilidades

### Atomic Design
- **Atoms**: ThemeToggle (menor unidade)
- **Organisms**: PreferencesSection (composição)
- **Templates**: UserInfoTemplate (layout completo)

## 🔄 Integração

O ThemeProvider está integrado na hierarquia principal de providers em `src/app/_layout.tsx`:

```tsx
<ThemeProvider>
  <ThemedGluestackProvider>
    {/* Resto da aplicação */}
  </ThemedGluestackProvider>
</ThemeProvider>
```

## 🎨 Componentes do Gluestack UI

Todos os componentes Gluestack UI (Button, Text, Input, etc.) automaticamente respondem à mudança de tema via NativeWind color scheme.

## 📝 Exemplo Completo

```tsx
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/atoms';

export default function SettingsScreen() {
  const { mode, resolvedTheme, setTheme } = useTheme();

  return (
    <ScrollView>
      {/* Toggle visual */}
      <ThemeToggle variant="full" />

      {/* Informações */}
      <Text>Modo selecionado: {mode}</Text>
      <Text>Tema aplicado: {resolvedTheme}</Text>

      {/* Controles manuais */}
      <Button onPress={() => setTheme('light')}>Claro</Button>
      <Button onPress={() => setTheme('dark')}>Escuro</Button>
      <Button onPress={() => setTheme('system')}>Automático</Button>
    </ScrollView>
  );
}
```
