const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Teste Simples de Conexão...\n');

if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL não encontrada');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
    process.exit(1);
}

console.log('✅ SUPABASE_URL:', supabaseUrl);
console.log('✅ SUPABASE_SERVICE_ROLE_KEY encontrada');
console.log('📋 Tamanho da chave:', supabaseServiceKey.length, 'caracteres');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleConnection() {
    try {
        console.log('\n🔍 Testando conexão básica...');
        
        // Teste simples de SELECT
        const { data, error } = await supabaseAdmin
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (error) {
            console.log('❌ Erro na conexão:', error.message);
            console.log('📋 Código:', error.code);
            console.log('📋 Detalhes:', error.details);
            return;
        }

        console.log('✅ Conexão funcionando!');
        console.log('📋 Dados retornados:', data);

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testSimpleConnection(); 