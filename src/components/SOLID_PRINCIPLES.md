# Princípios SOLID Aplicados no Sistema DirectusImage

## 📋 Visão Geral

A refatoração do sistema de imagens seguiu rigorosamente os princípios SOLID para criar uma arquitetura mais robusta, mantível e extensível.

## 🎯 S - Single Responsibility Principle (SRP)

### ✅ Implementação

**Cada componente tem uma única responsabilidade:**

#### DirectusImage (Base)
- **Responsabilidade**: Renderizar imagens do Directus com estados e cache
- **Não faz**: Lógica de negócio específica de avatares, banners, etc.

```tsx
// ✅ Foca apenas em renderizar imagens do Directus
const DirectusImage = ({ assetId, width, height, ... }) => {
  // Lógica de carregamento, cache e renderização
};
```

#### DirectusAvatar
- **Responsabilidade**: Renderizar avatares com fallback de iniciais
- **Não faz**: Renderização de banners ou cards

```tsx
// ✅ Especializado apenas em avatares
const DirectusAvatar = ({ assetId, name, size, ... }) => {
  // Lógica específica de avatares (iniciais, tamanhos predefinidos)
};
```

#### DirectusImageService
- **Responsabilidade**: Construir URLs e gerenciar conectividade
- **Não faz**: Renderização ou lógica de UI

```tsx
// ✅ Service isolado para lógica de URLs
class DirectusImageService {
  buildImageUrl() { /* apenas URLs */ }
  isNetworkAvailable() { /* apenas rede */ }
}
```

### ❌ Problema Anterior
```tsx
// ❌ Image.tsx antigo fazia muitas coisas
const Image = () => {
  // Construía URLs + renderizava + gerenciava ConfigContext + etc.
};
```

## 🔓 O - Open/Closed Principle (OCP)

### ✅ Implementação

**Componentes são abertos para extensão e fechados para modificação:**

#### Extensibilidade via Props
```tsx
// ✅ Extensível sem modificar o código base
<DirectusImage
  assetId="123"
  placeholder={<CustomPlaceholder />}  // Extensão
  fallback={<CustomError />}           // Extensão
  onLoad={customCallback}              // Extensão
/>
```

#### Componentes Especializados via Composição
```tsx
// ✅ DirectusCard estende funcionalidade sem modificar DirectusImage
<DirectusCard
  assetId="123"
  onPress={handlePress}  // Nova funcionalidade
  shadow={true}          // Nova funcionalidade
>
  <CustomOverlay />      // Extensão via children
</DirectusCard>
```

#### Hooks Especializados
```tsx
// ✅ Hooks especializados estendem funcionalidade base
const useDirectusAvatar = (assetId, size) => {
  return useDirectusImage(assetId, {
    width: size,
    height: size,
    quality: 85,
    fit: 'cover'
  });
};
```

### ❌ Problema Anterior
```tsx
// ❌ Para adicionar funcionalidade, precisava modificar o componente
const Image = ({ assetId, isAvatar, isBanner, showFallback, ... }) => {
  if (isAvatar) { /* lógica avatar */ }
  if (isBanner) { /* lógica banner */ }
  // Código ficava complexo e frágil
};
```

## 🔄 L - Liskov Substitution Principle (LSP)

### ✅ Implementação

**Componentes especializados podem substituir o base sem quebrar funcionalidade:**

```tsx
// ✅ Qualquer componente pode ser usado onde DirectusImage é esperado
const ImageContainer = ({ children }: { children: React.ReactElement }) => (
  <div className="image-wrapper">{children}</div>
);

// Todos funcionam igual
<ImageContainer><DirectusImage assetId="123" /></ImageContainer>
<ImageContainer><DirectusAvatar assetId="123" /></ImageContainer>
<ImageContainer><DirectusBanner assetId="123" /></ImageContainer>
<ImageContainer><DirectusThumbnail assetId="123" /></ImageContainer>
```

#### Interface Consistente
```tsx
// ✅ Todos seguem a mesma interface base
interface BaseImageProps {
  assetId: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

// DirectusAvatar implements BaseImageProps
// DirectusBanner implements BaseImageProps  
// DirectusThumbnail implements BaseImageProps
```

### ❌ Problema Anterior
```tsx
// ❌ Componentes especializados tinham APIs diferentes
<Avatar userAvatarID="123" />        // API diferente
<Banner imageId="123" />             // API diferente  
<Thumbnail assetId="123" />          // API diferente
// Não eram intercambiáveis
```

