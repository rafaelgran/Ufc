-- Script simples para ativar RLS
-- Execute este SQL no Supabase SQL Editor

-- 1. Ativar RLS
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

-- 2. Criar política de leitura para todos
CREATE POLICY "Allow read access for all" ON fighters FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON events FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON fights FOR SELECT USING (true);

-- 3. Criar política de modificação apenas para admin
CREATE POLICY "Admin only can modify" ON fighters FOR ALL USING (false);
CREATE POLICY "Admin only can modify" ON events FOR ALL USING (false);
CREATE POLICY "Admin only can modify" ON fights FOR ALL USING (false);

-- 4. Verificar se funcionou
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('fighters', 'events', 'fights')
ORDER BY tablename; 