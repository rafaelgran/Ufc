const { SupabaseService } = require('./supabase-config');

async function testEventDateSimple() {
    console.log('📅 Teste simples de data de eventos...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Verificar eventos existentes
        console.log('1️⃣ Verificando eventos existentes...');
        const allEvents = await supabaseService.getAllEvents();
        console.log(`✅ ${allEvents.length} eventos encontrados`);
        
        if (allEvents.length > 0) {
            const firstEvent = allEvents[0];
            console.log('Primeiro evento:', {
                id: firstEvent.id,
                name: firstEvent.name,
                date: firstEvent.date,
                mainevent: firstEvent.mainevent
            });
            
            // Teste 2: Atualizar data do primeiro evento
            console.log('\n2️⃣ Atualizando data do primeiro evento...');
            const newDate = '2024-12-25T20:00:00.000Z';
            const updatedEvent = await supabaseService.updateEvent(firstEvent.id, {
                date: newDate
            });
            console.log('✅ Data atualizada:', {
                id: updatedEvent.id,
                name: updatedEvent.name,
                date: updatedEvent.date
            });
            
            // Teste 3: Reverter a data
            console.log('\n3️⃣ Revertendo data...');
            const revertedEvent = await supabaseService.updateEvent(firstEvent.id, {
                date: firstEvent.date
            });
            console.log('✅ Data revertida:', {
                id: revertedEvent.id,
                name: revertedEvent.name,
                date: revertedEvent.date
            });
        }
        
        console.log('\n🎉 Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testEventDateSimple(); 