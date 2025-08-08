-- Verificar estrutura da coluna winner_id
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'fights' 
AND column_name = 'winner_id';

-- Verificar constraints da tabela fights
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'fights' 
AND ccu.column_name = 'winner_id';

-- Verificar foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'fights'
AND kcu.column_name = 'winner_id';

-- Testar inserção direta
UPDATE fights 
SET winner_id = 3 
WHERE id = 4 
RETURNING id, winner_id; 