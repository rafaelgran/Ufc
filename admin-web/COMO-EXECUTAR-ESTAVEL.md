# 🚀 Como Executar o Admin UFC - Versão Estável

## ✅ Problemas Corrigidos
- ✅ Mapeamento correto de nomes de colunas (mainEvent → mainevent, fightOrder → fightorder, etc.)
- ✅ Auto-restart quando o servidor cair
- ✅ Tratamento de erros melhorado

## 🎯 Métodos de Execução

### Método 1: Auto-Restart (Recomendado)
```bash
cd "/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"
./start-server.sh
```
**Vantagens:**
- Reinicia automaticamente se cair
- Logs detalhados
- Para graciosamente com Ctrl+C

### Método 2: Execução Manual
```bash
cd "/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"
node server-supabase.js
```

### Método 3: Desenvolvimento com Nodemon
```bash
cd "/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"
npm run dev:supabase
```

## 🌐 Acesso
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🔧 Troubleshooting

### Se o servidor não iniciar:
1. Verifique se está no diretório correto: `pwd`
2. Verifique se o arquivo existe: `ls -la server-supabase.js`
3. Verifique as dependências: `npm install`

### Se houver erros de coluna:
- Os erros foram corrigidos no código
- O servidor agora mapeia automaticamente os nomes de colunas

### Para parar o servidor:
- **Auto-restart:** Ctrl+C
- **Manual:** Ctrl+C ou fechar terminal

## 📊 Status do Servidor
- ✅ Conectado ao Supabase
- ✅ Mapeamento de colunas corrigido
- ✅ Auto-restart configurado
- ✅ Tratamento de erros melhorado

## 🎉 Pronto para Uso!
O admin está 100% funcional e estável! 🚀 