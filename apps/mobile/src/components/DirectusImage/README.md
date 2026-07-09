# Sistema DirectusImage - Documentação Completa

## 🎯 Visão Geral

Sistema unificado e otimizado para renderização de imagens do Directus, seguindo princípios SOLID e oferecendo alta performance, cache inteligente e experiência de usuário superior.

## 🚀 Quick Start

### Instalação
```bash
# Todas as dependências já estão no projeto
# Apenas importe os componentes necessários
```

### Uso Básico
```tsx
import DirectusImage from '@/components/DirectusImage';

// Imagem simples
<DirectusImage
  assetId="uuid-da-imagem"
  width={300}
  height={200}
/>
```

### Componentes Especializados
```tsx
import { 
  DirectusAvatar, 
  DirectusBanner, 
  DirectusThumbnail, 
  DirectusCard 
} from '@/components/DirectusImage';

// Avatar com fallback
<DirectusAvatar assetId="user-id" size={64} name="João Silva" />

// Banner com overlay
<DirectusBanner assetId="banner-id" height={300}>
  <CustomOverlay />
</DirectusBanner>

// Thumbnail otimizada
<DirectusThumbnail assetId="thumb-id" size={150} priority="low" />

// Card com interação
<DirectusCard assetId="card-id" onPress={handlePress} shadow>
  <CardContent />
</DirectusCard>
```

## 📚 Documentação

### Guias
- [🔄 Guia de Migração](../MIGRATION_GUIDE.md) - Como migrar código existente
- [🏗️ Princípios SOLID](../SOLID_PRINCIPLES.md) - Arquitetura e design patterns
- [🐛 Debug e Troubleshooting](../DirectusImage.DEBUG.md) - Solução de problemas

### API Reference
- [DirectusImage (Base)](./DirectusImage.md) - Componente principal
- [DirectusAvatar](./DirectusAvatar.md) - Avatares especializados
- [DirectusBanner](./DirectusBanner.md) - Banners e imagens de destaque
- [DirectusThumbnail](./DirectusThumbnail.md) - Miniaturas otimizadas
- [DirectusCard](./DirectusCard.md) - Imagens em cards

