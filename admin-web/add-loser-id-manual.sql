-- Adicionar campo loser_id na tabela fights
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar a coluna loser_id
ALTER TABLE fights ADD COLUMN IF NOT EXISTS loser_id INTEGER;

-- 2. Adicionar foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fights_loser_id_fkey' 
        AND table_name = 'fights'
    ) THEN
        ALTER TABLE fights ADD CONSTRAINT fights_loser_id_fkey 
        FOREIGN KEY (loser_id) REFERENCES fighters(id);
    END IF;
END $$;

-- 3. Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_fights_loser_id ON fights(loser_id);

-- 4. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fights' 
AND column_name = 'loser_id'; 