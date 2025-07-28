const http = require('http');

function makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAPIEvent() {
    console.log('🌐 Testando API de eventos via HTTP...\n');
    
    try {
        // Teste 1: Buscar eventos
        console.log('1️⃣ Buscando eventos...');
        const getResponse = await makeRequest('GET', 'events');
        console.log('Status:', getResponse.status);
        console.log('Eventos encontrados:', getResponse.data.length);
        
        if (getResponse.data.length === 0) {
            console.log('❌ Nenhum evento encontrado');
            return;
        }
        
        const event = getResponse.data[0];
        console.log('Primeiro evento:', {
            id: event.id,
            name: event.name,
            date: event.date,
            mainevent: event.mainevent
        });
        
        // Teste 2: Atualizar evento
        console.log('\n2️⃣ Atualizando evento...');
        const updateData = {
            name: event.name + ' (API TEST)',
            date: '2024-12-25T20:00', // Formato datetime-local
            location: event.location || 'Local API Test',
            venue: event.venue || 'Venue API Test',
            mainEvent: 'Main Event API Test'
        };
        
        console.log('Dados de atualização:', updateData);
        
        const updateResponse = await makeRequest('PUT', `events/${event.id}`, updateData);
        console.log('Status:', updateResponse.status);
        
        if (updateResponse.status === 200) {
            console.log('✅ Evento atualizado:', updateResponse.data);
        } else {
            console.log('❌ Erro na atualização:', updateResponse.data);
        }
        
        // Teste 3: Reverter alterações
        console.log('\n3️⃣ Revertendo alterações...');
        const revertData = {
            name: event.name,
            date: event.date,
            location: event.location,
            venue: event.venue,
            mainEvent: event.mainevent
        };
        
        const revertResponse = await makeRequest('PUT', `events/${event.id}`, revertData);
        console.log('Status:', revertResponse.status);
        
        if (revertResponse.status === 200) {
            console.log('✅ Evento revertido:', revertResponse.data);
        } else {
            console.log('❌ Erro na reversão:', revertResponse.data);
        }
        
        console.log('\n🎉 Teste da API concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testAPIEvent(); 