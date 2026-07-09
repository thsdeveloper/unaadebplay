# 🎨 Atomic Design - Guia de Implementação

Este documento explica como a metodologia Atomic Design foi implementada no projeto UNAADEB Play.

## 📋 Índice

1. [Estrutura de Pastas](#estrutura-de-pastas)
2. [Níveis Atômicos](#níveis-atômicos)
3. [Componentes Implementados](#componentes-implementados)
4. [Como Usar](#como-usar)
5. [Criando Novos Componentes](#criando-novos-componentes)
6. [Boas Práticas](#boas-práticas)

## 📁 Estrutura de Pastas

```
src/components/
├── atoms/           # Componentes básicos indivisíveis
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   └── ...
├── molecules/       # Combinações simples de átomos
│   ├── FormField/
│   ├── BiometricButton/
│   └── ...
├── organisms/       # Seções complexas e autônomas
│   ├── LoginForm/
│   ├── AuthHeader/
│   └── ...
└── templates/       # Layouts de página
    ├── AuthTemplate/
    └── ...
```

## 🔬 Níveis Atômicos

### Atoms (Átomos)
Componentes mais básicos e reutilizáveis do sistema.

**Características:**
- Não podem ser divididos em partes menores
- Não possuem lógica de negócio
- Altamente reutilizáveis
- Sempre memoizados com `React.memo`

**Exemplos:**
```typescript
import { Button, Input, Text, Icon } from '@/components/atoms';

<Button variant="primary" onPress={handlePress}>
  Entrar
</Button>
```

### Molecules (Moléculas)
Grupos simples de átomos funcionando juntos.

**Características:**
- Combinam 2-4 átomos
- Lógica mínima (apenas UI)
- Reutilizáveis em diferentes contextos
- Props bem definidas

**Exemplos:**
```typescript
import { FormField, BiometricButton } from '@/components/molecules';

<FormField
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
/>
```

### Organisms (Organismos)
Componentes complexos com lógica própria.

**Características:**
- Combinam moléculas e átomos
- Possuem estado e lógica de negócio
- Podem fazer chamadas de API
- Específicos para um contexto

**Exemplos:**
```typescript
import { LoginForm, BiometricLogin } from '@/components/organisms';

<LoginForm
  onSubmit={handleLogin}
  loading={isLoading}
/>
```

### Templates
Estruturas de página sem conteúdo específico.

**Características:**
- Definem layout geral
- Recebem conteúdo via props/children
- Gerenciam animações de página
- Podem ter múltiplas variações

**Exemplos:**
```typescript
import { AuthTemplate } from '@/components/templates';

<AuthTemplate title="Bem-vindo">
  {/* Conteúdo da página */}
</AuthTemplate>
```

## 🎯 Componentes Implementados

### Átomos Disponíveis
- `Button` - Botões com variantes (primary, secondary, ghost)
- `Input` - Campos de entrada com validação
- `Text` - Tipografia consistente (heading, body, label, error)
- `Icon` - Wrapper para ícones do sistema
- `Logo` - Logo animado da aplicação
- `Divider` - Separadores visuais
- `Checkbox` - Checkboxes com feedback háptico
- `Link` - Links de navegação
- `LoadingSpinner` - Indicadores de carregamento
- `GradientBackground` - Fundos com gradiente

### Moléculas Disponíveis
- `FormField` - Campo completo com label e erro
- `BiometricButton` - Botão para autenticação biométrica
- `RememberMeCheckbox` - Checkbox "lembrar-me"
- `SocialLoginButton` - Botões de login social
- `PasswordStrengthIndicator` - Indicador de força da senha
- `Toast` - Notificações temporárias

### Organismos Disponíveis
- `LoginForm` - Formulário de login completo
- `SignUpForm` - Formulário de cadastro
- `AuthHeader` - Cabeçalho de páginas de autenticação
- `AuthFooter` - Rodapé de páginas de autenticação
- `BiometricLogin` - Seção de login biométrico

### Templates Disponíveis
- `AuthTemplate` - Template para páginas de autenticação

## 🚀 Como Usar

### 1. Importação Organizada
```typescript
// ✅ Bom - Importações organizadas por nível
import { Button, Text, Icon } from '@/components/atoms';
import { FormField, BiometricButton } from '@/components/molecules';
import { LoginForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';

// ❌ Evitar - Importações diretas
import Button from '@/components/atoms/Button/Button';
```

### 2. Composição de Componentes
```typescript
// Exemplo de página usando Atomic Design
export default function SignIn() {
  return (
    <AuthTemplate title="Entrar">
      <LoginForm onSubmit={handleLogin}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
        />
        <FormField
          label="Senha"
          type="password"
          value={password}
          onChangeText={setPassword}
        />
        <Button variant="primary" onPress={submit}>
          Entrar
        </Button>
      </LoginForm>
      
      <Divider text="ou" />
      
      <BiometricButton onPress={handleBiometric} />
    </AuthTemplate>
  );
}
```

## 🛠 Criando Novos Componentes

### 1. Determine o Nível Correto
```
Pode ser dividido? → NÃO → Átomo
É um grupo simples? → SIM → Molécula
Tem lógica complexa? → SIM → Organismo
É um layout? → SIM → Template
```

### 2. Estrutura de Arquivos
```
components/atoms/NewComponent/
├── index.tsx          # Componente principal
├── types.ts           # Tipos TypeScript
├── styles.ts          # Estilos (NativeWind)
├── NewComponent.test.tsx  # Testes
└── README.md          # Documentação (opcional)
```

### 3. Template de Átomo
```typescript
// atoms/NewAtom/index.tsx
import React, { memo } from 'react';
import { View } from 'react-native';
import { NewAtomProps } from './types';
import { getStyles } from './styles';

export const NewAtom = memo<NewAtomProps>(({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const styles = getStyles(variant);
  
  return (
    <View className={`${styles} ${className}`} {...props}>
      {children}
    </View>
  );
});

NewAtom.displayName = 'NewAtom';

// atoms/NewAtom/types.ts
export interface NewAtomProps {
  variant?: 'default' | 'special';
  children?: React.ReactNode;
  className?: string;
}

// atoms/NewAtom/styles.ts
export const getStyles = (variant: string) => {
  const base = 'p-4 rounded-lg';
  const variants = {
    default: 'bg-gray-100',
    special: 'bg-blue-100'
  };
  return `${base} ${variants[variant]}`;
};
```

### 4. Exportar no Index
```typescript
// atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { NewAtom } from './NewAtom'; // Adicionar aqui
```

## 📚 Boas Práticas

### 1. Nomenclatura
- Átomos: Nomes simples (`Button`, `Text`, `Icon`)
- Moléculas: Descritivas (`FormField`, `SearchBar`)
- Organismos: Funcionais (`LoginForm`, `UserProfile`)
- Templates: Com sufixo (`AuthTemplate`, `DashboardTemplate`)

### 2. Props
```typescript
// ✅ Bom - Props específicas e tipadas
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
}

// ❌ Evitar - Props genéricas
interface ButtonProps {
  style?: any;
  [key: string]: any;
}
```

### 3. Performance
```typescript
// Átomos - Sempre memo
export const Atom = memo(Component);

// Moléculas - Memo com comparação customizada
export const Molecule = memo(Component, (prev, next) => {
  return prev.value === next.value;
});

// Organismos - Avaliar caso a caso
export const Organism = Component; // Ou com memo se necessário
```

### 4. Estilização
```typescript
// Use classes do NativeWind
<View className="flex-1 bg-white p-4">

// Evite styles inline
<View style={{ flex: 1, backgroundColor: 'white' }}>
```

### 5. Testes
- **Átomos**: Teste todas as variantes e estados
- **Moléculas**: Teste interações entre átomos
- **Organismos**: Teste lógica de negócio
- **Templates**: Teste responsividade e layout

## 🎨 Exemplo Completo

Veja como a tela de login foi refatorada:

**Antes (Monolítico):**
```typescript
// 800+ linhas de código misturando UI e lógica
export default function SignIn() {
  // Todo código junto...
}
```

**Depois (Atomic Design):**
```typescript
// 200 linhas focadas apenas em lógica
export default function SignIn() {
  // Lógica de negócio
  
  return (
    <AuthTemplate>
      <LoginForm {...props} />
      <BiometricLogin {...props} />
      <AuthFooter {...props} />
    </AuthTemplate>
  );
}
```

## 🚦 Checklist de Implementação

Antes de criar um componente:
- [ ] Verificar se já existe um similar
- [ ] Determinar o nível atômico correto
- [ ] Planejar a interface de props
- [ ] Considerar variantes necessárias
- [ ] Pensar em reusabilidade

Durante a implementação:
- [ ] Seguir a estrutura de arquivos
- [ ] Adicionar tipos TypeScript
- [ ] Implementar memoização quando apropriado
- [ ] Usar NativeWind para estilos
- [ ] Documentar props complexas

Após implementar:
- [ ] Exportar no arquivo index
- [ ] Adicionar testes básicos
- [ ] Verificar performance
- [ ] Atualizar este README se necessário

---

## 📞 Suporte

Dúvidas sobre Atomic Design? Consulte:
- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [CLAUDE.md](../../../CLAUDE.md) - Diretrizes do projeto
- Exemplos implementados em `/src/components/`