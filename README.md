# 🥊 UFC Events App

Um aplicativo iOS para acompanhar eventos do UFC em tempo real, similar ao app BoxBox de Formula 1, com foco em experiência em tempo real e widgets.

## 📱 Sobre o Projeto

Este projeto consiste em duas partes principais:

1. **App iOS** - Desenvolvido em SwiftUI para visualização de eventos e lutas
2. **Admin Web** - Interface web para gerenciamento manual de eventos e lutas

## 🚀 Funcionalidades

### App iOS
- ✅ Listagem de eventos futuros
- ✅ Detalhes completos dos eventos
- ✅ Card de lutas com informações dos lutadores
- ✅ Contagem regressiva para eventos
- ✅ Design moderno com tema UFC
- ✅ Pull-to-refresh para atualizar dados
- ✅ Fallback para dados mock quando servidor não está disponível

### Admin Web
- ✅ CRUD completo de eventos
- ✅ CRUD completo de lutadores
- ✅ CRUD completo de lutas
- ✅ Controle ao vivo de lutas com timer
- ✅ Sistema de rounds (3 ou 5 rounds)
- ✅ Atualizações em tempo real via WebSocket
- ✅ Interface responsiva e moderna
- ✅ Exportação de dados para o app iOS

## 🛠️ Stack Tecnológica

### iOS App
- **SwiftUI** - Interface moderna
- **Combine** - Reactive programming
- **URLSession** - Networking
- **AsyncImage** - Carregamento de imagens

### Admin Web
- **Node.js + Express** - API REST
- **SQLite** - Database local
- **Socket.io** - Tempo real
- **Bootstrap 5** - Interface responsiva
- **Vanilla JavaScript** - Interatividade

## 📦 Instalação e Configuração

### Pré-requisitos
- Xcode 15+ (para o app iOS)
- Node.js 18+ (para o admin web)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/rafaelgran/Ufc.git
cd Ufc
```

### 2. Configurar o Admin Web
```bash
cd admin-web
npm install
npm start
```

O servidor admin estará disponível em: `http://localhost:3000`

### 3. Configurar o App iOS
1. Abra o projeto no Xcode: `It's time.xcodeproj`
2. Selecione um simulador iOS
3. Build e execute o projeto (⌘+R)

## 🎯 Como Usar

### Admin Web
1. Acesse `http://localhost:3000`
2. Use as abas para gerenciar:
   - **Eventos**: Criar e gerenciar eventos UFC
   - **Lutadores**: Cadastrar lutadores com informações
   - **Lutas**: Criar lutas associando lutadores a eventos
   - **Controle ao Vivo**: Gerenciar lutas em tempo real

### App iOS
1. Execute o app no simulador
2. Visualize a lista de eventos futuros
3. Toque em um evento para ver detalhes
4. Use pull-to-refresh para atualizar dados

## 📊 Estrutura de Dados

### Evento
```json
{
  "id": "string",
  "name": "string",
  "date": "datetime",
  "location": "string",
  "venue": "string",
  "status": "scheduled|live|finished",
  "mainEvent": "string",
  "fights": ["fight_id"]
}
```

### Luta
```json
{
  "id": "string",
  "eventId": "string",
  "fighter1": "fighter_object",
  "fighter2": "fighter_object",
  "weightClass": "string",
  "rounds": 3|5,
  "status": "scheduled|live|finished",
  "currentRound": 1-5,
  "roundTime": "MM:SS",
  "winner": "fighter_id|null",
  "method": "string|null"
}
```

### Lutador
```json
{
  "id": "string",
  "name": "string",
  "nickname": "string",
  "record": "wins-losses-draws",
  "photo": "url",
  "weightClass": "string",
  "ranking": "number|null"
}
```

## 🔧 Configurações

### Alterar URL da API
No arquivo `It's time/Services/UFCEventService.swift`, altere a linha:
```swift
private let baseURL = "http://localhost:3000/api"
```

### Alterar Porta do Servidor
No arquivo `admin-web/server.js`, altere a linha:
```javascript
const PORT = process.env.PORT || 3000;
```

## 🚀 Deploy

### Admin Web (Vercel/Netlify)
1. Configure as variáveis de ambiente
2. Deploy o diretório `admin-web`
3. Atualize a URL da API no app iOS

### App iOS (TestFlight)
1. Configure certificados de distribuição
2. Archive o projeto no Xcode
3. Upload para App Store Connect
4. Distribua via TestFlight

## 🐛 Troubleshooting

### App não carrega eventos
- Verifique se o servidor admin está rodando
- Confirme se a URL da API está correta
- Verifique o console do Xcode para erros

### Admin web não funciona
- Verifique se todas as dependências foram instaladas
- Confirme se a porta 3000 está disponível
- Verifique os logs do servidor

### Problemas de build iOS
- Limpe o projeto (Product > Clean Build Folder)
- Reinstale as dependências
- Verifique a versão do Xcode

## 📈 Próximos Passos

### MVP Completo
- [ ] Widgets iOS para timer e resultados
- [ ] Notificações push para mudanças de round
- [ ] Sistema de pontuação por round
- [ ] Histórico de lutas
- [ ] Estatísticas de lutadores

### Funcionalidades Avançadas
- [ ] Integração com API oficial UFC
- [ ] Sistema de assinatura premium
- [ ] Comunidade e social features
- [ ] Analytics avançados
- [ ] Modo offline completo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Rafael Granemann**
- GitHub: [@rafaelgran](https://github.com/rafaelgran)

## 🙏 Agradecimentos

- UFC pela inspiração
- Comunidade SwiftUI
- Comunidade Node.js
- BoxBox app (inspiração para UX)

---

**Nota**: Este é um projeto MVP para validação de conceito. Para uso comercial, considere questões de direitos autorais e licenciamento. 