# Auditoria Gluestack UI - Estrutura e Dependências

**Data:** 2025-10-22
**Versão do Projeto:** 1.0.0
**Status:** ✅ Correções Aplicadas - Ver [GLUESTACK_UI_CORRECTIONS.md](./GLUESTACK_UI_CORRECTIONS.md)

## 📊 Resumo Executivo

Este documento apresenta uma auditoria completa da estrutura Gluestack UI no projeto, identificando:
- ✅ Componentes UI implementados corretamente
- ⚠️ Importações diretas que deveriam usar wrappers
- ❌ Problemas de implementação
- 📦 Pacotes instalados vs componentes disponíveis

---

## 🏗️ Arquitetura Atual

### Estrutura de Componentes UI (`/src/components/ui/`)

O projeto utiliza **Gluestack UI v3.0** com uma arquitetura de **wrappers customizados**. Cada componente em `/components/ui/` é um wrapper que:

1. Importa o **factory/creator** do pacote `@gluestack-ui/*`
2. Configura estilos com **NativeWind/TailwindCSS**
3. Adiciona variantes e comportamentos customizados
4. Exporta um componente pronto para uso

### Componentes UI Implementados (27 componentes)

```
✅ actionsheet/       - Menu de ações bottom-sheet
✅ avatar/           - Avatar de usuário/imagem
✅ badge/            - Badge/etiqueta
✅ box/              - Container flexível
✅ button/           - Botão com variantes
✅ card/             - Cartão de conteúdo
✅ center/           - Container centralizado
✅ checkbox/         - Checkbox com estados
✅ divider/          - Divisor de seções
✅ form-control/     - Controle de formulário
✅ gluestack-ui-provider/ - Provider principal
✅ heading/          - Títulos/cabeçalhos
✅ hstack/           - Stack horizontal
✅ icon/             - Ícones
✅ input/            - Input de texto
✅ keyboard-avoiding-view/ - View que evita teclado
✅ link/             - Link navegável (NOVO!)
✅ modal/            - Modal/dialog
✅ pressable/        - Área clicável
✅ radio/            - Radio button
✅ scroll-view/      - View com scroll
✅ select/           - Select/dropdown
✅ skeleton/         - Skeleton loader
✅ spinner/          - Loading spinner
✅ switch/           - Switch toggle
✅ text/             - Texto estilizado
✅ vstack/           - Stack vertical
```

---

## 📦 Análise de Pacotes

### Pacotes Gluestack UI Instalados

| Pacote | Versão | Status | Componente UI |
|--------|--------|--------|---------------|
| `@gluestack-ui/actionsheet` | ^0.2.53 | ✅ Usado | `/components/ui/actionsheet` |
| `@gluestack-ui/avatar` | ^0.1.18 | ✅ Usado | `/components/ui/avatar` |
| `@gluestack-ui/button` | ^1.0.14 | ✅ Usado | `/components/ui/button` |
| `@gluestack-ui/checkbox` | ^0.1.39 | ✅ Usado | `/components/ui/checkbox` |
| `@gluestack-ui/core` | **^3.0.10** | ✅ **Core v3** | Base system |
| `@gluestack-ui/divider` | ^0.1.10 | ✅ Usado | `/components/ui/divider` |
| `@gluestack-ui/form-control` | ^0.1.19 | ✅ Usado | `/components/ui/form-control` |
| `@gluestack-ui/icon` | ^0.1.27 | ✅ Usado | `/components/ui/icon` |
| `@gluestack-ui/input` | ^0.1.38 | ✅ Usado | `/components/ui/input` |
| `@gluestack-ui/modal` | ^0.1.41 | ✅ Usado | `/components/ui/modal` |
| `@gluestack-ui/nativewind-utils` | **^1.0.26** | ✅ **Utils** | `tva`, `cn`, `withStyleContext` |
| `@gluestack-ui/overlay` | ^0.1.22 | ⚠️ Interno | Usado por outros componentes |
| `@gluestack-ui/pressable` | ^0.1.23 | ✅ Usado | `/components/ui/pressable` |
| `@gluestack-ui/radio` | ^0.1.40 | ✅ Usado | `/components/ui/radio` |
| `@gluestack-ui/select` | ^0.1.31 | ✅ Usado | `/components/ui/select` |
| `@gluestack-ui/spinner` | ^0.1.15 | ✅ Usado | `/components/ui/spinner` |
| `@gluestack-ui/switch` | ^0.1.29 | ✅ Usado | `/components/ui/switch` |
| `@gluestack-ui/toast` | ^1.0.9 | ❌ **SEM WRAPPER** | - |
| `@gluestack-ui/utils` | **^3.0.11** | ✅ **Utils v3** | Utilities |

### ⚠️ Pacotes Sem Wrapper

#### 1. Toast (`@gluestack-ui/toast`)
- **Status:** Instalado mas SEM componente wrapper em `/components/ui/`
- **Uso atual:** Importado diretamente em `src/contexts/TokenRefreshContext.tsx`
- **Problema:** Violação do padrão de wrapper
- **Ação recomendada:** Criar `/components/ui/toast/index.tsx`

---

## 🔍 Problemas Identificados

### ❌ Importações Diretas (Violações do Padrão)

#### 1. `src/components/Button.tsx`
```typescript
// ❌ INCORRETO
import { IButtonProps } from "@gluestack-ui/button/lib/types";

// ✅ CORRETO
// Usar tipos do wrapper em @/components/ui/button
type ButtonProps = React.ComponentProps<typeof Button>;
```
**Linha:** 2
**Problema:** Importa tipos diretamente do pacote em vez de usar o wrapper
**Impacto:** Quebra a abstração, dificulta manutenção

