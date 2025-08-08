const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Teste de Ambas as Chaves...\n');

if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL não encontrada');
    process.exit(1);
}

if (!supabaseAnonKey) {
    console.error('❌ SUPABASE_ANON_KEY não encontrada');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
    process.exit(1);
}

console.log('✅ SUPABASE_URL:', supabaseUrl);
console.log('✅ SUPABASE_ANON_KEY encontrada');
console.log('✅ SUPABASE_SERVICE_ROLE_KEY encontrada');
console.log('📋 Tamanho Anon Key:', supabaseAnonKey.length, 'caracteres');
console.log('📋 Tamanho Service Key:', supabaseServiceKey.length, 'caracteres');

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testBothKeys() {
    try {
        console.log('\n🔍 Testando Anon Key...');
        
        const { data: anonData, error: anonError } = await supabaseAnon
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (anonError) {
            console.log('❌ Erro com Anon Key:', anonError.message);
        } else {
            console.log('✅ Anon Key funcionando!');
            console.log('📋 Dados:', anonData);
        }

        console.log('\n🔍 Testando Service Role Key...');
        
        const { data: adminData, error: adminError } = await supabaseAdmin
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (adminError) {
            console.log('❌ Erro com Service Role Key:', adminError.message);
            console.log('📋 Código:', adminError.code);
            console.log('📋 Detalhes:', adminError.details);
        } else {
            console.log('✅ Service Role Key funcionando!');
            console.log('📋 Dados:', adminData);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testBothKeys(); 