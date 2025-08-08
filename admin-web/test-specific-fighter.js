const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpecificFighter() {
    console.log('🧪 Testando lutador específico (Alex Perez - ID 102)...\n');

    try {
        const fighterId = 102;
        
        // Buscar lutas do lutador específico
        const { data: fights, error } = await supabase
            .from('fights')
            .select('*')
            .or(`fighter1id.eq.${fighterId},fighter2id.eq.${fighterId}`);

        if (error) {
            throw error;
        }

        console.log(`✅ ${fights.length} lutas encontradas para o lutador ${fighterId}`);

        if (fights.length > 0) {
            console.log('\n📋 Detalhes das lutas:');
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

            // Verificar lutas finalizadas
            const finishedFights = fights.filter(fight => fight.is_finished);
            console.log(`📊 Lutas finalizadas: ${finishedFights.length}/${fights.length}`);

            if (finishedFights.length > 0) {
                console.log('\n🏆 Lutas finalizadas:');
                finishedFights.forEach(fight => {
                    const isWinner = fight.winner_id == fighterId;
                    console.log(`   Luta ${fight.id}: ${isWinner ? '✅ VITÓRIA' : '❌ DERROTA'}`);
                });
            }
        } else {
            console.log('❌ Nenhuma luta encontrada para este lutador');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testSpecificFighter(); 