# 🚀 Configuração Rápida - MongoDB Atlas

## Passo 1: Criar conta no MongoDB Atlas
1. Acesse: https://cloud.mongodb.com
2. Clique em "Try Free"
3. Preencha os dados e crie sua conta

## Passo 2: Criar Cluster
1. Escolha "M0 - Free" (gratuito)
2. Escolha um provedor (AWS, Google Cloud, ou Azure)
3. Escolha uma região próxima
4. Clique em "Create"

## Passo 3: Configurar Acesso
1. **Network Access**: Clique em "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
2. **Database Access**: Clique em "Database Access" → "Add New Database User"
   - Username: `ufcadmin`
   - Password: `sua_senha_segura`
   - Role: "Read and write to any database"

## Passo 4: Obter String de Conexão
1. Clique em "Connect"
2. Escolha "Connect your application"
3. Copie a string de conexão

## Passo 5: Configurar Localmente
```bash
# No diretório admin-web
npm run setup
# Cole a string de conexão quando solicitado
```

## Passo 6: Testar
```bash
npm start
```

## Passo 7: Deploy no Vercel
1. Vá para https://vercel.com
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `MONGODB_URI`: sua string de conexão
   - `NODE_ENV`: production

## ⚡ Alternativa Rápida (Sem MongoDB)
Se quiser testar sem configurar MongoDB:
```bash
# Use o servidor in-memory
node server-vercel.js
``` 