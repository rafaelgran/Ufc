-- Verificar políticas finais após remoção
-- Execute este SQL no Supabase SQL Editor

SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename, policyname;

-- Se ainda houver políticas conflitantes, remova-as manualmente:
-- DROP POLICY IF EXISTS "Enable update for all users" ON fighters;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON fighters;
-- DROP POLICY IF EXISTS "Enable update for all users" ON events;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON events;
-- DROP POLICY IF EXISTS "Enable update for all users" ON fights;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON fights; 