## 🎯 I - Interface Segregation Principle (ISP)

### ✅ Implementação

**Componentes não dependem de interfaces que não usam:**

#### Interfaces Específicas
```tsx
// ✅ DirectusAvatar só usa props de avatar
interface DirectusAvatarProps {
  assetId?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg';
  name?: string;
  isOnline?: boolean;
  // Não tem props de banner/thumbnail que não usa
}

// ✅ DirectusBanner só usa props de banner
interface DirectusBannerProps {
  assetId: string;
  overlay?: ReactNode;
  priority?: 'low' | 'normal' | 'high';
  // Não tem props de avatar que não usa
}
```

#### Hooks Especializados
```tsx
// ✅ Cada hook retorna apenas o que precisa
const useDirectusAvatar = (assetId, size) => ({
  imageUrl,       // Só o que avatar precisa
  isValidAssetId  // Só o que avatar precisa
});

const useDirectusBanner = (assetId, options) => ({
  imageUrl,       // Só o que banner precisa
  isValidAssetId  // Só o que banner precisa
});
```

### ❌ Problema Anterior
```tsx
// ❌ Componente único com interface muito grande
interface ImageProps {
  assetId?: string;
  userAvatarID?: string;    // Só para avatar
  isOnline?: boolean;       // Só para avatar
  overlay?: ReactNode;      // Só para banner
  thumbnailSize?: number;   // Só para thumbnail
  // Muitas props que a maioria dos usos não precisa
}
```

## 🔀 D - Dependency Inversion Principle (DIP)

### ✅ Implementação

**Componentes dependem de abstrações, não de implementações concretas:**

#### Service Pattern
```tsx
// ✅ DirectusImage depende da abstração (interface)
interface ImageServiceInterface {
  buildImageUrl(assetId: string, options?: any): string;
  isNetworkAvailable: boolean;
}

// ✅ Implementação pode ser trocada sem afetar componentes
class DirectusImageService implements ImageServiceInterface {
  // Implementação específica do Directus
}

// ✅ Componente usa abstração
const DirectusImage = () => {
  const imageService = DirectusImageService.getInstance(); // Abstração
};
```

#### Hook-based Architecture
```tsx
// ✅ Componentes dependem de hooks (abstração) não de services diretos
const DirectusAvatar = ({ assetId, size }) => {
  const { imageUrl } = useDirectusAvatar(assetId, size); // Abstração
  // Não precisa saber como URLs são construídas
};
```

#### Context Independence
```tsx
// ✅ Hooks podem usar diferentes contextos sem afetar componentes
const useDirectusImage = (assetId, options) => {
  const config = useContext(ConfigContext);     // Pode mudar
  const apiUrl = config?.url_api || process.env.EXPO_PUBLIC_API_URL; // Fallback
  // Componente não precisa saber de onde vem a config
};
```

### ❌ Problema Anterior
```tsx
// ❌ Dependência direta de implementação concreta
const Image = ({ assetId }) => {
  const config = useContext(ConfigContext); // Dependência concreta
  const url = `${config.url_api}/assets/${assetId}`; // Lógica acoplada
  // Difícil de testar e modificar
};
```

## 🏆 Benefícios Alcançados

### Manutenibilidade
- ✅ Cada componente tem responsabilidade clara
- ✅ Mudanças em um não afetam outros
- ✅ Fácil de localizar e corrigir bugs

### Testabilidade
- ✅ Componentes podem ser testados isoladamente
- ✅ Mocking simples via interfaces
- ✅ Hooks podem ser testados separadamente

### Extensibilidade
- ✅ Novos tipos de imagem sem modificar existentes
- ✅ Novas funcionalidades via composição
- ✅ Hooks especializados para casos específicos

### Reusabilidade
- ✅ Componentes podem ser reutilizados em diferentes contextos
- ✅ Interface consistente entre todos
- ✅ Abstrações permitem diferentes implementações

## 📊 Métricas de Qualidade

### Acoplamento (Baixo ✅)
- Componentes não conhecem implementação interna de outros
- Dependências via abstrações (hooks, interfaces)
- Mudanças localizadas

### Coesão (Alto ✅)
- Cada componente faz uma coisa bem feita
- Funcionalidades relacionadas agrupadas
- Responsabilidades claras

### Complexidade (Reduzida ✅)
- Componentes pequenos e focados
- Lógica dividida em camadas
- Fácil de entender e modificar