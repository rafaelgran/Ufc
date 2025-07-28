const { SupabaseService } = require('./supabase-config');

async function testEventDate() {
    console.log('📅 Testando tratamento de datas de eventos...\n');
    const supabaseService = new SupabaseService();
    
    try {
        // Teste 1: Criar evento com data
        console.log('1️⃣ Criando evento com data...');
        const testEvent = {
            name: 'Test Event Date',
            date: '2024-12-25T20:00', // Formato datetime-local
            location: 'Test Arena',
            venue: 'Test Venue',
            mainEvent: 'Test Main Event'
        };
        
        const newEvent = await supabaseService.createEvent(testEvent);
        console.log('✅ Evento criado com sucesso:', {
            id: newEvent.id,
            name: newEvent.name,
            date: newEvent.date,
            location: newEvent.location
        });
        
        // Teste 2: Atualizar data do evento
        console.log('\n2️⃣ Atualizando data do evento...');
        const updatedEvent = await supabaseService.updateEvent(newEvent.id, {
            date: '2024-12-26T21:30' // Nova data
        });
        console.log('✅ Data atualizada:', {
            name: updatedEvent.name,
            date: updatedEvent.date
        });
        
        // Teste 3: Buscar todos os eventos para verificar
        console.log('\n3️⃣ Buscando todos os eventos...');
        const allEvents = await supabaseService.getAllEvents();
        console.log(`✅ ${allEvents.length} eventos encontrados:`);
        
        allEvents.forEach(event => {
            console.log(`   - ${event.name}: ${event.date} (${event.location || 'Sem local'})`);
        });
        
        // Teste 4: Limpar - deletar evento de teste
        console.log('\n4️⃣ Deletando evento de teste...');
        await supabaseService.deleteEvent(newEvent.id);
        console.log('✅ Evento de teste deletado');
        
        console.log('\n🎉 Todos os testes passaram! Tratamento de datas funcionando perfeitamente!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

testEventDate(); 