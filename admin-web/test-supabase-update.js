const { SupabaseService } = require('./supabase-config');

async function testSupabaseUpdate() {
    console.log('🔍 Testando updateEvent diretamente...');
    const supabaseService = new SupabaseService();
    
    try {
        // 1. Buscar eventos
        console.log('1️⃣ Buscando eventos...');
        const events = await supabaseService.getAllEvents();
        console.log(`✅ ${events.length} eventos encontrados`);
        
        if (events.length === 0) {
            console.log('❌ Nenhum evento encontrado');
            return;
        }
        
        const event = events[0];
        console.log('📋 Evento para testar:', {
            id: event.id,
            name: event.name,
            date: event.date
        });
        
        // 2. Testar update com dados mínimos
        console.log('\n2️⃣ Testando update com dados mínimos...');
        const updateData = {
            name: event.name + ' [TESTE]'
        };
        
        console.log('📤 Dados:', updateData);
        
        try {
            const updatedEvent = await supabaseService.updateEvent(event.id, updateData);
            console.log('✅ Update bem-sucedido:', updatedEvent);
        } catch (updateError) {
            console.log('❌ Erro no update:', updateError.message);
            console.log('🔍 Stack trace:', updateError.stack);
        }
        
        // 3. Verificar se o evento ainda existe
        console.log('\n3️⃣ Verificando se o evento ainda existe...');
        const eventsAfter = await supabaseService.getAllEvents();
        const eventAfter = eventsAfter.find(e => e.id === event.id);
        
        if (eventAfter) {
            console.log('✅ Evento ainda existe:', eventAfter.name);
        } else {
            console.log('❌ Evento não encontrado após update');
        }
        
    } catch (error) {
        console.error('💥 Erro geral:', error.message);
        console.error('🔍 Stack trace:', error.stack);
    }
}

testSupabaseUpdate(); 