const { SupabaseService } = require('./supabase-config');
require('dotenv').config();

async function testSupabaseConnection() {
    console.log('🧪 Testando conexão com Supabase...\n');
    
    // Debug das variáveis
    console.log('🔍 Debug:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 50) + '...' : 'NÃO DEFINIDA');
    console.log('');
    
    const supabaseService = new SupabaseService();
    
    try {
        // Test 1: Connection test
        console.log('1️⃣ Testando conexão básica...');
        const connectionTest = await supabaseService.testConnection();
        console.log(connectionTest.success ? '✅ Conexão OK' : '❌ Conexão falhou');
        console.log(`   Mensagem: ${connectionTest.message}\n`);
        
        if (!connectionTest.success) {
            console.log('❌ Falha na conexão. Verifique as credenciais do Supabase.');
            return;
        }
        
        // Test 2: Fetch events
        console.log('2️⃣ Testando busca de eventos...');
        const events = await supabaseService.getAllEvents();
        console.log(`✅ Encontrados ${events.length} eventos\n`);
        
        // Test 3: Fetch fighters
        console.log('3️⃣ Testando busca de lutadores...');
        const fighters = await supabaseService.getAllFighters();
        console.log(`✅ Encontrados ${fighters.length} lutadores\n`);
        
        // Test 4: Fetch fights
        console.log('4️⃣ Testando busca de lutas...');
        const fights = await supabaseService.getAllFights();
        console.log(`✅ Encontradas ${fights.length} lutas\n`);
        
        // Test 5: Show sample data
        if (events.length > 0) {
            console.log('📊 Exemplo de evento:');
            console.log(`   Nome: ${events[0].name}`);
            console.log(`   Data: ${events[0].date}`);
            console.log(`   Local: ${events[0].location}\n`);
        }
        
        if (fighters.length > 0) {
            console.log('🥊 Exemplo de lutador:');
            console.log(`   Nome: ${fighters[0].name}`);
            console.log(`   Record: ${fighters[0].record}`);
            console.log(`   Categoria: ${fighters[0].weightClass}\n`);
        }
        
        console.log('🎉 Todos os testes passaram! O Supabase está funcionando corretamente.');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Execute: npm install');
        console.log('   2. Configure o arquivo .env com suas credenciais');
        console.log('   3. Execute: npm run dev');
        console.log('   4. Acesse: http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.log('\n🔧 Verifique:');
        console.log('   - Se as credenciais do Supabase estão corretas');
        console.log('   - Se as tabelas existem no Supabase');
        console.log('   - Se as permissões estão configuradas');
    }
}

// Run the test
testSupabaseConnection(); 