### Hooks
- [useDirectusImage](../../hooks/useDirectusImage.md) - Hook base
- [useDirectusAvatar](../../hooks/useDirectusImage.md#usedirectusavatar) - Hook para avatares
- [useDirectusBanner](../../hooks/useDirectusImage.md#usedirectusbanner) - Hook para banners
- [useDirectusThumbnail](../../hooks/useDirectusImage.md#usedirectusthumbnail) - Hook para thumbnails

## 🎨 Componentes Disponíveis

| Componente | Uso | Performance | Cache |
|------------|-----|-------------|-------|
| `DirectusImage` | Base/Genérico | ⭐⭐⭐ | Padrão |
| `DirectusAvatar` | Perfis/Usuários | ⭐⭐⭐⭐ | Agressivo |
| `DirectusBanner` | Destaque/Hero | ⭐⭐⭐⭐⭐ | Alto |
| `DirectusThumbnail` | Listas/Grid | ⭐⭐⭐⭐ | Máximo |
| `DirectusCard` | Cards/Posts | ⭐⭐⭐⭐ | Inteligente |

## ⚡ Funcionalidades

### Performance
- ✅ Cache inteligente com múltiplas políticas
- ✅ Lazy loading automático
- ✅ Formato WebP para web
- ✅ Memoização de cálculos pesados
- ✅ Timeout para evitar loading infinito

### UX/UI
- ✅ Estados visuais (loading, error, loaded)
- ✅ Placeholders customizáveis
- ✅ Fallbacks para erros
- ✅ Transições suaves
- ✅ Acessibilidade completa

### Robustez
- ✅ Validação de Asset ID
- ✅ Detecção de conectividade
- ✅ Logs detalhados para debug
- ✅ Tratamento de erros abrangente
- ✅ Fallback para configurações

### Developer Experience
- ✅ TypeScript completo
- ✅ Props bem documentadas
- ✅ Componentes memoizados
- ✅ Hooks reutilizáveis
- ✅ Debug facilitado

## 🏗️ Arquitetura

### Princípios SOLID

#### Single Responsibility
- Cada componente tem uma responsabilidade única
- DirectusImage: renderização base
- DirectusAvatar: avatares com iniciais
- DirectusBanner: banners com overlays

#### Open/Closed
- Extensível via props e children
- Fechado para modificação
- Novos tipos via composição

#### Liskov Substitution
- Todos os componentes seguem interface base
- Intercambiáveis quando apropriado
- Comportamento consistente

#### Interface Segregation
- Props específicas para cada uso
- Sem dependências desnecessárias
- Interfaces focadas

#### Dependency Inversion
- Depende de abstrações (hooks, interfaces)
- Implementações podem ser trocadas
- Testabilidade alta

### Camadas

```
┌─────────────────────────────────┐
│     Componentes Especializados  │ ← UI Layer
│  Avatar │ Banner │ Thumb │ Card │
├─────────────────────────────────┤
│        DirectusImage (Base)     │ ← Core Layer
├─────────────────────────────────┤
│         Hooks Personalizados    │ ← Logic Layer
├─────────────────────────────────┤
│       DirectusImageService      │ ← Service Layer
└─────────────────────────────────┘
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
EXPO_PUBLIC_API_URL=https://your-directus.com
```

### TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🧪 Testes

### Exemplo de Teste
```tsx
import { render, waitFor } from '@testing-library/react-native';
import DirectusImage from '../DirectusImage';

test('renderiza imagem com sucesso', async () => {
  const { getByTestId } = render(
    <DirectusImage 
      assetId="valid-uuid" 
      testID="test-image"
    />
  );
  
  await waitFor(() => {
    expect(getByTestId('test-image')).toBeTruthy();
  });
});
```

## 📊 Performance Tips

### Para Listas
```tsx
// ✅ Use DirectusThumbnail com prioridade baixa
<DirectusThumbnail 
  assetId={item.image} 
  size={100} 
  priority="low" 
/>
```

### Para Hero/Banner
```tsx
// ✅ Use DirectusBanner com prioridade alta
<DirectusBanner 
  assetId={hero.image} 
  priority="high"
  quality={95}
/>
```

### Para Avatares
```tsx
// ✅ Use DirectusAvatar otimizado
<DirectusAvatar 
  assetId={user.avatar} 
  size={48}
  name={user.name}
/>
```

## 🐛 Troubleshooting

### Imagem não carrega
1. Verifique Asset ID no console
2. Teste URL diretamente no navegador
3. Confirme permissões no Directus
4. Verifique conectividade

### Performance lenta
1. Use componente especializado apropriado
2. Ajuste qualidade para contexto
3. Configure prioridade corretamente
4. Verifique política de cache

### Erros TypeScript
1. Verifique imports
2. Use tipos corretos
3. Configure paths no tsconfig.json

## 🤝 Contribuindo

### Adicionando Novo Componente Especializado
1. Crie arquivo em `./components/DirectusImage/`
2. Implemente interface base
3. Adicione ao barrel export (`index.ts`)
4. Documente uso e props
5. Adicione testes

### Melhorando Performance
1. Profile com React DevTools
2. Identifique gargalos
3. Otimize memoização
4. Teste em dispositivos reais

## 📝 Changelog

### v2.0.0 (Atual)
- ✅ Sistema completamente refatorado
- ✅ Componentes especializados
- ✅ Hooks personalizados
- ✅ Princípios SOLID aplicados
- ✅ Performance otimizada

### v1.0.0 (Legacy)
- ❌ Componente Image monolítico
- ❌ ConfigContext acoplado
- ❌ Performance subótima
- ❌ Difícil manutenção

## 📞 Suporte

- 📖 [Documentação Completa](./README.md)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussões](https://github.com/your-repo/discussions)
- 📧 [Email](mailto:dev@yourcompany.com)