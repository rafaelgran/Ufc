-- Script para adicionar coluna de imagem na tabela events
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna image para armazenar imagem em base64 ou URL
ALTER TABLE events ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position; 