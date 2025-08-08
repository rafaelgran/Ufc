const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpecificOperations() {
    console.log('🔒 Teste Específico de Operações...\n');
    
    try {
        // 1. Testar UPDATE específico
        console.log('1️⃣ Testando UPDATE específico...');
        const { error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Test Update' })
            .eq('id', 1);

        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
        } else {
            console.log('   ❌ UPDATE funcionou (não esperado)');
        }

        // 2. Testar DELETE específico
        console.log('\n2️⃣ Testando DELETE específico...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999);

        if (deleteError) {
            console.log('   ✅ DELETE bloqueado:', deleteError.message);
        } else {
            console.log('   ❌ DELETE funcionou (não esperado)');
        }

        // 3. Testar UPDATE em events
        console.log('\n3️⃣ Testando UPDATE em events...');
        const { error: updateEventsError } = await supabase
            .from('events')
            .update({ name: 'Test Event Update' })
            .eq('id', 1);

        if (updateEventsError) {
            console.log('   ✅ UPDATE em events bloqueado:', updateEventsError.message);
        } else {
            console.log('   ❌ UPDATE em events funcionou (não esperado)');
        }

        // 4. Testar DELETE em events
        console.log('\n4️⃣ Testando DELETE em events...');
        const { error: deleteEventsError } = await supabase
            .from('events')
            .delete()
            .eq('id', 999);

        if (deleteEventsError) {
            console.log('   ✅ DELETE em events bloqueado:', deleteEventsError.message);
        } else {
            console.log('   ❌ DELETE em events funcionou (não esperado)');
        }

        // 5. Testar UPDATE em fights
        console.log('\n5️⃣ Testando UPDATE em fights...');
        const { error: updateFightsError } = await supabase
            .from('fights')
            .update({ weightclass: 'Test Weight' })
            .eq('id', 1);

        if (updateFightsError) {
            console.log('   ✅ UPDATE em fights bloqueado:', updateFightsError.message);
        } else {
            console.log('   ❌ UPDATE em fights funcionou (não esperado)');
        }

        // 6. Testar DELETE em fights
        console.log('\n6️⃣ Testando DELETE em fights...');
        const { error: deleteFightsError } = await supabase
            .from('fights')
            .delete()
            .eq('id', 999);

        if (deleteFightsError) {
            console.log('   ✅ DELETE em fights bloqueado:', deleteFightsError.message);
        } else {
            console.log('   ❌ DELETE em fights funcionou (não esperado)');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testSpecificOperations(); 