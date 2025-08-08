-- Script para carregar SVGs manualmente no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos ver quantos países temos
SELECT COUNT(*) as total_countries FROM countries;

-- Listar países que ainda não têm SVG
SELECT name, flag_code FROM countries 
WHERE flag_svg IS NULL OR flag_svg = '' 
ORDER BY name;

-- Exemplo de como atualizar um SVG específico:
-- UPDATE countries 
-- SET flag_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">...</svg>'
-- WHERE flag_code = 'us';

-- Para carregar todos os SVGs, você precisará:
-- 1. Ler cada arquivo SVG da pasta flags
-- 2. Executar um UPDATE para cada um

-- Exemplo para alguns países importantes:
UPDATE countries 
SET flag_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#a)"><path fill="#eee" d="M256 0h256v64l-32 32 32 32v64l-32 32 32 32v64l-32 32 32 32v64l-256 32L0 448v-64l32-32-32-32v-64z"/><path fill="#d80027" d="M224 64h288v64H224Zm0 128h288v64H256ZM0 320h512v64H0Zm0 128h512v64H0Z"/><path fill="#0052b4" d="M0 0h256v256H0Z"/><path fill="#eee" d="m187 243 57-41h-70l57 41-22-67zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67zm162-81 57-41h-70l57 41-22-67zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67Zm162-82 57-41h-70l57 41-22-67Zm-81 0 57-41H93l57 41-22-67zm-81 0 57-41H12l57 41-22-67Z"/></g></svg>'
WHERE flag_code = 'us';

UPDATE countries 
SET flag_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#a)"><path fill="#009c3b" d="M0 0h512v512H0z"/><path fill="#ffdf00" d="m256 100.2 47.3 145.6H512L300.7 327.6l47.3 145.6L256 273.2 164 473.2l47.3-145.6L0 245.8h208.7z"/><path fill="#002776" d="M256 0v100.2L208.7 245.8H0v20.5h208.7L256 411.9V512h20.5V411.9L303.3 266.3H512v-20.5H303.3L276.5 100.2V0z"/></g></svg>'
WHERE flag_code = 'br';

-- Verificar se foi atualizado
SELECT name, flag_code, 
       CASE WHEN flag_svg IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_svg
FROM countries 
WHERE flag_code IN ('us', 'br'); 