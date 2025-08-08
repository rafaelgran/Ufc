-- Script para corrigir as políticas RLS
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admin only can modify fighters" ON fighters;
DROP POLICY IF EXISTS "Allow public read access" ON fighters;
DROP POLICY IF EXISTS "Allow read access for all" ON fighters;

DROP POLICY IF EXISTS "Admin only can modify events" ON events;
DROP POLICY IF EXISTS "Allow public read access" ON events;
DROP POLICY IF EXISTS "Allow read access for all" ON events;

DROP POLICY IF EXISTS "Admin only can modify fights" ON fights;
DROP POLICY IF EXISTS "Allow public read access" ON fights;
DROP POLICY IF EXISTS "Allow read access for all" ON fights;

-- 2. Criar políticas corretas para fighters
CREATE POLICY "Allow read access for all" ON fighters FOR SELECT USING (true);
CREATE POLICY "Admin only can modify fighters" ON fighters FOR ALL USING (false);

-- 3. Criar políticas corretas para events
CREATE POLICY "Allow read access for all" ON events FOR SELECT USING (true);
CREATE POLICY "Admin only can modify events" ON events FOR ALL USING (false);

-- 4. Criar políticas corretas para fights
CREATE POLICY "Allow read access for all" ON fights FOR SELECT USING (true);
CREATE POLICY "Admin only can modify fights" ON fights FOR ALL USING (false);

-- 5. Verificar as políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname; 