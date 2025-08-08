-- Adicionar colunas para controle de live activities e resultados das lutas
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar colunas para controle ao vivo da luta
ALTER TABLE fights ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 0;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_duration INTEGER DEFAULT 300; -- 5 minutos em segundos
ALTER TABLE fights ADD COLUMN IF NOT EXISTS round_status VARCHAR(20) DEFAULT 'stopped'; -- 'running', 'paused', 'stopped'

-- 2. Adicionar colunas para resultado da luta
ALTER TABLE fights ADD COLUMN IF NOT EXISTS result_type VARCHAR(10); -- 'DE', 'KO', 'TKO', 'SUB', 'Draw', 'DQ', 'NC'
ALTER TABLE fights ADD COLUMN IF NOT EXISTS final_round INTEGER;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS final_time VARCHAR(10); -- formato "MM:SS"
ALTER TABLE fights ADD COLUMN IF NOT EXISTS winner_id INTEGER;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT FALSE;
ALTER TABLE fights ADD COLUMN IF NOT EXISTS result_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Adicionar índices para melhor performance (apenas para colunas que existem)
CREATE INDEX IF NOT EXISTS idx_fights_is_live ON fights(is_live);
CREATE INDEX IF NOT EXISTS idx_fights_is_finished ON fights(is_finished);

-- 4. Adicionar constraints para validação (sem IF NOT EXISTS)
DO $$ 
BEGIN
    -- Adicionar constraint para result_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_result_type' 
        AND table_name = 'fights'
    ) THEN
        ALTER TABLE fights ADD CONSTRAINT check_result_type
            CHECK (result_type IN ('DE', 'KO', 'TKO', 'SUB', 'Draw', 'DQ', 'NC'));
    END IF;
    
    -- Adicionar constraint para round_status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_round_status' 
        AND table_name = 'fights'
    ) THEN
        ALTER TABLE fights ADD CONSTRAINT check_round_status
            CHECK (round_status IN ('running', 'paused', 'stopped'));
    END IF;
    
    -- Adicionar foreign key para winner_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_fights_winner' 
        AND table_name = 'fights'
    ) THEN
        ALTER TABLE fights ADD CONSTRAINT fk_fights_winner
            FOREIGN KEY (winner_id) REFERENCES fighters(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Comentários para documentação
COMMENT ON COLUMN fights.is_live IS 'Indica se a luta está sendo transmitida ao vivo';
COMMENT ON COLUMN fights.current_round IS 'Round atual da luta (1-5)';
COMMENT ON COLUMN fights.round_start_time IS 'Horário de início do round atual';
COMMENT ON COLUMN fights.round_end_time IS 'Horário de fim do round atual';
COMMENT ON COLUMN fights.round_duration IS 'Duração do round em segundos (padrão: 300 = 5 min)';
COMMENT ON COLUMN fights.round_status IS 'Status do round: running, paused, stopped';
COMMENT ON COLUMN fights.result_type IS 'Tipo de resultado: DE(Decisão), KO, TKO, SUB, Draw, DQ, NC';
COMMENT ON COLUMN fights.final_round IS 'Round final da luta';
COMMENT ON COLUMN fights.final_time IS 'Tempo final da luta no formato MM:SS';
COMMENT ON COLUMN fights.winner_id IS 'ID do lutador vencedor';
COMMENT ON COLUMN fights.is_finished IS 'Indica se a luta foi finalizada';
COMMENT ON COLUMN fights.result_updated_at IS 'Data/hora da última atualização do resultado';

-- 6. Verificar se as colunas foram criadas
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'fights'
AND column_name IN (
    'is_live', 'current_round', 'round_start_time', 'round_end_time',
    'round_duration', 'round_status', 'result_type', 'final_round',
    'final_time', 'winner_id', 'is_finished', 'result_updated_at'
)
ORDER BY column_name; 