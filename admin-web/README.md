# UFC Events Admin

Sistema de administração para eventos de UFC com controle ao vivo de lutas.

## 🚀 Funcionalidades

- **Gestão de Eventos**: Criar, editar e gerenciar eventos UFC
- **Gestão de Lutadores**: Cadastro completo de lutadores com records e rankings
- **Gestão de Lutas**: Organizar lutas por evento com drag & drop
- **Controle ao Vivo**: Timer e controle de status das lutas em tempo real
- **Interface Responsiva**: Design moderno e intuitivo

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Database**: SQLite (local) / In-Memory (Vercel)
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **UI Framework**: Bootstrap 5
- **Real-time**: Socket.io

## 📦 Instalação

### Local Development

1. Clone o repositório
```bash
git clone <repository-url>
cd admin-web
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

4. Execute o servidor
```bash
# Para desenvolvimento local com SQLite
USE_SQLITE=true npm start

# Para desenvolvimento com banco em memória
npm start
```

5. Acesse a aplicação
```
http://localhost:3000
```

### Deploy no Vercel

1. Instale o Vercel CLI
```bash
npm i -g vercel
```

2. Faça login no Vercel
```bash
vercel login
```

3. Deploy
```bash
vercel
```

## 🗄️ Estrutura do Banco

### Tabelas

- **events**: Eventos UFC
- **fighters**: Lutadores
- **fights**: Lutas organizadas por evento

### Campos Principais

#### Events
- `id`, `name`, `date`, `location`, `venue`, `mainEvent`, `status`

#### Fighters
- `id`, `name`, `nickname`, `record`, `weightClass`, `ranking`

#### Fights
- `id`, `eventId`, `fighter1Id`, `fighter2Id`, `weightClass`, `status`, `fightOrder`

## 🔧 API Endpoints

### Events
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `PUT /api/events/:id` - Atualizar evento
- `DELETE /api/events/:id` - Excluir evento

### Fighters
- `GET /api/fighters` - Listar lutadores
- `GET /api/fighters/:id` - Buscar lutador específico
- `POST /api/fighters` - Criar lutador
- `PUT /api/fighters/:id` - Atualizar lutador
- `DELETE /api/fighters/:id` - Excluir lutador

### Fights
- `GET /api/fights` - Listar lutas
- `GET /api/fights/:id` - Buscar luta específica
- `POST /api/fights` - Criar luta
- `PUT /api/fights/:id` - Atualizar luta
- `DELETE /api/fights/:id` - Excluir luta
- `PUT /api/fights/:id/status` - Atualizar status da luta

## 🎮 Como Usar

### Criando um Evento
1. Vá para a aba "Eventos"
2. Preencha os campos: Nome, Data, Local, Arena, Evento Principal
3. Clique em "Criar Evento"

### Adicionando Lutadores
1. Vá para a aba "Lutadores"
2. Preencha: Nome, Apelido, Record, Categoria, Ranking
3. Clique em "Adicionar Lutador"

### Criando Lutas
1. Vá para a aba "Lutas"
2. Selecione o evento, lutadores e categoria
3. Clique em "Criar Luta"

### Controle ao Vivo
1. Vá para a aba "Controle ao Vivo"
2. Selecione uma luta
3. Use os controles: Iniciar, Pausar, Retomar, Finalizar

### Editando Dados
- Clique no ícone de lápis (✏️) em qualquer item para editar
- Use os modais para fazer alterações
- Clique em "Salvar" para confirmar

## 🔄 Drag & Drop

- Arraste as lutas para reordenar dentro do mesmo evento
- A ordem é salva automaticamente no banco

## 🌐 Deploy

### Vercel
O projeto está configurado para deploy automático no Vercel com:
- Banco de dados em memória
- Configuração automática de rotas
- Build otimizado

### Variáveis de Ambiente
- `USE_SQLITE`: Define se usa SQLite (true) ou banco em memória (false)
- `VERCEL`: Identifica ambiente Vercel
- `PORT`: Porta do servidor (padrão: 3000)

## 📝 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request 