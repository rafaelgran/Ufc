#!/bin/bash

# Script simples para gerenciar o servidor UFC Admin

case "$1" in
    "start")
        echo "🚀 Iniciando servidor..."
        nohup node server-supabase.js > server.log 2>&1 &
        echo "✅ Servidor iniciado em background"
        echo "📝 Logs: tail -f server.log"
        echo "🌐 Acesso: http://localhost:3000"
        ;;
    "stop")
        echo "🛑 Parando servidor..."
        pkill -f "node server-supabase.js"
        echo "✅ Servidor parado"
        ;;
    "restart")
        echo "🔄 Reiniciando servidor..."
        pkill -f "node server-supabase.js"
        sleep 2
        nohup node server-supabase.js > server.log 2>&1 &
        echo "✅ Servidor reiniciado"
        ;;
    "status")
        if pgrep -f "node server-supabase.js" > /dev/null; then
            echo "✅ Servidor está rodando"
            echo "🌐 http://localhost:3000"
            echo "📊 Últimos logs:"
            tail -5 server.log 2>/dev/null || echo "Nenhum log encontrado"
        else
            echo "❌ Servidor não está rodando"
        fi
        ;;
    "logs")
        echo "📝 Mostrando logs em tempo real (Ctrl+C para sair):"
        tail -f server.log
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o servidor em background"
        echo "  stop    - Para o servidor"
        echo "  restart - Reinicia o servidor"
        echo "  status  - Mostra status do servidor"
        echo "  logs    - Mostra logs em tempo real"
        ;;
esac 