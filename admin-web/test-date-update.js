const { SupabaseService } = require('./supabase-config');

async function testDateUpdate() {
    console.log('🔍 Testando atualização de data...');
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
        
        // 2. Testar update com data específica
        console.log('\n2️⃣ Testando update com data específica...');
        const newDate = '2025-12-25T15:30:00.000Z'; // Data de Natal
        const updateData = {
            date: newDate
        };
        
        console.log('📤 Dados sendo enviados:', updateData);
        
        try {
            const updatedEvent = await supabaseService.updateEvent(event.id, updateData);
            console.log('✅ Update bem-sucedido:', {
                id: updatedEvent.id,
                name: updatedEvent.name,
                date: updatedEvent.date
            });
            
            // 3. Verificar se a data realmente mudou
            console.log('\n3️⃣ Verificando se a data mudou...');
            if (updatedEvent.date === newDate) {
                console.log('✅ Data foi atualizada corretamente!');
            } else {
                console.log('❌ Data não foi atualizada!');
                console.log('   Esperado:', newDate);
                console.log('   Recebido:', updatedEvent.date);
            }
            
        } catch (updateError) {
            console.log('❌ Erro no update:', updateError.message);
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testDateUpdate(); 