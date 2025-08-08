const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://igxztpjrojdmyzzhqxsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para calcular lutas finalizadas (simulando a lógica do Swift)
function calculateFinishedFights(fights) {
    const finishedCount = fights.filter(fight => {
        const status = fight.status || '';
        return status === 'live' || status === 'finished';
    }).count;
    
    return finishedCount;
}

async function testFinishedFightsCalculation() {
    console.log('🔍 Testando cálculo de lutas finalizadas...\n');

    try {
        // Testar com o evento UFC 319 (ID: 25) que tem 1 luta ao vivo e 0 finalizadas
        const eventId = 25;
        
        console.log(`1. Buscando evento ID: ${eventId}...`);
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select(`
                *,
                fights (
                    id,
                    eventid,
                    fighter1id,
                    fighter2id,
                    weightclass,
                    fighttype,
                    rounds,
                    timeremaining,
                    status,
                    is_finished,
                    winner_id,
                    winnerid,
                    fightorder,
                    final_round,
                    result_type
                )
            `)
            .eq('id', eventId);

        if (eventsError) {
            console.error('❌ Erro ao buscar evento:', eventsError);
            return;
        }

        if (!events || events.length === 0) {
            console.error('❌ Evento não encontrado');
            return;
        }

        const event = events[0];
        console.log(`✅ Evento encontrado: ${event.name}`);
        console.log(`   Data: ${event.date}`);
        console.log(`   Lutas: ${event.fights.length}`);

        // 2. Analisar status das lutas
        console.log('\n2. Analisando status das lutas...');
        
        const fights = event.fights;
        
        // Contar por status
        const statusCounts = {};
        fights.forEach(fight => {
            const status = fight.status || 'unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('   Status das lutas:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   - ${status}: ${count}`);
        });

        // 3. Calcular lutas finalizadas (incluindo "live" e "finished")
        console.log('\n3. Calculando lutas finalizadas...');
        
        const finishedFights = fights.filter(fight => {
            const status = fight.status || '';
            return status === 'live' || status === 'finished';
        });
        
        console.log(`   ✅ Lutas finalizadas (live + finished): ${finishedFights.length}/${fights.length}`);
        
        // Detalhar breakdown
        const liveFights = fights.filter(fight => (fight.status || '') === 'live');
        const completedFights = fights.filter(fight => (fight.status || '') === 'finished');
        
        console.log(`   Breakdown:`);
        console.log(`   - Live: ${liveFights.length}`);
        console.log(`   - Finished: ${completedFights.length}`);
        console.log(`   - Total: ${liveFights.length + completedFights.length}`);

        // 4. Mostrar detalhes das lutas finalizadas
        console.log('\n4. Detalhes das lutas finalizadas:');
        finishedFights.forEach(fight => {
            console.log(`   - fightOrder ${fight.fightorder}: ${fight.weightclass} - status: ${fight.status}`);
        });

        // 5. Simular cenários de teste
        console.log('\n5. Cenários de teste:');
        console.log('   Cenário atual: 1 luta ao vivo + 0 finalizadas = 1/12');
        console.log('   Se mudarmos o status da luta 1 de "live" para "finished":');
        console.log('   - 0 lutas ao vivo + 1 finalizada = 1/12');
        console.log('   Se iniciarmos a luta 2:');
        console.log('   - 1 luta ao vivo + 1 finalizada = 2/12');

        // 6. Verificar se o cálculo está correto
        console.log('\n6. Verificação do cálculo:');
        const expectedCount = liveFights.length + completedFights.length;
        const actualCount = finishedFights.length;
        
        if (expectedCount === actualCount) {
            console.log('   ✅ Cálculo correto!');
        } else {
            console.log('   ❌ Erro no cálculo!');
        }
        
        console.log(`   Esperado: ${expectedCount}, Obtido: ${actualCount}`);

        // 7. Testar com outro evento (UFC FIGHT NIGHT ID: 22)
        console.log('\n7. Testando com evento UFC FIGHT NIGHT (ID: 22)...');
        
        const { data: events2, error: eventsError2 } = await supabase
            .from('events')
            .select(`
                *,
                fights (
                    id,
                    eventid,
                    fighter1id,
                    fighter2id,
                    weightclass,
                    fighttype,
                    rounds,
                    timeremaining,
                    status,
                    is_finished,
                    winner_id,
                    winnerid,
                    fightorder,
                    final_round,
                    result_type
                )
            `)
            .eq('id', 22);

        if (!eventsError2 && events2 && events2.length > 0) {
            const event2 = events2[0];
            const fights2 = event2.fights;
            
            const liveFights2 = fights2.filter(fight => (fight.status || '') === 'live');
            const completedFights2 = fights2.filter(fight => (fight.status || '') === 'finished');
            const finishedFights2 = fights2.filter(fight => {
                const status = fight.status || '';
                return status === 'live' || status === 'finished';
            });
            
            console.log(`   Evento: ${event2.name}`);
            console.log(`   Lutas: ${fights2.length}`);
            console.log(`   Live: ${liveFights2.length}`);
            console.log(`   Finished: ${completedFights2.length}`);
            console.log(`   Total finalizadas: ${finishedFights2.length}/${fights2.length}`);
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar o teste
testFinishedFightsCalculation(); 