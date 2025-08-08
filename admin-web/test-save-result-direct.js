const { SupabaseService } = require('./supabase-config.js');
require('dotenv').config();

const supabaseService = new SupabaseService();

async function testSaveFightResultDirect() {
    console.log('🧪 Testando função saveFightResult diretamente...\n');
    
    try {
        // 1. Buscar uma luta para teste
        console.log('1. Buscando luta para teste...');
        const fights = await supabaseService.getAllFights();
        
        if (!fights || fights.length === 0) {
            console.error('❌ Nenhuma luta encontrada para teste');
            return;
        }
        
        const fight = fights[0];
        console.log(`✅ Luta encontrada: ID ${fight.id}`);
        console.log(`   Rounds: ${fight.rounds || 3}`);
        console.log(`   Fighter1 ID: ${fight.fighter1id}`);
        console.log(`   Fighter2 ID: ${fight.fighter2id}`);
        
        // 2. Testar salvamento de resultado KO
        console.log('\n2. Testando salvamento de resultado KO...');
        const koResult = {
            resultType: 'KO',
            finalRound: 2,
            finalTime: '01:30',
            winnerId: fight.fighter1id
        };
        
        console.log('Dados sendo enviados:', koResult);
        
        const koData = await supabaseService.saveFightResult(fight.id, koResult);
        console.log('✅ Resultado KO salvo com sucesso:', koData);
        
        // 3. Testar salvamento de resultado DE (Decisão)
        console.log('\n3. Testando salvamento de resultado DE (Decisão)...');
        const deResult = {
            resultType: 'DE',
            finalRound: fight.rounds || 3,
            finalTime: '05:00',
            winnerId: fight.fighter2id
        };
        
        console.log('Dados sendo enviados:', deResult);
        
        const deData = await supabaseService.saveFightResult(fight.id, deResult);
        console.log('✅ Resultado DE salvo com sucesso:', deData);
        
        // 4. Verificar dados salvos
        console.log('\n4. Verificando dados salvos...');
        const updatedFights = await supabaseService.getAllFights();
        const savedFight = updatedFights.find(f => f.id === fight.id);
        
        if (savedFight) {
            console.log('✅ Dados finais da luta:');
            console.log(`   Result Type: ${savedFight.result_type}`);
            console.log(`   Final Round: ${savedFight.final_round}`);
            console.log(`   Final Time: ${savedFight.final_time}`);
            console.log(`   Winner ID: ${savedFight.winner_id}`);
            console.log(`   Is Finished: ${savedFight.is_finished}`);
            console.log(`   Is Live: ${savedFight.is_live}`);
        }
        
        console.log('\n🎉 Teste de salvamento direto concluído!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testSaveFightResultDirect(); 