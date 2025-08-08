const axios = require('axios');

console.log('🔧 Teste do Sistema sem Coluna Record...\n');

async function testSystemWithoutRecord() {
    try {
        // 1. Testar busca de lutadores
        console.log('1️⃣ Testando busca de lutadores...');
        const fightersResponse = await axios.get('http://localhost:3000/api/fighters');
        const fighters = fightersResponse.data;
        
        console.log(`   ✅ Lutadores encontrados: ${fighters.length}`);
        
        // Verificar se os lutadores têm wins, losses, draws mas não têm record
        const firstFighter = fighters[0];
        if (firstFighter) {
            console.log(`   📋 Primeiro lutador: ${firstFighter.name}`);
            console.log(`   📋 Wins: ${firstFighter.wins}, Losses: ${firstFighter.losses}, Draws: ${firstFighter.draws}`);
            console.log(`   📋 Tem coluna record: ${firstFighter.hasOwnProperty('record')}`);
            
            if (firstFighter.hasOwnProperty('record')) {
                console.log('   ⚠️ Ainda tem coluna record no banco! Execute o SQL para removê-la.');
            } else {
                console.log('   ✅ Coluna record removida com sucesso!');
            }
        }
        
        // 2. Testar criação de lutador
        console.log('\n2️⃣ Testando criação de lutador...');
        const createResponse = await axios.post('http://localhost:3000/api/fighters', {
            name: 'Test Fighter No Record',
            nickname: 'Test',
            wins: 5,
            losses: 2,
            draws: 1,
            weightclass: 'Lightweight',
            country: 'Brazil'
        });
        
        const newFighterId = createResponse.data.id;
        console.log(`   ✅ Lutador criado com ID: ${newFighterId}`);
        console.log(`   📋 Record calculado: ${createResponse.data.wins}-${createResponse.data.losses}-${createResponse.data.draws}`);
        
        // 3. Testar atualização de lutador
        console.log('\n3️⃣ Testando atualização de lutador...');
        const updateResponse = await axios.put(`http://localhost:3000/api/fighters/${newFighterId}`, {
            name: 'Test Fighter No Record Updated',
            wins: 6,
            losses: 2,
            draws: 1
        });
        
        console.log(`   ✅ Lutador atualizado`);
        console.log(`   📋 Novo record: ${updateResponse.data.wins}-${updateResponse.data.losses}-${updateResponse.data.draws}`);
        
        // 4. Testar criação de luta com resultado
        console.log('\n4️⃣ Testando criação de luta com resultado...');
        const fightResponse = await axios.post('http://localhost:3000/api/fights', {
            eventid: 1,
            fighter1id: newFighterId,
            fighter2id: 2,
            weightclass: 'Lightweight',
            fighttype: 'Main Card',
            fightorder: 1,
            rounds: 3
        });
        
        const fightId = fightResponse.data.id;
        console.log(`   ✅ Luta criada com ID: ${fightId}`);
        
        // 5. Testar salvamento de resultado
        console.log('\n5️⃣ Testando salvamento de resultado...');
        const resultResponse = await axios.post(`http://localhost:3000/api/fights/${fightId}/save-result`, {
            resultType: 'DE',
            finalRound: 3,
            finalTime: '05:00',
            winnerId: newFighterId
        });
        
        console.log(`   ✅ Resultado salvo`);
        
        // 6. Verificar se o record do vencedor foi atualizado
        console.log('\n6️⃣ Verificando atualização do record...');
        const updatedFighterResponse = await axios.get(`http://localhost:3000/api/fighters/${newFighterId}`);
        const updatedFighter = updatedFighterResponse.data;
        
        console.log(`   📋 Record após vitória: ${updatedFighter.wins}-${updatedFighter.losses}-${updatedFighter.draws}`);
        
        if (updatedFighter.wins === 7) {
            console.log('   ✅ Record atualizado corretamente!');
        } else {
            console.log('   ❌ Record não foi atualizado corretamente!');
        }
        
        // 7. Limpar dados de teste
        console.log('\n7️⃣ Limpando dados de teste...');
        await axios.delete(`http://localhost:3000/api/fights/${fightId}`);
        await axios.delete(`http://localhost:3000/api/fighters/${newFighterId}`);
        console.log('   ✅ Dados de teste removidos');
        
        console.log('\n🎉 Teste do sistema sem coluna record concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testSystemWithoutRecord(); 