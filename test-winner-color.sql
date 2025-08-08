-- Script para testar a funcionalidade de cor do vencedor
-- Execute estes comandos no Supabase SQL Editor

-- 1. Primeiro, vamos verificar as lutas atuais
SELECT id, fighter1id, fighter2id, status, winnerid FROM fights ORDER BY id;

-- 2. Vamos atualizar a luta ID 33 para ter um vencedor (fighter1id = 33)
UPDATE fights 
SET status = 'finished', winnerid = 33 
WHERE id = 33;

-- 3. Vamos atualizar a luta ID 34 para ter um vencedor (fighter2id = 34)
UPDATE fights 
SET status = 'finished', winnerid = 34 
WHERE id = 34;

-- 4. Verificar se as atualizações funcionaram
SELECT id, fighter1id, fighter2id, status, winnerid FROM fights WHERE id IN (33, 34);

-- 5. Para reverter os testes (voltar ao estado original)
-- UPDATE fights SET status = 'scheduled', winnerid = NULL WHERE id IN (33, 34); 