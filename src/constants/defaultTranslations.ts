// Traduções padrão para o sistema de notícias
export const newsTranslations = {
  // Página de listagem
  'no_news_available': 'Nenhuma notícia disponível',
  'check_back_later_for_updates': 'Volte mais tarde para conferir as novidades',
  'error_loading_news': 'Erro ao carregar notícias',
  'try_again': 'Tentar novamente',
  'all_categories': 'Todas',
  
  // Página de detalhes
  'news_not_found': 'Notícia não encontrada',
  'related_news': 'Notícias relacionadas',
  'share': 'Compartilhar',
  'min_read': 'min de leitura',
  'views': 'visualizações',
  
  // Categorias padrão
  'category_technology': 'Tecnologia',
  'category_events': 'Eventos',
  'category_notices': 'Avisos',
  'category_sports': 'Esportes',
  
  // Filtros e busca
  'filter_by_category': 'Filtrar por categoria',
  'search_news': 'Buscar notícias',
  'search_news_placeholder': 'Buscar notícias...',
  'featured_news': 'Notícias em destaque',
  
  // Estados
  'loading_news': 'Carregando notícias...',
  'loading_more': 'Carregando mais...',
  'no_more_news': 'Não há mais notícias',
};

// Função para mesclar traduções padrão com traduções da API
export function mergeWithDefaultTranslations(apiTranslations: Record<string, string>): Record<string, string> {
  return {
    ...newsTranslations,
    ...apiTranslations
  };
}