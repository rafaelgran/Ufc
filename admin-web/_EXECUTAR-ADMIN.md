# 🚀 Como Executar o UFC Admin Web

## 📋 Pré-requisitos

- **Node.js** versão 18.0.0 ou superior
- **npm** (vem com o Node.js)
- **Git** (para clonar o repositório)

## 🔧 Configuração Inicial

### 1. Navegar para a pasta do projeto
```bash
cd "It's time/admin-web"
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp env.example .env
```

O arquivo `.env` já está configurado com as credenciais do Supabase.

## 🚀 Executar o Servidor

### Opção 1: Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Opção 2: Modo de Produção
```bash
npm start
```

### Opção 3: Executar diretamente
```bash
node server.js
```

## 🌐 Acessar a Aplicação

Após executar o servidor, acesse:

- **Interface Web**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 📊 Funcionalidades Disponíveis

- ✅ **Gerenciamento de Eventos UFC**
- ✅ **Gerenciamento de Lutadores**
- ✅ **Gerenciamento de Lutas**
- ✅ **Interface Administrativa**
- ✅ **Conexão com Supabase**

## 🔍 Troubleshooting

### Erro: "Port 3000 already in use"
```bash
# Encontrar processo usando a porta 3000
lsof -ti:3000

# Matar o processo
kill -9 <PID>
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Cannot connect to database"
- Verificar se as credenciais do Supabase estão corretas no `.env`
- Verificar se o Supabase está online

## 📝 Logs do Servidor

O servidor mostra logs em tempo real:
- Conexões de clientes
- Operações de banco de dados
- Erros e avisos

## 🛑 Parar o Servidor

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

## 🔄 Reiniciar o Servidor

Após parar, execute novamente:
```bash
npm start
```

## 📱 Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

Isso usa o `nodemon` para reiniciar automaticamente quando há mudanças nos arquivos.

---

**🎯 Status Atual**: ✅ Servidor funcionando em http://localhost:3000 