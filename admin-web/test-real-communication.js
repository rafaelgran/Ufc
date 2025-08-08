const { SupabaseService } = require('./supabase-config');

async function testRealCommunication() {
    try {
        console.log('🔍 Testando comunicação real com o servidor...');
        
        // Buscar uma luta para testar
        const supabaseService = new SupabaseService();
        const fights = await supabaseService.getAllFights();
        
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Verificar dados ANTES
        console.log('\n📋 Dados ANTES da chamada:');
        const beforeFight = await supabaseService.getAllFights();
        const beforeTestFight = beforeFight.find(f => f.id === testFight.id);
        console.log(`   - ID: ${beforeTestFight.id}`);
        console.log(`   - Status: ${beforeTestFight.status}`);
        console.log(`   - is_live: ${beforeTestFight.is_live}`);
        
        // Simular chamada do frontend para o servidor real
        console.log('\n🌐 Fazendo chamada para o servidor real...');
        
        const response = await fetch(`http://localhost:3000/api/fights/${testFight.id}/start-live`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Status da resposta: ${response.status}`);
        console.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Resposta do servidor:`, result);
            
            // Aguardar um pouco
            console.log('\n⏳ Aguardando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verificar dados DEPOIS
            console.log('\n📋 Dados DEPOIS da chamada:');
            const afterFight = await supabaseService.getAllFights();
            const afterTestFight = afterFight.find(f => f.id === testFight.id);
            console.log(`   - ID: ${afterTestFight.id}`);
            console.log(`   - Status: ${afterTestFight.status}`);
            console.log(`   - is_live: ${afterTestFight.is_live}`);
            
            // Comparar
            console.log('\n🔍 Comparação:');
            console.log(`   - Status mudou? ${beforeTestFight.status} → ${afterTestFight.status}`);
            console.log(`   - is_live mudou? ${beforeTestFight.is_live} → ${afterTestFight.is_live}`);
            
            if (afterTestFight.status === 'live' && afterTestFight.is_live === true) {
                console.log('✅ Comunicação real funcionando corretamente!');
            } else {
                console.log('❌ Dados não foram atualizados via comunicação real');
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Erro na resposta do servidor:', response.status, response.statusText);
            console.log('❌ Detalhes do erro:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testRealCommunication(); 