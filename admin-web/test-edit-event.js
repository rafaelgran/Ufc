const { SupabaseService } = require('./supabase-config');

async function testEditEvent() {
    console.log('✏️ Testando edição de eventos...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Buscar eventos existentes
        console.log('1️⃣ Buscando eventos existentes...');
        const allEvents = await supabaseService.getAllEvents();
        console.log(`✅ ${allEvents.length} eventos encontrados`);
        
        if (allEvents.length === 0) {
            console.log('❌ Nenhum evento encontrado para testar');
            return;
        }
        
        const event = allEvents[0];
        console.log('Evento para editar:', {
            id: event.id,
            name: event.name,
            date: event.date,
            mainevent: event.mainevent
        });
        
        // Simular dados de edição (como o frontend enviaria)
        console.log('\n2️⃣ Simulando dados de edição...');
        const editData = {
            name: event.name + ' (EDITADO)',
            date: '2024-12-25T20:00', // Formato datetime-local
            location: event.location || 'Local Editado',
            venue: event.venue || 'Venue Editado',
            mainEvent: 'Main Event Editado'
        };
        
        console.log('Dados de edição:', editData);
        
        // Atualizar evento
        console.log('\n3️⃣ Atualizando evento...');
        const updatedEvent = await supabaseService.updateEvent(event.id, editData);
        console.log('✅ Evento atualizado:', {
            id: updatedEvent.id,
            name: updatedEvent.name,
            date: updatedEvent.date,
            mainevent: updatedEvent.mainevent
        });
        
        // Reverter alterações
        console.log('\n4️⃣ Revertendo alterações...');
        const revertedEvent = await supabaseService.updateEvent(event.id, {
            name: event.name,
            date: event.date,
            location: event.location,
            venue: event.venue,
            mainEvent: event.mainevent
        });
        console.log('✅ Evento revertido:', {
            id: revertedEvent.id,
            name: revertedEvent.name,
            date: revertedEvent.date,
            mainevent: revertedEvent.mainevent
        });
        
        console.log('\n🎉 Teste de edição concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        console.error('Detalhes do erro:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
    }
}

testEditEvent(); 