#### 2. `src/contexts/TokenRefreshContext.tsx`
```typescript
// ❌ INCORRETO
import { Toast } from '@gluestack-ui/toast';

// ✅ CORRETO
import { Toast } from '@/components/ui/toast';
// (após criar o wrapper)
```
**Linha:** 3
**Problema:** Importa componente diretamente sem wrapper
**Impacto:** Toast não configurado com o tema do app

### ✅ Importações Corretas (Utilities)

Estas importações são **corretas** pois são utilities, não componentes:

```typescript
// ✅ Correto - Utility function
import { cn } from "@gluestack-ui/nativewind-utils/cn";

// ✅ Correto - Hook
import { useDisclose } from "@gluestack-ui/hooks";
```

**Arquivos que usam corretamente:**
- `src/components/BannerCarousel.tsx` (linha 18)
- `src/components/DirectusImage.tsx` (linha 7)
- `src/components/SectionContainer.tsx` (linha 7)
- `src/components/common/Actionsheet.tsx` (linha 21)
- `src/components/AudioPlayer/AudioPlayer.tsx` (linha 11)

---

## 📋 Checklist de Correções

### Prioridade Alta

- [ ] **Criar wrapper Toast** em `/components/ui/toast/index.tsx`
- [ ] **Corrigir** `src/components/Button.tsx` - remover importação de tipos do pacote
- [ ] **Atualizar** `src/contexts/TokenRefreshContext.tsx` - usar wrapper de Toast

### Prioridade Média

- [ ] **Auditar** todos os átomos em `/components/atoms/` para garantir que usam `/components/ui/`
- [ ] **Verificar** se há outros componentes importando tipos diretamente dos pacotes
- [ ] **Documentar** padrão de uso de utilities vs componentes

### Prioridade Baixa

- [ ] **Avaliar** se `@gluestack-ui/overlay` precisa de wrapper (provavelmente não)
- [ ] **Considerar** atualizar pacotes individuais para versões v3.x (se disponível)

---

## 📚 Padrões de Uso

### ✅ Como Importar Componentes

```typescript
// ✅ SEMPRE use os wrappers de @/components/ui/
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

// ✅ Utilities podem ser importadas diretamente
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import { useDisclose } from '@gluestack-ui/hooks';
```

### ❌ O Que NÃO Fazer

```typescript
// ❌ NUNCA importe componentes diretamente dos pacotes
import { Button } from '@gluestack-ui/button';
import { Toast } from '@gluestack-ui/toast';

// ❌ NUNCA importe tipos dos pacotes
import { IButtonProps } from '@gluestack-ui/button/lib/types';
```

### Atomic Design + Gluestack UI

```typescript
// atoms/Button/index.tsx
import { Button as GluestackButton } from '@/components/ui/button';

// ✅ Wrapper com lógica adicional
export const Button = ({ onPress, ...props }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return <GluestackButton onPress={handlePress} {...props} />;
};
```

---

## 🎯 Recomendações

### 1. Sobre Versões dos Pacotes

**Situação Atual:**
- Core v3: `@gluestack-ui/core` (^3.0.10) ✅
- Utils v3: `@gluestack-ui/utils` (^3.0.11) ✅
- Componentes: Versões 0.x e 1.x

**Análise:**
A arquitetura atual está **CORRETA**. Gluestack UI v3.0 mantém pacotes individuais para componentes. As versões 0.x/1.x são compatíveis com core v3.

**Ação:** ✅ **Manter versões atuais** - não é necessário atualizar para v3.x

### 2. Componentes Faltantes

#### Toast Component
É o único componente **instalado mas sem wrapper**. Recomendações:

1. Criar `/components/ui/toast/index.tsx` seguindo o padrão dos outros componentes
2. Atualizar `TokenRefreshContext.tsx` para usar o wrapper
3. Adicionar ao guia de componentes do projeto

### 3. Pacotes Não Utilizados

**Análise:** Todos os pacotes instalados são utilizados (direta ou indiretamente).

**Pacote Overlay:**
- `@gluestack-ui/overlay` é usado internamente por Modal, Actionsheet, etc.
- ✅ **Manter instalado** - dependência interna

---

## 📈 Estatísticas

- **Total de pacotes Gluestack UI:** 19
- **Componentes UI implementados:** 27
- **Pacotes Core/Utils (v3.x):** 3
- **Pacotes de componentes:** 16
- **Wrappers faltantes:** 1 (toast)
- **Violações de padrão encontradas:** 2 arquivos

---

## 🔗 Referências

- [Gluestack UI v3.0 Release](https://github.com/gluestack/gluestack-ui/releases/tag/v3.0.0-alpha.5)
- [Documentação Gluestack UI](https://gluestack.io/ui/)
- [CLAUDE.md - Guia de Arquitetura do Projeto](../CLAUDE.md)

---

## ✅ Conclusão

A estrutura atual do projeto está **majoritariamente correta**:

- ✅ Arquitetura de wrappers bem implementada
- ✅ Versões compatíveis entre core v3 e componentes
- ✅ Separação clara entre utilities e componentes
- ⚠️ Pequenas correções necessárias (Toast wrapper, 2 importações)

**Próximos Passos:**
1. Criar wrapper Toast
2. Corrigir as 2 importações diretas identificadas
3. Documentar padrões de uso para novos desenvolvedores
