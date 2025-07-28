# 🔍 Debug - Erro 500 ao Salvar Evento

## ✅ Status dos Testes

**Backend funcionando perfeitamente:**
- ✅ Criação de eventos via SupabaseService: OK
- ✅ Criação de eventos via API HTTP: OK
- ✅ Atualização de eventos: OK
- ✅ Conversão de datas: OK
- ✅ Mapeamento mainEvent/mainevent: OK

## 🎯 Possíveis Causas do Erro

### 1. **Erro no Console do Navegador**
- Abra o DevTools (F12)
- Vá na aba "Console"
- Tente criar/editar um evento
- Verifique se há erros JavaScript específicos

### 2. **Problema de CORS ou Rede**
- Verifique se o servidor está rodando em http://localhost:3000
- Verifique se não há bloqueios de rede

### 3. **Problema de Formulário**
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique se o formato de data está correto

## 🧪 Como Identificar o Erro Específico

### **Passo 1: Verificar Console do Navegador**
1. Abra http://localhost:3000
2. Pressione F12 (DevTools)
3. Vá na aba "Console"
4. Tente criar um novo evento
5. **Procure por erros vermelhos** e me informe exatamente qual erro aparece

### **Passo 2: Verificar Network Tab**
1. No DevTools, vá na aba "Network"
2. Tente criar um evento
3. Procure pela requisição POST para `/api/events`
4. Verifique:
   - Status da resposta (deve ser 201)
   - Dados enviados (Request payload)
   - Dados recebidos (Response)

### **Passo 3: Testar API Diretamente**
```bash
# Testar criação de evento
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2024-12-25T20:00",
    "location": "Test Location",
    "venue": "Test Venue",
    "mainEvent": "Test Main Event"
  }'
```

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
- ✅ API HTTP: Funcionando
- ✅ Supabase: Conectado
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

1. **Execute os testes:** `node test-frontend-event.js`
2. **Verifique o console:** F12 no navegador
3. **Teste manualmente:** Crie um evento
4. **Reporte o erro específico:** Se houver erro no console

**O backend está funcionando perfeitamente. O problema deve estar no frontend ou na interface do usuário.**

## 🎯 Comandos de Teste

```bash
# Teste da API
node test-frontend-event.js

# Teste de criação
node test-create-event-error.js

# Verificar servidor
curl http://localhost:3000/api/health
```

## 🔍 O que Verificar

### **No Console do Navegador:**
- Erros JavaScript (vermelhos)
- Requisições falhando
- Problemas de CORS

### **No Network Tab:**
- Status das requisições
- Dados enviados vs recebidos
- Headers da requisição

### **No Terminal do Servidor:**
- Logs de erro
- Mensagens de debug
- Problemas de conexão

**Se todos os testes passarem, o problema é específico da interface do usuário.**

**Por favor, me informe exatamente qual erro aparece no console do navegador quando você tenta salvar um evento!** 