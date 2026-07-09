export const ERROR_MESSAGES: Record<string, string> = {
    FAILED_VALIDATION: "A validação para este item falhou",
    FORBIDDEN: "Você não tem permissão para realizar esta ação",
    INVALID_TOKEN: "O token fornecido é inválido",
    TOKEN_EXPIRED: "O token fornecido é válido, mas expirou",
    INVALID_CREDENTIALS: "Usuário/senha ou token de acesso estão incorretos",
    INVALID_IP: "Seu endereço IP não está na lista de permissões para este usuário",
    INVALID_OTP: "OTP incorreto fornecido",
    INVALID_PAYLOAD: "As informações fornecidas são inválidas",
    INVALID_QUERY: "Os parâmetros de consulta solicitados não podem ser usados",
    UNSUPPORTED_MEDIA_TYPE: "O formato de payload fornecido ou o cabeçalho Content-Type não é suportado",
    REQUESTS_EXCEEDED: "Atingiu o limite de taxa",
    ROUTE_NOT_FOUND: "Este endpoint não existe",
    SERVICE_UNAVAILABLE: "Não foi possível usar o serviço externo",
    UNPROCESSABLE_ENTITY: "Você tentou fazer algo ilegal",
    RECORD_NOT_UNIQUE: "Usuário já cadastrado com esses dados",
    USER_SUSPENDED: 'Sua conta está suspensa, procure o administrador.'
};