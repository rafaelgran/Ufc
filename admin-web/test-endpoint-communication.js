const express = require('express');
const { SupabaseService } = require('./supabase-config');

// Simular o servidor Express
const app = express();
app.use(express.json());

// Simular o endpoint
app.post('/api/fights/:id/start-live', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔄 Endpoint chamado: POST /api/fights/${id}/start-live`);
        
        const supabaseService = new SupabaseService();
        const updatedFight = await supabaseService.startFightLive(parseInt(id));
        
        console.log(`✅ Resposta do endpoint:`, updatedFight);
        res.json(updatedFight);
    } catch (error) {
        console.error('❌ Erro no endpoint:', error);
        res.status(500).json({ error: 'Failed to start fight live' });
    }
});

async function testEndpointCommunication() {
    try {
        console.log('🔍 Testando comunicação entre frontend e backend...');
        
        // Buscar uma luta para testar
        const supabaseService = new SupabaseService();
        const fights = await supabaseService.getAllFights();
        
        if (fights.length === 0) {
            console.log('❌ Nenhuma luta encontrada para testar');
            return;
        }
        
        const testFight = fights[0];
        console.log(`\n🎯 Luta de teste: ID ${testFight.id}`);
        console.log(`📊 Status atual: ${testFight.status}`);
        console.log(`📊 is_live atual: ${testFight.is_live}`);
        
        // Simular chamada do frontend
        console.log('\n🌐 Simulando chamada do frontend...');
        
        const response = await fetch(`http://localhost:3000/api/fights/${testFight.id}/start-live`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Resposta do servidor:`, result);
            
            // Verificar se os dados foram atualizados
            console.log('\n🔄 Verificando dados no banco...');
            const updatedFights = await supabaseService.getAllFights();
            const updatedFight = updatedFights.find(f => f.id === testFight.id);
            
            console.log(`📊 Dados após atualização:`);
            console.log(`   - ID: ${updatedFight.id}`);
            console.log(`   - Status: ${updatedFight.status}`);
            console.log(`   - is_live: ${updatedFight.is_live}`);
            
            if (updatedFight.status === 'live' && updatedFight.is_live === true) {
                console.log('✅ Comunicação funcionando corretamente!');
            } else {
                console.log('❌ Dados não foram atualizados corretamente');
            }
        } else {
            console.log('❌ Erro na resposta do servidor:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Iniciar servidor de teste
const server = app.listen(3000, () => {
    console.log('🚀 Servidor de teste rodando na porta 3000');
    
    // Executar teste após servidor estar pronto
    setTimeout(() => {
        testEndpointCommunication().then(() => {
            server.close();
            console.log('✅ Teste concluído, servidor fechado');
        });
    }, 1000);
}); 