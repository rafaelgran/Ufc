#!/bin/bash

# Script para dividir o arquivo SQL em 3 partes
# Execute: bash split_sql_into_3_parts.sh

INPUT_FILE="update_svgs.sql"
BATCH_SIZE=140 # Aproximadamente 1/3 dos 421 países
BATCH_PREFIX="update_svgs_part"

echo "Dividindo arquivo SQL em 3 partes..."
echo "Arquivo de entrada: $INPUT_FILE"
echo "Tamanho do lote: $BATCH_SIZE"
echo ""

# Criar pasta para as 3 partes
mkdir -p supabase_3_parts

# Dividir o arquivo
split -l $BATCH_SIZE "$INPUT_FILE" "supabase_3_parts/${BATCH_PREFIX}_"

# Renomear os arquivos para part_1.sql, part_2.sql, part_3.sql
cd supabase_3_parts
mv ${BATCH_PREFIX}_aa part_1.sql
mv ${BATCH_PREFIX}_ab part_2.sql
mv ${BATCH_PREFIX}_ac part_3.sql

echo "✅ Arquivos criados:"
echo ""
ls -la *.sql
echo ""
echo "📊 Tamanho dos arquivos:"
wc -l *.sql
echo ""
echo "🎯 PRONTO! Execute cada arquivo no Supabase SQL Editor" 