const { SupabaseService } = require('./supabase-config');

async function testInterfaceUpdateIssue() {
    try {
        console.log('🔍 Testando problema na atualização da interface...');
        
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
        
        // Simular o problema que o usuário está enfrentando
        console.log('\n🌐 Simulando problema do usuário...');
        
        // 1. Fazer a chamada para start-live
        const response = await fetch(`http://localhost:3000/api/fights/${testFight.id}/start-live`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Resposta do start-live:`, result);
            
            // 2. Verificar se o banco foi atualizado
            console.log('\n🔄 Verificando banco de dados...');
            const updatedFights = await supabaseService.getAllFights();
            const updatedFight = updatedFights.find(f => f.id === testFight.id);
            
            console.log(`📊 Dados no banco:`);
            console.log(`   - ID: ${updatedFight.id}`);
            console.log(`   - Status: ${updatedFight.status}`);
            console.log(`   - is_live: ${updatedFight.is_live}`);
            
            // 3. Simular o que aconteceria na interface
            console.log('\n🖥️ Simulando interface...');
            
            // Simular window.fightsData (dados em cache do frontend)
            let windowFightsData = fights; // Dados antigos em cache
            
            // Simular a atualização que o frontend faria
            const fightIndex = windowFightsData.findIndex(f => f.id === testFight.id);
            if (fightIndex !== -1) {
                windowFightsData[fightIndex] = { ...windowFightsData[fightIndex], ...result };
                console.log(`✅ Dados atualizados no cache do frontend`);
                console.log(`   - ID: ${windowFightsData[fightIndex].id}`);
                console.log(`   - Status: ${windowFightsData[fightIndex].status}`);
                console.log(`   - is_live: ${windowFightsData[fightIndex].is_live}`);
            }
            
            // 4. Simular recarregamento de dados (forceReload = true)
            console.log('\n🔄 Simulando recarregamento de dados...');
            
            // Simular a chamada que o frontend faria para recarregar dados
            const reloadResponse = await fetch(`http://localhost:3000/api/fights`);
            if (reloadResponse.ok) {
                const reloadedFights = await reloadResponse.json();
                const reloadedFight = reloadedFights.find(f => f.id === testFight.id);
                
                console.log(`📊 Dados após recarregamento:`);
                console.log(`   - ID: ${reloadedFight.id}`);
                console.log(`   - Status: ${reloadedFight.status}`);
                console.log(`   - is_live: ${reloadedFight.is_live}`);
                
                // 5. Comparar todos os dados
                console.log('\n🔍 Comparação completa:');
                console.log(`   - Dados originais: status=${testFight.status}, is_live=${testFight.is_live}`);
                console.log(`   - Resposta do servidor: status=${result.status}, is_live=${result.is_live}`);
                console.log(`   - Dados no banco: status=${updatedFight.status}, is_live=${updatedFight.is_live}`);
                console.log(`   - Cache do frontend: status=${windowFightsData[fightIndex].status}, is_live=${windowFightsData[fightIndex].is_live}`);
                console.log(`   - Dados recarregados: status=${reloadedFight.status}, is_live=${reloadedFight.is_live}`);
                
                // 6. Verificar se há inconsistências
                const allStatuses = [
                    testFight.status,
                    result.status,
                    updatedFight.status,
                    windowFightsData[fightIndex].status,
                    reloadedFight.status
                ];
                
                const allIsLive = [
                    testFight.is_live,
                    result.is_live,
                    updatedFight.is_live,
                    windowFightsData[fightIndex].is_live,
                    reloadedFight.is_live
                ];
                
                const statusConsistent = allStatuses.every(s => s === 'live');
                const isLiveConsistent = allIsLive.every(l => l === true);
                
                if (statusConsistent && isLiveConsistent) {
                    console.log('✅ Todos os dados estão consistentes!');
                    console.log('✅ O problema pode estar na interface não mostrando as mudanças');
                } else {
                    console.log('❌ Há inconsistências nos dados');
                    console.log('🔍 Verificando onde está o problema...');
                }
            }
            
            // 7. Testar se o problema é específico do start-live
            console.log('\n🧪 Testando se o problema é específico do start-live...');
            
            // Fazer uma chamada para save-result (que o usuário disse que funciona)
            const saveResultResponse = await fetch(`http://localhost:3000/api/fights/${testFight.id}/save-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resultType: 'DE',
                    finalRound: 3,
                    finalTime: '05:00',
                    winnerId: testFight.fighter1id
                })
            });
            
            if (saveResultResponse.ok) {
                const saveResult = await saveResultResponse.json();
                console.log(`✅ Resposta do save-result:`, saveResult);
                
                // Verificar se o status mudou para finished
                const finalFights = await supabaseService.getAllFights();
                const finalFight = finalFights.find(f => f.id === testFight.id);
                
                console.log(`📊 Dados após save-result:`);
                console.log(`   - ID: ${finalFight.id}`);
                console.log(`   - Status: ${finalFight.status}`);
                console.log(`   - is_live: ${finalFight.is_live}`);
                console.log(`   - is_finished: ${finalFight.is_finished}`);
                
                if (finalFight.status === 'finished') {
                    console.log('✅ Save-result funcionando corretamente!');
                    console.log('🔍 Isso confirma que o problema é específico do start-live');
                } else {
                    console.log('❌ Save-result também não funcionou');
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Erro na resposta do servidor:', response.status, response.statusText);
            console.log('❌ Detalhes do erro:', errorText);
        }
        
        console.log('\n✅ Teste de interface concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testInterfaceUpdateIssue(); 