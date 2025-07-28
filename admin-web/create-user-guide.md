# 🔧 Criar Novo Usuário no MongoDB Atlas

## Problema Atual
Erro: `bad auth : authentication failed`
Isso significa que o usuário `rafaelgranemann` não existe ou a senha está incorreta.

## Solução: Criar Novo Usuário

### Passo 1: Acesse MongoDB Atlas
1. Vá para: https://cloud.mongodb.com
2. Faça login na sua conta
3. Clique no seu cluster

### Passo 2: Criar Novo Usuário
1. No menu lateral, clique em **"Database Access"**
2. Clique em **"Add New Database User"**
3. Configure:
   - **Username:** `ufcadmin`
   - **Password:** `UfcAdmin2024!` (senha simples sem caracteres especiais)
   - **Database User Privileges:** Selecione **"Read and write to any database"**
4. Clique em **"Add User"**

### Passo 3: Atualizar String de Conexão
Use esta string (sem codificação necessária):
```
mongodb+srv://ufcadmin:UfcAdmin2024!@cluster0.dwmmt89.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Passo 4: Atualizar Vercel
1. No Vercel, edite a variável `MONGODB_URI`
2. Substitua pelo valor acima
3. Salve e faça redeploy

### Passo 5: Atualizar Local
No arquivo `.env`:
```
MONGODB_URI=mongodb+srv://ufcadmin:UfcAdmin2024!@cluster0.dwmmt89.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Passo 6: Testar
```bash
node test-connection.js
```

Se funcionar, o problema era o usuário/senha antigo! 