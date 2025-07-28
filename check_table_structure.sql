-- Verificar estrutura da tabela fights
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fights' 
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'fights'; 