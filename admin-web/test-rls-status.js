const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSStatus() {
    console.log('🔒 Testando Status do RLS...\n');
    
    try {
        // 1. Testar se conseguimos fazer uma operação que deveria ser bloqueada
        console.log('1️⃣ Testando UPDATE que deveria ser bloqueado...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Test RLS' })
            .eq('id', 1)
            .select();

        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
            console.log('   🔍 Código do erro:', updateError.code);
            console.log('   🔍 Detalhes:', updateError.details);
        } else {
            console.log('   ❌ UPDATE funcionou (não esperado)');
            console.log('   🔍 Dados retornados:', updateData);
        }

        // 2. Testar se conseguimos fazer uma operação que deveria ser permitida
        console.log('\n2️⃣ Testando SELECT que deveria ser permitido...');
        const { data: selectData, error: selectError } = await supabase
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (selectError) {
            console.log('   ❌ SELECT falhou:', selectError.message);
        } else {
            console.log('   ✅ SELECT funcionou (esperado)');
            console.log('   🔍 Dados retornados:', selectData);
        }

        // 3. Verificar se há alguma política que está permitindo tudo
        console.log('\n3️⃣ Testando INSERT que deveria ser bloqueado...');
        const { data: insertData, error: insertError } = await supabase
            .from('fighters')
            .insert({
                name: 'Test RLS Insert',
                weightclass: 'Test'
            })
            .select();

        if (insertError) {
            console.log('   ✅ INSERT bloqueado:', insertError.message);
            console.log('   🔍 Código do erro:', insertError.code);
        } else {
            console.log('   ❌ INSERT funcionou (não esperado)');
            console.log('   🔍 Dados retornados:', insertData);
        }

        // 4. Testar DELETE
        console.log('\n4️⃣ Testando DELETE que deveria ser bloqueado...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999);

        if (deleteError) {
            console.log('   ✅ DELETE bloqueado:', deleteError.message);
            console.log('   🔍 Código do erro:', deleteError.code);
        } else {
            console.log('   ❌ DELETE funcionou (não esperado)');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testRLSStatus(); 