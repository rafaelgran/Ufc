const { SupabaseService } = require('./supabase-config.js');

async function testSaveResultWithStatus() {
    console.log('🧪 Testando saveFightResult com atualização de status...\n');
    
    const supabaseService = new SupabaseService();
    
    try {
        // Buscar uma luta para testar
        const fights = await supabaseService.getAllFights();
        const testFight = fights.find(f => f.id === 35); // Luta 35 que você mencionou
        
        if (!testFight) {
            console.log('❌ Luta 35 não encontrada');
            return;
        }
        
        console.log('📋 Luta antes da atualização:');
        console.log(`   ID: ${testFight.id}`);
        console.log(`   Status: ${testFight.status}`);
        console.log(`   Is Finished: ${testFight.is_finished}`);
        console.log(`   Winner ID: ${testFight.winner_id}`);
        console.log('');
        
        // Simular resultado da luta
        const resultData = {
            winnerId: 33, // Fighter 1
            resultType: 'KO',
            finalRound: 2,
            finalTime: '3:45'
        };
        
        console.log('💾 Salvando resultado...');
        const savedFight = await supabaseService.saveFightResult(testFight.id, resultData);
        
        console.log('✅ Luta após salvar resultado:');
        console.log(`   ID: ${savedFight.id}`);
        console.log(`   Status: ${savedFight.status}`);
        console.log(`   Is Finished: ${savedFight.is_finished}`);
        console.log(`   Winner ID: ${savedFight.winner_id}`);
        console.log(`   Result Type: ${savedFight.result_type}`);
        console.log('');
        
        // Verificar se o status foi atualizado
        if (savedFight.status === 'finished') {
            console.log('✅ Status foi atualizado para "finished" corretamente!');
        } else {
            console.log('❌ Status NÃO foi atualizado para "finished"');
            console.log(`   Status atual: ${savedFight.status}`);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testSaveResultWithStatus(); 