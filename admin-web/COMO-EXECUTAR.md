# 🚀 Como Executar o Admin UFC

## ✅ **Status: FUNCIONANDO**

O admin está configurado e funcionando! Só precisa executar corretamente.

## 📋 **Passos para Executar:**

### **1. Abrir Terminal**
```bash
# Navegar para a pasta do projeto
cd "/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"
```

### **2. Verificar se está no diretório correto**
```bash
pwd
# Deve mostrar: /Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web
```

### **3. Verificar se os arquivos existem**
```bash
ls -la server-supabase.js
ls -la supabase-config.js
```

### **4. Executar o servidor**
```bash
node server-supabase.js
```

### **5. Acessar no navegador**
Abrir: **http://localhost:3000**

## 🔧 **Se Der Erro:**

### **Erro: "Cannot find module"**
```bash
# Verificar se está no diretório correto
pwd
ls -la

# Se não estiver, navegar corretamente:
cd "/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"
```

### **Erro: "Port already in use"**
```bash
# Parar processos na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
PORT=3001 node server-supabase.js
```

### **Erro de dependências**
```bash
npm install
```

## 🎯 **Testes Rápidos:**

### **Testar conexão com Supabase:**
```bash
node test-supabase-connection.js
```

### **Testar criação de lutadores:**
```bash
node test-fighter-creation.js
```

### **Testar API:**
```bash
# Health check
curl http://localhost:3000/api/health

# Listar lutadores
curl http://localhost:3000/api/fighters
```

## 📱 **Interface Web:**

Quando o servidor estiver rodando, acesse:
- **http://localhost:3000** - Interface principal
- **http://localhost:3000/api/health** - Status da API

## 🎉 **Funcionalidades Disponíveis:**

✅ **Eventos** - Criar, editar, excluir eventos UFC  
✅ **Lutadores** - Cadastrar lutadores com categoria  
✅ **Lutas** - Organizar lutas por evento  
✅ **Controle ao Vivo** - Timer e status das lutas  

## 🔍 **Sobre a Categoria:**

A categoria (weightclass) está funcionando perfeitamente:
- ✅ Backend: Salvando corretamente no Supabase
- ✅ API: Endpoints funcionando
- ✅ Testes: Passando todos os testes

**O problema pode estar na interface web. Verifique se está usando o campo correto.**

## 🚀 **PRONTO PARA USO!**

Execute os passos acima e o admin estará funcionando! 