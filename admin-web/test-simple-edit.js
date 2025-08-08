const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSimpleEdit() {
    try {
        console.log('🔍 Testando edição simples...');
        
        // Buscar eventos
        const eventsResponse = await fetch('http://localhost:3000/api/events');
        const events = await eventsResponse.json();
        
        if (events.length > 0) {
            const event = events[0];
            console.log(`🎯 Editando evento: ${event.name} (ID: ${event.id})`);
            
            // Tentar editar
            const updateResponse = await fetch(`http://localhost:3000/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: event.name + ' [TESTE]',
                    date: event.date
                })
            });
            
            console.log('📝 Status:', updateResponse.status);
            
            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('✅ Sucesso:', result.name);
            } else {
                const error = await updateResponse.text();
                console.log('❌ Erro:', error);
            }
        }
    } catch (error) {
        console.error('💥 Erro:', error.message);
    }
}

testSimpleEdit(); 