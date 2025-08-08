-- Verificar constraints da tabela fights
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'fights'::regclass;

-- Verificar se há uma constraint específica para result_type
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'fights'::regclass 
AND pg_get_constraintdef(oid) LIKE '%result_type%';

-- Verificar valores permitidos para result_type (se for um enum)
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%result%' OR t.typname LIKE '%fight%'; 