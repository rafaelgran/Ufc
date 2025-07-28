const http = require('http');

function testAPI() {
    console.log('🧪 Testando API...\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ API está funcionando!');
                testEventCreation();
            } else {
                console.log('❌ API não está funcionando');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Erro de conexão:', error.message);
        console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:3000');
    });

    req.end();
}

function testEventCreation() {
    console.log('\n🎯 Testando criação de evento...\n');
    
    const eventData = {
        name: 'Test API Simple',
        date: '2024-12-25T20:00',
        location: 'Test',
        venue: 'Test',
        mainEvent: 'Test Main Event'
    };
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/events',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 201) {
                console.log('✅ Criação de evento funcionando!');
                try {
                    const event = JSON.parse(data);
                    console.log('Evento criado:', event.name, '(ID:', event.id, ')');
                } catch (e) {
                    console.log('Erro ao parsear resposta');
                }
            } else {
                console.log('❌ Erro na criação de evento');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Erro na requisição:', error.message);
    });

    req.write(JSON.stringify(eventData));
    req.end();
}

testAPI(); 