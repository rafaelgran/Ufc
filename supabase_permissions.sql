-- Configurar permissões para permitir inserção, atualização e exclusão de dados
-- Execute este SQL no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para permitir migração
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE fighters DISABLE ROW LEVEL SECURITY;
ALTER TABLE fights DISABLE ROW LEVEL SECURITY;

-- 2. Ou, se preferir manter RLS habilitado, criar políticas mais permissivas:

-- Políticas para a tabela events
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for all users" ON events;
DROP POLICY IF EXISTS "Enable update for all users" ON events;
DROP POLICY IF EXISTS "Enable delete for all users" ON events;

CREATE POLICY "Enable read access for all users" ON events
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON events
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON events
    FOR DELETE USING (true);

-- Políticas para a tabela fighters
DROP POLICY IF EXISTS "Enable read access for all users" ON fighters;
DROP POLICY IF EXISTS "Enable insert for all users" ON fighters;
DROP POLICY IF EXISTS "Enable update for all users" ON fighters;
DROP POLICY IF EXISTS "Enable delete for all users" ON fighters;

CREATE POLICY "Enable read access for all users" ON fighters
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON fighters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON fighters
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON fighters
    FOR DELETE USING (true);

-- Políticas para a tabela fights
DROP POLICY IF EXISTS "Enable read access for all users" ON fights;
DROP POLICY IF EXISTS "Enable insert for all users" ON fights;
DROP POLICY IF EXISTS "Enable update for all users" ON fights;
DROP POLICY IF EXISTS "Enable delete for all users" ON fights;

CREATE POLICY "Enable read access for all users" ON fights
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON fights
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON fights
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON fights
    FOR DELETE USING (true);

-- 3. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('events', 'fighters', 'fights')
ORDER BY tablename, policyname; 