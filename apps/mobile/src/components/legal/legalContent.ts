import type { LegalSection } from './LegalScreen';

/** Conteúdo dos documentos legais, compartilhado entre o cadastro (pré-login) e Ajustes. */

export const LEGAL_UPDATED_AT = '8 de julho de 2026';

export const TERMS_INTRO =
  'Bem-vindo ao UNAADEB Play. Estes Termos regem o uso do Aplicativo pela nossa comunidade. Leia com atenção.';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: 'Aceitação dos Termos',
    body: [
      'Ao criar uma conta ou utilizar o aplicativo UNAADEB Play ("Aplicativo"), você concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se não concordar, não utilize o Aplicativo.',
      'Estes Termos constituem um acordo entre você e a UNAADEB (União da Mocidade da Assembleia de Deus), responsável pelo Aplicativo.',
    ],
  },
  {
    heading: 'Elegibilidade e cadastro',
    body: [
      'O Aplicativo destina-se a membros e participantes da comunidade UNAADEB.',
      '• Menores de 18 anos só podem se cadastrar com o consentimento e os dados de um responsável legal, informados no momento do cadastro.',
      '• Você declara que as informações fornecidas no cadastro são verdadeiras, completas e atualizadas.',
    ],
  },
  {
    heading: 'Sua conta',
    body: [
      'Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.',
      '• Notifique-nos imediatamente sobre qualquer uso não autorizado.',
      '• Você pode ativar a autenticação biométrica do dispositivo para facilitar o acesso; as credenciais ficam armazenadas de forma cifrada no próprio aparelho.',
    ],
  },
  {
    heading: 'Uso aceitável',
    body: [
      'Ao usar o Aplicativo, você concorda em NÃO:',
      '• Publicar conteúdo ilegal, ofensivo, difamatório, discriminatório ou que viole direitos de terceiros;',
      '• Assediar, ameaçar ou se passar por outra pessoa;',
      '• Coletar dados de outros usuários sem autorização;',
      '• Tentar burlar, sobrecarregar ou comprometer a segurança do Aplicativo.',
    ],
  },
  {
    heading: 'Conteúdo do usuário',
    body: [
      'Você mantém a titularidade das fotos, textos e informações que envia (foto de perfil, capa, bio, redes sociais).',
      'Ao publicá-los, você concede à UNAADEB uma licença limitada e não exclusiva para exibi-los dentro do Aplicativo, com a finalidade de operar os recursos da comunidade.',
      'Você é o único responsável pelo conteúdo que compartilha e declara possuir os direitos necessários para tanto.',
    ],
  },
  {
    heading: 'Propriedade intelectual',
    body: [
      'A marca, o logotipo, o design e o software do Aplicativo pertencem à UNAADEB e são protegidos por lei. É vedada a reprodução sem autorização prévia.',
    ],
  },
  {
    heading: 'Notificações e comunicações',
    body: [
      'Com a sua permissão, podemos enviar notificações push sobre eventos, avisos e novidades da comunidade. Você pode desativá-las a qualquer momento nas configurações do Aplicativo ou do dispositivo.',
    ],
  },
  {
    heading: 'Suspensão e encerramento',
    body: [
      'Podemos suspender ou encerrar contas que violem estes Termos.',
      'Você pode excluir sua conta a qualquer momento em Configurações › Excluir minha conta, o que desativa o acesso e inicia o processo de remoção dos seus dados conforme a Política de Privacidade.',
    ],
  },
  {
    heading: 'Isenção de garantias e limitação de responsabilidade',
    body: [
      'O Aplicativo é fornecido "no estado em que se encontra". Não garantimos disponibilidade ininterrupta ou ausência de erros.',
      'Na máxima extensão permitida pela lei, a UNAADEB não se responsabiliza por danos indiretos decorrentes do uso ou da impossibilidade de uso do Aplicativo.',
    ],
  },
  {
    heading: 'Alterações nos Termos',
    body: [
      'Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas no Aplicativo. O uso continuado após a atualização representa a sua concordância.',
    ],
  },
  {
    heading: 'Lei aplicável e foro',
    body: [
      'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do usuário para dirimir eventuais controvérsias.',
    ],
  },
  {
    heading: 'Contato',
    body: ['Dúvidas sobre estes Termos: suporte@unaadeb.org.br.'],
  },
];

