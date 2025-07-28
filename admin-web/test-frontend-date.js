const { SupabaseService } = require('./supabase-config');

async function testFrontendDate() {
    console.log('🖥️ Testando comportamento do frontend com datas...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Simular o que o frontend faz ao editar um evento
        console.log('1️⃣ Simulando edição de evento...');
        
        // Buscar evento existente
        const allEvents = await supabaseService.getAllEvents();
        if (allEvents.length === 0) {
            console.log('❌ Nenhum evento encontrado para testar');
            return;
        }
        
        const event = allEvents[0];
        console.log('Evento original:', {
            id: event.id,
            name: event.name,
            date: event.date
        });
        
        // Simular conversão do frontend (datetime-local para ISO)
        console.log('\n2️⃣ Simulando conversão frontend → backend...');
        const frontendDate = '2024-12-25T20:00'; // Formato datetime-local
        console.log('Data do frontend (datetime-local):', frontendDate);
        
        // Converter para ISO (como o backend faz)
        const date = new Date(frontendDate);
        const isoDate = date.toISOString();
        console.log('Data convertida para ISO:', isoDate);
        
        // Atualizar evento
        const updatedEvent = await supabaseService.updateEvent(event.id, {
            date: isoDate
        });
        console.log('✅ Evento atualizado:', {
            id: updatedEvent.id,
            name: updatedEvent.name,
            date: updatedEvent.date
        });
        
        // Simular conversão backend → frontend (para edição)
        console.log('\n3️⃣ Simulando conversão backend → frontend...');
        const backendDate = updatedEvent.date;
        console.log('Data do backend:', backendDate);
        
        // Converter para datetime-local (como o frontend faz)
        const editDate = new Date(backendDate);
        const year = editDate.getFullYear();
        const month = String(editDate.getMonth() + 1).padStart(2, '0');
        const day = String(editDate.getDate()).padStart(2, '0');
        const hours = String(editDate.getHours()).padStart(2, '0');
        const minutes = String(editDate.getMinutes()).padStart(2, '0');
        const frontendEditDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        console.log('Data convertida para datetime-local:', frontendEditDate);
        
        // Reverter para a data original
        console.log('\n4️⃣ Revertendo para data original...');
        const revertedEvent = await supabaseService.updateEvent(event.id, {
            date: event.date
        });
        console.log('✅ Data revertida:', {
            id: revertedEvent.id,
            name: revertedEvent.name,
            date: revertedEvent.date
        });
        
        console.log('\n🎉 Teste de conversão frontend/backend concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testFrontendDate(); 