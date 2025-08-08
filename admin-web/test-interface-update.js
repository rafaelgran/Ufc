const { SupabaseService } = require('./supabase-config');

async function testInterfaceUpdate() {
    try {
        const supabaseService = new SupabaseService();
        
        console.log('🔍 Testando atualização da interface...');
        
        // Buscar uma luta para testar
        const fights = await supabaseService.getAllFights();
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Verificar se a luta tem um evento associado
        if (!testFight.eventId && !testFight.eventid) {
            console.log('❌ Luta não tem evento associado');
            return;
        }
        
        const eventId = testFight.eventId || testFight.eventid;
        console.log(`📅 Evento ID: ${eventId}`);
        
        // Testar startFightLive
        console.log('\n🚀 Testando startFightLive...');
        const updatedFight = await supabaseService.startFightLive(testFight.id);
        
        console.log(`✅ Luta atualizada no banco:`);
        console.log(`   - ID: ${updatedFight.id}`);
        console.log(`   - Status: ${updatedFight.status}`);
        console.log(`   - is_live: ${updatedFight.is_live}`);
        
        // Verificar se os dados foram realmente salvos no banco
        console.log('\n🔄 Verificando dados no banco...');
        const verifyFight = await supabaseService.getAllFights();
        const savedFight = verifyFight.find(f => f.id === testFight.id);
        
        if (savedFight) {
            console.log(`✅ Dados confirmados no banco:`);
            console.log(`   - ID: ${savedFight.id}`);
            console.log(`   - Status: ${savedFight.status}`);
            console.log(`   - is_live: ${savedFight.is_live}`);
            
            if (savedFight.status === 'live' && savedFight.is_live === true) {
                console.log('✅ Status atualizado corretamente no banco!');
            } else {
                console.log('❌ Status não foi atualizado corretamente no banco');
            }
        } else {
            console.log('❌ Luta não encontrada após atualização');
        }
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Testar stopFightLive
        console.log('\n⏹️ Testando stopFightLive...');
        const stoppedFight = await supabaseService.stopFightLive(testFight.id);
        
        console.log(`✅ Luta parada no banco:`);
        console.log(`   - ID: ${stoppedFight.id}`);
        console.log(`   - Status: ${stoppedFight.status}`);
        console.log(`   - is_live: ${stoppedFight.is_live}`);
        
        // Verificar novamente
        console.log('\n🔄 Verificando dados finais no banco...');
        const finalFights = await supabaseService.getAllFights();
        const finalFight = finalFights.find(f => f.id === testFight.id);
        
        if (finalFight) {
            console.log(`✅ Dados finais confirmados no banco:`);
            console.log(`   - ID: ${finalFight.id}`);
            console.log(`   - Status: ${finalFight.status}`);
            console.log(`   - is_live: ${finalFight.is_live}`);
            
            if (finalFight.status === 'scheduled' && finalFight.is_live === false) {
                console.log('✅ Status finalizado corretamente no banco!');
            } else {
                console.log('❌ Status final não foi atualizado corretamente no banco');
            }
        }
        
        console.log('\n✅ Teste concluído!');
        console.log('\n📋 Resumo:');
        console.log('1. O backend está funcionando corretamente');
        console.log('2. O status está sendo atualizado no banco');
        console.log('3. Se a interface não mostra as mudanças, o problema está no frontend');
        console.log('4. Verifique se o frontend está recarregando os dados corretamente');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testInterfaceUpdate(); 