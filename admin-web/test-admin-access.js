const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

// Criar cliente com service role key (admin)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminAccess() {
    console.log('🔒 Testando acesso admin...\n');
    
    try {
        // 1. Testar leitura (deve funcionar)
        console.log('1️⃣ Testando leitura com admin...');
        const { data: fighters, error: readError } = await supabaseAdmin
            .from('fighters')
            .select('id, name')
            .limit(1);
        
        if (readError) {
            console.log('   ❌ Leitura falhou:', readError.message);
        } else {
            console.log('   ✅ Leitura funcionou');
        }

        // 2. Testar criação (deve funcionar com service role)
        console.log('\n2️⃣ Testando criação com admin...');
        const { data: newFighter, error: createError } = await supabaseAdmin
            .from('fighters')
            .insert({
                name: 'Test Admin Fighter',
                weightclass: 'Test'
            })
            .select();

        if (createError) {
            console.log('   ❌ Criação falhou:', createError.message);
        } else {
            console.log('   ✅ Criação funcionou');
            // Limpar o teste
            await supabaseAdmin.from('fighters').delete().eq('name', 'Test Admin Fighter');
        }

        // 3. Testar atualização (deve funcionar com service role)
        console.log('\n3️⃣ Testando atualização com admin...');
        const { error: updateError } = await supabaseAdmin
            .from('fighters')
            .update({ name: 'Updated Test' })
            .eq('id', 1);

        if (updateError) {
            console.log('   ❌ Atualização falhou:', updateError.message);
        } else {
            console.log('   ✅ Atualização funcionou');
        }

        // 4. Testar exclusão (deve funcionar com service role)
        console.log('\n4️⃣ Testando exclusão com admin...');
        const { error: deleteError } = await supabaseAdmin
            .from('fighters')
            .delete()
            .eq('id', 999); // ID que não existe

        if (deleteError) {
            console.log('   ❌ Exclusão falhou:', deleteError.message);
        } else {
            console.log('   ✅ Exclusão funcionou');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAdminAccess(); 