export const PRIVACY_INTRO =
  'A sua privacidade é importante para nós. Esta Política explica quais dados o UNAADEB Play coleta, como os usamos e quais são os seus direitos, em conformidade com a LGPD.';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: 'Dados que coletamos',
    body: [
      'Coletamos apenas os dados necessários para o funcionamento da comunidade:',
      '• Identificação: nome, sobrenome, e-mail, telefone, data de nascimento e gênero;',
      '• Vínculo: setor ao qual você pertence;',
      '• Perfil: foto de perfil, imagem de capa, biografia e redes sociais (Instagram, LinkedIn, TikTok, WhatsApp) que você opte por cadastrar;',
      '• Responsável (para menores de 18 anos): nome e telefone do responsável legal;',
      '• Notificações: token do dispositivo, para envio de notificações push;',
      '• Uso: informações técnicas mínimas para operação e segurança (ex.: estado de sessão).',
    ],
  },
  {
    heading: 'Como usamos seus dados',
    body: [
      '• Autenticar seu acesso e manter sua conta;',
      '• Exibir seu perfil e permitir a interação na comunidade (seguir membros, ver liderança do setor);',
      '• Enviar notificações sobre eventos e avisos, quando autorizado;',
      '• Garantir a segurança e o bom funcionamento do Aplicativo.',
      'Não usamos seus dados para publicidade e não os vendemos a terceiros.',
    ],
  },
  {
    heading: 'Base legal (LGPD)',
    body: [
      'Tratamos seus dados com base no seu consentimento, na execução do relacionamento com a comunidade e no legítimo interesse de operar o Aplicativo, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).',
    ],
  },
  {
    heading: 'Compartilhamento e provedores',
    body: [
      'Não vendemos nem alugamos seus dados. Utilizamos provedores que atuam como operadores, estritamente para viabilizar o serviço:',
      '• Supabase — autenticação e armazenamento seguro dos dados e das imagens;',
      '• Expo — entrega de notificações push.',
      'Esses provedores tratam os dados apenas conforme nossas instruções e suas próprias políticas de segurança.',
    ],
  },
  {
    heading: 'Dados de menores de idade',
    body: [
      'O cadastro de menores de 18 anos exige o consentimento e os dados de um responsável legal. O tratamento é feito no melhor interesse do menor e limitado às finalidades aqui descritas. O responsável pode solicitar acesso ou exclusão a qualquer momento.',
    ],
  },
  {
    heading: 'Visibilidade e redes sociais',
    body: [
      'Você controla o que aparece no seu perfil público. Em Ajustes › Redes sociais, escolhe quais redes exibir aos demais membros.',
      'Por se tratar de um número de telefone, o WhatsApp fica OCULTO por padrão e só é exibido se você optar por ativá-lo.',
    ],
  },
  {
    heading: 'Armazenamento e segurança',
    body: [
      'As credenciais de sessão são armazenadas de forma cifrada no dispositivo (armazenamento seguro do sistema). Os dados no servidor são protegidos por controle de acesso e regras de segurança por usuário.',
    ],
  },
  {
    heading: 'Retenção e exclusão',
    body: [
      'Mantemos seus dados enquanto sua conta estiver ativa.',
      'Você pode excluir a conta a qualquer momento em Configurações › Excluir minha conta. A exclusão desativa o acesso e remove/anonimiza seus dados pessoais, ressalvadas as obrigações legais de retenção.',
    ],
  },
  {
    heading: 'Seus direitos',
    body: [
      'Nos termos da LGPD, você pode a qualquer momento:',
      '• Confirmar a existência de tratamento e acessar seus dados;',
      '• Corrigir dados incompletos ou desatualizados (na tela Editar perfil);',
      '• Solicitar a exclusão dos dados;',
      '• Revogar o consentimento;',
      '• Solicitar a portabilidade, quando aplicável.',
    ],
  },
  {
    heading: 'Alterações nesta Política',
    body: [
      'Podemos atualizar esta Política periodicamente. Mudanças relevantes serão comunicadas no Aplicativo, com atualização da data no topo deste documento.',
    ],
  },
  {
    heading: 'Encarregado e contato',
    body: [
      'Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com o nosso Encarregado de Dados (DPO): privacidade@unaadeb.org.br.',
    ],
  },
];
