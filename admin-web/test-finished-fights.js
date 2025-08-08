const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinishedFights() {
    console.log('🧪 Testando lutas finalizadas...\n');

    try {
        // Buscar lutas finalizadas
        const { data: fights, error } = await supabase
            .from('fights')
            .select('*')
            .eq('is_finished', true);

        if (error) {
            throw error;
        }

        console.log(`✅ ${fights.length} lutas finalizadas encontradas`);

        if (fights.length > 0) {
            console.log('\n📋 Lutas finalizadas:');
            fights.forEach((fight, index) => {
                console.log(`   Luta ${index + 1}:`);
                console.log(`     ID: ${fight.id}`);
                console.log(`     Fighter1ID: ${fight.fighter1id}`);
                console.log(`     Fighter2ID: ${fight.fighter2id}`);
                console.log(`     WinnerID: ${fight.winner_id}`);
                console.log(`     Status: ${fight.status}`);
                console.log(`     IsFinished: ${fight.is_finished}`);
                console.log(`     EventID: ${fight.eventid}`);
                console.log('');
            });

            // Pegar o primeiro lutador que tem luta finalizada
            const firstFight = fights[0];
            const testFighterId = firstFight.fighter1id;
            
            console.log(`\n🧪 Testando cálculo de record para lutador ${testFighterId}...`);
            
            // Calcular record manualmente
            let fightWins = 0;
            let fightLosses = 0;
            
            fights.forEach(fight => {
                if (fight.fighter1id === testFighterId || fight.fighter2id === testFighterId) {
                    if (fight.winner_id === testFighterId) {
                        fightWins++;
                        console.log(`   ✅ Vitória na luta ${fight.id}`);
                    } else {
                        fightLosses++;
                        console.log(`   ❌ Derrota na luta ${fight.id}`);
                    }
                }
            });
            
            console.log(`\n📊 Record das lutas para lutador ${testFighterId}: ${fightWins}-${fightLosses}-0`);
            
        } else {
            console.log('❌ Nenhuma luta finalizada encontrada');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testFinishedFights(); 