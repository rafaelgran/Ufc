const { SupabaseService } = require('./supabase-config');

async function testStatusUpdate() {
    try {
        const supabaseService = new SupabaseService();
        
        console.log('🔍 Testando atualização de status...');
        
        // Primeiro, vamos verificar a estrutura da tabela fights
        console.log('\n📋 Verificando estrutura da tabela fights...');
        
        // Buscar uma luta para testar
        const fights = await supabaseService.getAllFights();
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Testar startFightLive
        console.log('\n🚀 Testando startFightLive...');
        const updatedFight = await supabaseService.startFightLive(testFight.id);
        
        console.log(`✅ Luta atualizada:`);
        console.log(`   - ID: ${updatedFight.id}`);
        console.log(`   - Status: ${updatedFight.status}`);
        console.log(`   - is_live: ${updatedFight.is_live}`);
        console.log(`   - current_round: ${updatedFight.current_round}`);
        console.log(`   - round_status: ${updatedFight.round_status}`);
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Testar stopFightLive
        console.log('\n⏹️ Testando stopFightLive...');
        const stoppedFight = await supabaseService.stopFightLive(testFight.id);
        
        console.log(`✅ Luta parada:`);
        console.log(`   - ID: ${stoppedFight.id}`);
        console.log(`   - Status: ${stoppedFight.status}`);
        console.log(`   - is_live: ${stoppedFight.is_live}`);
        console.log(`   - round_status: ${stoppedFight.round_status}`);
        
        console.log('\n✅ Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar o teste
testStatusUpdate(); 