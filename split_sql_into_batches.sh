#!/bin/bash

# Script para dividir o arquivo SQL em lotes menores
# Execute: bash split_sql_into_batches.sh

INPUT_FILE="update_svgs.sql"
BATCH_SIZE=50
BATCH_PREFIX="update_svgs_batch"

echo "Dividindo arquivo SQL em lotes menores..."
echo "Arquivo de entrada: $INPUT_FILE"
echo "Tamanho do lote: $BATCH_SIZE"
echo ""

# Criar pasta para os lotes
mkdir -p sql_batches

# Dividir o arquivo
split -l $((BATCH_SIZE * 3)) "$INPUT_FILE" "sql_batches/${BATCH_PREFIX}_"

# Renomear arquivos
cd sql_batches
counter=1
for file in ${BATCH_PREFIX}_*; do
    mv "$file" "batch_${counter}.sql"
    echo "✅ Criado: batch_${counter}.sql"
    counter=$((counter + 1))
done

echo ""
echo "🎉 Divisão concluída!"
echo "📁 Pasta: sql_batches/"
echo "📊 Total de lotes: $((counter - 1))"
echo ""
echo "📋 Como usar:"
echo "1. Abra cada arquivo batch_X.sql"
echo "2. Copie o conteúdo"
echo "3. Cole no SQL Editor do Supabase"
echo "4. Execute um lote por vez"
echo ""
echo "💡 Dica: Execute os lotes em ordem (batch_1.sql, batch_2.sql, etc.)" 