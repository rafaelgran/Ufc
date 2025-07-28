#!/bin/bash

# Script para manter o servidor rodando automaticamente
# Reinicia automaticamente se cair

echo "🚀 Iniciando UFC Admin Server com auto-restart..."
echo "📊 Database: Supabase"
echo "🌐 Access: http://localhost:3000"
echo ""

# Função para limpar processos anteriores
cleanup() {
    echo ""
    echo "🛑 Parando servidor..."
    pkill -f "node server-supabase.js"
    exit 0
}

# Capturar Ctrl+C para parar graciosamente
trap cleanup SIGINT SIGTERM

# Loop infinito para reiniciar o servidor
while true; do
    echo "🔄 Iniciando servidor..."
    echo "⏰ $(date)"
    echo ""
    
    # Executar o servidor
    node server-supabase.js
    
    # Se chegou aqui, o servidor caiu
    echo ""
    echo "❌ Servidor caiu em $(date)"
    echo "🔄 Reiniciando em 3 segundos..."
    echo ""
    
    sleep 3
done 