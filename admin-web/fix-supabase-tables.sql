-- Script para corrigir a estrutura das tabelas no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar estrutura atual das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('events', 'fighters', 'fights')
ORDER BY table_name, ordinal_position;

-- 2. Corrigir tabela events - adicionar coluna mainEvent se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'mainEvent'
    ) THEN
        ALTER TABLE events ADD COLUMN mainEvent TEXT;
    END IF;
END $$;

-- 3. Corrigir tabela events - renomear coluna mainevent para mainEvent se necessário
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'mainevent'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'mainEvent'
    ) THEN
        ALTER TABLE events RENAME COLUMN mainevent TO mainEvent;
    END IF;
END $$;

-- 4. Corrigir foreign keys na tabela fights
-- Primeiro, remover foreign keys existentes se houver problemas
DO $$ 
BEGIN
    -- Verificar se as foreign keys existem e estão corretas
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fights_eventId_fkey' 
        AND table_name = 'fights'
    ) THEN
        -- A foreign key já existe, verificar se está correta
        NULL;
    ELSE
        -- Adicionar foreign key para events
        ALTER TABLE fights ADD CONSTRAINT fights_eventId_fkey 
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fights_fighter1Id_fkey' 
        AND table_name = 'fights'
    ) THEN
        -- A foreign key já existe, verificar se está correta
        NULL;
    ELSE
        -- Adicionar foreign key para fighter1
        ALTER TABLE fights ADD CONSTRAINT fights_fighter1Id_fkey 
        FOREIGN KEY (fighter1Id) REFERENCES fighters(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fights_fighter2Id_fkey' 
        AND table_name = 'fights'
    ) THEN
        -- A foreign key já existe, verificar se está correta
        NULL;
    ELSE
        -- Adicionar foreign key para fighter2
        ALTER TABLE fights ADD CONSTRAINT fights_fighter2Id_fkey 
        FOREIGN KEY (fighter2Id) REFERENCES fighters(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fights_winnerId_fkey' 
        AND table_name = 'fights'
    ) THEN
        -- A foreign key já existe, verificar se está correta
        NULL;
    ELSE
        -- Adicionar foreign key para winner
        ALTER TABLE fights ADD CONSTRAINT fights_winnerId_fkey 
        FOREIGN KEY (winnerId) REFERENCES fighters(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Verificar se a coluna isChampionship existe na tabela fights
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fights' AND column_name = 'isChampionship'
    ) THEN
        ALTER TABLE fights ADD COLUMN isChampionship BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 6. Verificar se a coluna weightClass existe na tabela fighters
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fighters' AND column_name = 'weightClass'
    ) THEN
        ALTER TABLE fighters ADD COLUMN weightClass TEXT;
    END IF;
END $$;

-- 7. Atualizar dados existentes se necessário
UPDATE events SET mainEvent = mainevent WHERE mainEvent IS NULL AND mainevent IS NOT NULL;

-- 8. Verificar estrutura final
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('events', 'fighters', 'fights')
ORDER BY table_name, ordinal_position;

-- 9. Verificar foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('events', 'fighters', 'fights'); 