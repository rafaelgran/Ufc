-- Script para corrigir as políticas RLS - Versão 2
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

-- 2. Criar políticas específicas para fighters
CREATE POLICY "Allow read access for all" ON fighters FOR SELECT USING (true);
CREATE POLICY "Block insert for public" ON fighters FOR INSERT WITH CHECK (false);
CREATE POLICY "Block update for public" ON fighters FOR UPDATE USING (false);
CREATE POLICY "Block delete for public" ON fighters FOR DELETE USING (false);

-- 3. Criar políticas específicas para events
CREATE POLICY "Allow read access for all" ON events FOR SELECT USING (true);
CREATE POLICY "Block insert for public" ON events FOR INSERT WITH CHECK (false);
CREATE POLICY "Block update for public" ON events FOR UPDATE USING (false);
CREATE POLICY "Block delete for public" ON events FOR DELETE USING (false);

-- 4. Criar políticas específicas para fights
CREATE POLICY "Allow read access for all" ON fights FOR SELECT USING (true);
CREATE POLICY "Block insert for public" ON fights FOR INSERT WITH CHECK (false);
CREATE POLICY "Block update for public" ON fights FOR UPDATE USING (false);
CREATE POLICY "Block delete for public" ON fights FOR DELETE USING (false);

-- 5. Verificar as políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname; 