const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendCalculation() {
    console.log('🧪 Testando cálculo do frontend...\n');

    try {
        const fighterId = 23; // Lutador que tem lutas finalizadas
        
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
        console.log(`   Record manual: ${fighter.wins || 0}-${fighter.losses || 0}-${fighter.draws || 0}`);

        // 2. Buscar lutas do lutador
        console.log('\n2. Buscando lutas do lutador...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .or(`fighter1id.eq.${fighterId},fighter2id.eq.${fighterId}`);

        if (fightsError) {
            throw fightsError;
        }

        console.log(`✅ ${fights.length} lutas encontradas para o lutador`);

        // 3. Calcular record das lutas finalizadas
        console.log('\n3. Calculando record das lutas finalizadas...');
        let fightWins = 0;
        let fightLosses = 0;
        let fightDraws = 0;

        fights.forEach(fight => {
            console.log(`   Luta ${fight.id}: Status=${fight.status}, IsFinished=${fight.is_finished}, WinnerID=${fight.winner_id}`);
            
            if (fight.is_finished && fight.winner_id) {
                if (fight.winner_id == fighterId) {
                    fightWins++;
                    console.log(`     ✅ Vitória`);
                } else if (fight.fighter1id == fighterId || fight.fighter2id == fighterId) {
                    fightLosses++;
                    console.log(`     ❌ Derrota`);
                }
            } else {
                console.log(`     ⏸️ Não finalizada ou sem vencedor`);
            }
        });

        console.log(`\n📊 Record das lutas: ${fightWins}-${fightLosses}-${fightDraws}`);

        // 4. Calcular record total
        const manualWins = fighter.wins || 0;
        const manualLosses = fighter.losses || 0;
        const manualDraws = fighter.draws || 0;

        const totalWins = manualWins + fightWins;
        const totalLosses = manualLosses + fightLosses;
        const totalDraws = manualDraws + fightDraws;

        console.log('\n4. Record total calculado:');
        console.log(`   Manual: ${manualWins}-${manualLosses}-${manualDraws}`);
        console.log(`   Lutas: ${fightWins}-${fightLosses}-${fightDraws}`);
        console.log(`   Total: ${totalWins}-${totalLosses}-${totalDraws}`);

        // 5. Simular o que o frontend deveria mostrar
        console.log('\n5. Simulação do frontend:');
        console.log(`   Input Vitórias: ${manualWins}`);
        console.log(`   Input Derrotas: ${manualLosses}`);
        console.log(`   Input Empates: ${manualDraws}`);
        console.log(`   Record Calculado: ${totalWins}-${totalLosses}-${totalDraws}`);
        console.log(`   Breakdown: Manual: ${manualWins}-${manualLosses}-${manualDraws} | Lutas: ${fightWins}-${fightLosses}-${fightDraws}`);

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testFrontendCalculation(); 