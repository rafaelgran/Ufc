#!/bin/bash

# Script para gerar comandos SQL a partir dos arquivos SVG
# Execute: bash generate_sql_from_svgs.sh

FLAGS_DIR="Fyte/Assets.xcassets/flags"
OUTPUT_FILE="update_svgs.sql"

echo "-- Script gerado automaticamente para atualizar SVGs" > $OUTPUT_FILE
echo "-- Execute este script no SQL Editor do Supabase" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "Iniciando geração de comandos SQL..."
echo "Pasta de bandeiras: $FLAGS_DIR"
echo "Arquivo de saída: $OUTPUT_FILE"
echo ""

# Contador
count=0

# Processar cada arquivo SVG
for svg_file in "$FLAGS_DIR"/*.svg; do
    if [ -f "$svg_file" ]; then
        # Extrair o código da bandeira do nome do arquivo
        flag_code=$(basename "$svg_file" .svg)
        
        # Ler o conteúdo do arquivo SVG
        svg_content=$(cat "$svg_file")
        
        # Escapar aspas simples no conteúdo SVG
        svg_content_escaped=$(echo "$svg_content" | sed "s/'/''/g")
        
        # Gerar comando SQL
        echo "-- $flag_code" >> $OUTPUT_FILE
        echo "UPDATE countries SET flag_svg = '$svg_content_escaped' WHERE flag_code = '$flag_code';" >> $OUTPUT_FILE
        echo "" >> $OUTPUT_FILE
        
        count=$((count + 1))
        echo "✅ Processado: $flag_code"
    fi
done

echo ""
echo "🎉 Geração concluída!"
echo "📊 Total de arquivos processados: $count"
echo "📄 Arquivo gerado: $OUTPUT_FILE"
echo ""
echo "📋 Próximos passos:"
echo "1. Abra o arquivo $OUTPUT_FILE"
echo "2. Copie o conteúdo"
echo "3. Cole no SQL Editor do Supabase"
echo "4. Execute o script"
echo ""
echo "💡 Dica: Você pode executar em lotes menores se o script for muito grande" 