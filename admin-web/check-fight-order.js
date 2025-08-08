const { SupabaseService } = require('./supabase-config');

async function checkFightOrder() {
    try {
        console.log('🔍 Verificando campo fightOrder...');
        
        const supabaseService = new SupabaseService();
        
        // Buscar todas as lutas
        const fights = await supabaseService.getAllFights();
        
        console.log(`📊 Total de lutas: ${fights.length}`);
        
        // Verificar lutas com fightOrder definido
        const fightsWithOrder = fights.filter(f => f.fightOrder !== undefined && f.fightOrder !== null);
        console.log(`📊 Lutas com fightOrder definido: ${fightsWithOrder.length}`);
        
        if (fightsWithOrder.length > 0) {
            console.log('\n📋 Lutas com fightOrder:');
            fightsWithOrder.forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder} - status: ${fight.status} - is_finished: ${fight.is_finished}`);
            });
        }
        
        // Verificar lutas sem fightOrder
        const fightsWithoutOrder = fights.filter(f => f.fightOrder === undefined || f.fightOrder === null);
        console.log(`\n📊 Lutas SEM fightOrder: ${fightsWithoutOrder.length}`);
        
        if (fightsWithoutOrder.length > 0) {
            console.log('\n📋 Primeiras 5 lutas sem fightOrder:');
            fightsWithoutOrder.slice(0, 5).forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - status: ${fight.status} - is_finished: ${fight.is_finished}`);
            });
        }
        
        // Verificar lutas não finalizadas
        const unfinishedFights = fights.filter(f => !f.is_finished);
        console.log(`\n📊 Lutas não finalizadas: ${unfinishedFights.length}`);
        
        if (unfinishedFights.length > 0) {
            console.log('\n📋 Lutas não finalizadas:');
            unfinishedFights.forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder || 'undefined'} - status: ${fight.status} - is_live: ${fight.is_live}`);
            });
        }
        
        // Verificar lutas agendadas (não finalizadas e não ao vivo)
        const scheduledFights = fights.filter(f => !f.is_finished && f.status !== 'live');
        console.log(`\n📊 Lutas agendadas: ${scheduledFights.length}`);
        
        if (scheduledFights.length > 0) {
            console.log('\n📋 Lutas agendadas:');
            scheduledFights.forEach(fight => {
                console.log(`   - ID ${fight.id}: ${fight.weightclass} - fightOrder: ${fight.fightOrder || 'undefined'} - status: ${fight.status}`);
            });
        }
        
        // Verificar eventos
        const events = await supabaseService.getAllEvents();
        console.log(`\n📊 Total de eventos: ${events.length}`);
        
        events.forEach(event => {
            const eventFights = fights.filter(f => f.eventid === event.id);
            const eventFightsWithOrder = eventFights.filter(f => f.fightOrder !== undefined && f.fightOrder !== null);
            const eventUnfinishedFights = eventFights.filter(f => !f.is_finished);
            
            console.log(`   - Evento ${event.id}: ${event.name}`);
            console.log(`     - Total de lutas: ${eventFights.length}`);
            console.log(`     - Lutas com fightOrder: ${eventFightsWithOrder.length}`);
            console.log(`     - Lutas não finalizadas: ${eventUnfinishedFights.length}`);
        });
        
        console.log('\n✅ Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}

// Executar a verificação
checkFightOrder(); 