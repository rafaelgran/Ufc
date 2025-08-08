-- Script para verificar todas as políticas RLS ativas
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se RLS está ativo nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename;

-- 2. Verificar todas as políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname;

-- 3. Verificar se há políticas específicas que podem estar conflitando
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND (cmd = 'UPDATE' OR cmd = 'DELETE')
ORDER BY tablename, policyname;

-- 4. Verificar se há políticas ALL que podem estar sobrescrevendo
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND cmd = 'ALL'
ORDER BY tablename, policyname;

-- 5. Verificar se há políticas que permitem tudo (qual = 'true')
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
    AND qual = 'true'
ORDER BY tablename, policyname; 