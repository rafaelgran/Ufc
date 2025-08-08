const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPolicies() {
    console.log('🔒 Testando políticas específicas...\n');
    
    try {
        // 1. Testar INSERT
        console.log('1️⃣ Testando INSERT...');
        const { data: insertData, error: insertError } = await supabase
            .from('fighters')
            .insert({
                name: 'Test Policy Fighter',
                weightclass: 'Test'
            })
            .select();
        
        if (insertError) {
            console.log('   ✅ INSERT bloqueado:', insertError.message);
        } else {
            console.log('   ⚠️ INSERT funcionou (política permite)');
            // Limpar o teste
            await supabase.from('fighters').delete().eq('name', 'Test Policy Fighter');
        }
        
        // 2. Testar UPDATE
        console.log('\n2️⃣ Testando UPDATE...');
        const { data: updateData, error: updateError } = await supabase
            .from('fighters')
            .update({ name: 'Updated Test' })
            .eq('id', 1)
            .select();
        
        if (updateError) {
            console.log('   ✅ UPDATE bloqueado:', updateError.message);
        } else {
            console.log('   ⚠️ UPDATE funcionou (política permite)');
        }
        
        // 3. Testar DELETE
        console.log('\n3️⃣ Testando DELETE...');
        const { error: deleteError } = await supabase
            .from('fighters')
            .delete()
            .eq('id', 999); // ID que não existe
        
        if (deleteError) {
            console.log('   ✅ DELETE bloqueado:', deleteError.message);
        } else {
            console.log('   ⚠️ DELETE funcionou (política permite)');
        }
        
        // 4. Verificar se há políticas conflitantes
        console.log('\n4️⃣ Verificando políticas...');
        console.log('   💡 Baseado na imagem, você tem:');
        console.log('   - Política ALL: "Admin only can modify fighters" (public role)');
        console.log('   - Política DELETE: "Enable delete for all users" (public role)');
        console.log('   - Política INSERT: "Enable insert for all users" (public role)');
        console.log('   - Política UPDATE: "Enable update for all users" (public role)');
        console.log('   ');
        console.log('   ⚠️ PROBLEMA: As políticas específicas (DELETE, INSERT, UPDATE)');
        console.log('   estão sobrescrevendo a política ALL que deveria bloquear tudo!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testPolicies(); 