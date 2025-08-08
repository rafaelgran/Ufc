#!/bin/bash

echo "🚀 Iniciando UFC Admin Web (Caminho Absoluto)..."
echo ""

# Caminho absoluto para a pasta admin-web
ADMIN_PATH="/Users/rafael.granemann/Documents/xcode/its-time/It's time/admin-web"

echo "📁 Navegando para: $ADMIN_PATH"

# Navegar para a pasta
cd "$ADMIN_PATH"

# Verificar se chegou no lugar certo
if [ ! -f "server.js" ]; then
    echo "❌ Erro: Não encontrei server.js em $ADMIN_PATH"
    echo "💡 Verifique se o caminho está correto"
    exit 1
fi

echo "✅ Pasta encontrada!"
echo "📁 Diretório atual: $(pwd)"
echo ""

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