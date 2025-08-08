-- Script para remover a coluna record da tabela fighters
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover a coluna record
ALTER TABLE fighters DROP COLUMN IF EXISTS record;

-- 2. Verificar se a coluna foi removida
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fighters' 
ORDER BY ordinal_position; 