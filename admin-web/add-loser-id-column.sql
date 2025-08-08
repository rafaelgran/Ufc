-- Adicionar campo loser_id na tabela fights
ALTER TABLE fights ADD COLUMN IF NOT EXISTS loser_id INTEGER;

-- Adicionar foreign key constraint para loser_id
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

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_fights_loser_id ON fights(loser_id);

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fights' 
AND column_name = 'loser_id'; 