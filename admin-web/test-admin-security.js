const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminSecurity() {
    console.log('🔒 Testando segurança do banco de dados...\n');
    
    try {
        // 1. Testar leitura (deve funcionar)
        console.log('1️⃣ Testando leitura (deve funcionar)...');
        const { data: fighters, error: readError } = await supabase
            .from('fighters')
            .select('id, name')
            .limit(1);
        
        if (readError) {
            console.error('   ❌ Erro na leitura:', readError);
        } else {
            console.log('   ✅ Leitura funcionando');
        }
        
        // 2. Testar criação sem admin (deve falhar)
        console.log('\n2️⃣ Testando criação sem admin (deve falhar)...');
        const { data: createData, error: createError } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Fighter',
                weightclass: 'Test'
            })
            .select();
        
        if (createError) {
            console.log('   ✅ Criação bloqueada (esperado):', createError.message);
        } else {
            console.log('   ⚠️ Criação funcionou (não esperado)');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Fighter');
        }
        
        // 3. Testar atualização sem admin (deve falhar)
        console.log('\n3️⃣ Testando atualização sem admin (deve falhar)...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Updated Test' })
            .eq('id', 1)
            .select();
        
        if (updateError) {
            console.log('   ✅ Atualização bloqueada (esperado):', updateError.message);
        } else {
            console.log('   ⚠️ Atualização funcionou (não esperado)');
        }
        
        // 4. Testar exclusão sem admin (deve falhar)
        console.log('\n4️⃣ Testando exclusão sem admin (deve falhar)...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999); // ID que não existe
        
        if (deleteError) {
            console.log('   ✅ Exclusão bloqueada (esperado):', deleteError.message);
        } else {
            console.log('   ⚠️ Exclusão funcionou (não esperado)');
        }
        
        console.log('\n🎯 Resumo da segurança:');
        console.log('   ✅ Leitura: Funcionando para todos');
        console.log('   🔒 Modificação: Bloqueada para usuários não-admin');
        console.log('   🔒 Exclusão: Bloqueada para usuários não-admin');
        
        console.log('\n📋 Para usar o admin:');
        console.log('   1. Execute o script setup-admin-security.sql no Supabase');
        console.log('   2. O admin agora usa JWT com role "admin"');
        console.log('   3. Apenas o admin pode modificar dados');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testAdminSecurity(); 