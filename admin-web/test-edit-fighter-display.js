const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEditFighterDisplay() {
    console.log('🧪 Testando exibição dos valores manuais no edit...\n');

    try {
        const fighterId = 23; // Danny Silva
        
        // 1. Buscar dados do lutador
        console.log('1. Buscando dados do lutador...');
        const { data: fighters, error: fightersError } = await supabase
            .from('fighters')
            .select('*')
            .eq('id', fighterId);

        if (fightersError) {
            throw fightersError;
        }

        if (!fighters || fighters.length === 0) {
            console.log('❌ Lutador não encontrado');
            return;
        }

        const fighter = fighters[0];
        console.log(`✅ Lutador encontrado: ${fighter.name} (ID: ${fighter.id})`);
        
        // 2. Simular o que deveria aparecer nos inputs
        console.log('\n2. Valores que deveriam aparecer nos inputs:');
        console.log(`   Input Vitórias: ${fighter.wins || 0}`);
        console.log(`   Input Derrotas: ${fighter.losses || 0}`);
        console.log(`   Input Empates: ${fighter.draws || 0}`);
        
        // 3. Buscar lutas para calcular record total
        console.log('\n3. Calculando record total...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .or(`fighter1id.eq.${fighterId},fighter2id.eq.${fighterId}`);

        if (fightsError) {
            throw fightsError;
        }

        let fightWins = 0;
        let fightLosses = 0;
        
        fights.forEach(fight => {
            if (fight.is_finished && fight.winner_id) {
                if (fight.winner_id == fighterId) {
                    fightWins++;
                } else if (fight.fighter1id == fighterId || fight.fighter2id == fighterId) {
                    fightLosses++;
                }
            }
        });

        const manualWins = fighter.wins || 0;
        const manualLosses = fighter.losses || 0;
        const manualDraws = fighter.draws || 0;

        const totalWins = manualWins + fightWins;
        const totalLosses = manualLosses + fightLosses;
        const totalDraws = manualDraws + 0;

        console.log('\n4. Record calculado:');
        console.log(`   Record Calculado: ${totalWins}-${totalLosses}-${totalDraws}`);
        console.log(`   Breakdown: Manual: ${manualWins}-${manualLosses}-${manualDraws} | Lutas: ${fightWins}-${fightLosses}-0`);

        console.log('\n✅ Teste concluído!');
        console.log('📋 Resumo:');
        console.log(`   Inputs devem mostrar: ${manualWins}, ${manualLosses}, ${manualDraws}`);
        console.log(`   Record calculado deve mostrar: ${totalWins}-${totalLosses}-${totalDraws}`);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testEditFighterDisplay(); 