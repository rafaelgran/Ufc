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

async function testEventDetailsSubmit() {
    console.log('🔍 Testando handleEventDetailsSubmit...\n');
    
    try {
        // Simular dados exatos que o handleEventDetailsSubmit envia
        console.log('1️⃣ Simulando dados do handleEventDetailsSubmit...');
        const eventDetailsData = {
            name: 'Test Event Details',
            date: '2024-12-25T20:00', // Formato datetime-local
            location: 'Test Location',
            venue: 'Test Venue',
            mainEvent: 'Test Main Event' // Campo mainEvent (camelCase)
        };
        
        console.log('Dados enviados:', eventDetailsData);
        
        // Testar criação (POST)
        console.log('\n2️⃣ Testando criação via POST...');
        const createResponse = await makeRequest('POST', 'events', eventDetailsData);
        console.log('Status:', createResponse.status);
        
        if (createResponse.status === 201) {
            console.log('✅ Evento criado com sucesso:', createResponse.data);
            
            const eventId = createResponse.data.id;
            
            // Testar atualização (PUT)
            console.log('\n3️⃣ Testando atualização via PUT...');
            const updateData = {
                name: 'Test Event Details Updated',
                date: '2024-12-26T21:00',
                location: 'Updated Location',
                venue: 'Updated Venue',
                mainEvent: 'Updated Main Event'
            };
            
            const updateResponse = await makeRequest('PUT', `events/${eventId}`, updateData);
            console.log('Status:', updateResponse.status);
            
            if (updateResponse.status === 200) {
                console.log('✅ Evento atualizado com sucesso:', updateResponse.data);
            } else {
                console.log('❌ Erro na atualização:', updateResponse.data);
            }
            
            // Testar busca (GET)
            console.log('\n4️⃣ Testando busca via GET...');
            const getResponse = await makeRequest('GET', 'events');
            console.log('Status:', getResponse.status);
            
            if (getResponse.status === 200) {
                console.log('✅ Eventos buscados com sucesso:', getResponse.data.length, 'eventos');
            } else {
                console.log('❌ Erro na busca:', getResponse.data);
            }
            
            // Limpar - deletar evento de teste
            console.log('\n5️⃣ Deletando evento de teste...');
            const deleteResponse = await makeRequest('DELETE', `events/${eventId}`);
            console.log('Status:', deleteResponse.status);
            
            if (deleteResponse.status === 204) {
                console.log('✅ Evento deletado com sucesso');
            } else {
                console.log('❌ Erro na deleção:', deleteResponse.data);
            }
            
        } else {
            console.log('❌ Erro na criação:', createResponse.data);
        }
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testEventDetailsSubmit(); 