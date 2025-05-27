# Guia de Migração - Sistema de Imagens DirectusImage

## 📋 Visão Geral

Este projeto foi refatorado para usar um sistema unificado de imagens baseado no componente `DirectusImage`. Todos os componentes agora seguem princípios SOLID e oferecem melhor performance, cache e tratamento de erros.

## 🎯 Componentes Disponíveis

### 1. DirectusImage (Base)
Componente principal para todas as imagens do Directus.

```tsx
import DirectusImage from '@/components/DirectusImage';

<DirectusImage
  assetId="uuid-da-imagem"
  width={300}
  height={200}
  resizeMode="cover"
  quality={80}
/>
```

### 2. DirectusAvatar (Especializado)
Para avatares de usuários com fallback de iniciais.

```tsx
import { DirectusAvatar } from '@/components/DirectusImage';

<DirectusAvatar
  assetId="user-avatar-id"
  size={64}
  name="João Silva"
  isOnline={true}
/>
```

### 3. DirectusBanner (Especializado)
Para banners e imagens de destaque com overlays.

```tsx
import { DirectusBanner } from '@/components/DirectusImage';

<DirectusBanner
  assetId="banner-id"
  width="100%"
  height={300}
  priority="high"
  overlay={<CustomOverlay />}
/>
```

### 4. DirectusThumbnail (Especializado)
Para miniaturas otimizadas com baixo uso de dados.

```tsx
import { DirectusThumbnail } from '@/components/DirectusImage';

<DirectusThumbnail
  assetId="thumb-id"
  size={150}
  priority="low"
/>
```

### 5. DirectusCard (Especializado)
Para imagens em cards com conteúdo sobreposto.

```tsx
import { DirectusCard } from '@/components/DirectusImage';

<DirectusCard
  assetId="card-image-id"
  width="100%"
  height={200}
  onPress={() => navigation.navigate('Detail')}
  shadow={true}
>
  <CardContent />
</DirectusCard>
```

## 🔄 Migração de Componentes Existentes

### De `Image` para `DirectusImage`

#### ❌ Antes
```tsx
import { Image } from '@/components/Image';

<Image
  assetId="123"
  width="300"
  height="200"
  borderRadius={8}
/>
```

#### ✅ Depois
```tsx
import DirectusImage from '@/components/DirectusImage';

<DirectusImage
  assetId="123"
  width={300}
  height={200}
  borderRadius={8}
/>
```

### De `Avatar` para `DirectusAvatar`

#### ❌ Antes
```tsx
import { Avatar } from '@/components/Avatar';

<Avatar
  userAvatarID="456"
  size="md"
  name="João"
/>
```

#### ✅ Depois
```tsx
import { DirectusAvatar } from '@/components/DirectusImage';

<DirectusAvatar
  assetId="456"
  size={48}
  name="João"
/>
```

### De componentes customizados para `DirectusCard`

#### ❌ Antes
```tsx
<TouchableOpacity onPress={handlePress}>
  <View style={cardStyles}>
    <Image assetId="789" />
    <View style={overlayStyles}>
      <Text>Título</Text>
    </View>
  </View>
</TouchableOpacity>
```

#### ✅ Depois
```tsx
<DirectusCard
  assetId="789"
  onPress={handlePress}
  shadow={true}
>
  <View className="absolute bottom-0 left-0 right-0 p-4">
    <Text className="text-white">Título</Text>
  </View>
</DirectusCard>
```

## 🎨 Hooks Personalizados

### useDirectusImage
Hook base para construir URLs e validar assets.

```tsx
import { useDirectusImage } from '@/hooks/useDirectusImage';

const { imageUrl, isValidAssetId, buildUrl } = useDirectusImage(assetId, {
  width: 300,
  height: 200,
  quality: 80
});
```

### useDirectusAvatar
Hook especializado para avatares.

```tsx
import { useDirectusAvatar } from '@/hooks/useDirectusImage';

const { imageUrl } = useDirectusAvatar(assetId, 64);
```

### useDirectusBanner
Hook especializado para banners.

```tsx
import { useDirectusBanner } from '@/hooks/useDirectusImage';

const { imageUrl } = useDirectusBanner(assetId, { width: 400, height: 300 });
```

### useDirectusThumbnail
Hook especializado para miniaturas.

```tsx
import { useDirectusThumbnail } from '@/hooks/useDirectusImage';

const { imageUrl } = useDirectusThumbnail(assetId, 150);
```

## ⚡ Benefícios da Migração

### Performance
- ✅ Cache inteligente com políticas otimizadas
- ✅ Lazy loading automático
- ✅ Formato WebP para web
- ✅ Memoização de cálculos pesados

### Experiência do Usuário
- ✅ Estados de loading visuais
- ✅ Fallbacks customizáveis para erros
- ✅ Placeholders durante carregamento
- ✅ Transições suaves

### Código Limpo
- ✅ Componentes especializados (Single Responsibility)
- ✅ Props tipadas com TypeScript
- ✅ Logs detalhados para debug
- ✅ Padrões consistentes

### Robustez
- ✅ Validação de Asset ID
- ✅ Detecção de conectividade
- ✅ Timeout para evitar loading infinito
- ✅ Tratamento de erros abrangente

## 🔧 Checklist de Migração

### Para cada componente:
- [ ] Identificar tipo de uso (avatar, banner, thumbnail, card, genérico)
- [ ] Escolher componente especializado apropriado
- [ ] Migrar props para nova API
- [ ] Testar carregamento e estados de erro
- [ ] Verificar performance e cache
- [ ] Atualizar testes se necessário

### Verificações finais:
- [ ] Todos os componentes Image antigos removidos
- [ ] Imports atualizados
- [ ] Logs de console limpos em produção
- [ ] Performance testada em dispositivos diferentes
- [ ] Acessibilidade verificada

## 🐛 Troubleshooting

### Imagem não carrega
1. Verifique se o Asset ID é válido
2. Confirme permissões no Directus
3. Teste a URL diretamente no navegador
4. Verifique logs no console

### Performance lenta
1. Use componente especializado apropriado
2. Ajuste qualidade para o contexto
3. Configure prioridade corretamente
4. Verifique política de cache

### Falhas de TypeScript
1. Importe tipos corretos
2. Use props tipadas
3. Configure paths no tsconfig.json

## 📚 Referências

- [DirectusImage Documentação](./DirectusImage.DEBUG.md)
- [Princípios SOLID aplicados](./SOLID_PRINCIPLES.md)
- [Hooks personalizados](../hooks/useDirectusImage.ts)
- [Componentes especializados](./DirectusImage/)