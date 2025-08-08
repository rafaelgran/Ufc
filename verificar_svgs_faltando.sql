-- Verificar países sem SVG no banco
-- Execute no SQL Editor do Supabase

-- 1. Resumo geral
SELECT 
    COUNT(*) as total_paises,
    COUNT(flag_svg) as com_svg,
    COUNT(*) - COUNT(flag_svg) as sem_svg
FROM countries;

-- 2. Lista de países SEM SVG
SELECT 
    id,
    name,
    flag_code
FROM countries 
WHERE flag_svg IS NULL OR flag_svg = ''
ORDER BY name;

-- 3. Lista de países COM SVG (primeiros 10)
SELECT 
    name,
    flag_code,
    LENGTH(flag_svg) as tamanho
FROM countries 
WHERE flag_svg IS NOT NULL AND flag_svg != ''
ORDER BY name
LIMIT 10; 