const { SupabaseService } = require('./supabase-config');

async function checkWhatHappened() {
    try {
        console.log('🔍 Verificando o que aconteceu com as lutas...');
        
        const supabaseService = new SupabaseService();
        
        // Buscar todas as lutas
        const fights = await supabaseService.getAllFights();
        
        console.log(`\n📊 Total de lutas: ${fights.length}`);
        
        // Verificar lutas que foram modificadas recentemente
        const recentFights = fights.filter(fight => {
            // Verificar se foi modificada nas últimas horas
            const updatedAt = new Date(fight.result_updated_at || fight.created_at);
            const now = new Date();
            const hoursDiff = (now - updatedAt) / (1000 * 60 * 60);
            return hoursDiff < 2; // Últimas 2 horas
        });
        
        console.log(`\n🕐 Lutas modificadas nas últimas 2 horas: ${recentFights.length}`);
        
        recentFights.forEach(fight => {
            console.log(`\n🎯 Luta ID ${fight.id}:`);
            console.log(`   - Status: ${fight.status}`);
            console.log(`   - is_live: ${fight.is_live}`);
            console.log(`   - is_finished: ${fight.is_finished}`);
            console.log(`   - Result Type: ${fight.result_type || 'N/A'}`);
            console.log(`   - Winner ID: ${fight.winner_id || 'N/A'}`);
            console.log(`   - Final Round: ${fight.final_round || 'N/A'}`);
            console.log(`   - Final Time: ${fight.final_time || 'N/A'}`);
            console.log(`   - Result Updated At: ${fight.result_updated_at || 'N/A'}`);
            
            // Verificar se foi finalizada por um teste
            if (fight.result_type && fight.winner_id) {
                console.log(`   - ⚠️ ESTA LUTA FOI FINALIZADA POR UM TESTE!`);
            }
        });
        
        // Verificar lutas ao vivo
        const liveFights = fights.filter(f => f.is_live && f.status === 'live');
        console.log(`\n🔴 Lutas atualmente ao vivo: ${liveFights.length}`);
        
        liveFights.forEach(fight => {
            console.log(`   - ID ${fight.id}: ${fight.weightclass} - ${fight.status}`);
        });
        
        // Verificar lutas finalizadas recentemente
        const finishedFights = fights.filter(f => f.is_finished && f.status === 'finished');
        console.log(`\n✅ Lutas finalizadas: ${finishedFights.length}`);
        
        const recentFinished = finishedFights.filter(fight => {
            const updatedAt = new Date(fight.result_updated_at || fight.created_at);
            const now = new Date();
            const hoursDiff = (now - updatedAt) / (1000 * 60 * 60);
            return hoursDiff < 2;
        });
        
        console.log(`   - Finalizadas nas últimas 2 horas: ${recentFinished.length}`);
        
        if (recentFinished.length > 0) {
            console.log('\n⚠️ ATENÇÃO: Estas lutas foram finalizadas recentemente:');
            recentFinished.forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - ${fight.result_type} - Round ${fight.final_round} - ${fight.final_time}`);
            });
        }
        
        console.log('\n✅ Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}

// Executar a verificação
checkWhatHappened(); 