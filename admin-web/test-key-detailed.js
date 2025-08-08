const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 Teste Detalhado da Service Role Key...\n');

if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL não encontrada');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
    process.exit(1);
}

console.log('✅ SUPABASE_URL encontrada');
console.log('✅ SUPABASE_SERVICE_ROLE_KEY encontrada');
console.log('📋 Tamanho da chave:', supabaseServiceKey.length, 'caracteres');
console.log('📋 Key (primeiros 20 chars):', supabaseServiceKey.substring(0, 20) + '...');
console.log('📋 Key (últimos 20 chars):', '...' + supabaseServiceKey.substring(supabaseServiceKey.length - 20));

// Verificar se a chave tem o formato correto
if (!supabaseServiceKey.startsWith('eyJ')) {
    console.log('❌ A chave não começa com "eyJ" (formato JWT inválido)');
    process.exit(1);
}

if (supabaseServiceKey.length < 200) {
    console.log('❌ A chave parece muito curta para uma Service Role Key');
    process.exit(1);
}

console.log('✅ Formato da chave parece correto');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testKeyDetailed() {
    try {
        console.log('\n🔍 Testando conexão com Service Role Key...');
        
        // Teste simples de SELECT
        const { data, error } = await supabaseAdmin
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (error) {
            console.log('❌ Erro na conexão:', error.message);
            console.log('📋 Código:', error.code);
            console.log('📋 Detalhes:', error.details);
            console.log('📋 Hint:', error.hint);
            return;
        }

        console.log('✅ Conexão funcionando!');
        console.log('📋 Dados retornados:', data.length, 'registros');

        // Teste de INSERT (deve funcionar com Service Role Key)
        console.log('\n🔍 Testando INSERT...');
        const { data: insertData, error: insertError } = await supabaseAdmin
            .from('fighters')
            .insert({
                name: 'Test Service Role Key Detailed',
                weightclass: 'Test'
            })
            .select();

        if (insertError) {
            console.log('❌ INSERT falhou:', insertError.message);
            console.log('📋 Código:', insertError.code);
            console.log('📋 Detalhes:', insertError.details);
        } else {
            console.log('✅ INSERT funcionou!');
            console.log('📋 ID criado:', insertData[0].id);
            
            // Limpar o teste
            await supabaseAdmin
                .from('fighters')
                .delete()
                .eq('name', 'Test Service Role Key Detailed');
            console.log('🧹 Teste removido');
        }

        console.log('\n🎉 Teste da Service Role Key concluído!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.log('📋 Stack trace:', error.stack);
    }
}

testKeyDetailed(); 