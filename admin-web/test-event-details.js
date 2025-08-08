const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEventDetails() {
    try {
        console.log('🔍 Verificando detalhes do evento...');
        
        // Buscar eventos
        const eventsResponse = await fetch('http://localhost:3000/api/events');
        const events = await eventsResponse.json();
        
        if (events.length > 0) {
            const event = events[0];
            console.log('📋 Evento encontrado:');
            console.log('  ID:', event.id);
            console.log('  Nome:', event.name);
            console.log('  Data:', event.date);
            console.log('  Localização:', event.location);
            console.log('  Main Event:', event.mainevent);
            console.log('  Todos os campos:', Object.keys(event));
            
            // Verificar se o ID é realmente um número
            console.log('\n🔢 Verificando ID:', typeof event.id, event.id);
            
            // Tentar uma atualização mais simples
            console.log('\n🔧 Tentando atualização simples...');
            const updateData = {
                name: event.name + ' [TESTE]'
            };
            
            console.log('📤 Dados sendo enviados:', updateData);
            
            const updateResponse = await fetch(`http://localhost:3000/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            console.log('📝 Status:', updateResponse.status);
            
            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('✅ Sucesso:', result);
            } else {
                const error = await updateResponse.text();
                console.log('❌ Erro:', error);
            }
        }
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testEventDetails(); 