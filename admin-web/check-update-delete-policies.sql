-- Script para verificar especificamente as políticas de UPDATE e DELETE
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar políticas de UPDATE
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND cmd = 'UPDATE'
ORDER BY tablename, policyname;

-- 2. Verificar políticas de DELETE
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- 3. Verificar se há alguma política que permite tudo (qual = 'true' ou with_check = 'true')
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND (qual = 'true' OR with_check = 'true')
    AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, policyname; 