# Instruções para Build iOS sem Mac

## 1. Preparação
```bash
# Instalar EAS CLI (se ainda não tem)
npm install -g eas-cli

# Login no Expo
eas login

# Verificar se está tudo configurado
eas whoami
```

## 2. Obter UDID do iPhone
- Acesse https://get-udid.io no Safari do iPhone
- Ou use iTunes/3uTools no Windows

## 3. Registrar Dispositivo
```bash
eas device:create
# Cole o UDID quando solicitado
```

## 4. Criar Build de Desenvolvimento
```bash
# Build com Expo Dev Client (recomendado para desenvolvimento)
eas build --profile development --platform ios

# OU Build de preview (mais próximo da produção)
eas build --profile preview --platform ios
```

## 5. Instalação no iPhone
1. Aguarde o build completar (15-30 minutos)
2. Abra o link fornecido no Safari do iPhone
3. Toque em "Install"
4. Vá em Ajustes → Geral → VPN e Gerenciamento
5. Confie no perfil do desenvolvedor

## 6. Executar o App
```bash
# Se usou development build, pode conectar ao Metro:
npx expo start --dev-client
# Escaneie o QR code com a câmera do iPhone
```

## Observações Importantes:
- Use Safari no iPhone (não Chrome)
- Com conta gratuita, reinstale semanalmente
- O primeiro build demora mais (cache das dependências)
- Biometria funcionará normalmente no build!