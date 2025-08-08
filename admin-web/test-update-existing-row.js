const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateExistingRow() {
    console.log('🔍 Teste UPDATE em linha existente...\n');

    try {
        // Primeiro, vamos verificar se existe um fighter com ID 1
        console.log('1️⃣ Verificando se existe fighter com ID 1...');
        const { data: existingFighter, error: selectError } = await supabase
            .from('fighters')
            .select('id, name')
            .eq('id', 1)
            .single();

        if (selectError) {
            console.log('   ❌ Erro ao buscar fighter:', selectError.message);
            return;
        }

        if (!existingFighter) {
            console.log('   ❌ Fighter com ID 1 não encontrado');
            return;
        }

        console.log('   ✅ Fighter encontrado:', existingFighter.name);

        // Agora vamos tentar atualizar este fighter
        console.log('\n2️⃣ Tentando atualizar o fighter...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Test Update Existing Row' })
            .eq('id', 1)
            .select();

        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
            console.log('   📋 Código do erro:', updateError.code);
        } else {
            console.log('   ❌ UPDATE funcionou (não esperado)');
            console.log('   📋 Dados retornados:', updateData);
            console.log('   📋 Linhas afetadas:', updateData.length);
        }

        // Vamos verificar se a atualização realmente aconteceu
        console.log('\n3️⃣ Verificando se a atualização aconteceu...');
        const { data: checkFighter, error: checkError } = await supabase
            .from('fighters')
            .select('id, name')
            .eq('id', 1)
            .single();

        if (checkError) {
            console.log('   ❌ Erro ao verificar:', checkError.message);
        } else {
            console.log('   📋 Nome atual:', checkFighter.name);
            if (checkFighter.name === 'Test Update Existing Row') {
                console.log('   ❌ UPDATE realmente funcionou!');
            } else {
                console.log('   ✅ UPDATE não funcionou (esperado)');
            }
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testUpdateExistingRow(); 