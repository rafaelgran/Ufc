const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleSecurity() {
    console.log('🔒 Testando segurança simples...\n');
    
    try {
        // 1. Testar leitura (deve funcionar)
        console.log('1️⃣ Testando leitura...');
        const { data: fighters, error: readError } = await supabase
            .from('fighters')
            .select('id, name')
            .limit(1);
        
        if (readError) {
            console.error('   ❌ Erro na leitura:', readError);
        } else {
            console.log('   ✅ Leitura funcionando');
        }
        
        // 2. Testar criação (deve falhar se RLS estiver ativo)
        console.log('\n2️⃣ Testando criação...');
        const { data: createData, error: createError } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Security Fighter',
                weightclass: 'Test'
            })
            .select();
        
        if (createError) {
            console.log('   ✅ Criação bloqueada (RLS ativo):', createError.message);
        } else {
            console.log('   ⚠️ Criação funcionou (RLS inativo)');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Security Fighter');
        }
        
        // 3. Verificar se RLS está ativo
        console.log('\n3️⃣ Verificando RLS...');
        const { data: rlsData, error: rlsError } = await supabase
            .rpc('get_rls_status');
        
        if (rlsError) {
            console.log('   ⚠️ Não foi possível verificar RLS via RPC');
            console.log('   💡 Execute este SQL no Supabase para verificar:');
            console.log('   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN (\'fighters\', \'events\', \'fights\');');
        } else {
            console.log('   📊 Status RLS:', rlsData);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testSimpleSecurity(); 