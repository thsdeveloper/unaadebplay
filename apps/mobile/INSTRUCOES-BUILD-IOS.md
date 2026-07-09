# 📱 Instruções para Build iOS e Instalação no iPhone

## 🔍 Passo 1: Obter o UDID do seu iPhone

### Opção A: Usando get-udid.io (Recomendado)
1. **No seu iPhone**, abra o Safari (IMPORTANTE: use Safari, não Chrome!)
2. Acesse: https://get-udid.io
3. Toque no botão "Tap here to find UDID"
4. Toque em "Permitir" quando solicitado para baixar um perfil
5. Vá para **Ajustes** → **Perfil Baixado** (aparecerá no topo)
6. Toque em "Instalar" no canto superior direito
7. Digite sua senha do iPhone
8. Toque em "Instalar" novamente
9. Volte ao Safari - o site mostrará seu UDID
10. **Copie o UDID** (toque e segure para copiar)

### Opção B: Usando iTunes no Windows
1. Instale o iTunes da Apple (não da Microsoft Store)
2. Conecte o iPhone via USB
3. Clique no ícone do iPhone
4. Clique em "Número de Série" até mostrar "UDID"
5. Clique com botão direito → Copiar

## 📝 Passo 2: Registrar seu Dispositivo

No terminal (WSL ou PowerShell), execute:

```bash
cd /home/pcthiago/projetos/unaadebplay
eas device:create
```

Quando solicitado:
- **Device UDID**: Cole o UDID que você copiou
- **Device name**: Digite um nome (ex: "iPhone de Thiago")

## 🏗️ Passo 3: Criar o Build de Desenvolvimento

Execute o comando:

```bash
eas build --profile development --platform ios
```

Durante o processo, será solicitado:
1. **Apple ID**: Digite seu email da Apple
2. **Senha**: Digite sua senha (será mascarada)
3. **Código 2FA**: Se tiver autenticação de dois fatores ativada

⏱️ **Tempo estimado**: 15-30 minutos para o primeiro build

## 📲 Passo 4: Instalar no iPhone

1. Quando o build terminar, você receberá um link como:
   ```
   https://expo.dev/accounts/thsdeveloper/projects/unaadebplay/builds/[ID-DO-BUILD]
   ```

2. **No iPhone**, abra este link no Safari

3. Toque no botão "Install"

4. Aparecerá um popup "expo.dev deseja instalar 'Unaadeb Play'"
   - Toque em "Instalar"

5. O app começará a baixar (você verá o ícone na tela inicial)

## 🔐 Passo 5: Confiar no Desenvolvedor

1. Vá para **Ajustes** → **Geral** → **VPN e Gerenciamento de Dispositivo**

2. Em "App do Desenvolvedor", você verá seu email
   - Toque nele

3. Toque em "Confiar em [seu-email]"

4. Toque em "Confiar" no popup de confirmação

## 🚀 Passo 6: Executar o App

### Para Development Build:
1. No terminal, execute:
   ```bash
   npx expo start --dev-client
   ```

2. Abra o app "Unaadeb Play" no iPhone

3. O app mostrará uma tela para conectar ao Metro Bundler:
   - Digite o IP do seu computador (mostrado no terminal)
   - Ou escaneie o QR code com a câmera

### Recursos Disponíveis:
- ✅ Face ID/Touch ID real funcionando
- ✅ Notificações push
- ✅ Todas as permissões nativas
- ✅ Hot reload (alterações em tempo real)
- ✅ Debugging tools

## ⚠️ Observações Importantes

### Conta Apple Gratuita:
- App expira em **7 dias**
- Precisa reinstalar semanalmente
- Máximo 3 apps instalados

### Conta Apple Developer ($99/ano):
- App expira em **1 ano**
- Até 100 dispositivos
- Sem limite de apps

## 🔄 Reinstalação (Conta Gratuita)

Após 7 dias, repita apenas:
1. `eas build --profile development --platform ios`
2. Instale o novo build
3. Confie no desenvolvedor novamente

## 🆘 Problemas Comuns

### "Unable to Install"
- Verifique se o UDID está correto
- Delete o app anterior se existir
- Reinicie o iPhone

### "Untrusted Developer"
- Siga o Passo 5 novamente

### "Cannot connect to Metro"
- Verifique se estão na mesma rede Wi-Fi
- Desative firewall temporariamente
- Use o IP local, não localhost

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do build no link fornecido
2. Execute `eas build:list` para ver status
3. Confira se o UDID foi registrado: `eas device:list`