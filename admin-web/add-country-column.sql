-- Script para adicionar a coluna country na tabela fighters
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar coluna country se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fighters' AND column_name = 'country'
    ) THEN
        ALTER TABLE fighters ADD COLUMN country VARCHAR(100);
        RAISE NOTICE 'Coluna country adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna country já existe!';
    END IF;
END $$;

-- 2. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fighters' AND column_name = 'country';

-- 3. Atualizar alguns lutadores com países conhecidos (opcional)
UPDATE fighters SET country = 'Brazil' WHERE name = 'Alex Pereira';
UPDATE fighters SET country = 'Australia' WHERE name = 'Alexander Volkanovski';
UPDATE fighters SET country = 'Iraq' WHERE name = 'Amir Albazi';
UPDATE fighters SET country = 'Brazil' WHERE name = 'Charles Oliveira';
UPDATE fighters SET country = 'South Africa' WHERE name = 'Dricus Du Plessis';
UPDATE fighters SET country = 'Spain' WHERE name = 'Ilia Topuria';
UPDATE fighters SET country = 'Russia' WHERE name = 'Islam Makhachev';
UPDATE fighters SET country = 'Nigeria' WHERE name = 'Israel Adesanya';
UPDATE fighters SET country = 'Czech Republic' WHERE name = 'Jiri Prochazka';
UPDATE fighters SET country = 'Georgia' WHERE name = 'Merab Dvalishvili';
UPDATE fighters SET country = 'United States' WHERE name = 'Sean O''Malley';
UPDATE fighters SET country = 'Japan' WHERE name = 'Tatsuro Taira';

-- 4. Verificar resultado
SELECT name, country FROM fighters ORDER BY name; 