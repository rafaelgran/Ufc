const { SupabaseService } = require('./supabase-config');

async function testFrontendBackendCommunication() {
    try {
        console.log('🔍 Testando comunicação frontend-backend...');
        
        const supabaseService = new SupabaseService();
        
        // Buscar uma luta para testar
        const fights = await supabaseService.getAllFights();
        let testFight = fights.find(f => f.status !== 'live' && !f.is_live && f.status !== 'finished');
        
        if (!testFight) {
            testFight = fights.find(f => f.status !== 'finished');
            console.log('⚠️ Usando luta que não está finalizada para teste');
        }
        
        if (!testFight) {
            console.log('❌ Nenhuma luta adequada encontrada para teste');
            return;
        }
        
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Simular exatamente o que o frontend faz
        console.log('\n🌐 Simulando chamada do frontend...');
        
        // 1. Simular a chamada fetch que o frontend faz
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
            
            // 2. Simular o que o frontend faria com a resposta
            console.log('\n🔄 Simulando processamento do frontend...');
            
            // Simular window.fightsData
            let windowFightsData = fights;
            const fightIndex = windowFightsData.findIndex(f => f.id === testFight.id);
            
            if (fightIndex !== -1) {
                windowFightsData[fightIndex] = { ...windowFightsData[fightIndex], ...result };
                console.log(`✅ Dados atualizados no frontend (simulado)`);
                console.log(`   - ID: ${windowFightsData[fightIndex].id}`);
                console.log(`   - Status: ${windowFightsData[fightIndex].status}`);
                console.log(`   - is_live: ${windowFightsData[fightIndex].is_live}`);
            }
            
            // 3. Verificar se os dados foram realmente salvos no banco
            console.log('\n🔄 Verificando dados no banco...');
            const updatedFights = await supabaseService.getAllFights();
            const updatedFight = updatedFights.find(f => f.id === testFight.id);
            
            console.log(`📊 Dados no banco após chamada:`);
            console.log(`   - ID: ${updatedFight.id}`);
            console.log(`   - Status: ${updatedFight.status}`);
            console.log(`   - is_live: ${updatedFight.is_live}`);
            
            // 4. Comparar com a resposta do servidor
            console.log('\n🔍 Comparação:');
            console.log(`   - Resposta do servidor: status=${result.status}, is_live=${result.is_live}`);
            console.log(`   - Dados no banco: status=${updatedFight.status}, is_live=${updatedFight.is_live}`);
            
            if (result.status === updatedFight.status && result.is_live === updatedFight.is_live) {
                console.log('✅ Comunicação funcionando corretamente!');
                
                if (updatedFight.status === 'live' && updatedFight.is_live === true) {
                    console.log('✅ Status atualizado corretamente para "live"!');
                } else {
                    console.log('❌ Status não foi atualizado para "live"');
                }
            } else {
                console.log('❌ Dados inconsistentes entre servidor e banco');
            }
            
            // 5. Testar stopFightLive também
            console.log('\n⏹️ Testando stopFightLive...');
            
            const stopResponse = await fetch(`http://localhost:3000/api/fights/${testFight.id}/stop-live`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (stopResponse.ok) {
                const stopResult = await stopResponse.json();
                console.log(`✅ Resposta do stopFightLive:`, stopResult);
                
                // Verificar dados finais
                const finalFights = await supabaseService.getAllFights();
                const finalFight = finalFights.find(f => f.id === testFight.id);
                
                console.log(`📊 Dados finais:`);
                console.log(`   - ID: ${finalFight.id}`);
                console.log(`   - Status: ${finalFight.status}`);
                console.log(`   - is_live: ${finalFight.is_live}`);
                
                if (finalFight.status === 'scheduled' && finalFight.is_live === false) {
                    console.log('✅ Stop funcionando corretamente!');
                } else {
                    console.log('❌ Stop não funcionou corretamente');
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Erro na resposta do servidor:', response.status, response.statusText);
            console.log('❌ Detalhes do erro:', errorText);
        }
        
        console.log('\n✅ Teste de comunicação concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testFrontendBackendCommunication(); 