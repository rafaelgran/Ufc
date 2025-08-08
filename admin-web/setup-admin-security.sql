-- Script para configurar segurança do banco - Apenas Admin pode modificar dados
-- Execute este SQL no Supabase SQL Editor

-- 1. Ativar Row Level Security (RLS) em todas as tabelas
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Enable read access for all users" ON fighters;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON fights;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON fighters;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON fights;
DROP POLICY IF EXISTS "Enable update for users based on email" ON fighters;
DROP POLICY IF EXISTS "Enable update for users based on email" ON events;
DROP POLICY IF EXISTS "Enable update for users based on email" ON fights;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON fighters;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON events;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON fights;

-- 3. Criar políticas de leitura para todos (app iOS e admin)
CREATE POLICY "Allow read access for all" ON fighters
    FOR SELECT USING (true);

CREATE POLICY "Allow read access for all" ON events
    FOR SELECT USING (true);

CREATE POLICY "Allow read access for all" ON fights
    FOR SELECT USING (true);

-- 4. Criar políticas de modificação apenas para admin
CREATE POLICY "Admin only can modify fighters" ON fighters
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only can modify events" ON events
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only can modify fights" ON fights
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname;

-- 6. Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename; 