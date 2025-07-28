# 🔍 Debug - Erro ao Editar Data e Hora

## ✅ Status dos Testes

**Backend funcionando perfeitamente:**
- ✅ Criação de eventos: OK
- ✅ Atualização de eventos: OK
- ✅ Conversão de datas: OK
- ✅ API HTTP: OK

## 🎯 Possíveis Causas do Erro

### 1. **Erro no Console do Navegador**
- Abra o DevTools (F12)
- Vá na aba "Console"
- Tente editar um evento
- Verifique se há erros JavaScript

### 2. **Problema de CORS**
- Verifique se o servidor está rodando em http://localhost:3000
- Verifique se não há bloqueios de CORS

### 3. **Problema de Formato de Data**
- O frontend pode estar enviando formato incorreto
- Verificar se o campo datetime-local está funcionando

## 🧪 Como Testar Manualmente

### **Passo 1: Verificar Console**
1. Abra http://localhost:3000
2. Pressione F12 (DevTools)
3. Vá na aba "Console"
4. Tente editar um evento
5. Verifique se há erros vermelhos

### **Passo 2: Testar API Diretamente**
```bash
# Testar busca de eventos
curl http://localhost:3000/api/events

# Testar atualização (substitua ID pelo ID real)
curl -X PUT http://localhost:3000/api/events/6 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2024-12-25T20:00",
    "location": "Test Location",
    "venue": "Test Venue",
    "mainEvent": "Test Main Event"
  }'
```

### **Passo 3: Verificar Formulário**
1. Abra o formulário de edição
2. Verifique se a data aparece corretamente
3. Tente modificar a data
4. Verifique se o formato está correto (YYYY-MM-DDTHH:MM)

## 🔧 Soluções Possíveis

### **Solução 1: Limpar Cache do Navegador**
1. Pressione Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
2. Ou limpe o cache manualmente

### **Solução 2: Verificar Servidor**
```bash
cd admin-web
node server-supabase.js
```

### **Solução 3: Verificar Variáveis de Ambiente**
```bash
# Verificar se o .env está correto
cat .env
```

## 📊 Informações de Debug

### **Dados de Teste:**
- ✅ Backend: Funcionando
- ✅ API: Funcionando
- ✅ Conversão de datas: Funcionando
- ✅ Mapeamento mainEvent: Funcionando

### **Logs do Servidor:**
- Verifique se há erros no terminal onde o servidor está rodando
- Procure por mensagens de erro específicas

## 🚨 Erros Comuns

### **Erro 1: "Cannot find module"**
- Execute `cd admin-web` antes de rodar o servidor

### **Erro 2: "Connection refused"**
- Verifique se o servidor está rodando na porta 3000

### **Erro 3: "CORS error"**
- Verifique se está acessando http://localhost:3000

### **Erro 4: "Invalid date format"**
- Verifique se o campo datetime-local está funcionando

## 📞 Próximos Passos

1. **Execute os testes:** `node test-api-event.js`
2. **Verifique o console:** F12 no navegador
3. **Teste manualmente:** Edite um evento
4. **Reporte o erro:** Se houver erro específico

**O backend está funcionando perfeitamente. O problema deve estar no frontend ou na interface do usuário.**

## 🎯 Comandos de Teste

```bash
# Teste da API
node test-api-event.js

# Teste de edição
node test-edit-event.js

# Teste de datas
node test-frontend-date.js

# Verificar servidor
curl http://localhost:3000/api/health
```

**Se todos os testes passarem, o problema é específico da interface do usuário.** 