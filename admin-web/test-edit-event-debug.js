const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEditEvent() {
    const baseUrl = 'http://localhost:3000';
    
    try {
        console.log('🔍 Testando conexão com o servidor...');
        
        // Teste 1: Health check
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        console.log('✅ Health check status:', healthResponse.status);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.text();
            console.log('📄 Health response:', healthData);
        }
        
        // Teste 2: Buscar eventos existentes
        console.log('\n🔍 Buscando eventos existentes...');
        const eventsResponse = await fetch(`${baseUrl}/api/events`);
        console.log('📊 Events status:', eventsResponse.status);
        
        if (eventsResponse.ok) {
            const events = await eventsResponse.json();
            console.log(`📋 Encontrados ${events.length} eventos`);
            
            if (events.length > 0) {
                const firstEvent = events[0];
                console.log('🎯 Primeiro evento:', {
                    id: firstEvent.id,
                    name: firstEvent.name,
                    date: firstEvent.date
                });
                
                // Teste 3: Tentar editar o primeiro evento
                console.log('\n🔧 Testando edição do evento...');
                const updateData = {
                    name: firstEvent.name + ' (TESTE)',
                    date: firstEvent.date,
                    location: firstEvent.location || 'Teste Location'
                };
                
                const updateResponse = await fetch(`${baseUrl}/api/events/${firstEvent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                console.log('📝 Update status:', updateResponse.status);
                console.log('📝 Update headers:', Object.fromEntries(updateResponse.headers.entries()));
                
                const responseText = await updateResponse.text();
                console.log('📄 Response text:', responseText);
                
                if (updateResponse.ok) {
                    try {
                        const responseJson = JSON.parse(responseText);
                        console.log('✅ Update successful:', responseJson);
                    } catch (parseError) {
                        console.log('❌ Failed to parse JSON:', parseError.message);
                    }
                } else {
                    console.log('❌ Update failed');
                }
            }
        } else {
            const errorText = await eventsResponse.text();
            console.log('❌ Failed to fetch events:', errorText);
        }
        
    } catch (error) {
        console.error('💥 Erro no teste:', error.message);
    }
}

testEditEvent(); 