# FCM Test Extension

Uma extensão para VS Code/Cursor que permite testar o envio de notificações push usando o Firebase Cloud Messaging (FCM).

## Funcionalidades

- Envio de notificações push para Web, Android e iOS
- Suporte a imagens nas notificações
- Suporte a redirecionamento ao clicar na notificação
- Configurações específicas para cada plataforma
- Interface amigável integrada ao VS Code/Cursor

## Requisitos

- VS Code ^1.87.0 ou Cursor
- Node.js
- Arquivo de credenciais do Firebase (service-account.json)
- Token FCM do dispositivo de destino

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Compile o projeto:
   ```bash
   pnpm run build
   ```
4. Pressione F5 para iniciar o modo de debug

## Uso

1. Clique no ícone da extensão na barra de atividades (ícone de sino)
2. Selecione o arquivo de credenciais do Firebase (service-account.json)
3. Cole o token FCM do dispositivo
4. Escolha a plataforma (Web, Android ou iOS)
5. Preencha os campos da notificação
6. Clique em "Enviar Notificação"

## Configurações por Plataforma

### Web
- Título
- Mensagem
- URL da Imagem
- URL de Redirecionamento

### Android
- Título
- Mensagem
- URL da Imagem
- ID do Canal
- Prioridade
- Ação ao Clicar
- URL de Redirecionamento

### iOS
- Título
- Mensagem
- URL da Imagem
- Som
- Badge
- URL de Redirecionamento

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas alterações (`git commit -m 'feat: Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença "Beer-ware" - se você me encontrar algum dia e achar que este código vale a pena, você pode me pagar uma cerveja em retorno. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
