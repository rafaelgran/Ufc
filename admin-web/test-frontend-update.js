const { SupabaseService } = require('./supabase-config');

async function testFrontendUpdate() {
    try {
        console.log('🔍 Testando atualização do frontend...');
        
        // Buscar uma luta para testar
        const supabaseService = new SupabaseService();
        const fights = await supabaseService.getAllFights();
        
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        // Encontrar uma luta que não esteja ao vivo
        let testFight = fights.find(f => f.status !== 'live' && !f.is_live);
        
        if (!testFight) {
            // Se todas estão ao vivo, usar a primeira
            testFight = fights[0];
            console.log('⚠️ Todas as lutas estão ao vivo, usando a primeira para teste');
        }
        
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Simular o que o frontend faz
        console.log('\n🌐 Simulando chamada do frontend...');
        
        const response = await fetch(`http://localhost:3000/api/fights/${testFight.id}/start-live`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Resposta do servidor:`, result);
            
            // Simular o que o frontend faria com a resposta
            console.log('\n🔄 Simulando atualização do frontend...');
            
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
            
            // Simular recarregamento de dados
            console.log('\n🔄 Simulando recarregamento de dados...');
            const updatedFights = await supabaseService.getAllFights();
            const updatedFight = updatedFights.find(f => f.id === testFight.id);
            
            console.log(`📊 Dados após recarregamento:`);
            console.log(`   - ID: ${updatedFight.id}`);
            console.log(`   - Status: ${updatedFight.status}`);
            console.log(`   - is_live: ${updatedFight.is_live}`);
            
            // Verificar se a interface seria atualizada
            if (updatedFight.status === 'live' && updatedFight.is_live === true) {
                console.log('✅ Frontend seria atualizado corretamente!');
                console.log('📋 O que deveria acontecer na interface:');
                console.log('   - Status badge mudaria para "IN PROGRESS"');
                console.log('   - Botão "Iniciar ao Vivo" seria ocultado');
                console.log('   - Botão "Parar ao Vivo" seria mostrado');
                console.log('   - Cronômetro da luta seria iniciado');
            } else {
                console.log('❌ Frontend não seria atualizado corretamente');
            }
            
            // Testar stopFightLive também
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
        
        console.log('\n✅ Teste do frontend concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testFrontendUpdate(); 