const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalSecurity() {
    console.log('🔒 Teste Final de Segurança RLS...\n');

    try {
        console.log('1️⃣ Testando SELECT (deveria funcionar)...');
        const { data: selectData, error: selectError } = await supabase
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (selectError) {
            console.log('   ❌ SELECT falhou:', selectError.message);
        } else {
            console.log('   ✅ SELECT funcionou (esperado)');
        }

        console.log('\n2️⃣ Testando INSERT (deveria ser bloqueado)...');
        const { data: insertData, error: insertError } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Final Security',
                weightclass: 'Test'
            })
            .select();

        if (insertError) {
            console.log('   ✅ INSERT bloqueado:', insertError.message);
        } else {
            console.log('   ❌ INSERT funcionou (não esperado)');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Final Security');
        }

        console.log('\n3️⃣ Testando UPDATE (deveria ser bloqueado)...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Test Update Final' })
            .eq('id', 1)
            .select();

        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
        } else {
            console.log('   ❌ UPDATE funcionou (não esperado)');
        }

        console.log('\n4️⃣ Testando DELETE (deveria ser bloqueado)...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999);

        if (deleteError) {
            console.log('   ✅ DELETE bloqueado:', deleteError.message);
        } else {
            console.log('   ❌ DELETE funcionou (não esperado)');
        }

        console.log('\n5️⃣ Testando UPDATE em events...');
        const { error: updateEventsError } = await supabase
            .from('events')
            .update({ name: 'Test Event Update Final' })
            .eq('id', 1);

        if (updateEventsError) {
            console.log('   ✅ UPDATE em events bloqueado:', updateEventsError.message);
        } else {
            console.log('   ❌ UPDATE em events funcionou (não esperado)');
        }

        console.log('\n6️⃣ Testando UPDATE em fights...');
        const { error: updateFightsError } = await supabase
            .from('fights')
            .update({ weightclass: 'Test Weight Final' })
            .eq('id', 1);

        if (updateFightsError) {
            console.log('   ✅ UPDATE em fights bloqueado:', updateFightsError.message);
        } else {
            console.log('   ❌ UPDATE em fights funcionou (não esperado)');
        }

        console.log('\n📋 RESUMO:');
        console.log('   - Se INSERT está bloqueado mas UPDATE/DELETE funcionam,');
        console.log('     há uma política específica sobrescrevendo as restritivas');
        console.log('   - Se todos estão bloqueados, RLS está funcionando corretamente');
        console.log('   - Se todos funcionam, RLS não está ativo ou há política permissiva');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testFinalSecurity(); 