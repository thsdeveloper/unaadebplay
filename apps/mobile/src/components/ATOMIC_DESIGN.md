# Atomic Design Structure

Este projeto implementa a metodologia Atomic Design para organização de componentes React Native.

## Estrutura

### 🔵 Atoms (`/atoms`)
Componentes básicos e indivisíveis que servem como blocos de construção fundamentais.

- **Button**: Botões com variantes (primary, secondary, ghost, outline)
- **Input**: Campo de entrada com estados e validação
- **Text**: Componente de texto com variantes tipográficas
- **Icon**: Wrapper unificado para ícones
- **Logo**: Logo da aplicação com animações opcionais
- **Divider**: Divisor visual
- **Checkbox**: Checkbox com feedback háptico
- **Link**: Links de navegação
- **LoadingSpinner**: Indicadores de carregamento
- **GradientBackground**: Fundo com gradiente

### 🟢 Molecules (`/molecules`)
Grupos simples de átomos que funcionam juntos como uma unidade.

- **FormField**: Label + Input + Error message
- **BiometricButton**: Botão especializado para autenticação biométrica
- **RememberMeCheckbox**: Checkbox "Lembrar-me" com link "Esqueci a senha"
- **SocialLoginButton**: Botões de login social (Google, Facebook, etc)
- **PasswordStrengthIndicator**: Indicador visual de força da senha
- **Toast**: Notificações temporárias

### 🟠 Organisms (`/organisms`)
Grupos complexos de moléculas e/ou grupos de átomos que formam seções distintas.

- **LoginForm**: Formulário completo de login
- **SignUpForm**: Formulário completo de cadastro
- **AuthHeader**: Cabeçalho das telas de autenticação
- **AuthFooter**: Rodapé das telas de autenticação
- **BiometricLogin**: Seção completa de login biométrico

### 🔴 Templates (`/templates`)
Estruturas de página que organizam organismos e outros componentes.

- **AuthTemplate**: Template base para todas as páginas de autenticação

## Princípios de Uso

### 1. Composição sobre Herança
```tsx
// ❌ Evite
class SpecialButton extends Button { }

// ✅ Prefira
<Button variant="special" />
```

### 2. Props Bem Definidas
```tsx
// Cada componente tem uma interface clara
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  // ...
}
```

### 3. Responsabilidade Única
- **Atoms**: Apenas apresentação
- **Molecules**: Lógica simples de UI
- **Organisms**: Lógica de negócio e estado local
- **Templates**: Layout e estrutura

### 4. Reutilização
```tsx
// Import direto de categorias
import { Button, Text, Icon } from '@/components/atoms';
import { FormField, Toast } from '@/components/molecules';
import { LoginForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';
```

## Exemplos de Uso

### Criando uma nova tela de autenticação
```tsx
import { AuthTemplate } from '@/components/templates';
import { AuthHeader, AuthFooter } from '@/components/organisms';

export default function ForgotPassword() {
  return (
    <AuthTemplate>
      <AuthHeader 
        title="Recuperar Senha"
        subtitle="Digite seu email para receber instruções"
      />
      
      {/* Seu conteúdo aqui */}
      
      <AuthFooter showSignIn />
    </AuthTemplate>
  );
}
```

### Usando componentes atômicos
```tsx
import { Button, Text, Icon } from '@/components/atoms';

<Button 
  variant="primary"
  size="large"
  leftIcon={<Icon family="MaterialIcons" name="save" />}
>
  <Text>Salvar</Text>
</Button>
```

## Convenções de Nomenclatura

1. **Arquivos**: PascalCase (ex: `Button.tsx`)
2. **Pastas**: PascalCase para componentes (ex: `/Button`)
3. **Exports**: Named exports com re-export em index
4. **Props**: Interface com sufixo `Props` (ex: `ButtonProps`)

## Manutenção

Ao adicionar novos componentes:

1. Identifique a categoria correta (atom, molecule, organism, template)
2. Crie a pasta do componente com arquivo principal e index
3. Adicione ao arquivo index da categoria
4. Documente props e uso básico
5. Mantenha a responsabilidade única do componente