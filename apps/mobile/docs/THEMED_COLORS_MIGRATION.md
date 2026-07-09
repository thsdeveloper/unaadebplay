# Sistema de Cores Temáticas - Guia de Migração

Sistema completo de cores com suporte a temas dark/light implementado em todo o aplicativo.

## 📋 Resumo da Implementação

### Arquivos Criados

1. **`src/constants/colors.ts`** - Definições de cores para light e dark theme
2. **`src/hooks/useThemedColors.ts`** - Hook para acessar cores baseadas no tema atual

### Arquivos Atualizados Automaticamente

✅ **25 arquivos** tiveram seus imports atualizados automaticamente:

#### Páginas (Apps)
- `src/app/(tabs)/(events)/index.tsx`
- `src/app/(tabs)/(home)/contribua.tsx`
- `src/app/(tabs)/(home)/repertories.tsx`
- `src/app/(tabs)/(home)/youtube.tsx`
- `src/app/(tabs)/(home)/(profile)/[id].tsx`
- `src/app/(tabs)/(home)/users.tsx`
- `src/app/(tabs)/(home)/index.tsx`
- `src/app/(tabs)/(home)/(congresso)/[id].tsx`
- `src/app/(tabs)/(home)/(congresso)/hospedagem/index.tsx`
- `src/app/(tabs)/(home)/(congresso)/cartao-acesso.tsx`
- `src/app/(tabs)/(posts)/_layout.tsx`
- `src/app/(tabs)/(home)/_layout.tsx`
- `src/app/(tabs)/(settings)/_layout.tsx`

#### Componentes
- `src/components/HeaderDrawer.tsx`
- `src/components/AudioPlayer/PlayerControls.tsx`
- `src/components/CustomCarousel/CarouselItemCongress.tsx`
- `src/components/CustomCarousel/CarouselItemUsers.tsx`
- `src/components/CustomCarousel/CarouselItemRepertories.tsx`
- `src/components/BannerCarouselUsers.tsx`

### Arquivos Removidos

- ❌ `src/constants/colors.js` (substituído por `colors.ts`)

## 🎨 Como Funciona

### Antes (Sistema Antigo)

```tsx
import colors from "@/constants/colors";

export default function MyComponent() {
  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

**Problema:** Cores fixas, não respondem a mudanças de tema.

### Depois (Sistema Novo)

```tsx
import { useThemedColors } from "@/hooks/useThemedColors";

