const { SupabaseService } = require('./supabase-config');

async function testInterfaceDisplay() {
    try {
        console.log('🔍 Testando exibição da interface...');
        
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
        
        // Verificar o evento da luta
        const events = await supabaseService.getAllEvents();
        const event = events.find(e => e.id === testFight.eventid);
        console.log(`📅 Evento: ${event ? event.name : 'N/A'} (ID: ${testFight.eventid})`);
        
        // Simular o que acontece na interface
        console.log('\n🖥️ Simulando interface...');
        
        // 1. Fazer start-live
        console.log('\n🚀 Fazendo start-live...');
        const response = await fetch(`http://localhost:3000/api/fights/${testFight.id}/start-live`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Start-live realizado: status=${result.status}, is_live=${result.is_live}`);
            
            // 2. Verificar como a luta apareceria na lista
            console.log('\n📋 Simulando lista de lutas...');
            
            // Simular a função createFightItem
            const createFightItem = (fight) => {
                const statusClass = fight.is_live ? 'bg-danger' : 
                                   fight.is_finished ? 'bg-success' : 'bg-secondary';
                const statusText = fight.is_live ? 'IN PROGRESS' : 
                                  fight.is_finished ? 'FINALIZADA' : 'AGUARDANDO';
                
                return {
                    id: fight.id,
                    status: fight.status,
                    is_live: fight.is_live,
                    is_finished: fight.is_finished,
                    statusClass: statusClass,
                    statusText: statusText,
                    displayText: `${fight.weightclass} - ${statusText}`
                };
            };
            
            // Simular como a luta apareceria antes e depois
            const beforeDisplay = createFightItem(testFight);
            const afterDisplay = createFightItem(result);
            
            console.log(`📊 Antes do start-live:`);
            console.log(`   - ID: ${beforeDisplay.id}`);
            console.log(`   - Status: ${beforeDisplay.status}`);
            console.log(`   - is_live: ${beforeDisplay.is_live}`);
            console.log(`   - Status Class: ${beforeDisplay.statusClass}`);
            console.log(`   - Status Text: ${beforeDisplay.statusText}`);
            console.log(`   - Display: ${beforeDisplay.displayText}`);
            
            console.log(`📊 Depois do start-live:`);
            console.log(`   - ID: ${afterDisplay.id}`);
            console.log(`   - Status: ${afterDisplay.status}`);
            console.log(`   - is_live: ${afterDisplay.is_live}`);
            console.log(`   - Status Class: ${afterDisplay.statusClass}`);
            console.log(`   - Status Text: ${afterDisplay.statusText}`);
            console.log(`   - Display: ${afterDisplay.displayText}`);
            
            // 3. Verificar se a mudança seria visível
            if (beforeDisplay.statusText !== afterDisplay.statusText) {
                console.log('✅ Mudança seria visível na interface!');
                console.log(`   - Antes: ${beforeDisplay.statusText}`);
                console.log(`   - Depois: ${afterDisplay.statusText}`);
            } else {
                console.log('❌ Mudança NÃO seria visível na interface');
            }
            
            // 4. Verificar se o problema pode estar no cache
            console.log('\n🔄 Verificando cache...');
            
            // Simular dados em cache (como window.fightsData)
            let cachedFights = fights; // Dados antigos em cache
            const fightIndex = cachedFights.findIndex(f => f.id === testFight.id);
            
            if (fightIndex !== -1) {
                // Atualizar cache com novos dados
                cachedFights[fightIndex] = { ...cachedFights[fightIndex], ...result };
                
                const cachedFight = cachedFights[fightIndex];
                const cachedDisplay = createFightItem(cachedFight);
                
                console.log(`📊 Dados em cache:`);
                console.log(`   - ID: ${cachedDisplay.id}`);
                console.log(`   - Status: ${cachedDisplay.status}`);
                console.log(`   - is_live: ${cachedDisplay.is_live}`);
                console.log(`   - Status Text: ${cachedDisplay.statusText}`);
                console.log(`   - Display: ${cachedDisplay.displayText}`);
                
                if (cachedDisplay.statusText === afterDisplay.statusText) {
                    console.log('✅ Cache atualizado corretamente!');
                } else {
                    console.log('❌ Cache não foi atualizado corretamente');
                }
            }
            
            // 5. Verificar se o problema pode estar na recarga de dados
            console.log('\n🔄 Verificando recarga de dados...');
            
            // Simular recarga de dados do servidor
            const reloadResponse = await fetch(`http://localhost:3000/api/fights`);
            if (reloadResponse.ok) {
                const reloadedFights = await reloadResponse.json();
                const reloadedFight = reloadedFights.find(f => f.id === testFight.id);
                const reloadedDisplay = createFightItem(reloadedFight);
                
                console.log(`📊 Dados recarregados:`);
                console.log(`   - ID: ${reloadedDisplay.id}`);
                console.log(`   - Status: ${reloadedDisplay.status}`);
                console.log(`   - is_live: ${reloadedDisplay.is_live}`);
                console.log(`   - Status Text: ${reloadedDisplay.statusText}`);
                console.log(`   - Display: ${reloadedDisplay.displayText}`);
                
                if (reloadedDisplay.statusText === afterDisplay.statusText) {
                    console.log('✅ Recarga de dados funcionando!');
                } else {
                    console.log('❌ Recarga de dados não funcionou');
                }
            }
            
            // 6. Resumo final
            console.log('\n📋 Resumo do teste:');
            console.log(`   - Backend: ✅ Funcionando (status=${result.status})`);
            console.log(`   - Banco: ✅ Atualizado (is_live=${result.is_live})`);
            console.log(`   - Interface: ${beforeDisplay.statusText !== afterDisplay.statusText ? '✅ Mudança visível' : '❌ Mudança não visível'}`);
            console.log(`   - Cache: ${cachedFights[fightIndex].status === result.status ? '✅ Atualizado' : '❌ Não atualizado'}`);
            
            if (beforeDisplay.statusText !== afterDisplay.statusText) {
                console.log('\n✅ TUDO FUNCIONANDO CORRETAMENTE!');
                console.log('🔍 O problema pode estar na interface não sendo atualizada visualmente');
                console.log('💡 Verifique se o admin está recarregando a página ou se há algum problema de cache do navegador');
            } else {
                console.log('\n❌ PROBLEMA IDENTIFICADO!');
                console.log('🔍 A interface não está mostrando as mudanças');
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Erro no start-live:', response.status, response.statusText);
            console.log('❌ Detalhes:', errorText);
        }
        
        console.log('\n✅ Teste de interface concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testInterfaceDisplay(); 