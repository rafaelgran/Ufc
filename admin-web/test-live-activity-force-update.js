const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testLiveActivityForceUpdate() {
    try {
        console.log('🔍 Testando atualização forçada da Live Activity...');
        
        // Criar cliente Supabase com chave de serviço
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Buscar o evento 23
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('id', 23);
        
        if (eventsError) {
            console.error('❌ Erro ao buscar evento:', eventsError);
            return;
        }
        
        const event = events[0];
        console.log(`🎯 Evento: ${event.name} (ID: ${event.id})`);
        
        // Buscar lutas do evento
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .eq('eventid', event.id)
            .order('fightorder', { ascending: true });
        
        if (fightsError) {
            console.error('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        console.log(`📊 Lutas do evento: ${fights.length}`);
        
        // Simular a função forceUpdateLiveActivity
        console.log('\n🧪 Simulando forceUpdateLiveActivity:');
        
        // 1. Simular getNextFight (lógica decrescente)
        const sortedFights = fights.sort((fight1, fight2) => {
            const order1 = fight1.fightorder || Number.MAX_SAFE_INTEGER;
            const order2 = fight2.fightorder || Number.MAX_SAFE_INTEGER;
            return order2 - order1; // Ordem decrescente (maior primeiro)
        });
        
        console.log('\n📊 Lutas ordenadas por fightOrder (maior para menor):');
        sortedFights.forEach(fight => {
            console.log(`   - fightorder ${fight.fightorder}: ${fight.weightclass} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // 2. Encontrar próxima luta
        let nextFight = null;
        for (const fight of sortedFights) {
            if (!fight.is_finished && fight.status !== 'live') {
                nextFight = fight;
                break;
            }
        }
        
        // 3. Simular getHighlightFight (fightOrder 1)
        const highlightFight = fights.find(f => f.fightorder === 1);
        
        console.log('\n🔍 Resultado da simulação:');
        console.log(`   - Highlight Fight (fightOrder 1): ${highlightFight?.weightclass || 'N/A'}`);
        console.log(`   - Next Fight: ${nextFight?.weightclass || 'N/A'} (fightOrder: ${nextFight?.fightorder || 'N/A'})`);
        
        // 4. Simular o estado atualizado da Live Activity
        console.log('\n📋 Estado atualizado da Live Activity:');
        console.log(`   - Event Name: ${event.name}`);
        console.log(`   - Event Status: ${event.timeRemaining ? 'starting' : 'live'}`);
        console.log(`   - Main Fight: ${highlightFight?.weightclass || 'N/A'}`);
        console.log(`   - Next Fight: ${nextFight?.weightclass || 'N/A'}`);
        
        // 5. Verificar se a luta 12 está ao vivo
        const fight12 = fights.find(f => f.fightorder === 12);
        console.log('\n🔍 Verificação da luta 12:');
        if (fight12) {
            console.log(`   - Luta 12: ${fight12.weightclass}`);
            console.log(`   - Status: ${fight12.status}`);
            console.log(`   - is_live: ${fight12.is_live}`);
            console.log(`   - is_finished: ${fight12.is_finished}`);
            
            if (fight12.status === 'live' && fight12.is_live) {
                console.log(`   - ✅ Luta 12 está ao vivo`);
                console.log(`   - ✅ Próxima luta deveria ser: ${nextFight?.weightclass} (fightOrder: ${nextFight?.fightorder})`);
            } else {
                console.log(`   - ❌ Luta 12 NÃO está ao vivo`);
            }
        }
        
        // 6. Simular cenário de atualização
        console.log('\n🎭 Simulando cenário de atualização:');
        console.log('1. Usuário coloca luta 12 ao vivo no FYTE Admin');
        console.log('2. Banco de dados é atualizado (status: live, is_live: true)');
        console.log('3. App iOS chama refreshDataAndUpdateLiveActivity()');
        console.log('4. UFCEventService.fetchEvents() é executado');
        console.log('5. updateLiveActivityIfNeeded() é chamado');
        console.log('6. LiveActivityService.forceUpdateLiveActivity() é executado');
        console.log('7. Live Activity é atualizada com dados mais recentes');
        console.log('8. Próxima luta muda de 12 para 11');
        
        console.log('\n✅ Simulação concluída!');
        console.log('\n📝 Para testar no app iOS:');
        console.log('1. Abra o app iOS');
        console.log('2. Se houver uma Live Activity ativa, ela deve mostrar a luta 12 como próxima');
        console.log('3. No FYTE Admin, coloque a luta 12 ao vivo');
        console.log('4. No app iOS, force um refresh dos dados (pull to refresh ou similar)');
        console.log('5. A Live Activity deve atualizar e mostrar a luta 11 como próxima');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testLiveActivityForceUpdate(); 