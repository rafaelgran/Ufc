const axios = require('axios');

async function testAdminOperations() {
    console.log('🔧 Teste de Operações Admin via Servidor...\n');

    try {
        // Teste de health check
        console.log('1️⃣ Testando health check...');
        const healthResponse = await axios.get('http://localhost:3000/api/health');
        console.log('   ✅ Health check:', healthResponse.data);

        // Teste de busca de eventos (deve funcionar)
        console.log('\n2️⃣ Testando busca de eventos...');
        const eventsResponse = await axios.get('http://localhost:3000/api/events');
        console.log('   ✅ Eventos encontrados:', eventsResponse.data.length);

        // Teste de busca de fighters (deve funcionar)
        console.log('\n3️⃣ Testando busca de fighters...');
        const fightersResponse = await axios.get('http://localhost:3000/api/fighters');
        console.log('   ✅ Fighters encontrados:', fightersResponse.data.length);

        // Teste de busca de fights (deve funcionar)
        console.log('\n4️⃣ Testando busca de fights...');
        const fightsResponse = await axios.get('http://localhost:3000/api/fights');
        console.log('   ✅ Fights encontrados:', fightsResponse.data.length);

        // Teste de criação de evento (deve funcionar - admin)
        console.log('\n5️⃣ Testando criação de evento...');
        try {
            const createEventResponse = await axios.post('http://localhost:3000/api/events', {
                name: 'Test Event Admin',
                date: '2024-12-31T20:00:00',
                venue: 'Test Arena',
                location: 'Test City'
            });
            console.log('   ✅ Evento criado:', createEventResponse.data.id);
            
            // Limpar o teste
            await axios.delete(`http://localhost:3000/api/events/${createEventResponse.data.id}`);
            console.log('   🧹 Evento de teste removido');
        } catch (error) {
            console.log('   ❌ Erro ao criar evento:', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 Teste de operações admin concluído!');

    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testAdminOperations(); 