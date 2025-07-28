const { SupabaseService } = require('./supabase-config');

async function testEventDetails() {
    console.log('📋 Testando detalhes de eventos...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Buscar eventos existentes
        console.log('1️⃣ Buscando eventos...');
        const allEvents = await supabaseService.getAllEvents();
        console.log(`✅ ${allEvents.length} eventos encontrados`);
        
        if (allEvents.length === 0) {
            console.log('❌ Nenhum evento encontrado');
            return;
        }
        
        const event = allEvents[0];
        console.log('Evento para testar:', {
            id: event.id,
            name: event.name,
            date: event.date,
            mainevent: event.mainevent
        });
        
        // Simular conversão de data (como o frontend faz)
        console.log('\n2️⃣ Simulando conversão de data...');
        let dateValue = event.date;
        if (dateValue) {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                console.log('✅ Data convertida para datetime-local:', dateValue);
            } else {
                dateValue = event.date.replace(' ', 'T');
                console.log('✅ Data usando fallback:', dateValue);
            }
        }
        
        // Simular dados do formulário
        console.log('\n3️⃣ Simulando dados do formulário...');
        const formData = {
            name: event.name,
            date: dateValue,
            location: event.location || '',
            venue: event.venue || '',
            mainEvent: event.mainevent || ''
        };
        
        console.log('Dados do formulário:', formData);
        
        // Testar atualização
        console.log('\n4️⃣ Testando atualização...');
        const updatedEvent = await supabaseService.updateEvent(event.id, formData);
        console.log('✅ Evento atualizado:', {
            id: updatedEvent.id,
            name: updatedEvent.name,
            date: updatedEvent.date,
            mainevent: updatedEvent.mainevent
        });
        
        // Reverter alterações
        console.log('\n5️⃣ Revertendo alterações...');
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
        
        console.log('\n🎉 Teste de detalhes de eventos concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testEventDetails(); 