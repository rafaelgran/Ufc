-- Script para remover políticas conflitantes de UPDATE e DELETE
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar políticas existentes antes
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname;

-- 2. Remover políticas específicas de UPDATE
DROP POLICY IF EXISTS "Enable update for all users" ON fighters;
DROP POLICY IF EXISTS "Enable update for all users" ON events;
DROP POLICY IF EXISTS "Enable update for all users" ON fights;

-- 3. Remover políticas específicas de DELETE
DROP POLICY IF EXISTS "Enable delete for all users" ON fighters;
DROP POLICY IF EXISTS "Enable delete for all users" ON events;
DROP POLICY IF EXISTS "Enable delete for all users" ON fights;

-- 4. Verificar políticas após remoção
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname;

-- 5. Testar se as políticas foram removidas corretamente
-- Se não houver políticas conflitantes, apenas as políticas ALL e SELECT devem aparecer 