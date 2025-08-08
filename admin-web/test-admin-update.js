const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminUpdate() {
    console.log('🔧 Teste UPDATE com Admin (Service Role Key)...\n');

    try {
        // Teste UPDATE com admin
        console.log('1️⃣ Testando UPDATE em fighters com admin...');
        const { data: updateData, error: updateError } = await supabaseAdmin
            .from('fighters')
            .update({ name: 'Admin Update Test' })
            .eq('id', 1)
            .select();

        if (updateError) {
            console.log('   ❌ UPDATE falhou:', updateError.message);
        } else {
            console.log('   ✅ UPDATE funcionou (esperado para admin)');
            console.log('   📋 Dados retornados:', updateData);
            console.log('   📋 Linhas afetadas:', updateData.length);
        }

        // Verificar se a atualização aconteceu
        console.log('\n2️⃣ Verificando se a atualização aconteceu...');
        const { data: checkFighter, error: checkError } = await supabaseAdmin
            .from('fighters')
            .select('id, name')
            .eq('id', 1)
            .single();

        if (checkError) {
            console.log('   ❌ Erro ao verificar:', checkError.message);
        } else {
            console.log('   📋 Nome atual:', checkFighter.name);
            if (checkFighter.name === 'Admin Update Test') {
                console.log('   ✅ UPDATE realmente funcionou para admin!');
            } else {
                console.log('   ❌ UPDATE não funcionou para admin');
            }
        }

        // Teste DELETE com admin
        console.log('\n3️⃣ Testando DELETE em fighters com admin...');
        const { error: deleteError } = await supabaseAdmin
            .from('fighters')
            .delete()
            .eq('id', 999);

        if (deleteError) {
            console.log('   ❌ DELETE falhou:', deleteError.message);
        } else {
            console.log('   ✅ DELETE funcionou (esperado para admin)');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAdminUpdate(); 