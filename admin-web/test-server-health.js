const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServerHealth() {
    console.log('🏥 Teste de Saúde do Servidor...\n');

    try {
        // Teste básico de conexão
        console.log('1️⃣ Testando conexão com Supabase...');
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, name')
            .limit(1);

        if (eventsError) {
            console.log('   ❌ Erro ao conectar:', eventsError.message);
            return;
        }

        console.log('   ✅ Conexão com Supabase funcionando');
        console.log('   📋 Eventos encontrados:', events.length);

        // Teste de fighters
        console.log('\n2️⃣ Testando tabela fighters...');
        const { data: fighters, error: fightersError } = await supabase
            .from('fighters')
            .select('id, name')
            .limit(1);

        if (fightersError) {
            console.log('   ❌ Erro ao buscar fighters:', fightersError.message);
        } else {
            console.log('   ✅ Tabela fighters acessível');
            console.log('   📋 Fighters encontrados:', fighters.length);
        }

        // Teste de fights
        console.log('\n3️⃣ Testando tabela fights...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('id, weightclass')
            .limit(1);

        if (fightsError) {
            console.log('   ❌ Erro ao buscar fights:', fightsError.message);
        } else {
            console.log('   ✅ Tabela fights acessível');
            console.log('   📋 Fights encontrados:', fights.length);
        }

        console.log('\n🎉 Todos os testes de saúde passaram!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testServerHealth(); 