export default function MyComponent() {
  const colors = useThemedColors();

  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

**Benefícios:**
- ✅ Cores mudam automaticamente quando o tema muda
- ✅ Suporte completo a dark/light theme
- ✅ Memoizado para performance
- ✅ Type-safe com TypeScript

## 📊 Paleta de Cores

### Cores Temáticas (Mudam com o tema)

| Nome da Cor | Light Theme | Dark Theme | Uso |
|------------|-------------|------------|-----|
| `background` | #FFFFFF | #111827 | Fundo principal |
| `backgroundSecondary` | #F3F4F6 | #1F2937 | Fundo secundário |
| `surface` | #FFFFFF | #1F2937 | Cards, modais |
| `text` | #111827 | #F9FAFB | Texto principal |
| `textSecondary` | #4B5563 | #D1D5DB | Texto secundário |
| `textMuted` | #9CA3AF | #9CA3AF | Texto desabilitado |
| `border` | #E5E7EB | #374151 | Bordas |
| `overlay` | rgba(0,0,0,0.4) | rgba(0,0,0,0.6) | Overlays |

### Cores da Marca (Fixas)

| Nome da Cor | Valor | Uso |
|------------|-------|-----|
| `primary` | #E51C44 | Cor primária da marca |
| `secundary` | #0E1647 | Cor secundária |
| `secundary2` | #243189 | Variação secundária |
| `secundary3` | #495BCC | Variação secundária |

### Cores de Status

| Nome da Cor | Valor | Uso |
|------------|-------|-----|
| `success` | #10B981 | Sucesso, confirmações |
| `error` | #EF4444 | Erros, alertas |
| `warning` | #F59E0B | Avisos |
| `info` | #3B82F6 | Informações |

## 🔧 API do Hook useThemedColors

```typescript
interface AppColors {
  // Brand
  primary: string;
  secundary: string;
  secundary2: string;
  secundary3: string;

  // UI (theme-aware)
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;

  // Text (theme-aware)
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Borders
  border: string;
  divider: string;

  // Status
  success: string;
  error: string;
  warning: string;
  info: string;

  // Utility
  black: string;
  white: string;
  accent: string;
  purple: string;
  pink: string;
  gold: string;

  // Overlays (theme-aware)
  overlay: string;
  overlayLight: string;
  overlayHeavy: string;

  // Alphas (theme-aware)
  primaryAlpha: string;
  errorAlpha: string;
  successAlpha: string;
  purpleAlpha: string;

  // Decorative
  bag1Bg through bag11Bg: string;
}
```

## 📝 Exemplos de Uso

### Em Componentes Funcionais

```tsx
import { useThemedColors } from "@/hooks/useThemedColors";

export function MyCard() {
  const colors = useThemedColors();

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>Title</Text>
      <Text style={{ color: colors.textSecondary }}>Subtitle</Text>
    </View>
  );
}
```

### Em StyleSheet

```tsx
import { useThemedColors } from "@/hooks/useThemedColors";
import { StyleSheet } from "react-native";

export function MyComponent() {
  const colors = useThemedColors();
  const styles = createStyles(colors);

  return <View style={styles.container} />;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
  },
});
```

### Com NativeWind (Recomendado)

```tsx
// Para componentes novos, prefira NativeWind que já suporta tema
import { View, Text } from "react-native";

export function MyComponent() {
  return (
    <View className="bg-white dark:bg-gray-900">
      <Text className="text-gray-900 dark:text-white">
        Hello
      </Text>
    </View>
  );
}
```

## 🚀 Migração de Componentes Existentes

### Passo a Passo

1. **Substituir import:**
   ```tsx
   // Antes
   import colors from "@/constants/colors";

   // Depois
   import { useThemedColors } from "@/hooks/useThemedColors";
   ```

2. **Adicionar hook no componente:**
   ```tsx
   export function MyComponent() {
     const colors = useThemedColors(); // Adicionar esta linha
     // ...resto do código
   }
   ```

3. **Usar as cores normalmente:**
   ```tsx
   <View style={{ backgroundColor: colors.background }} />
   ```

## ⚡ Performance

- **Memoização**: Hook usa `useMemo` para evitar re-cálculos
- **Re-renders**: Componentes só re-renderizam quando o tema muda
- **Bundle size**: Adiciona ~2KB ao bundle

## 🎯 Compatibilidade

### Backward Compatibility

O arquivo antigo `colors.js` foi removido, mas mantemos compatibilidade via:

```typescript
// src/constants/colors.ts
export default lightColors; // Para imports legados
```

Componentes que ainda importam `colors` sem usar o hook receberão sempre o tema light até serem migrados.

## ✅ Checklist de Migração

Para cada componente que usa cores:

- [ ] Substituir `import colors from "@/constants/colors"` por `import { useThemedColors } from "@/hooks/useThemedColors"`
- [ ] Adicionar `const colors = useThemedColors();` no início do componente
- [ ] Verificar se todas as cores usadas existem na nova interface
- [ ] Testar em dark e light theme
- [ ] Verificar se não há cores hardcoded que devem ser temáticas

## 📚 Referências

- Documentação do tema: `docs/THEME_SYSTEM.md`
- Hook useTheme: `src/hooks/useTheme.ts`
- Hook useThemedColors: `src/hooks/useThemedColors.ts`
- Constantes de cores: `src/constants/colors.ts`
- Context do tema: `src/contexts/ThemeContext.tsx`

## 🐛 Troubleshooting

### Erro: "colors is undefined"

**Causa:** Hook não foi adicionado ao componente.

**Solução:**
```tsx
export function MyComponent() {
  const colors = useThemedColors(); // Adicionar esta linha
  // ...
}
```

### Cores não mudam com o tema

**Causa:** Componente não está usando o hook.

**Solução:** Seguir o guia de migração acima.

### TypeScript reclama de propriedade inexistente

**Causa:** Tentando acessar cor que não existe na interface.

**Solução:** Verificar `AppColors` interface em `src/constants/colors.ts` para ver cores disponíveis.
