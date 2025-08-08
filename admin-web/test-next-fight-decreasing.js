const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testNextFightDecreasing() {
    try {
        console.log('🔍 Testando lógica de next fight com ordem decrescente...');
        
        // Criar cliente Supabase com chave de serviço
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Buscar eventos com lutas
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        
        if (eventsError) {
            console.error('❌ Erro ao buscar eventos:', eventsError);
            return;
        }
        
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .order('fightorder', { ascending: true });
        
        if (fightsError) {
            console.error('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        console.log(`📊 Total de eventos: ${events.length}`);
        console.log(`📊 Total de lutas: ${fights.length}`);
        
        // Encontrar um evento que tenha lutas agendadas
        const eventWithScheduledFights = events.find(event => {
            const eventFights = fights.filter(f => f.eventid === event.id);
            const scheduledFights = eventFights.filter(f => !f.is_finished && f.status !== 'live');
            return scheduledFights.length > 0;
        });
        
        if (!eventWithScheduledFights) {
            console.log('❌ Nenhum evento com lutas agendadas encontrado');
            return;
        }
        
        console.log(`\n🎯 Evento selecionado: ${eventWithScheduledFights.name} (ID: ${eventWithScheduledFights.id})`);
        
        // Buscar lutas do evento
        const eventFights = fights.filter(f => f.eventid === eventWithScheduledFights.id);
        console.log(`📊 Lutas do evento: ${eventFights.length}`);
        
        // Mostrar todas as lutas do evento
        console.log('\n📋 Todas as lutas do evento:');
        eventFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // Simular a lógica do getNextFight com ordem decrescente
        console.log('\n🧪 Simulando lógica do getNextFight (ordem decrescente):');
        
        // 1. Ordenar por fightOrder (maior para menor)
        const sortedFights = eventFights.sort((fight1, fight2) => {
            const order1 = fight1.fightorder || Number.MAX_SAFE_INTEGER;
            const order2 = fight2.fightorder || Number.MAX_SAFE_INTEGER;
            return order2 - order1; // Ordem decrescente (maior primeiro)
        });
        
        console.log('\n📊 Lutas ordenadas por fightOrder (maior para menor):');
        sortedFights.forEach(fight => {
            console.log(`   - fightorder ${fight.fightorder}: ${fight.weightclass} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // 2. Encontrar a próxima luta não finalizada
        console.log('\n🔍 Procurando próxima luta não finalizada (maior fightOrder primeiro):');
        let nextFight = null;
        
        for (const fight of sortedFights) {
            const isNotFinished = !fight.is_finished;
            const isNotLive = fight.status !== 'live';
            
            console.log(`   - Verificando fightorder ${fight.fightorder}: ${fight.weightclass}`);
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
            console.log(`   - fightorder: ${nextFight.fightorder}`);
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
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder}`);
        });
        
        // 4. Verificar lutas finalizadas
        const finishedFights = eventFights.filter(f => f.is_finished);
        console.log(`\n✅ Lutas finalizadas: ${finishedFights.length}`);
        finishedFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status}`);
        });
        
        // 5. Verificar lutas agendadas
        const scheduledFights = eventFights.filter(f => !f.is_finished && f.status !== 'live');
        console.log(`\n⏰ Lutas agendadas: ${scheduledFights.length}`);
        scheduledFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status}`);
        });
        
        // 6. Simular cenários específicos
        console.log('\n🎭 Simulando cenários específicos:');
        
        // Cenário 1: Evento começando (todas as lutas agendadas)
        console.log('\n📋 Cenário 1: Evento começando (todas agendadas)');
        const allScheduled = eventFights.filter(f => f.status === 'scheduled');
        if (allScheduled.length > 0) {
            const highestOrder = Math.max(...allScheduled.map(f => f.fightorder || 0));
            const nextFightScenario1 = allScheduled.find(f => f.fightorder === highestOrder);
            console.log(`   - Próxima luta seria: fightorder ${highestOrder} - ${nextFightScenario1?.weightclass}`);
        }
        
        // Cenário 2: Uma luta ao vivo
        if (liveFights.length > 0) {
            console.log('\n📋 Cenário 2: Uma luta ao vivo');
            const liveFight = liveFights[0];
            console.log(`   - Luta ao vivo: fightorder ${liveFight.fightorder} - ${liveFight.weightclass}`);
            
            // Encontrar próxima luta após a luta ao vivo
            const nextAfterLive = scheduledFights
                .filter(f => (f.fightorder || 0) < (liveFight.fightorder || 0))
                .sort((a, b) => (b.fightorder || 0) - (a.fightorder || 0))[0];
            
            if (nextAfterLive) {
                console.log(`   - Próxima luta após ao vivo: fightorder ${nextAfterLive.fightorder} - ${nextAfterLive.weightclass}`);
            } else {
                console.log(`   - Nenhuma luta agendada após a luta ao vivo`);
            }
        }
        
        console.log('\n✅ Teste de lógica decrescente concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testNextFightDecreasing(); 