-- Script para carregar o conteúdo SVG das bandeiras
-- Execute este script após criar a tabela countries

-- Função para atualizar o SVG de uma bandeira específica
-- Exemplo: SELECT update_flag_svg('us', '<svg>...</svg>');

CREATE OR REPLACE FUNCTION update_flag_svg(flag_code_param VARCHAR(20), svg_content TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE countries 
    SET flag_svg = svg_content, updated_at = NOW()
    WHERE flag_code = flag_code_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Flag code % not found', flag_code_param;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar o SVG de uma bandeira
CREATE OR REPLACE FUNCTION get_flag_svg(flag_code_param VARCHAR(20))
RETURNS TEXT AS $$
DECLARE
    svg_content TEXT;
BEGIN
    SELECT flag_svg INTO svg_content
    FROM countries 
    WHERE flag_code = flag_code_param;
    
    RETURN svg_content;
END;
$$ LANGUAGE plpgsql;

-- Função para listar países sem SVG
CREATE OR REPLACE FUNCTION get_countries_without_svg()
RETURNS TABLE(name VARCHAR(100), flag_code VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY
    SELECT c.name, c.flag_code
    FROM countries c
    WHERE c.flag_svg IS NULL OR c.flag_svg = '';
END;
$$ LANGUAGE plpgsql;

-- Exemplos de uso:

-- 1. Atualizar o SVG de uma bandeira específica
-- SELECT update_flag_svg('us', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">...</svg>');

-- 2. Buscar o SVG de uma bandeira
-- SELECT get_flag_svg('br');

-- 3. Listar países que ainda não têm SVG
-- SELECT * FROM get_countries_without_svg();

-- 4. Contar quantos países têm SVG
-- SELECT 
--     COUNT(*) as total_countries,
--     COUNT(flag_svg) as countries_with_svg,
--     COUNT(*) - COUNT(flag_svg) as countries_without_svg
-- FROM countries;

-- 5. Buscar países por região
-- SELECT name, flag_code FROM countries WHERE name IN ('Brazil', 'Argentina', 'Chile', 'Uruguay', 'Paraguay');

-- 6. Buscar por código de bandeira
-- SELECT name, flag_code, CASE WHEN flag_svg IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_svg
-- FROM countries WHERE flag_code LIKE 'gb-%'; 