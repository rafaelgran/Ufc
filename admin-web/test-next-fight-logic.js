const { SupabaseService } = require('./supabase-config');

async function testNextFightLogic() {
    try {
        console.log('🔍 Testando lógica de next fight...');
        
        const supabaseService = new SupabaseService();
        
        // Buscar eventos com lutas
        const events = await supabaseService.getAllEvents();
        const fights = await supabaseService.getAllFights();
        
        console.log(`📊 Total de eventos: ${events.length}`);
        console.log(`📊 Total de lutas: ${fights.length}`);
        
        // Encontrar um evento que tenha lutas
        const eventWithFights = events.find(event => {
            const eventFights = fights.filter(f => f.eventid === event.id);
            return eventFights.length > 0;
        });
        
        if (!eventWithFights) {
            console.log('❌ Nenhum evento com lutas encontrado');
            return;
        }
        
        console.log(`\n🎯 Evento selecionado: ${eventWithFights.name} (ID: ${eventWithFights.id})`);
        
        // Buscar lutas do evento
        const eventFights = fights.filter(f => f.eventid === eventWithFights.id);
        console.log(`📊 Lutas do evento: ${eventFights.length}`);
        
        // Mostrar todas as lutas do evento
        console.log('\n📋 Todas as lutas do evento:');
        eventFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // Simular a lógica do getNextFight
        console.log('\n🧪 Simulando lógica do getNextFight:');
        
        // 1. Ordenar por fightOrder (maior para menor)
        const sortedFights = eventFights.sort((fight1, fight2) => {
            const order1 = fight1.fightOrder || Number.MAX_SAFE_INTEGER;
            const order2 = fight2.fightOrder || Number.MAX_SAFE_INTEGER;
            return order2 - order1; // Ordem decrescente (maior primeiro)
        });
        
        console.log('\n📊 Lutas ordenadas por fightOrder (maior para menor):');
        sortedFights.forEach(fight => {
            console.log(`   - fightOrder ${fight.fightOrder}: ${fight.weightclass} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // 2. Encontrar a próxima luta não finalizada
        console.log('\n🔍 Procurando próxima luta não finalizada:');
        let nextFight = null;
        
        for (const fight of sortedFights) {
            const isNotFinished = !fight.is_finished;
            const isNotLive = fight.status !== 'live';
            
            console.log(`   - Verificando fightOrder ${fight.fightOrder}: ${fight.weightclass}`);
            console.log(`     - is_finished: ${fight.is_finished} (não finalizada: ${isNotFinished})`);
            console.log(`     - status: ${fight.status} (não ao vivo: ${isNotLive})`);
            
            if (isNotFinished && isNotLive) {
                nextFight = fight;
                console.log(`     - ✅ ENCONTRADA! Esta é a próxima luta`);
                break;
            } else {
                console.log(`     - ❌ Não é a próxima luta`);
            }
        }
        
        if (nextFight) {
            console.log(`\n✅ Próxima luta encontrada:`);
            console.log(`   - ID: ${nextFight.id}`);
            console.log(`   - fightOrder: ${nextFight.fightOrder}`);
            console.log(`   - Categoria: ${nextFight.weightclass}`);
            console.log(`   - Status: ${nextFight.status}`);
            console.log(`   - is_finished: ${nextFight.is_finished}`);
            console.log(`   - is_live: ${nextFight.is_live}`);
        } else {
            console.log(`\n❌ Nenhuma próxima luta encontrada`);
        }
        
        // 3. Verificar se há lutas ao vivo
        const liveFights = eventFights.filter(f => f.is_live && f.status === 'live');
        console.log(`\n🔴 Lutas atualmente ao vivo: ${liveFights.length}`);
        liveFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder}`);
        });
        
        // 4. Verificar lutas finalizadas
        const finishedFights = eventFights.filter(f => f.is_finished);
        console.log(`\n✅ Lutas finalizadas: ${finishedFights.length}`);
        finishedFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder} - status: ${fight.status}`);
        });
        
        // 5. Verificar lutas agendadas
        const scheduledFights = eventFights.filter(f => !f.is_finished && f.status !== 'live');
        console.log(`\n⏰ Lutas agendadas: ${scheduledFights.length}`);
        scheduledFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder} - status: ${fight.status}`);
        });
        
        console.log('\n✅ Teste de lógica concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testNextFightLogic(); 