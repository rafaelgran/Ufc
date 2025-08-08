const axios = require('axios');

console.log('🔧 Teste de Upload de Imagem...\n');

async function testImageUpload() {
    try {
        // 1. Testar criação de evento com imagem base64
        console.log('1️⃣ Testando criação de evento com imagem base64...');
        
        // Imagem base64 de teste (1x1 pixel transparente)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const createResponse = await axios.post('http://localhost:3000/api/events', {
            name: 'Test Event with Image',
            date: '2024-12-25T20:00',
            location: 'Test Location',
            venue: 'Test Venue',
            image: testImageBase64
        });
        
        const eventId = createResponse.data.id;
        console.log(`   ✅ Evento criado com ID: ${eventId}`);
        console.log(`   📋 Imagem salva: ${createResponse.data.image ? 'Sim' : 'Não'}`);
        
        // 2. Testar criação de evento com URL de imagem
        console.log('\n2️⃣ Testando criação de evento com URL de imagem...');
        
        const createUrlResponse = await axios.post('http://localhost:3000/api/events', {
            name: 'Test Event with URL',
            date: '2024-12-26T20:00',
            location: 'Test Location 2',
            venue: 'Test Venue 2',
            image: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Test+Image'
        });
        
        const eventId2 = createUrlResponse.data.id;
        console.log(`   ✅ Evento criado com ID: ${eventId2}`);
        console.log(`   📋 URL salva: ${createUrlResponse.data.image ? 'Sim' : 'Não'}`);
        
        // 3. Testar busca de eventos para verificar se as imagens foram salvas
        console.log('\n3️⃣ Verificando se imagens foram salvas...');
        
        const eventsResponse = await axios.get('http://localhost:3000/api/events');
        const events = eventsResponse.data;
        
        const event1 = events.find(e => e.id === eventId);
        const event2 = events.find(e => e.id === eventId2);
        
        if (event1 && event1.image) {
            console.log(`   ✅ Evento 1 tem imagem: ${event1.image.substring(0, 50)}...`);
        } else {
            console.log(`   ❌ Evento 1 não tem imagem`);
        }
        
        if (event2 && event2.image) {
            console.log(`   ✅ Evento 2 tem URL: ${event2.image}`);
        } else {
            console.log(`   ❌ Evento 2 não tem URL`);
        }
        
        // 4. Limpar dados de teste
        console.log('\n4️⃣ Limpando dados de teste...');
        await axios.delete(`http://localhost:3000/api/events/${eventId}`);
        await axios.delete(`http://localhost:3000/api/events/${eventId2}`);
        console.log('   ✅ Dados de teste removidos');
        
        console.log('\n🎉 Teste de upload de imagem concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testImageUpload(); 