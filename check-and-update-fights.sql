-- Script para verificar e atualizar os dados das lutas
-- Execute estes comandos no Supabase SQL Editor

-- 1. Verificar a estrutura da tabela fights
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fights' 
ORDER BY ordinal_position;

-- 2. Verificar os dados atuais da luta 35
SELECT id, fighter1id, fighter2id, status, winnerid, is_finished, "isFinished", finished
FROM fights 
WHERE id = 35;

-- 3. Verificar todas as lutas com seus campos
SELECT id, fighter1id, fighter2id, status, winnerid, 
       is_finished, "isFinished", finished
FROM fights 
ORDER BY id;

-- 4. Atualizar a luta 35 com todos os campos possíveis
UPDATE fights 
SET 
    status = 'finished',
    winnerid = 33,
    is_finished = true,
    "isFinished" = true,
    finished = true
WHERE id = 35;

-- 5. Verificar se as atualizações funcionaram
SELECT id, fighter1id, fighter2id, status, winnerid, 
       is_finished, "isFinished", finished
FROM fights 
WHERE id = 35; 