const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSaveResult() {
    console.log('🧪 Testando salvamento de resultado da luta...\n');
    
    try {
        // 1. Buscar uma luta para teste
        console.log('1. Buscando luta para teste...');
        const { data: fights, error: fightsError } = await supabase
            .from('fights')
            .select('*')
            .limit(1);
            
        if (fightsError) {
            console.error('❌ Erro ao buscar lutas:', fightsError);
            return;
        }
        
        if (!fights || fights.length === 0) {
            console.error('❌ Nenhuma luta encontrada para teste');
            return;
        }
        
        const fight = fights[0];
        console.log(`✅ Luta encontrada: ID ${fight.id}`);
        console.log(`   Rounds: ${fight.rounds || 3}`);
        console.log(`   Fighter1: ${fight.fighter1Id}`);
        console.log(`   Fighter2: ${fight.fighter2Id}`);
        
        // 2. Testar salvamento de resultado KO
        console.log('\n2. Testando salvamento de resultado KO...');
        const koResult = {
            resultType: 'KO',
            finalRound: 2,
            finalTime: '01:30',
            winnerId: fight.fighter1Id
        };
        
        const { data: koData, error: koError } = await supabase
            .from('fights')
            .update({
                result_type: koResult.resultType,
                final_round: koResult.finalRound,
                final_time: koResult.finalTime,
                winner_id: koResult.winnerId,
                is_finished: true,
                is_live: false,
                result_updated_at: new Date().toISOString()
            })
            .eq('id', fight.id)
            .select();
            
        if (koError) {
            console.error('❌ Erro ao salvar resultado KO:', koError);
        } else {
            console.log('✅ Resultado KO salvo com sucesso:', koData[0]);
        }
        
        // 3. Testar salvamento de resultado DE (Decisão)
        console.log('\n3. Testando salvamento de resultado DE (Decisão)...');
        const deResult = {
            resultType: 'DE',
            finalRound: fight.rounds || 3,
            finalTime: '05:00',
            winnerId: fight.fighter2Id
        };
        
        const { data: deData, error: deError } = await supabase
            .from('fights')
            .update({
                result_type: deResult.resultType,
                final_round: deResult.finalRound,
                final_time: deResult.finalTime,
                winner_id: deResult.winnerId,
                is_finished: true,
                is_live: false,
                result_updated_at: new Date().toISOString()
            })
            .eq('id', fight.id)
            .select();
            
        if (deError) {
            console.error('❌ Erro ao salvar resultado DE:', deError);
        } else {
            console.log('✅ Resultado DE salvo com sucesso:', deData[0]);
        }
        
        // 4. Verificar dados salvos
        console.log('\n4. Verificando dados salvos...');
        const { data: savedFight, error: savedError } = await supabase
            .from('fights')
            .select('*')
            .eq('id', fight.id)
            .single();
            
        if (savedError) {
            console.error('❌ Erro ao verificar dados salvos:', savedError);
        } else {
            console.log('✅ Dados finais da luta:');
            console.log(`   Result Type: ${savedFight.result_type}`);
            console.log(`   Final Round: ${savedFight.final_round}`);
            console.log(`   Final Time: ${savedFight.final_time}`);
            console.log(`   Winner ID: ${savedFight.winner_id}`);
            console.log(`   Is Finished: ${savedFight.is_finished}`);
            console.log(`   Is Live: ${savedFight.is_live}`);
        }
        
        console.log('\n🎉 Teste de salvamento concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testSaveResult(); 