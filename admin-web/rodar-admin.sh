#!/bin/bash

echo "🚀 Iniciando UFC Admin Web..."
echo "📁 Diretório: $(pwd)"
echo ""

# Verificar se está no diretório correto
if [ ! -f "server.js" ]; then
    echo "❌ Erro: Não encontrei server.js"
    echo "💡 Execute: cd 'It\'s time/admin-web'"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚙️  Configurando variáveis de ambiente..."
    cp env.example .env
fi

echo "✅ Tudo configurado!"
echo "🌐 Servidor iniciando em: http://localhost:3000"
echo "🛑 Para parar: Ctrl + C"
echo ""

# Rodar o servidor
node server.js 