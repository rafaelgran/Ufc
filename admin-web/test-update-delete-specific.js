const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateDeleteSpecific() {
    console.log('🔍 Teste Específico UPDATE/DELETE...\n');

    try {
        // Teste UPDATE com mais detalhes
        console.log('1️⃣ Testando UPDATE em fighters...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Test Update Specific' })
            .eq('id', 1)
            .select();

        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
            console.log('   📋 Código do erro:', updateError.code);
            console.log('   📋 Detalhes:', updateError.details);
        } else {
            console.log('   ❌ UPDATE funcionou (não esperado)');
            console.log('   📋 Dados retornados:', updateData);
        }

        console.log('\n2️⃣ Testando DELETE em fighters...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999);

        if (deleteError) {
            console.log('   ✅ DELETE bloqueado:', deleteError.message);
            console.log('   📋 Código do erro:', deleteError.code);
            console.log('   📋 Detalhes:', deleteError.details);
        } else {
            console.log('   ❌ DELETE funcionou (não esperado)');
        }

        console.log('\n3️⃣ Testando UPDATE em events...');
        const { error: updateEventsError } = await supabase
            .from('events')
            .update({ name: 'Test Event Update Specific' })
            .eq('id', 1);

        if (updateEventsError) {
            console.log('   ✅ UPDATE em events bloqueado:', updateEventsError.message);
            console.log('   📋 Código do erro:', updateEventsError.code);
        } else {
            console.log('   ❌ UPDATE em events funcionou (não esperado)');
        }

        console.log('\n4️⃣ Testando UPDATE em fights...');
        const { error: updateFightsError } = await supabase
            .from('fights')
            .update({ weightclass: 'Test Weight Specific' })
            .eq('id', 1);

        if (updateFightsError) {
            console.log('   ✅ UPDATE em fights bloqueado:', updateFightsError.message);
            console.log('   📋 Código do erro:', updateFightsError.code);
        } else {
            console.log('   ❌ UPDATE em fights funcionou (não esperado)');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testUpdateDeleteSpecific(); 