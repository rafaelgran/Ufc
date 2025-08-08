const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testLiveActivityUpdate() {
    try {
        console.log('🔍 Testando atualização da Live Activity...');
        
        // Criar cliente Supabase com chave de serviço
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Buscar o evento 23 que tem lutas agendadas
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
        
        // Mostrar estado atual das lutas
        console.log('\n📋 Estado atual das lutas:');
        fights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // Simular a lógica do getNextFight
        console.log('\n🧪 Simulando lógica do getNextFight:');
        
        // 1. Ordenar por fightOrder (maior para menor)
        const sortedFights = fights.sort((fight1, fight2) => {
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
        } else {
            console.log(`\n❌ Nenhuma próxima luta encontrada`);
        }
        
        // 3. Verificar se há lutas ao vivo
        const liveFights = fights.filter(f => f.is_live && f.status === 'live');
        console.log(`\n🔴 Lutas atualmente ao vivo: ${liveFights.length}`);
        liveFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder}`);
        });
        
        // 4. Simular cenário: se a luta 12 estiver ao vivo, qual seria a próxima?
        console.log('\n🎭 Simulando cenário: Luta 12 ao vivo');
        
        // Criar uma cópia das lutas com a luta 12 ao vivo
        const simulatedFights = fights.map(fight => {
            if (fight.fightorder === 12) {
                return { ...fight, status: 'live', is_live: true };
            }
            return fight;
        });
        
        console.log('\n📋 Estado simulado (luta 12 ao vivo):');
        simulatedFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightorder: ${fight.fightorder} - status: ${fight.status} - is_finished: ${fight.is_finished} - is_live: ${fight.is_live}`);
        });
        
        // Simular getNextFight com lutas modificadas
        const simulatedSortedFights = simulatedFights.sort((fight1, fight2) => {
            const order1 = fight1.fightorder || Number.MAX_SAFE_INTEGER;
            const order2 = fight2.fightorder || Number.MAX_SAFE_INTEGER;
            return order2 - order1; // Ordem decrescente (maior primeiro)
        });
        
        console.log('\n🔍 Procurando próxima luta (simulado - luta 12 ao vivo):');
        let simulatedNextFight = null;
        
        for (const fight of simulatedSortedFights) {
            const isNotFinished = !fight.is_finished;
            const isNotLive = fight.status !== 'live';
            
            console.log(`   - Verificando fightorder ${fight.fightorder}: ${fight.weightclass}`);
            console.log(`     - is_finished: ${fight.is_finished} (não finalizada: ${isNotFinished})`);
            console.log(`     - status: ${fight.status} (não ao vivo: ${isNotLive})`);
            
            if (isNotFinished && isNotLive) {
                simulatedNextFight = fight;
                console.log(`     - ✅ ENCONTRADA! Esta é a próxima luta`);
                break;
            } else {
                console.log(`     - ❌ Não é a próxima luta`);
            }
        }
        
        if (simulatedNextFight) {
            console.log(`\n✅ Próxima luta (simulado):`);
            console.log(`   - ID: ${simulatedNextFight.id}`);
            console.log(`   - fightorder: ${simulatedNextFight.fightorder}`);
            console.log(`   - Categoria: ${simulatedNextFight.weightclass}`);
            console.log(`   - Status: ${simulatedNextFight.status}`);
        } else {
            console.log(`\n❌ Nenhuma próxima luta encontrada (simulado)`);
        }
        
        // 5. Verificar se a luta 12 realmente está ao vivo no banco
        console.log('\n🔍 Verificando se a luta 12 está realmente ao vivo no banco:');
        const fight12 = fights.find(f => f.fightorder === 12);
        if (fight12) {
            console.log(`   - Luta 12 (ID: ${fight12.id}): ${fight12.weightclass}`);
            console.log(`   - Status: ${fight12.status}`);
            console.log(`   - is_live: ${fight12.is_live}`);
            console.log(`   - is_finished: ${fight12.is_finished}`);
            
            if (fight12.status === 'live' && fight12.is_live) {
                console.log(`   - ✅ Luta 12 está realmente ao vivo no banco`);
            } else {
                console.log(`   - ❌ Luta 12 NÃO está ao vivo no banco`);
            }
        } else {
            console.log(`   - ❌ Luta 12 não encontrada`);
        }
        
        console.log('\n✅ Teste de atualização da Live Activity concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testLiveActivityUpdate(); 